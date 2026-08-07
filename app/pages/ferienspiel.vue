<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalendarDays, Clock, MapPin, Users, Sun, Sparkles, Volleyball,
  Utensils, Smile, ArrowRight, Phone, ExternalLink, Info, Heart,
} from '@lucide/vue'

const REGISTER_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScCBBnTYo5VE1z4KkY4G66p09qVEmnp3eFbHWSU1XS90FFNyg/viewform'
const CONTACT_PHONE = '0699/19961402'
const CONTACT_NAME = 'Verena Seiler'

useSeoMeta({
  title: 'Ferienspielaktion 2026',
  description:
    'Beachvolleyball-Ferienspielaktion des O.H.BEACH Offenhausen am 31. Juli 2026 von 10 bis 14 Uhr. Sport, Spaß und Sommerfeeling im Sand – ab 7 Jahren, inkl. Verpflegung. Jetzt anmelden!',
})

const facts = [
  { icon: CalendarDays, label: 'Wann', value: 'Freitag, 31. Juli 2026' },
  { icon: Clock, label: 'Uhrzeit', value: '10:00 – 14:00 Uhr' },
  { icon: MapPin, label: 'Wo', value: 'Beachvolleyballplatz Offenhausen' },
  { icon: Users, label: 'Wer', value: 'Kinder ab 7 Jahren' },
  { icon: Utensils, label: 'Verpflegung', value: 'inkl. Mittagssnack & Getränke' },
  { icon: CalendarDays, label: 'Anmeldeschluss', value: 'Montag, 27. Juli 2026' },
]

