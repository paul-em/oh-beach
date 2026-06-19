<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { X } from '@lucide/vue'

type WeatherKind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'

export interface BookingSlot {
  hour: number
  label: string
  startISO: string
  status: 'free' | 'busy' | 'past'
  mine: boolean
  bookingId?: string
  bookedBy?: string
  note?: string
  weather?: { kind: WeatherKind; temp: number } | null
}

const props = withDefaults(
  defineProps<{ slots: BookingSlot[]; interactive?: boolean; pending?: boolean }>(),
  { interactive: false, pending: false },
)
const emit = defineEmits<{ book: [number[]]; cancel: [string] }>()

// ---- Mehrfachauswahl: Maus = sofort ziehen, Touch = halten, dann ziehen ----
const byHour = computed(() => new Map(props.slots.map((s) => [s.hour, s])))
const anchor = ref<number | null>(null)
const hoverHour = ref<number | null>(null)
// Während einer aktiven Touch-Auswahl: Seiten-Scrollen unterbinden.
const lockScroll = ref(false)

const HOLD_MS = 320 // so lange halten, bis der Auswahl-Modus startet
const MOVE_CANCEL = 12 // Bewegt sich der Finger vorher mehr, ist es ein Scroll

function selectable(hour: number): boolean {
  const s = byHour.value.get(hour)
  return Boolean(s && s.status === 'free' && props.interactive)
}

// Zusammenhängender Block vom Start-Slot bis zum aktuell überfahrenen Slot.
const selectedHours = computed<number[]>(() => {
  if (anchor.value == null || hoverHour.value == null) return []
  const dir = hoverHour.value >= anchor.value ? 1 : -1
  const out: number[] = []
  for (let h = anchor.value; dir > 0 ? h <= hoverHour.value : h >= hoverHour.value; h += dir) {
    if (!selectable(h)) break
    out.push(h)
  }
  return out
})
const selectedSet = computed(() => new Set(selectedHours.value))

function hourAt(x: number, y: number): number | null {
  const cell = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-hour]') as HTMLElement | null
  if (!cell) return null
  const h = Number(cell.dataset.hour)
  return Number.isNaN(h) ? null : h
}

function beginSelect(hour: number) {
  anchor.value = hour
  hoverHour.value = hour
}

function commit() {
  const hours = [...selectedHours.value]
  reset()
  if (hours.length) emit('book', hours)
}

function reset() {
  anchor.value = null
  hoverHour.value = null
  lockScroll.value = false
  window.removeEventListener('pointermove', onMouseMove)
  window.removeEventListener('pointerup', onMouseUp)
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
  document.removeEventListener('touchcancel', onTouchEnd)
  clearHold()
}

// ---- Maus -----------------------------------------------------------------
function onMouseMove(e: PointerEvent) {
  if (anchor.value == null) return
  const h = hourAt(e.clientX, e.clientY)
  if (h != null) hoverHour.value = h
}
function onMouseUp() {
  commit()
}

// ---- Touch ----------------------------------------------------------------
let holdTimer: ReturnType<typeof setTimeout> | null = null
let touchHour: number | null = null
let touchStartX = 0
let touchStartY = 0
let touchSelecting = false
let touchAborted = false

function clearHold() {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
}

function beginTouch(hour: number, e: PointerEvent) {
  touchHour = hour
  touchStartX = e.clientX
  touchStartY = e.clientY
  touchSelecting = false
  touchAborted = false
  document.addEventListener('touchmove', onTouchMove, { passive: false })
  document.addEventListener('touchend', onTouchEnd)
  document.addEventListener('touchcancel', onTouchEnd)
  holdTimer = setTimeout(() => {
    holdTimer = null
    touchSelecting = true
    lockScroll.value = true
    if (touchHour != null) beginSelect(touchHour)
    navigator.vibrate?.(15)
  }, HOLD_MS)
}

function onTouchMove(e: TouchEvent) {
  const t = e.touches[0]
  if (!t) return
  if (!touchSelecting) {
    // Noch im Halte-Fenster: deutliche Bewegung = Scroll-Absicht → abbrechen.
    if (Math.abs(t.clientX - touchStartX) > MOVE_CANCEL || Math.abs(t.clientY - touchStartY) > MOVE_CANCEL) {
      touchAborted = true
      clearHold()
    }
    return // nicht preventDefault → Seite darf scrollen
  }
  // Auswahl-Modus: Scrollen blockieren und Block erweitern.
  e.preventDefault()
  const h = hourAt(t.clientX, t.clientY)
  if (h != null) hoverHour.value = h
}

function onTouchEnd() {
  if (touchSelecting) {
    commit()
  } else if (!touchAborted && touchHour != null) {
    // Kurzer Tap ohne Halten → einzelnen Slot buchen.
    const hour = touchHour
    reset()
    emit('book', [hour])
  } else {
    reset()
  }
}

// ---- Einstieg (Pointer) ---------------------------------------------------
function onDown(hour: number, e: PointerEvent) {
  if (!selectable(hour)) return
  if (e.pointerType === 'mouse') {
    e.preventDefault()
    beginSelect(hour)
    window.addEventListener('pointermove', onMouseMove)
    window.addEventListener('pointerup', onMouseUp)
  } else {
    beginTouch(hour, e)
  }
}

onBeforeUnmount(reset)
</script>

