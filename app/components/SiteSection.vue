<script setup lang="ts">
defineProps<{ id?: string }>()
</script>

<template>
  <section :id="id" class="sand-grain bg-background py-16 md:py-24">
    <div class="mx-auto w-full max-w-6xl px-4">
      <slot />
    </div>
  </section>
</template>
