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
  weather?: { kind: WeatherKind; temp: number } | null
}

withDefaults(
  defineProps<{ slots: BookingSlot[]; interactive?: boolean; pending?: boolean }>(),
  { interactive: false, pending: false },
)
const emit = defineEmits<{ book: [number]; cancel: [string] }>()
</script>

<template>
  <div>
    <div v-if="pending" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <Skeleton v-for="i in 8" :key="i" class="h-20 rounded-xl" />
    </div>

    <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <template v-for="s in slots" :key="s.hour">
        <!-- Frei + buchbar -->
        <button
          v-if="s.status === 'free' && interactive"
          type="button"
          :data-weather="s.weather?.kind"
          class="group relative h-20 overflow-hidden rounded-xl border-2 border-brand-sky/40 text-left transition-colors hover:border-brand-sky"
          @click="emit('book', s.hour)"
        >
          <span class="weather-surface absolute inset-0 opacity-90 transition-opacity group-hover:opacity-100" />
          <BookingWeatherGlyph :kind="s.weather?.kind" :stroke-width="1.25" class="pointer-events-none absolute -bottom-4 -right-3 size-24 text-foreground/15" />
          <span class="relative z-10 flex h-full flex-col items-start justify-between p-3">
            <span class="flex w-full items-start justify-between gap-2">
              <span class="font-display font-semibold drop-shadow-sm">{{ s.label }}</span>
              <span v-if="s.weather" class="text-xs font-semibold tabular-nums opacity-80">{{ s.weather.temp }}°</span>
            </span>
            <span class="text-sm font-semibold drop-shadow-sm">Frei · buchen</span>
          </span>
        </button>

        <!-- Frei, nur Anzeige -->
        <div
          v-else-if="s.status === 'free'"
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
            <span class="flex w-full items-center justify-between">
              <span class="text-sm font-semibold text-brand-coral-dark drop-shadow-sm">Deine Buchung</span>
              <Button
                v-if="interactive && s.bookingId"
                variant="ghost"
                size="icon-sm"
                aria-label="Stornieren"
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
            <span class="w-full truncate text-sm font-semibold drop-shadow-sm" :title="s.bookedBy || 'Belegt'">{{ s.bookedBy || 'Belegt' }}</span>
          </span>
        </div>

        <!-- Vergangen -->
        <div
          v-else
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
  </div>
</template>
