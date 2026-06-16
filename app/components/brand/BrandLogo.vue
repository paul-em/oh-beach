<script setup lang="ts">
import { cn } from '@/lib/utils'

/*
  Offizielles O.H.BEACH-Logo (public/Logo-OHBeach*.png).
  - variant: 'dark' (Standard, für helle Flächen) | 'white' (für dunkle Flächen)
  - emblem:  nur das runde Emblem (oberes Quadrat des Lockups) – per CSS zugeschnitten,
             ideal für den schmalen Header. Größe über `class` (z. B. w-10).
  - sonst:   komplettes Lockup inkl. Wortmarke – Größe über `class` (z. B. h-20).
*/
const props = withDefaults(
  defineProps<{ variant?: 'dark' | 'white'; emblem?: boolean; class?: string }>(),
  { variant: 'dark', emblem: false },
)

const src = computed(() =>
  props.variant === 'white' ? '/Logo-OHBeach-white.png' : '/Logo-OHBeach.png',
)
</script>

<template>
  <span
    v-if="emblem"
    :class="cn('inline-block aspect-square overflow-hidden', props.class)"
    role="img"
    aria-label="O.H.BEACH Volleyballverein"
  >
    <img :src="src" alt="" class="h-auto w-full max-w-none" style="object-position: top" />
  </span>
  <img
    v-else
    :src="src"
    alt="O.H.BEACH Volleyballverein"
    :class="cn('w-auto', props.class)"
  />
</template>
