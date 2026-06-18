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

// ---- Mehrfachauswahl per Ziehen (Maus & Touch) ----------------------------
const byHour = computed(() => new Map(props.slots.map((s) => [s.hour, s])))
const anchor = ref<number | null>(null)
const hoverHour = ref<number | null>(null)

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

function onDown(hour: number, e: PointerEvent) {
  if (!selectable(hour)) return
  e.preventDefault()
  anchor.value = hour
  hoverHour.value = hour
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', reset)
}
function onMove(e: PointerEvent) {
  if (anchor.value == null) return
  const cell = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest('[data-hour]') as HTMLElement | null
  const h = cell ? Number(cell.dataset.hour) : Number.NaN
  if (!Number.isNaN(h)) hoverHour.value = h
}
function onUp() {
  const hours = [...selectedHours.value]
  reset()
  if (hours.length) emit('book', hours)
}
function reset() {
  anchor.value = null
  hoverHour.value = null
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', reset)
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
      :class="{ 'touch-none select-none': interactive }"
      @pointermove="onMove"
    >
      <template v-for="s in slots" :key="s.hour">
        <!-- Frei + buchbar -->
        <button
          v-if="s.status === 'free' && interactive"
          type="button"
          :data-hour="s.hour"
          :data-weather="s.weather?.kind"
          :data-selected="selectedSet.has(s.hour) || undefined"
          class="group relative h-20 overflow-hidden rounded-xl border-2 border-brand-sky/40 text-left transition-colors hover:border-brand-sky data-selected:border-brand-coral data-selected:ring-2 data-selected:ring-brand-coral/40"
          @pointerdown="onDown(s.hour, $event)"
          @keydown.enter.prevent="emit('book', [s.hour])"
          @keydown.space.prevent="emit('book', [s.hour])"
        >
          <span class="weather-surface absolute inset-0 opacity-90 transition-opacity group-hover:opacity-100" />
          <span v-if="selectedSet.has(s.hour)" class="absolute inset-0 bg-brand-coral/15" />
          <BookingWeatherGlyph :kind="s.weather?.kind" :stroke-width="1.25" class="pointer-events-none absolute -bottom-4 -right-3 size-24 text-foreground/15" />
          <span class="relative z-10 flex h-full flex-col items-start justify-between p-3">
            <span class="flex w-full items-start justify-between gap-2">
              <span class="font-display font-semibold drop-shadow-sm">{{ s.label }}</span>
              <span v-if="s.weather" class="text-xs font-semibold tabular-nums opacity-80">{{ s.weather.temp }}°</span>
            </span>
            <span class="text-sm font-semibold drop-shadow-sm">{{ selectedSet.has(s.hour) ? 'Ausgewählt' : 'Frei · buchen' }}</span>
          </span>
        </button>

        <!-- Frei, nur Anzeige -->
        <div
          v-else-if="s.status === 'free'"
          :data-hour="s.hour"
          :data-weather="s.weather?.kind"
          class="relative h-20 overflow-hidden rounded-xl border border-border/70"
        >
          <span class="weather-surface absolute inset-0 opacity-80" />
          <BookingWeatherGlyph :kind="s.weather?.kind" :stroke-width="1.25" class="pointer-events-none absolute -bottom-4 -right-3 size-24 text-foreground/15" />
          <span class="relative z-10 flex h-full flex-col items-start justify-between p-3">
            <span class="flex w-full items-start justify-between gap-2">
              <span class="font-display font-semibold drop-shadow-sm">{{ s.label }}</span>
              <span v-if="s.weather" class="text-xs font-semibold tabular-nums opacity-80">{{ s.weather.temp }}°</span>
            </span>
            <span class="text-sm font-semibold drop-shadow-sm">Frei</span>
          </span>
        </div>

        <!-- Eigene Buchung -->
        <div
          v-else-if="s.status === 'busy' && s.mine"
          :data-hour="s.hour"
          :data-weather="s.weather?.kind"
          class="relative h-20 overflow-hidden rounded-xl border-2 border-brand-coral/60"
        >
          <span class="weather-surface absolute inset-0 opacity-70" />
          <span class="absolute inset-0 bg-brand-coral/15" />
          <BookingWeatherGlyph :kind="s.weather?.kind" :stroke-width="1.25" class="pointer-events-none absolute -bottom-4 -right-3 size-24 text-foreground/15" />
          <span class="relative z-10 flex h-full flex-col items-start justify-between p-3">
            <span class="flex w-full items-start justify-between gap-2">
              <span class="font-display font-semibold drop-shadow-sm">{{ s.label }}</span>
              <span v-if="s.weather" class="text-xs font-semibold tabular-nums opacity-80">{{ s.weather.temp }}°</span>
            </span>
            <span class="flex w-full items-end justify-between gap-2">
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-brand-coral-dark drop-shadow-sm">Deine Buchung</span>
                <span v-if="s.note" class="block truncate text-xs text-brand-coral-dark/80" :title="s.note">{{ s.note }}</span>
              </span>
              <Button
                v-if="interactive && s.bookingId"
                variant="ghost"
                size="icon-sm"
                aria-label="Stornieren"
                @pointerdown.stop
                @click="emit('cancel', s.bookingId)"
              >
                <X class="size-4" />
              </Button>
            </span>
          </span>
        </div>

        <!-- Belegt (fremd) -->
        <div
          v-else-if="s.status === 'busy'"
          :data-hour="s.hour"
          :data-weather="s.weather?.kind"
          class="relative h-20 overflow-hidden rounded-xl border border-border"
        >
          <span class="weather-surface absolute inset-0 opacity-60" />
          <span class="absolute inset-0 bg-foreground/10" />
          <BookingWeatherGlyph :kind="s.weather?.kind" :stroke-width="1.25" class="pointer-events-none absolute -bottom-4 -right-3 size-24 text-foreground/15" />
          <span class="relative z-10 flex h-full flex-col items-start justify-between p-3">
            <span class="flex w-full items-start justify-between gap-2">
              <span class="font-display font-semibold drop-shadow-sm">{{ s.label }}</span>
              <span v-if="s.weather" class="text-xs font-semibold tabular-nums opacity-80">{{ s.weather.temp }}°</span>
            </span>
            <span class="w-full min-w-0">
              <span class="block truncate text-sm font-semibold drop-shadow-sm" :title="s.bookedBy || 'Belegt'">{{ s.bookedBy || 'Belegt' }}</span>
              <span v-if="s.note" class="block truncate text-xs opacity-80" :title="s.note">{{ s.note }}</span>
            </span>
          </span>
        </div>

        <!-- Vergangen -->
        <div
          v-else
          :data-hour="s.hour"
          :data-weather="s.weather?.kind"
          class="relative h-20 overflow-hidden rounded-xl border border-dashed border-border/60 opacity-50"
        >
          <span class="weather-surface absolute inset-0 opacity-25" />
          <BookingWeatherGlyph :kind="s.weather?.kind" :stroke-width="1.25" class="pointer-events-none absolute -bottom-4 -right-3 size-24 text-foreground/15" />
          <span class="relative z-10 flex h-full flex-col items-start justify-between p-3">
            <span class="font-display font-semibold">{{ s.label }}</span>
            <span class="text-sm">Vorbei</span>
          </span>
        </div>
      </template>
    </div>

    <p v-if="interactive" class="mt-3 text-center text-xs text-muted-foreground">
      Tipp: Über mehrere freie Slots ziehen, um gleich mehrere Stunden zu buchen.
    </p>
  </div>
</template>
