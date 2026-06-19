<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight, Download, Mail, Trophy, Users, Eye, Sparkles,
  Megaphone, Gift, Check, Heart, Star, HandHeart,
} from '@lucide/vue'

useSeoMeta({
  title: 'Sponsoring & Partner',
  description:
    'Werde Partner von O.H.BEACH! Unsere Sponsorpakete für die Beach Open Offenhausen – von Turniername-Sponsor bis Vereins-Supporter. Jetzt Sponsormappe herunterladen.',
})

const PDF_URL = '/Sponsormappe-OHBeach.pdf'
const CONTACT_MAIL = 'info@oh-beach.at'

/*
  Partner-Logos werden noch nachgeliefert.
  `logo: null` rendert einen Platzhalter. SilberHolz haben wir bereits als Hauptpartner.
*/
const partners = [
  { name: 'SilberHolz', logo: '/sponsoren/Silberholz-logo.png', url: 'https://www.silberholz.at/', featured: true },
  { name: 'Poschacher', logo: '/sponsoren/Poschacher.jpeg', url: 'https://www.instagram.com/spar.poschacher', featured: false },
  { name: 'Ganic', logo: '/sponsoren/Vitaminwater-Logo-2016.png', url: 'https://www.vitaminwater.at/ganic-sport/', featured: false },
  { name: 'Partner', logo: null, url: null, featured: false },
  { name: 'Partner', logo: null, url: null, featured: false },
  { name: 'Partner', logo: null, url: null, featured: false },
]

// Kurze Vereins-Kennzahlen aus der Mappe – machen Lust auf eine Partnerschaft
const facts = [
  { icon: Users, value: '~35', label: 'Mitglieder' },
  { icon: Trophy, value: '~60', label: 'Turnierteilnehmer:innen' },
  { icon: Eye, value: '~200', label: 'Zuschauer:innen' },
  { icon: Sparkles, value: 'seit 2012', label: 'gewachsene Sektion' },
]

// Hauptpakete (große Karten)
const packages = [
  {
    name: 'Turniername-Sponsor',
    price: '700 €',
    featured: false,
    tagline: 'Unser Event trägt Ihren Namen',
    perks: [
      'Unser Event-Name erhält Ihren Firmen- oder Markennamen (z. B. „Kaloveo Beach Open“)',
      'Werbeeinschaltungen auf Homepage & Social-Media-Kanälen',
      'Präsenz Ihres Logos auf allen Plakaten',
      'Unlimitierte Anzahl an Transparenten und Beachflags',
      'Erwähnung in allen Berichten vor und nach dem Turnier',
    ],
  },
  {
    name: 'Gold-Sponsor',
    price: '500 €',
    featured: true,
    tagline: 'Ganzjährige Sichtbarkeit',
    perks: [
      'Jahres-Banner am Beachvolleyball-Platz',
      'Erwähnung in Social-Media-Postings',
      'Erwähnung als Sponsor bei unserem Turnier',
      'Werbung in Gemeindezeitung und Berichten vor und nach dem Turnier',
    ],
  },
  {
    name: 'Silber-Sponsor',
    price: '300 €',
    featured: false,
    tagline: 'Präsenz am Turnierwochenende',
    perks: [
      'Banner am Turnierwochenende',
      'Erwähnung in Social-Media-Postings',
      'Erwähnung als Sponsor bei unserem Turnier',
    ],
  },
  {
    name: 'Bronze-Sponsor',
    price: '250 €',
    featured: false,
    tagline: 'Der Einstieg',
    perks: [
      'Banner (klein) am Turnierwochenende',
      'Erwähnung in Social-Media-Postings',
    ],
  },
]

