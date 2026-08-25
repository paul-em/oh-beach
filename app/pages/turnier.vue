<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalendarDays, MapPin, Trophy, Users, Beer, Utensils,
  ArrowRight, ExternalLink, Mail, Images, Heart, Medal,
} from '@lucide/vue'

const PHOTOS_URL = 'https://drive.google.com/drive/folders/17F8e5CBY35YhVqJEYPVaywTEGWsMyHCz'
const TOURNAMENT_URL = 'https://app.tournamize.com/tournaments/294'

// Partner zentral aus app/utils/partners.ts (auto-importiert)
const mainPartner = partners.find(p => p.featured)
const otherPartners = partners.filter(p => !p.featured)

useSeoMeta({
  title: 'SilberHolz Beach Open 2026 – Danke, Ergebnisse & Fotos',
  description:
    'Das SilberHolz Beach Open 2026 in Offenhausen ist vorbei. Danke an alle Teams, Helfer:innen und Partner – hier gibt es Ergebnisse und Fotos vom Turniertag.',
})

const facts = [
  { icon: CalendarDays, label: 'Datum', value: 'Samstag, 22. August 2026' },
  { icon: MapPin, label: 'Ort', value: 'Schulstraße 6, 4625 Offenhausen' },
  { icon: Users, label: 'Modus', value: '4 vs. 4 Mixed (mind. 1 Dame)' },
  { icon: Trophy, label: 'Raster', value: 'Pool Play → Double KO' },
]

// Endstand vom Turniertag – Platz 1 zuerst
const rankings = [
  {
    icon: Trophy,
    title: 'Beachvolleyball',
    subtitle: 'Das Podium im Turnier',
    entries: [
      { place: 1, team: 'Leberkasvereinigung' },
      { place: 2, team: 'Offenhausner Beckenrandlegenden' },
      { place: 3, team: 'Em Bäm & Co KG' },
    ],
  },
  {
    icon: Beer,
    title: 'Seiterl-Wertung',
    subtitle: 'Die durstigsten Teams',
    entries: [
      { place: 1, team: 'Bachforön', note: '104 Seiterl' },
      { place: 2, team: 'Gegen wen eigentlich' },
      { place: 3, team: 'Leberkasvereinigung' },
    ],
  },
]

const rankClasses: Record<number, string> = {
  1: 'bg-brand-sun text-brand-navy',
  2: 'bg-white/85 text-brand-navy',
  3: 'bg-brand-coral text-white',
}

