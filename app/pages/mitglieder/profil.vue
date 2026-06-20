<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Mein Profil' })

type Skill = 1 | 2 | 3 | null
interface Profile {
  vorname: string
  nachname: string
  email: string
  telefon: string
  wohnort: string
  talente: string
  skill: Skill
}

const { fetch: refreshSession } = useUserSession()

const { data, pending, error } = await useFetch('/api/members/profile', {
  default: () => ({ profile: null as Profile | null }),
})

const form = reactive<Profile>({
  vorname: '', nachname: '', email: '', telefon: '', wohnort: '', talente: '', skill: null,
})

// Bei (Neu-)Laden Formular mit den Serverwerten befüllen.
watchEffect(() => {
  if (data.value.profile) Object.assign(form, data.value.profile)
})

// "" <-> null fürs Skill-Dropdown.
const skillValue = computed({
  get: () => (form.skill === null ? '' : String(form.skill)),
  set: (v: string) => { form.skill = v === '' ? null : (Number(v) as Skill) },
})

const saving = ref(false)
const emailChanged = computed(() => !!data.value.profile && form.email.trim().toLowerCase() !== data.value.profile.email.trim().toLowerCase())

async function save() {
  if (!form.vorname.trim() || !form.nachname.trim()) {
    toast.error('Vor- und Nachname dürfen nicht leer sein.')
    return
  }
  saving.value = true
  try {
    const res = await $fetch('/api/members/profile', {
      method: 'PUT',
      body: {
        vorname: form.vorname.trim(),
        nachname: form.nachname.trim(),
        email: form.email.trim(),
        telefon: form.telefon.trim(),
        wohnort: form.wohnort.trim(),
        talente: form.talente.trim(),
        skill: form.skill,
      },
    })
    data.value = { profile: res.profile }
    await refreshSession()
    toast.success('Profil gespeichert.')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.statusMessage || 'Speichern fehlgeschlagen.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-4 py-12">
    <header class="mb-8 flex items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl">Mein Profil</h1>
        <p class="mt-2 text-muted-foreground">Deine persönlichen Daten – jederzeit änderbar.</p>
      </div>
      <Button as-child variant="ghost" size="sm"><NuxtLink to="/mitglieder">Zurück</NuxtLink></Button>
    </header>

    <p v-if="pending" class="text-muted-foreground">Lädt …</p>
    <p v-else-if="error || !data.profile" class="text-muted-foreground">Profil konnte nicht geladen werden.</p>

    <Card v-else>
      <CardContent class="space-y-5 pt-6">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <Label for="vorname">Vorname</Label>
            <Input id="vorname" v-model="form.vorname" autocomplete="given-name" />
          </div>
          <div class="space-y-1.5">
            <Label for="nachname">Nachname</Label>
            <Input id="nachname" v-model="form.nachname" autocomplete="family-name" />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label for="email">E-Mail</Label>
          <Input id="email" v-model="form.email" type="email" autocomplete="email" />
          <p v-if="emailChanged" class="text-xs text-amber-600">
            Das ist deine Login-Adresse – nach dem Speichern meldest du dich künftig mit der neuen E-Mail an.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <Label for="telefon">Telefonnummer</Label>
            <Input id="telefon" v-model="form.telefon" type="tel" autocomplete="tel" placeholder="optional" />
          </div>
          <div class="space-y-1.5">
            <Label for="wohnort">Wohnort</Label>
            <Input id="wohnort" v-model="form.wohnort" autocomplete="address-level2" placeholder="optional" />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label for="talente">Talente</Label>
          <Input id="talente" v-model="form.talente" placeholder="z. B. Aufschlag, Block …" />
        </div>

        <div class="space-y-1.5">
          <Label for="skill">Spielstärke</Label>
          <select
            id="skill"
            v-model="skillValue"
            class="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-72"
          >
            <option value="">Ohne Wertung</option>
            <option value="1">1 – Liga-Spieler</option>
            <option value="2">2 – Starker Angriff</option>
            <option value="3">3 – Gute Ballkontrolle</option>
          </select>
          <p class="text-xs text-muted-foreground">Hilft bei fairen Team-Auslosungen.</p>
        </div>

        <div class="flex justify-end pt-2">
          <Button :disabled="saving" @click="save">{{ saving ? 'Speichert …' : 'Speichern' }}</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