// Weitere Unterstützungsmöglichkeiten (kompakte Karten)
const support = [
  {
    icon: Megaphone,
    name: 'Vereins-Merch',
    price: 'ab 150 €',
    perks: [
      'Neue Ausstattung für unsere Mitglieder',
      'In Planung: neue Vereinswesten und Shirts für alle Mitglieder',
      'Mit Ihrem Beitrag erhalten Sie eine Werbefläche auf unserer Vereinsausrüstung',
    ],
  },
  {
    icon: Star,
    name: 'Nachwuchs-Sponsor',
    price: '100 €',
    perks: [
      'Für unseren Nachwuchs benötigen wir immer wieder neue Materialien für den Trainingsbetrieb',
      'Platzierung des Logos bei Postings und Berichten rund um den Nachwuchs',
    ],
  },
  {
    icon: HandHeart,
    name: 'Vereins-Supporter',
    price: 'ab 50 € / Sachpreise',
    perks: [
      'Damit wir unser Projekt O.H.BEACH weiterhin aufrechterhalten können, freuen wir uns über jede Hilfe und Unterstützung',
      'Es muss nicht immer eine Geldsumme sein – auch Sachpreise sind für uns ein echter Support',
    ],
  },
  {
    icon: Gift,
    name: 'Tombola',
    price: 'Sachpreise & Goodies',
    perks: [
      'Heuer würden wir im Rahmen unserer Ortsmeisterschaft gerne eine Tombola für alle Spieler:innen und Zuschauer:innen veranstalten',
      'Wir freuen uns über jegliche Sachpreise, Gutscheine oder andere Goodies Ihrer Firma!',
    ],
  },
]

// Kombi-Angebote aus der Mappe
const bundles = [
  { name: 'Goldpaket inkl. Vereins-Merch', old: '650 €', now: '550 €' },
  { name: 'Silberpaket inkl. Vereins-Merch', old: '450 €', now: '400 €' },
]