const highlights = [
  {
    icon: Volleyball,
    title: 'Spannende Beachvolleyball-Spiele',
    text: 'Wir spielen, üben und toben gemeinsam im Sand – egal ob Anfänger oder schon mit Erfahrung.',
  },
  {
    icon: Sparkles,
    title: 'Coole Übungen & Tipps',
    text: 'Unsere Trainer:innen zeigen dir die ersten Tricks und alles, was du für ein gutes Spiel brauchst.',
  },
  {
    icon: Smile,
    title: 'Bewegung & gute Laune',
    text: 'Jede Menge Bewegung, Sonne und ein unvergesslicher Sommertag mit uns – der Spaß steht im Vordergrund!',
  },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="sand-glow relative overflow-hidden bg-brand-sand-soft">
      <div class="mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
        <div class="max-w-2xl space-y-6">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-brand-coral">
            Ferienspielaktion · 31. Juli 2026
          </p>
          <h1 class="text-5xl sm:text-6xl lg:text-7xl">
            Beachvolleyball<br /><span class="text-brand-coral">Action!</span>
          </h1>
          <p class="max-w-md text-lg text-muted-foreground">
            Lust auf Sport, Spaß und Sommerfeeling? Dann komm zu unserer Ferienspielaktion!
            Ein actionreicher Tag im Sand für alle ab 7 Jahren – Anfänger:innen genauso
            wie kleine Profis. Bei uns steht der Spaß im Vordergrund!
          </p>
          <div class="flex flex-wrap gap-3">
            <Button as-child size="lg">
              <a :href="REGISTER_URL" target="_blank" rel="noopener">
                Jetzt anmelden <ArrowRight class="size-4" />
              </a>
            </Button>
            <Button as-child size="lg" variant="outline">
              <a href="#infos">Alle Infos</a>
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- DANKE fürs Mitmachen -->
    <SiteSection>
      <div class="grid items-center gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-coral">
            <Heart class="size-4" /> Rückblick
          </p>
          <h2 class="text-3xl sm:text-4xl">DANKE fürs Mitmachen!</h2>
          <p class="text-lg text-muted-foreground">
            14 Kinder waren bei unserer Ferienspielaktion dabei und haben mit
            jeder Menge Einsatz, Spaß und guter Laune den Sand zum Beben gebracht.
            Wir sagen DANKE – es war ein richtig toller Tag mit euch!
          </p>
        </div>
        <img
          src="/ferienspiel-2026-danke.jpg"
          alt="Gruppenfoto der Kinder bei der Ferienspielaktion 2026 am Beachvolleyballplatz Offenhausen"
          class="w-full rounded-xl border border-border/60 object-cover shadow-sm"
          loading="lazy"
        />
      </div>
    </SiteSection>

    <!-- Eckdaten -->
    <SiteSection id="infos">
      <!-- Hinweis: geänderte Uhrzeit -->
      <div class="mb-8 flex items-start gap-3 rounded-xl border border-brand-coral/30 bg-brand-coral/10 p-4 text-sm">
        <Info class="mt-0.5 size-5 shrink-0 text-brand-coral" />
        <p>
          <span class="font-semibold">Achtung, geänderte Uhrzeit:</span>
          Die Ferienspielaktion endet nun bereits um <strong>14:00 Uhr</strong>
          (statt wie ursprünglich angekündigt um 16:00 Uhr). Los geht's weiterhin um 10:00 Uhr.
        </p>
      </div>

      <div class="mb-10 max-w-2xl">
        <h2 class="text-3xl">Die Eckdaten</h2>
        <p class="mt-3 text-muted-foreground">Das Wichtigste auf einen Blick.</p>
      </div>
      <dl class="grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="f in facts"
          :key="f.label"
          class="flex items-start gap-4 bg-background p-6"
        >
          <component :is="f.icon" class="mt-0.5 size-6 shrink-0 text-brand-coral" />
          <div>
            <dt class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{{ f.label }}</dt>
            <dd class="mt-0.5 font-semibold">{{ f.value }}</dd>
          </div>
        </div>
      </dl>
    </SiteSection>

    <!-- Freu dich auf -->
    <SiteSection>
      <div class="mb-10 max-w-2xl">
        <h2 class="text-3xl">Darauf kannst du dich freuen</h2>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <Card v-for="h in highlights" :key="h.title" class="bg-background">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <component :is="h.icon" class="size-5 text-brand-sky-dark" /> {{ h.title }}
            </CardTitle>
          </CardHeader>
          <CardContent class="text-muted-foreground">
            {{ h.text }}
          </CardContent>
        </Card>
      </div>
    </SiteSection>

    <!-- Ablauf & Ort -->
    <SiteSection tone="navy">
      <div class="grid items-start gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-sun">
            <Sun class="size-4" /> Ein Tag im Sand
          </p>
          <h2 class="text-3xl">So läuft's ab</h2>
          <p class="text-white/80">
            Von 10 bis 14 Uhr dreht sich alles um Beachvolleyball: Wir starten mit
            spielerischen Übungen, sammeln erste Tipps und Tricks und spielen gemeinsam
            im Sand. Egal ob du noch nie am Beachplatz gestanden bist oder schon Erfahrung
            hast – bei uns findet jede:r den passenden Platz.
          </p>
          <p class="text-white/80">
            Für Verpflegung ist bestens gesorgt: Ein Mittagssnack und Getränke sind
            inklusive. Zieh dir bequeme Sportsachen an, denk an Sonnenschutz und eine
            Kopfbedeckung – dann steht einem unvergesslichen Sommertag nichts im Weg!
          </p>
        </div>
        <div class="rounded-xl border border-white/15 bg-white/5 p-6">
          <h3 class="flex items-center gap-2 text-xl">
            <MapPin class="size-5 text-brand-sky" /> Veranstaltungsort
          </h3>
          <p class="mt-1 text-sm text-white/60">Gegenüber vom Freibad Offenhausen</p>
          <div class="mt-4 space-y-4 text-white/80">
            <p>Beachvolleyballplatz, Schulstraße 6, 4625 Offenhausen, Oberösterreich</p>
            <p class="text-sm">
              WCs sind beim Fußballplatz nebenan vorhanden.
            </p>
            <Button as-child size="sm" variant="outline" class="border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white">
              <a href="https://maps.google.com/?cid=16346363461618422179" target="_blank" rel="noopener">
                In Google Maps öffnen <ExternalLink class="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </SiteSection>

    <!-- Anmeldung -->
    <SiteSection id="anmeldung">
      <Card class="bg-background">
        <CardContent class="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div class="max-w-xl space-y-2">
            <h2 class="text-3xl">Anmeldung</h2>
            <p class="text-muted-foreground">
              Die Anmeldung läuft ausschließlich über unser Online-Formular. Melde dich
              einfach bis <strong>27. Juli 2026</strong> an – wir freuen uns auf dich!
            </p>
          </div>
          <Button as-child size="lg" class="shrink-0">
            <a :href="REGISTER_URL" target="_blank" rel="noopener">
              Zum Anmeldeformular <ArrowRight class="size-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          :href="`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, '')}`"
          class="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-5 transition-colors hover:border-brand-coral"
        >
          <Phone class="size-5 text-brand-coral" />
          <span>
            <span class="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fragen?</span>
            <span class="font-semibold">{{ CONTACT_NAME }} · {{ CONTACT_PHONE }}</span>
          </span>
        </a>
      </div>
    </SiteSection>
  </div>
</template>
