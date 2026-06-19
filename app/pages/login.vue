<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'vue-sonner'

useSeoMeta({ title: 'Login', description: 'Mitglieder-Login von O.H.BEACH.' })

const route = useRoute()
const { loggedIn } = useUserSession()

const email = ref('')
const loading = ref(false)
const sent = ref(false)

// Bereits eingeloggt? Direkt weiter.
watchEffect(() => {
  if (loggedIn.value) navigateTo(redirectTarget())
})

function redirectTarget() {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') ? r : '/mitglieder'
}

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/request-link', { method: 'POST', body: { email: email.value } })
    sent.value = true
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.statusMessage || 'Das hat nicht geklappt.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col items-center px-4 py-16">
    <BrandFaultierMascot :size="120" />
    <Card class="mt-6 w-full">
      <CardHeader>
        <CardTitle>Mitglieder-Login</CardTitle>
        <CardDescription>
          Gib deine E-Mail ein – wir schicken dir einen Anmelde-Link. Kein Passwort nötig.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert v-if="sent">
          <AlertTitle>Check deine E-Mails</AlertTitle>
          <AlertDescription>
            Falls ein aktives Konto mit dieser Adresse existiert, haben wir dir einen
            Anmelde-Link geschickt. Er ist 30 Minuten gültig.
          </AlertDescription>
        </Alert>

        <form v-else class="space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-2">
            <Label for="email">E-Mail</Label>
            <Input id="email" v-model="email" type="email" autocomplete="email" required placeholder="deine@email.com" />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Link senden …' : 'Anmelde-Link senden' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
