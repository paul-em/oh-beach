<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

useSeoMeta({ title: 'Passwort setzen', description: 'Passwort-Link für O.H.BEACH anfordern.' })

const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/request-link', { method: 'POST', body: { email: email.value } })
    sent.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col px-4 py-16">
    <Card>
      <CardHeader>
        <CardTitle>Passwort setzen</CardTitle>
        <CardDescription>
          Für dein erstes Login oder ein vergessenes Passwort schicken wir dir einen Link per E-Mail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert v-if="sent">
          <AlertTitle>Check deine E-Mails</AlertTitle>
          <AlertDescription>
            Falls ein aktives Konto mit dieser Adresse existiert, haben wir dir einen
            Link zum Setzen des Passworts geschickt. Er ist 30 Minuten gültig.
          </AlertDescription>
        </Alert>

        <form v-else class="space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-2">
            <Label for="email">E-Mail</Label>
            <Input id="email" v-model="email" type="email" autocomplete="email" required placeholder="name@verein.at" />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Senden …' : 'Link anfordern' }}
          </Button>
        </form>

        <div class="mt-4 text-center text-sm text-muted-foreground">
          <NuxtLink to="/login" class="underline underline-offset-4 hover:text-foreground">Zurück zum Login</NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