const highlights = [
  {
    icon: Beer,
    title: 'Seiterl-Wertung',
    text: 'Unsere berühmte Seiterl-Wertung war auch heuer wieder heiß umkämpft: 104 Seiterl hat es heuer zum Sieg gebraucht. Prost an alle, die mitgehalten haben! 🍻',
  },
  {
    icon: Utensils,
    title: 'Speis & Trank',
    text: 'Grillerei, Veggie-Angebot und kühle Getränke: Danke an alle, die den ganzen Tag in der Küche und am Griller gestanden sind.',
  },
  {
    icon: Trophy,
    title: 'Beach & Rasen',
    text: 'Gespielt wurde auf einem Beachvolleyball- und zwei Rasenplätzen – und fast jedes Team war mindestens einmal im Sand.',
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
            Rückblick · Turnier vom 22. August 2026
          </p>
          <h1 class="text-5xl sm:text-6xl lg:text-7xl">
            Danke für das<br /><span class="text-brand-coral">Beach Open 2026!</span>
          </h1>
          <p class="max-w-md text-lg text-muted-foreground">
            Ein Turniertag mit Beach, Rasen, Grillerei und bester Stimmung liegt hinter
            uns. Danke an alle Teams, die angereist sind, an alle Helfer:innen und an
            unsere Partner – ihr habt das SilberHolz Beach Open zu dem gemacht, was es
            war.
          </p>
          <div class="flex flex-wrap gap-3">
            <Button as-child size="lg">
              <a :href="PHOTOS_URL" target="_blank" rel="noopener">
                Fotos ansehen <ArrowRight class="size-4" />
              </a>
            </Button>
            <Button as-child size="lg" variant="outline">
              <a href="#ergebnisse">Ergebnisse</a>
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Fotos -->
    <SiteSection id="fotos">
      <Card class="bg-background">
        <CardContent class="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div class="max-w-xl space-y-2">
            <h2 class="flex items-start gap-2 text-3xl">
              <Images class="mt-1 size-7 shrink-0 text-brand-coral" /> Die Fotos vom Turniertag
            </h2>
            <p class="text-muted-foreground">
              Alle Bilder liegen in einem geteilten Google-Drive-Ordner – anschauen und
              herunterladen ohne Anmeldung. Wenn du ein Foto von dir nicht online haben
              möchtest, schreib uns kurz an
              <a href="mailto:turnier@oh-beach.at" class="font-semibold text-brand-coral hover:underline">turnier@oh-beach.at</a>,
              dann nehmen wir es raus.
            </p>
          </div>
          <Button as-child size="lg" class="shrink-0">
            <a :href="PHOTOS_URL" target="_blank" rel="noopener">
              Zur Foto-Galerie <ExternalLink class="size-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </SiteSection>

    <!-- Ergebnisse -->
    <SiteSection id="ergebnisse" tone="navy">
      <div class="mb-10 max-w-2xl">
        <h2 class="flex items-start gap-2 text-3xl">
          <Medal class="mt-1 size-7 shrink-0 text-brand-sun" /> Die Ergebnisse
        </h2>
        <p class="mt-3 text-white/80">
          Gratulation an die Podiumsplätze – in beiden Wertungen!
        </p>
      </div>
      <div class="grid gap-6 md:grid-cols-2">
        <div
          v-for="r in rankings"
          :key="r.title"
          class="rounded-xl border border-white/15 bg-white/5 p-6"
        >
          <h3 class="flex items-center gap-2 text-xl">
            <component :is="r.icon" class="size-5 text-brand-sky" /> {{ r.title }}
          </h3>
          <p class="mt-1 text-sm text-white/60">{{ r.subtitle }}</p>
          <ol class="mt-5 space-y-3">
            <li
              v-for="e in r.entries"
              :key="e.place"
              class="flex items-center gap-4 rounded-lg bg-white/5 px-4 py-3"
              :class="e.place === 1 ? 'ring-1 ring-brand-sun/60' : ''"
            >
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-full font-semibold"
                :class="rankClasses[e.place]"
              >
                {{ e.place }}
              </span>
              <span class="min-w-0">
                <span
                  class="block font-semibold"
                  :class="e.place === 1 ? 'text-lg text-brand-sun' : 'text-white'"
                >{{ e.team }}</span>
                <span v-if="e.note" class="block text-sm text-white/60">{{ e.note }}</span>
              </span>
            </li>
          </ol>
        </div>
      </div>
    </SiteSection>

    <!-- Rückblick: Eckdaten -->
    <SiteSection id="rueckblick">
      <div class="mb-10 max-w-2xl">
        <h2 class="text-3xl">Der Turniertag</h2>
        <p class="mt-3 text-muted-foreground">
          4er-Mixed-Beachvolleyball in Offenhausen, Oberösterreich – das Wichtigste auf
          einen Blick.
        </p>
      </div>
      <dl class="grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
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
      <div class="mt-6">
        <Button as-child variant="outline">
          <a :href="TOURNAMENT_URL" target="_blank" rel="noopener">
            Turnierraster & Ergebnisse auf Tournamize <ExternalLink class="size-4" />
          </a>
        </Button>
      </div>
    </SiteSection>

    <!-- Highlights -->
    <SiteSection>
      <div class="mb-10 max-w-2xl">
        <h2 class="text-3xl">Das war los</h2>
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

    <!-- Danke an alle Teilnehmer:innen -->
    <SiteSection tone="navy">
      <div class="grid items-start gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <h2 class="flex items-start gap-2 text-3xl">
            <Heart class="mt-1 size-7 shrink-0 text-brand-coral" /> Danke, dass ihr dabei wart
          </h2>
          <p class="text-white/80">
            Danke an jedes einzelne Team fürs Anreisen, fürs Mitspielen bei jedem Wetter
            und für den fairen, entspannten Umgang am und neben dem Feld. Genau das macht
            unser Turnier aus.
          </p>
          <p class="text-white/80">
            Ein besonderes Danke an alle Helfer:innen: an der Anmeldung, am Griller, hinter
            der Bar, beim Platz-Herrichten und beim Aufräumen am Abend. Ohne euch geht so
            ein Tag nicht.
          </p>
          <p class="text-white/80">
            Wir freuen uns schon auf die nächste Ausgabe – Termin und Anmeldung
            veröffentlichen wir wieder hier auf der Website.
          </p>
        </div>
        <div class="rounded-xl border border-white/15 bg-white/5 p-6">
          <h3 class="flex items-center gap-2 text-xl">
            <MapPin class="size-5 text-brand-sky" /> Veranstaltungsort
          </h3>
          <p class="mt-1 text-sm text-white/60">Gegenüber vom Freibad Offenhausen</p>
          <div class="mt-4 space-y-4 text-white/80">
            <p>Schulstraße 6, 4625 Offenhausen, Oberösterreich</p>
            <Button as-child size="sm" variant="outline" class="border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white">
              <a href="https://maps.google.com/?cid=16346363461618422179" target="_blank" rel="noopener">
                In Google Maps öffnen <ExternalLink class="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </SiteSection>

    <!-- Hauptsponsor -->
    <SiteSection v-if="mainPartner">
      <div class="flex flex-col items-center gap-6 text-center">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unser Hauptsponsor</p>
        <a :href="mainPartner.url || undefined" target="_blank" rel="noopener" class="w-full max-w-2xl" :aria-label="`Zur Website von ${mainPartner.name}`">
          <img
            :src="mainPartner.logo"
            :alt="`${mainPartner.name} – Hauptsponsor des Beach Open`"
            class="w-full shadow-md transition-transform hover:scale-[1.02]"
          />
        </a>
        <p class="max-w-xl text-muted-foreground">
          {{ mainPartner.description }} Danke, dass ihr unser Turnier möglich gemacht habt!
        </p>
        <Button v-if="mainPartner.url" as-child variant="secondary">
          <a :href="mainPartner.url" target="_blank" rel="noopener">
            Zur Website von {{ mainPartner.name }} <ExternalLink class="size-4" />
          </a>
        </Button>
      </div>
    </SiteSection>

    <!-- Weitere Partner -->
    <SiteSection tone="navy">
      <div class="mb-10 max-w-2xl">
        <h2 class="text-3xl">Unsere Partner</h2>
        <p class="mt-3 text-white/80">
          Ohne die Unterstützung dieser Unternehmen aus der Region wäre unser Turnier
          nicht möglich gewesen. Schau vorbei – sie haben es sich verdient!
        </p>
      </div>
      <div class="grid gap-6 md:grid-cols-2">
        <div
          v-for="p in otherPartners"
          :key="p.name"
          class="flex flex-col rounded-xl border border-white/15 bg-white/5 p-6"
        >
          <div class="flex h-16 items-center justify-center rounded-lg bg-white p-3">
            <img :src="p.logo" :alt="p.name" class="max-h-full w-auto max-w-[70%] object-contain" />
          </div>
          <h3 class="mt-5 text-xl">{{ p.name }}</h3>
          <p class="mt-2 flex-1 text-white/75">{{ p.description }}</p>
          <a
            v-if="p.url"
            :href="p.url"
            target="_blank"
            rel="noopener"
            class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-sky hover:underline"
          >
            Zur Website <ExternalLink class="size-4" />
          </a>
        </div>
      </div>
    </SiteSection>

    <!-- Kontakt -->
    <SiteSection>
      <div class="mb-6 max-w-2xl">
        <h2 class="text-3xl">Fragen zum Turnier?</h2>
        <p class="mt-3 text-muted-foreground">
          Feedback, ein fehlendes Foto oder Interesse an der nächsten Ausgabe? Schreib uns
          einfach.
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <a
          href="mailto:turnier@oh-beach.at"
          class="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-5 transition-colors hover:border-brand-coral"
        >
          <Mail class="size-5 text-brand-coral" />
          <span class="font-semibold">turnier@oh-beach.at</span>
        </a>
      </div>
    </SiteSection>
  </div>
</template>
