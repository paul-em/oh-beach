<script setup lang="ts">
withDefaults(defineProps<{ alt?: boolean; id?: string }>(), { alt: false })
</script>

<template>
  <section :id="id" :class="['sand-grain py-16 md:py-24', alt ? 'bg-brand-sand-soft' : 'bg-background']">
    <div class="mx-auto w-full max-w-6xl px-4">
      <slot />
    </div>
  </section>
</template>
