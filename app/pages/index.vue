<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sun, Users, Waves, CalendarDays, MapPin, ArrowRight, Clock } from '@lucide/vue'

const config = useRuntimeConfig()
const joinUrl = computed(() => config.public.joinFormUrl || '#mitglied-werden')

useSeoMeta({
  title: 'Start',
  description:
    'O.H.BEACH – der entspannteste Beachvolleyball-Verein. Spiel, Sand und gute Laune. Werde Mitglied und reserviere deinen Platz online.',
})

const values = [
  { icon: Sun, title: 'Entspannt', text: 'Kein Leistungsdruck. Wir spielen für die Freude am Sand – im Tempo eines Faultiers.' },
  { icon: Users, title: 'Gemeinsam', text: 'Anfänger:innen und Profis teilen sich das Feld. Jede:r ist willkommen, mitzuspielen.' },
  { icon: Waves, title: 'Draußen', text: 'Frische Luft, Sonne, Sand zwischen den Zehen. Beachvolleyball ist Urlaub für zwischendurch.' },
]

const trainings = [
  { day: 'Dienstag', time: '18:00 – 20:00', note: 'Offenes Training für alle' },
  { day: 'Donnerstag', time: '18:00 – 20:00', note: 'Technik & Spielformen' },
  { day: 'Samstag', time: '10:00 – 13:00', note: 'Freies Spiel & Turniere' },
]

const steps = [
  { n: 1, title: 'Formular ausfüllen', text: 'Trag dich über unser Anmeldeformular ein – dauert keine zwei Minuten.' },
  { n: 2, title: 'Beitrag begleichen', text: 'Wir bestätigen deine Anmeldung, sobald der Mitgliedsbeitrag eingegangen ist.' },
  { n: 3, title: 'Platz reservieren', text: 'Mit deinem Login reservierst du den Platz online – wann immer du willst.' },
]

const faqs = [
  { q: 'Brauche ich Erfahrung?', a: 'Nein. Komm einfach zu einem offenen Training vorbei – wir zeigen dir alles.' },
  { q: 'Was kostet die Mitgliedschaft?', a: 'Den aktuellen Jahresbeitrag findest du im Anmeldeformular. Studierende zahlen ermäßigt.' },
  { q: 'Wie reserviere ich den Platz?', a: 'Als Mitglied loggst du dich ein und buchst freie Zeitslots. Die Belegung ist auch öffentlich einsehbar.' },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-brand-sand-soft">
      <div class="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
        <div class="space-y-6">
          <span class="inline-flex items-center gap-2 rounded-full bg-brand-sun/30 px-3 py-1 text-sm font-semibold text-brand-ink">
            <Sun class="size-4" /> Beachvolleyball-Verein
          </span>
          <h1 class="text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Beachvolleyball.<br /><span class="text-brand-coral">Aber ganz entspannt.</span>
          </h1>
          <p class="max-w-md text-lg text-muted-foreground">
            Willkommen bei O.H.BEACH. Spiel, Sand und gute Laune – mit einem
            Faultier als Maskottchen und Platz für alle.
          </p>
          <div class="flex flex-wrap gap-3">
            <Button as-child size="lg">
              <a :href="joinUrl" target="_blank" rel="noopener">
                Mitglied werden <ArrowRight class="size-4" />
              </a>
            </Button>
            <Button as-child size="lg" variant="outline">
              <NuxtLink to="/kalender">Platz ansehen</NuxtLink>
            </Button>
          </div>
        </div>
        <div class="flex justify-center">
          <BrandFaultierMascot :size="300" />
        </div>
      </div>
    </section>

    <!-- Werte -->
    <SiteSection>
      <div class="mb-12 max-w-2xl">
        <h2 class="text-3xl">Warum O.H.BEACH?</h2>
        <p class="mt-3 text-muted-foreground">
          Wir sind ein kleiner Verein mit großer Strandliebe. Bei uns zählt der Spaß, nicht die Tabelle.
        </p>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <Card v-for="v in values" :key="v.title" class="border-border/70">
          <CardHeader>
            <div class="mb-2 flex size-12 items-center justify-center rounded-xl bg-brand-turquoise/15 text-brand-turquoise-dark">
              <component :is="v.icon" class="size-6" />
            </div>
            <CardTitle>{{ v.title }}</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground">{{ v.text }}</p>
          </CardContent>
        </Card>
      </div>
    </SiteSection>

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
            <CardDescription>Komm vorbei und spiel mit – Schnuppern jederzeit möglich.</CardDescription>
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

    <!-- Mitglied werden -->
    <SiteSection id="mitglied-werden">
      <div class="mb-12 max-w-2xl">
        <h2 class="text-3xl">Mitglied werden</h2>
        <p class="mt-3 text-muted-foreground">In drei entspannten Schritten Teil des Vereins.</p>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <div v-for="s in steps" :key="s.n" class="space-y-3">
          <div class="flex size-11 items-center justify-center rounded-full bg-brand-coral font-display text-lg font-bold text-primary-foreground">
            {{ s.n }}
          </div>
          <h3 class="text-xl">{{ s.title }}</h3>
          <p class="text-muted-foreground">{{ s.text }}</p>
        </div>
      </div>
      <div class="mt-10">
        <Button as-child size="lg">
          <a :href="joinUrl" target="_blank" rel="noopener">Jetzt anmelden <ArrowRight class="size-4" /></a>
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
        </div>
      </div>
    </SiteSection>
  </div>
</template>
