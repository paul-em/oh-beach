<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dices, UserPlus, Users, X, Search, RotateCw } from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { DrawPlayer, DrawResult } from '~/utils/teams'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Teams auslosen' })

type Skill = 1 | 2 | 3 | null

const { data, pending } = await useFetch('/api/members/roster', {
  default: () => ({ members: [] as { name: string; skill: Skill }[] }),
})

// Anwesende Mitglieder (per Index ausgewählt, da Namen theoretisch doppelt vorkommen).
const selected = ref<Set<number>>(new Set())
const query = ref('')

const roster = computed(() => data.value.members.map((m, i) => ({ ...m, id: i })))
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return roster.value
  return roster.value.filter((m) => m.name.toLowerCase().includes(q))
})

function toggle(id: number) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}
function selectAll() {
  selected.value = new Set(filtered.value.map((m) => m.id))
}
function selectNone() {
  selected.value = new Set()
}

// Gäste
const guests = ref<{ name: string; skill: Skill }[]>([])
const guestName = ref('')
const guestSkill = ref<Skill>(2)

function addGuest() {
  const name = guestName.value.trim()
  if (!name) return
  guests.value.push({ name, skill: guestSkill.value })
  guestName.value = ''
  guestSkill.value = 2
}
function removeGuest(i: number) {
  guests.value.splice(i, 1)
}

// Teamgröße
const teamSize = ref(2)
const sizeOptions = [2, 3, 4]

const players = computed<DrawPlayer[]>(() => [
  ...roster.value.filter((m) => selected.value.has(m.id)).map((m) => ({ name: m.name, skill: m.skill, guest: false })),
  ...guests.value.map((g) => ({ name: g.name, skill: g.skill, guest: true })),
])

const numTeams = computed(() => {
  const n = players.value.length
  if (n < 2) return 0
  return Math.max(1, Math.min(Math.ceil(n / teamSize.value), Math.floor(n / 2)))
})

const result = ref<DrawResult | null>(null)

function draw() {
  if (players.value.length < 2) {
    toast.error('Wähle mindestens zwei Spieler aus.')
    return
  }
  result.value = drawTeams(players.value, teamSize.value)
}

// Auswahländerungen machen ein altes Ergebnis ungültig.
watch([players, teamSize], () => { result.value = null })

