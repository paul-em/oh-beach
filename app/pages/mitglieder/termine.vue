<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CalendarSync, CalendarX, Check, Clock, Copy, MapPin } from '@lucide/vue'
import { toast } from 'vue-sonner'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Termine' })

const { data, pending, error } = await useFetch('/api/events', { default: () => ({ events: [] }) })

// Persönlicher Abo-Link (nur im Browser laden, wird nicht gecacht/gerendert)
const { data: feed } = useLazyFetch('/api/events/feed-link', { server: false })
const { copy, copied } = useClipboard({ legacy: true })

async function copyFeedUrl() {
  if (!feed.value) return
  await copy(feed.value.url)
  toast.success('Link kopiert.')
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-4 py-12">
    <header class="mb-8">
      <h1 class="text-4xl">Termine</h1>
      <p class="mt-2 text-muted-foreground">Was im Verein ansteht – Sitzungen, Arbeitseinsätze, Feste und mehr.</p>
    </header>

    <Card class="mb-8">
      <CardContent class="py-5">
        <div class="flex items-start gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-coral/15 text-brand-coral">
            <CalendarSync class="size-5" />
          </div>
          <div class="min-w-0">
            <p class="font-semibold">Im eigenen Kalender abonnieren</p>
            <p class="text-sm text-muted-foreground">
              Neue Termine erscheinen automatisch in deiner Kalender-App.
            </p>
          </div>
        </div>
        <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button as-child size="sm" :disabled="!feed">
            <a :href="feed?.webcalUrl">Apple / Outlook</a>
          </Button>
          <Button as-child size="sm" variant="secondary" :disabled="!feed">
            <a :href="feed?.googleUrl" target="_blank" rel="noopener">Google Calendar</a>
          </Button>
          <Button size="sm" variant="outline" :disabled="!feed" @click="copyFeedUrl">
            <Check v-if="copied" class="size-4" /><Copy v-else class="size-4" /> Link kopieren
          </Button>
        </div>
        <p class="mt-3 text-xs text-muted-foreground">
          Der Link ist persönlich – bitte nicht weitergeben. Kalender-Apps laden Änderungen
          verzögert nach (Google teils erst nach bis zu 24 Stunden); aktuell ist immer diese Seite.
          Klappt der Google-Button nicht: Link kopieren und in Google Calendar unter
          „Weitere Kalender → Per URL“ einfügen.
        </p>
      </CardContent>
    </Card>

    <div v-if="pending" class="text-muted-foreground">Lädt …</div>

    <Alert v-else-if="error" variant="destructive">
      <AlertTitle>Termine nicht verfügbar</AlertTitle>
      <AlertDescription>{{ error.data?.statusMessage || 'Bitte später noch einmal versuchen.' }}</AlertDescription>
    </Alert>

    <div v-else-if="!data.events.length" class="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-12 text-center">
      <CalendarX class="size-10 text-muted-foreground" />
      <p class="text-muted-foreground">Aktuell sind keine Termine eingetragen.</p>
    </div>

    <div v-else class="space-y-3">
      <Card v-for="ev in data.events" :key="ev.id">
        <CardContent class="flex gap-4 py-4">
          <div class="flex w-14 shrink-0 flex-col items-center justify-center self-start rounded-xl bg-brand-sky/15 py-2 text-brand-sky-dark">
            <span class="text-xs font-semibold uppercase">{{ eventDateBadge(ev).month }}</span>
            <span class="font-display text-2xl font-bold leading-none">{{ eventDateBadge(ev).day }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-display text-lg font-semibold">{{ ev.title }}</p>
            <p class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock class="size-4 shrink-0" /> <span>{{ formatEventWhen(ev) }}</span>
            </p>
            <p v-if="ev.location" class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin class="size-4 shrink-0" /> <span class="break-words">{{ ev.location }}</span>
            </p>
            <p v-if="ev.description" class="mt-3 whitespace-pre-line break-words text-sm">{{ ev.description }}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
