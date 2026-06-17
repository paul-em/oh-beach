<script setup lang="ts">
import { cn } from '@/lib/utils'

/*
  Offizielles O.H.BEACH-Logo (public/Logo-OHBeach*).
  - variant 'landscape-small': kompaktes Emblem + Wortmarke seitlich (SVG, für Header)
  - variant 'landscape': Emblem + Wortmarke seitlich (mehr Rand)
  - variant 'portrait':  vollständiges Lockup (Emblem über Wortmarke)
  - variant 'emblem':    nur das Emblem als SVG (kompakt, skaliert verlustfrei)
  - color   'dark' (Standard, für helle Flächen) | 'white' (für dunkle Flächen)
  Größe über `class` (z. B. h-8, h-24).
*/
const props = withDefaults(
  defineProps<{
    variant?: 'landscape-small' | 'landscape' | 'portrait' | 'emblem'
    color?: 'dark' | 'white'
    class?: string
  }>(),
  { variant: 'landscape-small', color: 'dark' },
)

const SRC: Record<string, string> = {
  'landscape-small-dark': '/Logo-OHBeach-landscape-small.svg',
  'landscape-small-white': '/Logo-OHBeach-landscape-small.svg', // keine White-Variante -> dark
  'landscape-dark': '/Logo-OHBeach-landscape.png',
  'landscape-white': '/Logo-OHBeach-landscape.png', // keine White-Landscape-Variante -> dark
  'portrait-dark': '/Logo-OHBeach.png',
  'portrait-white': '/Logo-OHBeach-white.png',
  'emblem-dark': '/Logo-OHBeach-no-text.svg',
  'emblem-white': '/Logo-OHBeach-no-text-white.svg',
}
const src = computed(() => SRC[`${props.variant}-${props.color}`] ?? SRC['portrait-dark'])
</script>

<template>
  <img :src="src" alt="O.H.BEACH Volleyballverein" :class="cn('w-auto', props.class)" />
</template>