<template>
  <div>
    <div v-if="pending" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <Skeleton v-for="i in 8" :key="i" class="h-20 rounded-xl" />
    </div>

    <div
      v-else
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      :class="{ 'select-none': interactive, 'touch-none': lockScroll }"
    >
      <template v-for="s in slots" :key="s.hour">
        <!-- Frei + buchbar -->
        <button
          v-if="s.status === 'free' && interactive"
          type="button"
          :data-hour="s.hour"
          :data-selected="selectedSet.has(s.hour) || undefined"
          class="group relative h-20 overflow-hidden rounded-xl border-2 border-brand-sky/40 bg-brand-sky/5 text-left transition-colors hover:border-brand-sky hover:bg-brand-sky/10 data-selected:border-brand-coral data-selected:bg-brand-coral/10 data-selected:ring-2 data-selected:ring-brand-coral/40"
          @pointerdown="onDown(s.hour, $event)"
          @keydown.enter.prevent="emit('book', [s.hour])"
          @keydown.space.prevent="emit('book', [s.hour])"
        >
          <span class="relative z-10 flex h-full flex-col items-start justify-between p-3">
            <span class="flex w-full items-center justify-between gap-2">
              <span class="min-w-0 truncate font-display font-semibold">{{ s.label }}</span>
              <span v-if="s.weather" class="inline-flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums">
                <BookingWeatherGlyph :kind="s.weather.kind" class="-my-2 size-9" />{{ s.weather.temp }}°
              </span>
            </span>
            <span class="text-sm font-semibold">{{ selectedSet.has(s.hour) ? 'Ausgewählt' : 'Frei · buchen' }}</span>
          </span>
        </button>

        <!-- Frei, nur Anzeige -->
        <div
          v-else-if="s.status === 'free'"
          :data-hour="s.hour"
          class="relative h-20 overflow-hidden rounded-xl border border-border/70 bg-muted/30"
        >
          <span class="relative z-10 flex h-full flex-col items-start justify-between p-3">
            <span class="flex w-full items-center justify-between gap-2">
              <span class="min-w-0 truncate font-display font-semibold">{{ s.label }}</span>
              <span v-if="s.weather" class="inline-flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums">
                <BookingWeatherGlyph :kind="s.weather.kind" class="-my-2 size-9" />{{ s.weather.temp }}°
              </span>
            </span>
            <span class="text-sm font-semibold">Frei</span>
          </span>
        </div>

        <!-- Eigene Buchung -->
        <div
          v-else-if="s.status === 'busy' && s.mine"
          :data-hour="s.hour"
          class="relative h-20 overflow-hidden rounded-xl border-2 border-brand-coral bg-brand-coral/15"
        >
          <Button
            v-if="interactive && s.bookingId"
            variant="ghost"
            size="icon-sm"
            aria-label="Stornieren"
            class="absolute bottom-1.5 right-1.5 z-20 bg-background/60 backdrop-blur-sm hover:bg-background/80"
            @pointerdown.stop
            @click="emit('cancel', s.bookingId)"
          >
            <X class="size-4" />
          </Button>
          <span class="relative z-10 flex h-full flex-col items-start justify-between p-3">
            <span class="flex w-full items-center justify-between gap-2">
              <span class="min-w-0 truncate font-display font-semibold">{{ s.label }}</span>
              <span v-if="s.weather" class="inline-flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums">
                <BookingWeatherGlyph :kind="s.weather.kind" class="-my-2 size-9" />{{ s.weather.temp }}°
              </span>
            </span>
            <span class="flex w-full min-w-0 flex-col pr-9">
              <span class="truncate text-sm font-semibold text-brand-coral-dark">Deine Buchung</span>
              <span v-if="s.note" class="truncate text-xs text-brand-coral-dark/80" :title="s.note">{{ s.note }}</span>
            </span>
          </span>
        </div>

        <!-- Belegt (fremd) -->
        <div
          v-else-if="s.status === 'busy'"
          :data-hour="s.hour"
          class="relative h-20 overflow-hidden rounded-xl border border-border bg-muted/50"
        >
          <span class="slot-hatch absolute inset-0" />
          <span class="relative z-10 flex h-full flex-col items-start justify-between p-3">
            <span class="flex w-full items-center justify-between gap-2">
              <span class="min-w-0 truncate font-display font-semibold">{{ s.label }}</span>
              <span v-if="s.weather" class="inline-flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums opacity-80">
                <BookingWeatherGlyph :kind="s.weather.kind" class="-my-2 size-9" />{{ s.weather.temp }}°
              </span>
            </span>
            <span class="w-full min-w-0">
              <span class="block truncate text-sm font-semibold" :title="s.bookedBy || 'Belegt'">{{ s.bookedBy || 'Belegt' }}</span>
              <span v-if="s.note" class="block truncate text-xs opacity-80" :title="s.note">{{ s.note }}</span>
            </span>
          </span>
        </div>

        <!-- Vergangen -->
        <div
          v-else
          :data-hour="s.hour"
          class="relative h-20 overflow-hidden rounded-xl border border-dashed border-border/60 opacity-50"
        >
          <span class="relative z-10 flex h-full flex-col items-start justify-between p-3">
            <span class="w-full truncate font-display font-semibold">{{ s.label }}</span>
            <span class="text-sm">Vorbei</span>
          </span>
        </div>
      </template>
    </div>

    <p v-if="interactive" class="mt-3 text-center text-xs text-muted-foreground">
      Tipp: Für mehrere Stunden über die freien Slots ziehen – am Handy einen Slot kurz halten, dann ziehen.
    </p>
  </div>
</template>
