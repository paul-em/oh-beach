<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

useSeoMeta({
  title: 'Platzbelegung',
  description: 'Aktuelle Belegung des Beachvolleyball-Platzes von O.H.BEACH – sieh, wann frei ist.',
})

const { loggedIn } = useUserSession()

// Eingeloggte Mitglieder brauchen keine reine Lese-Ansicht – direkt zur Reservierung (Datum mitnehmen).
const route = useRoute()
if (loggedIn.value) {
  await navigateTo({ path: '/mitglieder/reservieren', query: route.query })
}

const date = useDateParam()

const { data, pending } = await useFetch('/api/bookings', {
  query: { date },
  default: () => null,
})
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-12">
    <header class="mb-8 flex items-end justify-between gap-6">
      <div class="max-w-2xl">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-brand-coral">
          Unser Platz · Offenhausen
        </p>
        <h1 class="mt-3 text-4xl sm:text-5xl">Platzbelegung</h1>
        <p class="mt-3 text-muted-foreground">
          Hier siehst du, wann der Platz frei ist. Reservieren können angemeldete Mitglieder.
        </p>
      </div>
      <BrandFaultierMascot :size="120" class="hidden shrink-0 drop-shadow-lg sm:block" />
    </header>

    <Card :data-weather="data?.weather?.kind" class="weather-tint">
      <CardContent class="space-y-6 pt-6">
        <BookingDayStrip v-model="date" :today="data?.today || date" :max-date="data?.maxDate || date" />
        <BookingDateNav v-model="date" :today="data?.today || date" :max-date="data?.maxDate || date" :weather="data?.weather" />
        <BookingSlotGrid :slots="data?.slots || []" :pending="pending" />
      </CardContent>
    </Card>

    <div class="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      <span class="inline-flex items-center gap-2"><span class="size-3 rounded bg-brand-sky/40" /> Frei</span>
      <span class="inline-flex items-center gap-2"><span class="size-3 rounded bg-muted-foreground/40" /> Belegt</span>
    </div>

    <div class="mt-8 rounded-xl border border-border/70 bg-brand-sand-soft p-6">
      <template v-if="loggedIn">
        <p class="mb-3 font-semibold">Bereit für ein Match?</p>
        <Button as-child><NuxtLink to="/mitglieder/reservieren">Jetzt reservieren</NuxtLink></Button>
      </template>
      <template v-else>
        <p class="mb-3 font-semibold">Du bist Mitglied?</p>
        <Button as-child><NuxtLink to="/login">Einloggen &amp; reservieren</NuxtLink></Button>
      </template>
    </div>
  </div>
</template>
