<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'vue-sonner'

useSeoMeta({ title: 'Neues Passwort', description: 'Neues Passwort für O.H.BEACH setzen.' })

const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const done = ref(false)

async function onSubmit() {
  if (password.value.length < 8) {
    toast.error('Das Passwort muss mindestens 8 Zeichen haben.')
    return
  }
  if (password.value !== confirm.value) {
    toast.error('Die Passwörter stimmen nicht überein.')
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/set-password', {
      method: 'POST',
      body: { token: token.value, password: password.value },
    })
    done.value = true
    toast.success('Passwort gesetzt. Du kannst dich jetzt anmelden.')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.statusMessage || 'Das hat nicht geklappt.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col px-4 py-16">
    <Card>
      <CardHeader>
        <CardTitle>Neues Passwort</CardTitle>
        <CardDescription>Wähle ein sicheres Passwort (mind. 8 Zeichen).</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert v-if="!token" variant="destructive">
          <AlertTitle>Ungültiger Link</AlertTitle>
          <AlertDescription>
            Dieser Link ist unvollständig. Fordere bitte einen neuen
            <NuxtLink to="/passwort/vergessen" class="underline">Passwort-Link</NuxtLink> an.
          </AlertDescription>
        </Alert>

        <div v-else-if="done" class="space-y-4">
          <Alert>
            <AlertTitle>Geschafft!</AlertTitle>
            <AlertDescription>Dein Passwort wurde gesetzt.</AlertDescription>
          </Alert>
          <Button as-child class="w-full"><NuxtLink to="/login">Zum Login</NuxtLink></Button>
        </div>

        <form v-else class="space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-2">
            <Label for="pw">Neues Passwort</Label>
            <Input id="pw" v-model="password" type="password" autocomplete="new-password" required placeholder="••••••••" />
          </div>
          <div class="space-y-2">
            <Label for="pw2">Passwort wiederholen</Label>
            <Input id="pw2" v-model="confirm" type="password" autocomplete="new-password" required placeholder="••••••••" />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Speichern …' : 'Passwort setzen' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
