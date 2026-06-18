<script setup lang="ts">
/*
  Section-Wrapper mit einheitlichem Spacing und optionalem Farb-Ton.
  `tone` bricht den monotonen Sand-Stapel auf und gibt der Seite Rhythmus.
*/
withDefaults(defineProps<{ id?: string; tone?: 'sand' | 'navy' }>(), {
  tone: 'sand',
})
</script>

<template>
  <section
    :id="id"
    :class="[
      'py-16 md:py-24',
      tone === 'navy' ? 'bg-brand-navy text-white' : 'sand-grain bg-background',
    ]"
  >
    <div class="mx-auto w-full max-w-6xl px-4">
      <slot />
    </div>
  </section>
</template>
