<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

useHead({ title: 'Styleguide' })

const brandColors = [
  { name: 'Sand', var: '--brand-sand', hex: '#F4E4C1' },
  { name: 'Sand soft', var: '--brand-sand-soft', hex: '#FAF1DC' },
  { name: 'Koralle', var: '--brand-coral', hex: '#FF6B5C' },
  { name: 'Türkis', var: '--brand-turquoise', hex: '#2EC4B6' },
  { name: 'Sonne', var: '--brand-sun', hex: '#FFD23F' },
  { name: 'Ocean', var: '--brand-ocean', hex: '#14506B' },
  { name: 'Ink', var: '--brand-ink', hex: '#2A2A2A' },
]

const semanticColors = [
  { name: 'background', fg: 'foreground' },
  { name: 'primary', fg: 'primary-foreground' },
  { name: 'secondary', fg: 'secondary-foreground' },
  { name: 'accent', fg: 'accent-foreground' },
  { name: 'muted', fg: 'muted-foreground' },
  { name: 'destructive', fg: 'destructive-foreground' },
]
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-12 px-4 py-12">
    <header class="space-y-2">
      <Badge variant="secondary">Design-System</Badge>
      <h1 class="text-4xl">Sunny Beach Styleguide</h1>
      <p class="max-w-2xl text-muted-foreground">
        Lebende Dokumentation der Tokens und Komponenten. Quelle der Wahrheit:
        <code class="rounded bg-muted px-1.5 py-0.5 text-sm">app/assets/css/tailwind.css</code>
        &amp; <code class="rounded bg-muted px-1.5 py-0.5 text-sm">design/tokens.json</code>.
      </p>
    </header>

    <!-- Markenfarben -->
    <section class="space-y-4">
      <h2 class="text-2xl">Markenfarben</h2>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div v-for="c in brandColors" :key="c.var" class="overflow-hidden rounded-xl border">
          <div class="h-20" :style="{ background: `var(${c.var})` }" />
          <div class="space-y-0.5 p-3">
            <p class="text-sm font-semibold">{{ c.name }}</p>
            <p class="text-xs text-muted-foreground">{{ c.hex }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Semantische Tokens -->
    <section class="space-y-4">
      <h2 class="text-2xl">Semantische Tokens</h2>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div
          v-for="c in semanticColors"
          :key="c.name"
          class="flex h-24 flex-col justify-end rounded-xl border p-3"
          :style="{ background: `var(--${c.name})`, color: `var(--${c.fg})` }"
        >
          <span class="text-sm font-semibold">{{ c.name }}</span>
        </div>
      </div>
    </section>

    <!-- Typografie -->
    <section class="space-y-4">
      <h2 class="text-2xl">Typografie</h2>
      <Card>
        <CardContent class="space-y-3 pt-6">
          <p class="font-display text-4xl font-bold">Fredoka · Display</p>
          <h1 class="text-3xl">Überschrift H1</h1>
          <h2 class="text-2xl">Überschrift H2</h2>
          <h3 class="text-xl">Überschrift H3</h3>
          <Separator />
          <p class="font-sans text-base">
            Nunito · Body. Der entspannteste Beachvolleyball-Verein der Stadt –
            mit Sand zwischen den Zehen und einem Faultier als Maskottchen.
          </p>
          <p class="text-sm text-muted-foreground">Sekundärtext / Muted</p>
        </CardContent>
      </Card>
    </section>

    <!-- Buttons -->
    <section class="space-y-4">
      <h2 class="text-2xl">Buttons</h2>
      <div class="flex flex-wrap items-center gap-3">
        <Button>Primär</Button>
        <Button variant="secondary">Sekundär</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Stornieren</Button>
        <Button variant="link">Link</Button>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <Button size="sm">Klein</Button>
        <Button>Standard</Button>
        <Button size="lg">Groß</Button>
      </div>
    </section>

    <!-- Formfelder -->
    <section class="space-y-4">
      <h2 class="text-2xl">Formfelder</h2>
      <Card class="max-w-md">
        <CardHeader>
          <CardTitle>Beispiel-Formular</CardTitle>
          <CardDescription>Eingabefelder &amp; Labels</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="sg-email">E-Mail</Label>
            <Input id="sg-email" type="email" placeholder="name@verein.at" />
          </div>
          <div class="space-y-2">
            <Label for="sg-pw">Passwort</Label>
            <Input id="sg-pw" type="password" placeholder="••••••••" />
          </div>
          <Button class="w-full">Anmelden</Button>
        </CardContent>
      </Card>
    </section>

    <!-- Hinweise + Badges -->
    <section class="space-y-4">
      <h2 class="text-2xl">Hinweise &amp; Badges</h2>
      <div class="flex flex-wrap gap-2">
        <Badge>Standard</Badge>
        <Badge variant="secondary">Sekundär</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Belegt</Badge>
      </div>
      <Alert>
        <AlertTitle>Tipp vom Faultier</AlertTitle>
        <AlertDescription>
          Reservierungen sind bis zu 14 Tage im Voraus möglich. Immer schön entspannt bleiben.
        </AlertDescription>
      </Alert>
    </section>

    <!-- Maskottchen -->
    <section class="space-y-4">
      <h2 class="text-2xl">Maskottchen</h2>
      <Card>
        <CardContent class="flex flex-col items-center gap-4 pt-6 sm:flex-row">
          <BrandFaultierMascot :size="180" />
          <div class="space-y-2">
            <p class="font-display text-2xl font-bold">Das Faultier</p>
            <p class="max-w-md text-muted-foreground">
              Aktueller Platzhalter als Inline-SVG. Wird durch die finale
              Illustration ersetzt – Einsatz in Hero, Leerzuständen und Bestätigungen.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
</template>
