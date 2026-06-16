<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'

useSeoMeta({ title: 'Login', description: 'Mitglieder-Login von O.H.BEACH.' })

const route = useRoute()
const { loggedIn, fetch: refreshSession } = useUserSession()

const email = ref('')
const password = ref('')
const loading = ref(false)

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
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await refreshSession()
    toast.success('Willkommen zurück!')
    await navigateTo(redirectTarget())
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.statusMessage || 'Login fehlgeschlagen.')
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
        <CardDescription>Melde dich an, um den Platz zu reservieren.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-2">
            <Label for="email">E-Mail</Label>
            <Input id="email" v-model="email" type="email" autocomplete="email" required placeholder="name@verein.at" />
          </div>
          <div class="space-y-2">
            <Label for="password">Passwort</Label>
            <Input id="password" v-model="password" type="password" autocomplete="current-password" required placeholder="••••••••" />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Anmelden …' : 'Anmelden' }}
          </Button>
        </form>
        <div class="mt-4 text-center text-sm text-muted-foreground">
          <NuxtLink to="/passwort/vergessen" class="underline underline-offset-4 hover:text-foreground">
            Passwort vergessen oder erstes Login?
          </NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
