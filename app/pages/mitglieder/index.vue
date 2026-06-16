<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CalendarPlus, CalendarDays, ListChecks } from '@lucide/vue'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Mein Bereich' })

const { user } = useUserSession()
</script>

<template>
  <div class="mx-auto w-full max-w-5xl px-4 py-12">
    <div class="flex items-center gap-4">
      <BrandFaultierMascot :size="80" />
      <div>
        <h1 class="text-3xl">Hallo, {{ user?.name || 'Mitglied' }}!</h1>
        <p class="text-muted-foreground">Schön, dass du da bist. Bereit für ein Match?</p>
      </div>
    </div>

    <Alert v-if="user && user.paid === false" variant="destructive" class="mt-6">
      <AlertTitle>Mitgliedsbeitrag offen</AlertTitle>
      <AlertDescription>
        Wir konnten deinen Beitrag noch nicht zuordnen. Reservierungen sind erst nach
        Zahlungseingang möglich – melde dich bei Fragen beim Vorstand.
      </AlertDescription>
    </Alert>

    <div class="mt-8 grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <div class="mb-2 flex size-12 items-center justify-center rounded-xl bg-brand-coral/15 text-brand-coral">
            <CalendarPlus class="size-6" />
          </div>
          <CardTitle>Platz reservieren</CardTitle>
          <CardDescription>Freien Zeitslot wählen und buchen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button as-child class="w-full"><NuxtLink to="/mitglieder/reservieren">Zur Reservierung</NuxtLink></Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div class="mb-2 flex size-12 items-center justify-center rounded-xl bg-brand-turquoise/15 text-brand-turquoise-dark">
            <ListChecks class="size-6" />
          </div>
          <CardTitle>Meine Buchungen</CardTitle>
          <CardDescription>Deine kommenden Reservierungen verwalten.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button as-child variant="secondary" class="w-full"><NuxtLink to="/mitglieder/meine-buchungen">Anzeigen</NuxtLink></Button>
        </CardContent>
      </Card>
    </div>

    <div class="mt-6">
      <Button as-child variant="ghost">
        <NuxtLink to="/kalender"><CalendarDays class="size-4" /> Öffentliche Platzbelegung ansehen</NuxtLink>
      </Button>
    </div>
  </div>
</template>
