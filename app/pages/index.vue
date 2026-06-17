<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sun, Users, CalendarDays, MapPin, ArrowRight, Clock, Trophy } from '@lucide/vue'

const config = useRuntimeConfig()
const joinUrl = computed(() => config.public.joinFormUrl || '#mitglied-werden')

useSeoMeta({
  title: 'Start',
  description:
    'O.H.BEACH – der entspannteste Beachvolleyball-Verein. Spiel, Sand und gute Laune. Werde Mitglied und reserviere deinen Platz online.',
})

const trainings = [
  { day: 'Montag', time: '19:00 – 21:00', note: 'Beach Monday - Offenes Training für alle' },
]

const steps = [
  { n: 1, title: 'Vorbeikommen & kennenlernen', text: 'Schau am besten zuerst bei einem Trainingstermin vorbei. So lernen wir uns gegenseitig kennen und du bekommst ein Gefühl dafür, ob wir zusammenpassen.' },
  { n: 2, title: 'Anmeldeformular ausfüllen', text: 'Hat es gepasst? Dann trag dich über unser Anmeldeformular ein – dauert keine zwei Minuten.' },
  { n: 3, title: 'Nachricht von uns', text: 'Du bekommst eine Nachricht von uns mit den Daten zum Überweisen des Mitgliedsbeitrags – und damit bist du startklar.' },
  { n: 4, title: 'Dabei sein & mitanpacken', text: 'Nach der Zusage bist du dabei: Platz online reservieren, mitspielen – und beim Vereinsleben mit anpacken.' },
]

const faqs = [
  { q: 'Brauche ich Erfahrung?', a: 'Für den Beach Monday ist es gut wenn du zumindest den Ball beherrschst. Es wird aber in Zukunft noch weitere Angebote geben. Schau einfach mal vorbei!' },
  { q: 'Was kostet die Mitgliedschaft?', a: 'Nur 30€ pro Saison - absolut preiswert für was du bekommst: Zugang zur Beach-Hütte inkl Kühlschrank, Platzbuchung, Gemeinsame Trainingslager, ...' },
  { q: 'Wie reserviere ich den Platz?', a: 'Als Mitglied loggst du dich ein und buchst freie Zeitslots. Die Belegung ist auch öffentlich einsehbar.', link: { to: '/kalender', label: 'Zur öffentlichen Platzbelegung' } },
]
</script>

