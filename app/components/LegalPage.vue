<script setup lang="ts">
defineProps<{ title: string; updated?: string }>()
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-16">
    <NuxtLink to="/" class="text-sm text-muted-foreground hover:text-foreground">← Zur Startseite</NuxtLink>
    <h1 class="mt-4 text-4xl">{{ title }}</h1>
    <p v-if="updated" class="mt-2 text-sm text-muted-foreground">Stand: {{ updated }}</p>
    <div class="prose-legal mt-8">
      <slot />
    </div>
  </div>
</template>
