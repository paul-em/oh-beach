<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

useSeoMeta({ title: 'Anmeldung', description: 'Anmeldung bei O.H.BEACH.' })

const route = useRoute()
const { fetch: refreshSession } = useUserSession()

const token = typeof route.query.token === 'string' ? route.query.token : ''
const state = ref<'verifying' | 'error'>('verifying')

function redirectTarget() {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') ? r : '/mitglieder'
}

onMounted(async () => {
  if (!token) {
    state.value = 'error'
    return
  }
  try {
    await $fetch('/api/auth/verify', { method: 'POST', body: { token } })
    await refreshSession()
    await navigateTo(redirectTarget())
  } catch {
    state.value = 'error'
  }
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col px-4 py-16">
    <Card>
      <CardHeader>
        <CardTitle>Anmeldung</CardTitle>
        <CardDescription>Wir melden dich gerade an …</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="state === 'verifying'" class="flex items-center gap-3 text-muted-foreground">
          <span class="size-4 animate-spin rounded-full border-2 border-brand-coral border-t-transparent" />
          Einen Moment …
        </div>

        <div v-else class="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Link ungültig oder abgelaufen</AlertTitle>
            <AlertDescription>
              Dieser Anmelde-Link funktioniert nicht mehr. Fordere bitte einen neuen an.
            </AlertDescription>
          </Alert>
          <Button as-child class="w-full"><NuxtLink to="/login">Neuen Link anfordern</NuxtLink></Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