<template>
  <div>
    <!-- Turnier-Hinweis -->
    <NuxtLink
      to="/turnier"
      class="group block border-b border-brand-turquoise/20 bg-brand-turquoise/10 transition-colors hover:bg-brand-turquoise/15"
    >
      <div class="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-2.5 text-center text-sm">
        <Trophy class="size-4 shrink-0 text-brand-turquoise-dark" />
        <span class="font-semibold text-brand-ink">SilberHolz Beach Open am 22. August</span>
        <span class="hidden text-muted-foreground sm:inline">– jetzt Team anmelden</span>
        <ArrowRight class="size-4 shrink-0 text-brand-turquoise-dark transition-transform group-hover:translate-x-1" />
      </div>
    </NuxtLink>

    <!-- Hero -->
    <section class="sand-grain relative overflow-hidden bg-brand-sand-soft">
      <div class="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
        <div class="space-y-6">
          <span class="inline-flex items-center gap-2 rounded-full bg-brand-sun/30 px-3 py-1 text-sm font-semibold text-brand-ink">
            <Sun class="size-4" /> Volleyball-Verein
          </span>
          <h1 class="text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Teneriffa Vibes<br /><span class="text-brand-coral">mit Hopfen Hypes</span>
          </h1>
          <p class="max-w-md text-lg text-muted-foreground">
            Willkommen bei O.H.BEACH. Spiel, Sand und gute Laune - das gibt es bei uns am Beachplatz in Offenhausen - mit bester Flutlichtanlage!
          </p>
          <div class="flex flex-wrap gap-3">
            <Button as-child size="lg">
              <NuxtLink to="#mitglied-werden">
                Mitglied werden <ArrowRight class="size-4" />
              </NuxtLink>
            </Button>
            <Button as-child size="lg" variant="outline">
              <NuxtLink to="/kalender">Platzverfügbarkeit ansehen</NuxtLink>
            </Button>
          </div>
        </div>
        <div class="flex justify-center">
          <BrandFaultierMascot :size="300" />
        </div>
      </div>
    </section>

    <!-- Bild -->
    <section>
      <img
        src="/bg.jpg"
        alt="O.H.BEACH Beachvolleyball-Platz"
        class="h-75 w-full object-cover md:h-120"
      />
    </section>

    <!-- Der Platz -->
    <SiteSection alt>
      <div class="grid items-center gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <h2 class="text-3xl">Unser Platz</h2>
          <p class="text-muted-foreground">
            Ein gepflegter Sandplatz, der nur darauf wartet, bespielt zu werden.
            Mitglieder reservieren online – und alle anderen sehen jederzeit,
            wann gerade frei ist.
          </p>
          <ul class="space-y-3">
            <li class="flex items-center gap-3">
              <MapPin class="size-5 text-brand-coral" />
              <span>Sandplatz am Vereinsgelände (Adresse im Impressum)</span>
            </li>
            <li class="flex items-center gap-3">
              <Clock class="size-5 text-brand-coral" />
              <span>Buchbar täglich 08:00 – 22:00 in Stundenslots</span>
            </li>
            <li class="flex items-center gap-3">
              <CalendarDays class="size-5 text-brand-coral" />
              <span>Reservierung bis zu 14 Tage im Voraus</span>
            </li>
          </ul>
          <Button as-child variant="secondary">
            <NuxtLink to="/kalender">Zur Platzbelegung <ArrowRight class="size-4" /></NuxtLink>
          </Button>
        </div>
        <Card class="bg-background">
          <CardHeader>
            <CardTitle class="flex items-center gap-2"><CalendarDays class="size-5" /> Trainingszeiten</CardTitle>
            <CardDescription>Komm vorbei und spiel mit - Schnuppern jederzeit möglich.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div
              v-for="t in trainings"
              :key="t.day"
              class="flex items-center justify-between rounded-lg border border-border/60 bg-brand-sand-soft px-4 py-3"
            >
              <div>
                <p class="font-semibold">{{ t.day }}</p>
                <p class="text-sm text-muted-foreground">{{ t.note }}</p>
              </div>
              <span class="font-display font-semibold text-brand-turquoise-dark">{{ t.time }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </SiteSection>

    <!-- Beachcamp -->
    <SiteSection alt>
      <div class="grid items-center gap-10 md:grid-cols-2">
        <div class="flex justify-center">
          <video
            class="w-full max-w-80 rounded-2xl border border-border/60 shadow-lg"
            controls
            playsinline
            preload="none"
            poster="/beachcamp-26-poster.jpg"
          >
            <source src="/beachcamp-26.mp4" type="video/mp4" />
          </video>
        </div>
        <div class="space-y-4">
          <span class="inline-flex items-center gap-2 rounded-full bg-brand-sun/30 px-3 py-1 text-sm font-semibold text-brand-ink">
            <Sun class="size-4" /> Beachcamp 2026
          </span>
          <h2 class="text-3xl">Unser Beachcamp</h2>
          <p class="text-muted-foreground">
            Sonne, Sand und gute Laune am Stück: Beim O.H.BEACH-Camp treffen sich
            Anfänger:innen und alte Hasen zum gemeinsamen Spielen, Üben und Abhängen.
            Schau rein, wie es bei uns zugeht – und sei nächstes Mal selbst dabei.
          </p>
          <Button as-child variant="secondary">
            <NuxtLink to="#mitglied-werden">Mitglied werden <ArrowRight class="size-4" /></NuxtLink>
          </Button>
        </div>
      </div>
    </SiteSection>

    <!-- Mitglied werden -->
    <SiteSection id="mitglied-werden">
      <div class="mb-12 max-w-2xl">
        <h2 class="text-3xl">Mitglied werden</h2>
        <p class="mt-3 text-muted-foreground">In ein paar entspannten Schritten Teil des Vereins.</p>
      </div>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div v-for="s in steps" :key="s.n" class="space-y-3">
          <div class="flex size-11 items-center justify-center rounded-full bg-brand-coral font-display text-lg font-bold text-primary-foreground">
            {{ s.n }}
          </div>
          <h3 class="text-xl">{{ s.title }}</h3>
          <p class="text-muted-foreground">{{ s.text }}</p>
        </div>
      </div>

      <!-- Was wir uns wünschen -->
      <Card class="mt-12 border-brand-turquoise/30 bg-brand-turquoise/5">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Users class="size-5 text-brand-turquoise-dark" /> Ein faires Miteinander
          </CardTitle>
          <CardDescription>Mitglied sein heißt mitmachen – nicht nur einen Platz buchen.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3 text-muted-foreground">
          <p>
            Wir bieten dir eine Menge: einen top gepflegten Platz mit Flutlicht, die Beach-Hütte,
            gemeinsame Trainings, Turniere und Trainingslager – und das alles für einen fairen Beitrag.
          </p>
          <p>
            Im Gegenzug wünschen wir uns, dass du dich als Mitglied aktiv am Vereinsleben beteiligst.
            Bei uns geht es ums gemeinsame Spielen, Helfen und Dabeisein – nicht nur darum, online einen
            Platz zu reservieren. So bleibt das Ganze für alle fair: Jede:r gibt ein bisschen, und alle
            haben mehr davon.
          </p>
        </CardContent>
      </Card>

      <div class="mt-10">
        <Button as-child size="lg">
          <a :href="joinUrl" target="_blank" rel="noopener">Zum Anmeldeformular <ArrowRight class="size-4" /></a>
        </Button>
      </div>
    </SiteSection>

    <!-- FAQ -->
    <SiteSection alt>
      <div class="mb-12 max-w-2xl">
        <h2 class="text-3xl">Häufige Fragen</h2>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <div v-for="f in faqs" :key="f.q" class="rounded-xl border border-border/60 bg-background p-6">
          <h3 class="text-lg">{{ f.q }}</h3>
          <p class="mt-2 text-muted-foreground">{{ f.a }}</p>
          <NuxtLink
            v-if="f.link"
            :to="f.link.to"
            class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-turquoise-dark hover:underline"
          >
            {{ f.link.label }} <ArrowRight class="size-4" />
          </NuxtLink>
        </div>
      </div>
    </SiteSection>

    <!-- Social Media -->
    <SiteSection>
      <div class="mb-10 max-w-2xl">
        <h2 class="text-3xl">Folg uns</h2>
        <p class="mt-3 text-muted-foreground">
          Fotos, Termine und gute Laune vom Beachplatz – bleib auf dem Laufenden.
        </p>
      </div>
      <div class="grid gap-6 sm:grid-cols-2">
        <a
          href="https://www.instagram.com/o.h.beach"
          target="_blank"
          rel="noopener"
          class="group flex items-center gap-4 rounded-xl border border-border/60 bg-background p-6 transition-colors hover:border-brand-coral"
        >
          <span class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-brand-coral via-brand-coral to-brand-sun text-white">
            <svg viewBox="0 0 24 24" fill="none" class="size-6" aria-hidden="true">
              <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="1.8" />
              <circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8" />
              <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
            </svg>
          </span>
          <div>
            <p class="font-display text-lg font-semibold">Instagram</p>
            <p class="text-sm text-muted-foreground">@o.h.beach</p>
          </div>
          <ArrowRight class="ml-auto size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </a>

        <a
          href="https://www.facebook.com/share/1BYQ7HS5JH/"
          target="_blank"
          rel="noopener"
          class="group flex items-center gap-4 rounded-xl border border-border/60 bg-background p-6 transition-colors hover:border-brand-turquoise"
        >
          <span class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" class="size-6" aria-hidden="true">
              <path d="M14.5 8.5h2V5.7c-.35-.05-1.54-.15-2.93-.15-2.9 0-4.88 1.77-4.88 5.02V13H6.2v3.13h2.49V24h3.06v-7.87h2.49l.38-3.13h-2.87v-2.3c0-.9.25-1.5 1.25-1.5z" />
            </svg>
          </span>
          <div>
            <p class="font-display text-lg font-semibold">Facebook</p>
            <p class="text-sm text-muted-foreground">O.H.BEACH</p>
          </div>
          <ArrowRight class="ml-auto size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </SiteSection>
  </div>
</template>