const vision = [
  'Eigene Trainingscamps und Teamevents sind in Planung',
  'Entwicklung einer neuen Nachwuchsgruppe für Halle & Beach',
  'Ausweitung der Vereinsbekanntschaft rund um Offenhausen',
  'Teilnahme an Gemeindeevents',
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative isolate overflow-hidden bg-brand-navy">
      <img
        src="/bg.jpg"
        alt="Beachvolleyball-Turnier in Offenhausen"
        class="absolute inset-0 size-full object-cover"
      />
      <div class="absolute inset-0 bg-linear-to-t from-brand-navy via-brand-navy/75 to-brand-navy/30"></div>
      <div class="absolute inset-0 bg-linear-to-r from-brand-navy/85 to-transparent"></div>
      <div class="absolute inset-0 bg-[radial-gradient(110%_80%_at_85%_-10%,rgba(255,210,63,0.4),transparent_55%)]"></div>

      <div class="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-24 md:pb-24 md:pt-36">
        <div class="max-w-2xl">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-brand-sun">
            Sponsoring & Partnerschaft
          </p>
          <h1 class="mt-4 text-5xl text-white sm:text-6xl lg:text-7xl">
            Be part of it!<br /><span class="text-brand-coral">Werde Partner</span>
          </h1>
          <p class="mt-6 max-w-md text-lg text-white/85">
            Bringen Sie Ihre Marke aufs Spielfeld: Mit Ihrer Unterstützung machen Sie
            die Beach Open Offenhausen und unseren Verein möglich – und sind das ganze
            Jahr über sichtbar dabei.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <Button as-child size="lg">
              <a href="#pakete">
                Unsere Pakete <ArrowRight class="size-4" />
              </a>
            </Button>
            <Button as-child size="lg" variant="outline" class="border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white">
              <a :href="PDF_URL" download>
                Sponsormappe (PDF) <Download class="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Unsere Partner -->
    <SiteSection>
      <div class="mb-10 max-w-2xl">
        <h2 class="text-3xl">Unsere Partner</h2>
        <p class="mt-3 text-muted-foreground">
          Diese Unternehmen und Institutionen machen O.H.BEACH möglich. Danke, dass ihr dabei seid!
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <template v-for="(p, i) in partners" :key="i">
          <a
            v-if="p.logo"
            :href="p.url || undefined"
            :target="p.url ? '_blank' : undefined"
            :rel="p.url ? 'noopener' : undefined"
            class="flex aspect-3/2 items-center justify-center rounded-xl border border-border/60 bg-background p-6 transition-colors hover:border-brand-coral"
            :class="{ 'ring-1 ring-brand-coral/30': p.featured }"
          >
            <img :src="p.logo" :alt="p.name" class="max-h-16 w-auto max-w-full object-contain" />
          </a>
          <div
            v-else
            class="flex aspect-3/2 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-brand-sand-soft/50 p-6 text-center"
          >
            <span class="font-display text-sm font-semibold text-muted-foreground">Ihr Logo hier?</span>
            <span class="text-xs text-muted-foreground/70">Platzhalter</span>
          </div>
        </template>
      </div>
      <p class="mt-6 text-sm text-muted-foreground">
        Noch ein Platz frei: Werde einer von ihnen –
        <a :href="`mailto:${CONTACT_MAIL}`" class="font-semibold text-brand-sky-dark hover:underline">schreib uns</a>.
      </p>
    </SiteSection>

    <!-- Warum O.H.BEACH (Our Story) -->
    <SiteSection tone="navy">
      <div class="grid items-start gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-brand-sun">Our Story</p>
          <h2 class="text-3xl">Warum O.H.BEACH?</h2>
          <p class="text-white/80">
            Gegründet im Frühjahr 2012, ist O.H.BEACH heute eine feste Größe in der
            oberösterreichischen Beachvolleyball-Szene. Jeden Sommer richten wir unsere
            Ortsmeisterschaft in Offenhausen aus und entwickeln den Verein stetig weiter.
          </p>
          <p class="text-white/80">
            Unsere aktivsten Mitglieder kommen im Sommer auf bis zu 20 Turnierteilnahmen –
            mit vielen Topplatzierungen. Als Partner sind Sie überall mit dabei, wo wir
            antreten.
          </p>
          <div class="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4" lang="de">
            <div v-for="f in facts" :key="f.label" class="rounded-xl border border-white/15 bg-white/5 p-4">
              <component :is="f.icon" class="size-5 text-brand-sky" />
              <p class="mt-2 font-display text-xl font-bold leading-tight text-white">{{ f.value }}</p>
              <p class="mt-0.5 hyphens-auto wrap-break-word text-xs leading-snug text-white/60">{{ f.label }}</p>
            </div>
          </div>
        </div>
        <div class="rounded-xl border border-white/15 bg-white/5 p-6">
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-brand-sun">Our Vision</p>
          <h3 class="mt-2 text-xl">Wohin wir wollen</h3>
          <p class="mt-2 text-white/70">
            In den kommenden Jahren möchten wir unseren Verein stetig vergrößern und
            unseren Mitgliedern immer mehr bieten.
          </p>
          <ul class="mt-4 space-y-3">
            <li v-for="v in vision" :key="v" class="flex items-start gap-3 text-white/85">
              <Check class="mt-0.5 size-5 shrink-0 text-brand-coral" />
              <span>{{ v }}</span>
            </li>
          </ul>
        </div>
      </div>
    </SiteSection>

    <!-- Pakete-Übersicht -->
    <SiteSection id="pakete">
      <div class="mb-10 max-w-2xl">
        <h2 class="text-3xl">Unsere Sponsorpakete</h2>
        <p class="mt-3 text-muted-foreground">Finden Sie alle Pakete auf einen Blick – für jedes Budget das Passende.</p>
      </div>

      <!-- Hauptpakete -->
      <div class="grid gap-6 lg:grid-cols-2">
        <Card
          v-for="p in packages"
          :key="p.name"
          class="bg-background"
          :class="p.featured ? 'border-brand-coral/40 ring-1 ring-brand-coral/20' : ''"
        >
          <CardHeader>
            <div class="flex items-start justify-between gap-4">
              <div>
                <span
                  v-if="p.featured"
                  class="mb-2 inline-block rounded-full bg-brand-coral/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-coral-dark"
                >
                  Beliebt
                </span>
                <CardTitle class="text-2xl">{{ p.name }}</CardTitle>
                <p class="mt-1 text-sm text-muted-foreground">{{ p.tagline }}</p>
              </div>
              <div class="shrink-0 rounded-lg bg-brand-sun px-4 py-2 text-center font-display text-xl font-bold text-brand-navy">
                {{ p.price }}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul class="space-y-3">
              <li v-for="perk in p.perks" :key="perk" class="flex items-start gap-3 text-muted-foreground">
                <Check class="mt-0.5 size-5 shrink-0 text-brand-sky-dark" />
                <span>{{ perk }}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <!-- Kombi-Angebote -->
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div
          v-for="b in bundles"
          :key="b.name"
          class="flex items-center justify-between gap-4 rounded-xl border border-brand-sun/50 bg-brand-sun/10 p-5"
        >
          <div>
            <p class="flex items-center gap-2 font-display font-semibold">
              <Sparkles class="size-4 text-brand-coral" /> Kombi-Angebot
            </p>
            <p class="mt-1 text-sm text-muted-foreground">{{ b.name }}</p>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-sm text-muted-foreground line-through">{{ b.old }}</p>
            <p class="font-display text-2xl font-bold text-brand-coral-dark">{{ b.now }}</p>
          </div>
        </div>
      </div>

      <!-- Weitere Möglichkeiten -->
      <div class="mt-12 mb-8 max-w-2xl">
        <h3 class="text-2xl">Weitere Möglichkeiten</h3>
        <p class="mt-2 text-muted-foreground">Auch abseits der klassischen Pakete freuen wir uns über jede Unterstützung.</p>
      </div>
      <div class="grid gap-6 md:grid-cols-2">
        <Card v-for="s in support" :key="s.name" class="bg-background">
          <CardHeader>
            <div class="flex items-center justify-between gap-4">
              <CardTitle class="flex items-center gap-2 text-xl">
                <component :is="s.icon" class="size-5 text-brand-sky-dark" /> {{ s.name }}
              </CardTitle>
              <span class="shrink-0 font-display font-bold text-brand-coral-dark">{{ s.price }}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul class="space-y-2.5">
              <li v-for="perk in s.perks" :key="perk" class="flex items-start gap-3 text-muted-foreground">
                <Check class="mt-0.5 size-5 shrink-0 text-brand-sky-dark" />
                <span>{{ perk }}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </SiteSection>

    <!-- Sponsormappe / Kontakt -->
    <SiteSection tone="navy">
      <div class="grid items-center gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-brand-sun">You will find us at the beach</p>
          <h2 class="text-3xl">Lust, dabei zu sein?</h2>
          <p class="text-white/80">
            Alle Pakete und Details gibt es auch als komplette Sponsormappe zum Herunterladen.
            Bei Fragen oder einer individuellen Vereinbarung melden Sie sich einfach – wir finden
            gemeinsam das passende Paket.
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <Button as-child size="lg">
              <a :href="PDF_URL" download>
                Sponsormappe herunterladen <Download class="size-4" />
              </a>
            </Button>
            <Button as-child size="lg" variant="outline" class="border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white">
              <a :href="`mailto:${CONTACT_MAIL}`">
                Kontakt aufnehmen <Mail class="size-4" />
              </a>
            </Button>
          </div>
        </div>

        <div class="rounded-xl border border-white/15 bg-white/5 p-6">
          <h3 class="flex items-center gap-2 text-xl">
            <Heart class="size-5 text-brand-coral" /> Kontakt
          </h3>
          <dl class="mt-4 space-y-4 text-white/85">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-white/50">Hauptverantwortlich</dt>
              <dd class="mt-1">Obmann Michael Sterrer</dd>
              <dd>Kassier Peter Emathinger</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-white/50">Verein</dt>
              <dd class="mt-1">O.H. Beachvolleyball Offenhausen</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-white/50">E-Mail</dt>
              <dd class="mt-1">
                <a :href="`mailto:${CONTACT_MAIL}`" class="inline-flex items-center gap-2 font-semibold text-brand-sky hover:underline">
                  <Mail class="size-4" /> {{ CONTACT_MAIL }}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </SiteSection>
  </div>
</template>