// Dezente Farbe für den selbst gesetzten Skill eines Gasts (nur bei der Eingabe).
function skillClass(s: Skill) {
  switch (s) {
    case 1: return 'bg-amber-100 text-amber-800'
    case 2: return 'bg-brand-coral/15 text-brand-coral'
    case 3: return 'bg-brand-sky/20 text-brand-sky-dark'
    default: return 'bg-muted text-muted-foreground'
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-12">
    <header class="mb-8 flex items-center gap-4">
      <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-coral/15 text-brand-coral">
        <Dices class="size-6" />
      </div>
      <div>
        <h1 class="text-4xl">Teams auslosen</h1>
        <p class="mt-1 text-muted-foreground">Anwesende wählen, Gäste ergänzen und faire Teams ziehen.</p>
      </div>
    </header>

    <div class="space-y-6">
      <!-- 1. Anwesende Mitglieder -->
      <Card>
        <CardHeader>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle class="flex items-center gap-2"><Users class="size-5" /> Wer ist dabei?</CardTitle>
              <CardDescription>{{ selected.size }} ausgewählt</CardDescription>
            </div>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" @click="selectAll">Alle</Button>
              <Button variant="ghost" size="sm" @click="selectNone">Keine</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="query" placeholder="Mitglied suchen …" class="pl-9" />
          </div>

          <p v-if="pending" class="text-sm text-muted-foreground">Lädt Mitglieder …</p>
          <p v-else-if="!filtered.length" class="text-sm text-muted-foreground">Keine Mitglieder gefunden.</p>

          <div v-else class="flex flex-wrap gap-2">
            <button
              v-for="m in filtered"
              :key="m.id"
              type="button"
              class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
              :class="selected.has(m.id)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-muted'"
              @click="toggle(m.id)"
            >
              <span>{{ m.name }}</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <!-- 2. Gäste -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2"><UserPlus class="size-5" /> Gäste ergänzen</CardTitle>
          <CardDescription>Nicht-Mitglieder mit Spielstärke hinzufügen.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div class="flex-1 space-y-1.5">
              <Label for="guest-name">Name</Label>
              <Input id="guest-name" v-model="guestName" placeholder="z. B. Max (Gast)" @keydown.enter.prevent="addGuest" />
            </div>
            <div class="space-y-1.5">
              <Label>Spielstärke</Label>
              <div class="flex gap-1">
                <button
                  v-for="opt in ([1, 2, 3, null] as Skill[])"
                  :key="String(opt)"
                  type="button"
                  class="h-9 rounded-md border px-3 text-sm transition-colors"
                  :class="guestSkill === opt ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'"
                  @click="guestSkill = opt"
                >{{ opt ?? '–' }}</button>
              </div>
            </div>
            <Button type="button" :disabled="!guestName.trim()" @click="addGuest">
              <UserPlus class="size-4" /> Hinzufügen
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">1 = Liga-Spieler · 2 = Angriff · 3 = Ballkontrolle · – = ohne Wertung (zählt als Mittelfeld)</p>

          <div v-if="guests.length" class="flex flex-wrap gap-2">
            <span
              v-for="(g, i) in guests"
              :key="i"
              class="flex items-center gap-2 rounded-full border border-dashed border-border bg-background py-1 pl-3 pr-1 text-sm"
            >
              <span>{{ g.name }}</span>
              <span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none" :class="skillClass(g.skill)">{{ g.skill ?? '–' }}</span>
              <button type="button" class="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground" :aria-label="`${g.name} entfernen`" @click="removeGuest(i)">
                <X class="size-3.5" />
              </button>
            </span>
          </div>
        </CardContent>
      </Card>

      <!-- 3. Auslosen -->
      <Card>
        <CardContent class="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1.5">
            <Label>Spieler pro Team</Label>
            <div class="flex gap-1">
              <button
                v-for="s in sizeOptions"
                :key="s"
                type="button"
                class="h-9 w-10 rounded-md border text-sm transition-colors"
                :class="teamSize === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'"
                @click="teamSize = s"
              >{{ s }}</button>
            </div>
          </div>
          <div class="text-sm text-muted-foreground">
            {{ players.length }} Spieler ·
            <template v-if="numTeams >= 1">{{ numTeams }} Team{{ numTeams === 1 ? '' : 's' }}</template>
            <template v-else>noch zu wenige</template>
          </div>
          <Button size="lg" :disabled="players.length < 2" @click="draw">
            <Dices class="size-5" /> {{ result ? 'Neu auslosen' : 'Teams auslosen' }}
          </Button>
        </CardContent>
      </Card>

      <!-- Ergebnis -->
      <div v-if="result" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl">Ergebnis</h2>
          <Button variant="outline" size="sm" @click="draw"><RotateCw class="size-4" /> Neu auslosen</Button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card v-for="(team, i) in result.teams" :key="i" class="overflow-hidden">
            <CardHeader class="bg-brand-navy py-3 text-white">
              <CardTitle class="text-base text-white">Team {{ i + 1 }}</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 py-4">
              <div v-for="(p, j) in team.players" :key="j" class="flex items-center gap-1.5">
                {{ p.name }}
                <span v-if="p.guest" class="text-xs text-muted-foreground">(Gast)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <p class="text-xs text-muted-foreground">Alle Anwesenden werden auf Teams mit mindestens 2 Spielern verteilt – geht die Teamgröße nicht glatt auf, weicht ein Team um einen Spieler ab (niemand sitzt aus, niemand spielt allein). Die Teams werden anhand der hinterlegten Spielstärke möglichst ausgeglichen zusammengestellt, bei gleicher Stärke zufällig gemischt.</p>
      </div>
    </div>
  </div>
</template>
