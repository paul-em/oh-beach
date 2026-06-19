<script setup lang="ts">
import { Wind } from '@lucide/vue'

type WeatherKind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'

interface DayWeather {
  kind: WeatherKind
  tempMax: number
  tempMin: number
  windMax: number
  windy: boolean
}

const props = defineProps<{ weather: DayWeather | null }>()

const LABELS: Record<WeatherKind, string> = {
  clear: 'Sonnig',
  partly: 'Heiter',
  cloudy: 'Bewölkt',
  fog: 'Neblig',
  rain: 'Regen',
  snow: 'Schnee',
  storm: 'Gewitter',
}

const label = computed(() => (props.weather ? LABELS[props.weather.kind] : ''))
</script>

<template>
  <div
    v-if="weather"
    class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-sm"
    :title="label"
  >
    <BookingWeatherGlyph :kind="weather.kind" class="-my-2 size-8" :alt="label" />
    <span class="font-medium">{{ weather.tempMax }}°</span>
    <span class="text-muted-foreground">/ {{ weather.tempMin }}°</span>
    <span v-if="weather.windy" class="inline-flex items-center gap-1 text-muted-foreground" title="Windig">
      <Wind class="size-3.5" />
      {{ weather.windMax }} km/h
    </span>
  </div>
</template>
