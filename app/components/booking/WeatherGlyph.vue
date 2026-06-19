<script setup lang="ts">
/**
 * Wetter-Icon für eine Wetter-Art – animiertes SVG aus dem Set
 * „Makin-Things/weather-icons". Die Dateien liegen unter
 * /public/weather-icons/<kind>.svg und werden per <img> eingebunden, damit die
 * SVG-internen CSS-Animationen laufen. Größe per Klasse (z. B. size-6) steuern.
 */
type WeatherKind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'

const props = defineProps<{ kind?: WeatherKind | null; alt?: string }>()

const src = computed(() => (props.kind ? `/weather-icons/${props.kind}.svg` : null))
</script>

<template>
  <img v-if="src" :src="src" :alt="alt || ''" draggable="false" class="select-none object-contain" />
</template>
