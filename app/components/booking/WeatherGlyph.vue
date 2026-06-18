<script setup lang="ts">
/**
 * Wetter-Icon für eine Wetter-Art – zentrale Zuordnung (von WeatherBadge und als
 * dezentes Hintergrund-Wasserzeichen in den Slots genutzt). Klasse/Attribute
 * werden an das gerenderte SVG durchgereicht (Größe, Farbe, stroke-width …).
 */
import { Sun, CloudSun, Cloudy, CloudFog, CloudRain, CloudSnow, CloudLightning } from '@lucide/vue'

type WeatherKind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'

const props = defineProps<{ kind?: WeatherKind | null }>()

const ICONS: Record<WeatherKind, any> = {
  clear: Sun,
  partly: CloudSun,
  cloudy: Cloudy,
  fog: CloudFog,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
}

const icon = computed(() => (props.kind ? ICONS[props.kind] : null))
</script>

<template>
  <component :is="icon" v-if="icon" />
</template>
