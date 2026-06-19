<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalendarDays, Clock, MapPin, Trophy, Users, Beer, Utensils,
  ArrowRight, ExternalLink, Mail, Phone, Ticket,
} from '@lucide/vue'

const REGISTER_URL = 'https://app.tournamize.com/tournaments/294'

useSeoMeta({
  title: 'SilberHolz Beach Open 2026',
  description:
    'SilberHolz Beach Open Offenhausen – 4er Mixed Beachvolleyball-Turnier am 22. August 2026 in Offenhausen. Jetzt Team anmelden!',
})

const facts = [
  { icon: CalendarDays, label: 'Datum', value: 'Samstag, 22. August 2026' },
  { icon: Clock, label: 'Treffpunkt', value: '08:45 Uhr – Spielbeginn 09:00 Uhr' },
  { icon: MapPin, label: 'Ort', value: 'Schulstraße 6, 4625 Offenhausen' },
  { icon: Users, label: 'Modus', value: '4 vs. 4 Mixed (mind. 1 Dame)' },
  { icon: Trophy, label: 'Raster', value: 'max. 20 Teams · Pool Play → Double KO' },
  { icon: Ticket, label: 'Startgeld', value: '10 € pro Person (40 € / Team) · bar vor Ort' },
]

const highlights = [
  {
    icon: Beer,
    title: 'Seiterl-Wertung',
    text: 'Wie jedes Jahr gibt es unsere berühmte Seiterl-Wertung mit tollen Preisen! 🍻',
  },
  {
    icon: Utensils,
    title: 'Speis & Trank',
    text: 'Für Verpflegung ist bestens gesorgt: Grillerei inklusive Veggie-Angebot und vieles mehr.',
  },
  {
    icon: Trophy,
    title: 'Beach & Rasen',
    text: 'Gespielt wird auf einem Beachvolleyball- und zwei Rasenplätzen. Jedes Team kommt nach Möglichkeit mind. einmal auf den Beachplatz.',
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
            Turnier · 22. August 2026
          </p>
          <h1 class="text-5xl sm:text-6xl lg:text-7xl">
            SilberHolz<br /><span class="text-brand-coral">Beach Open 2026</span>
          </h1>
          <p class="max-w-md text-lg text-muted-foreground">
            4er-Mixed-Beachvolleyball in Offenhausen, Oberösterreich. Ein entspannter
            Turniertag mit Beach, Rasen, Grillerei und der legendären Seiterl-Wertung.
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

    <!-- Eckdaten -->
    <SiteSection id="infos">
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

    <!-- Highlights -->
    <SiteSection>
      <div class="mb-10 max-w-2xl">
        <h2 class="text-3xl">Das erwartet dich</h2>
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

    <!-- Spielmodus -->
    <SiteSection tone="navy">
      <div class="grid items-start gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <h2 class="text-3xl">Spielmodus</h2>
          <p class="text-white/80">
            Gespielt wird 4 vs. 4 Mixed – pro Team muss mindestens eine Dame am Feld stehen.
            Bei maximal 20 Teams starten wir mit einer Gruppenphase (modified Pool Play),
            die zufällig ausgelost wird. Danach geht es in die Doppel-KO-Phase, gesetzt
            nach Spiel-, Satz- und Punkteverhältnis.
          </p>
          <p class="text-white/80">
            Wir versuchen, jedes Team mindestens einmal am Beachvolleyballplatz spielen zu
            lassen – wir bitten aber um Rücksicht, wenn sich mit Beach- und Rasenplätzen
            nicht alles optimal ausgeht.
          </p>
        </div>
        <div class="rounded-xl border border-white/15 bg-white/5 p-6">
          <h3 class="flex items-center gap-2 text-xl">
            <MapPin class="size-5 text-brand-sky" /> Veranstaltungsort
          </h3>
          <p class="mt-1 text-sm text-white/60">Gegenüber vom Freibad Offenhausen</p>
          <div class="mt-4 space-y-4 text-white/80">
            <p>Schulstraße 6, 4625 Offenhausen, Oberösterreich</p>
            <p class="text-sm">
              WCs sind beim Fußballplatz nebenan vorhanden (Gäste-WC 1 + Gäste-WC 2).
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

    <!-- Hauptsponsor -->
    <SiteSection>
      <div class="flex flex-col items-center gap-6 text-center">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unser Hauptsponsor</p>
        <a href="https://www.silberholz.at/" target="_blank" rel="noopener" class="w-full max-w-2xl" aria-label="Zur Website von SilberHolz">
          <img
            src="/sponsoren/Silberholz-logo.png"
            alt="SilberHolz – Hauptsponsor der Beach Open"
            class="w-full shadow-md transition-transform hover:scale-[1.02]"
          />
        </a>
        <p class="max-w-xl text-muted-foreground">
          <span class="font-semibold text-foreground">SilberHolz</span> ist eine Tischlerei aus der
          Region, die nachhaltig gefertigte Küchen und Möbel für Haus und Garten herstellt –
          getreu dem Motto „Natürlich SilberHolz“. Danke, dass ihr unser Turnier möglich macht!
        </p>
        <Button as-child variant="secondary">
          <a href="https://www.silberholz.at/" target="_blank" rel="noopener">
            Zur Website von SilberHolz <ExternalLink class="size-4" />
          </a>
        </Button>
      </div>
    </SiteSection>

    <!-- Anmeldung -->
    <SiteSection id="anmeldung">
      <Card class="bg-background">
        <CardContent class="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div class="max-w-xl space-y-2">
            <h2 class="text-3xl">Team anmelden</h2>
            <p class="text-muted-foreground">
              Die Anmeldung läuft über Tournamize. Dort findest du auch das aktuelle
              Teilnehmerfeld, die Warteliste und alle Details. Startgeld (10 € pro Person)
              wird bar vor Ort bezahlt.
            </p>
          </div>
          <Button as-child size="lg" class="shrink-0">
            <a :href="REGISTER_URL" target="_blank" rel="noopener">
              Zur Anmeldung <ArrowRight class="size-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div class="mt-8 grid gap-4 sm:grid-cols-2">
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
