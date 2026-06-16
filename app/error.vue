<script setup lang="ts">
import { Button } from '@/components/ui/button'

const props = defineProps<{ error: { statusCode: number; statusMessage?: string; message?: string } }>()
const is404 = computed(() => props.error?.statusCode === 404)

useHead({ title: is404.value ? 'Seite nicht gefunden' : 'Fehler' })
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center gap-6 bg-brand-sand-soft px-4 text-center">
    <BrandFaultierMascot :size="200" />
    <div class="space-y-2">
      <h1 class="text-4xl">
        {{ is404 ? 'Hier ist nur Sand …' : 'Das Faultier ist kurz eingenickt.' }}
      </h1>
      <p class="max-w-md text-muted-foreground">
        {{ is404 ? 'Diese Seite gibt es leider nicht.' : 'Da ist etwas schiefgelaufen.' }}
        <span class="text-sm">(Fehler {{ error?.statusCode }})</span>
      </p>
    </div>
    <Button @click="clearError({ redirect: '/' })">Zurück zur Startseite</Button>
  </div>
</template>
