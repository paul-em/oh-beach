<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Platz reservieren' })

const date = useDateParam()
const { data, pending, refresh } = await useFetch('/api/bookings', {
  query: { date },
  lazy: true,
  default: () => null,
})

type DialogState =
  | { open: false }
  | { open: true; mode: 'book'; hours: number[]; label: string }
  | { open: true; mode: 'cancel'; bookingId: string; label: string }

const dialog = ref<DialogState>({ open: false })
const note = ref('')
const working = ref(false)

/** Beschriftung einer Slot-Range, z. B. "18:00 – 21:00 (3 Std.)". */
function rangeLabel(hours: number[]): string {
  const slots = data.value?.slots ?? []
  const first = slots.find((s) => s.hour === hours[0])
  const last = slots.find((s) => s.hour === hours[hours.length - 1])
  if (!first || !last) return ''
  const from = first.label.split(' – ')[0]
  const to = last.label.split(' – ')[1]
  return hours.length > 1 ? `${from} – ${to} (${hours.length} Std.)` : `${from} – ${to}`
}

function askBook(hours: number[]) {
  if (!hours.length) return
  note.value = ''
  dialog.value = { open: true, mode: 'book', hours, label: rangeLabel(hours) }
}
function askCancel(bookingId: string) {
  // Eine Buchung kann mehrere Stunden umfassen – alle Slots desselben Eintrags zusammenfassen.
  const hours = (data.value?.slots ?? []).filter((s) => s.bookingId === bookingId).map((s) => s.hour).sort((a, b) => a - b)
  dialog.value = { open: true, mode: 'cancel', bookingId, label: rangeLabel(hours) }
}

async function confirm() {
  if (!dialog.value.open) return
  working.value = true
  try {
    if (dialog.value.mode === 'book') {
      await $fetch('/api/bookings', {
        method: 'POST',
        body: { date: date.value, hours: dialog.value.hours, note: note.value.trim() || undefined },
      })
      toast.success(dialog.value.hours.length > 1 ? 'Slots reserviert. Viel Spaß!' : 'Platz reserviert. Viel Spaß!')
    } else {
      await $fetch(`/api/bookings/${dialog.value.bookingId}`, { method: 'DELETE' })
      toast.success('Reservierung storniert.')
    }
    dialog.value = { open: false }
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.statusMessage || 'Das hat nicht geklappt.')
  } finally {
    working.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-12">
    <header class="mb-8 flex items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl">Platz reservieren</h1>
        <p class="mt-2 text-muted-foreground">Wähle einen freien Slot – maximal {{ data?.config.advanceDays ?? 14 }} Tage im Voraus.</p>
      </div>
      <Button as-child variant="ghost" class="hidden sm:inline-flex">
        <NuxtLink to="/mitglieder/meine-buchungen">Meine Buchungen</NuxtLink>
      </Button>
    </header>

    <Card>
      <CardContent class="space-y-6 pt-6">
        <BookingDayStrip v-model="date" :today="data?.today || date" :max-date="data?.maxDate || date" />
        <BookingDateNav v-model="date" :today="data?.today || date" :max-date="data?.maxDate || date" />
        <BookingSlotGrid
          :slots="data?.slots || []"
          :pending="pending"
          interactive
          @book="askBook"
          @cancel="askCancel"
        />
      </CardContent>
    </Card>

    <Dialog :open="dialog.open" @update:open="(v) => { if (!v) dialog = { open: false } }">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ dialog.open && dialog.mode === 'book' ? 'Reservierung bestätigen' : 'Reservierung stornieren' }}</DialogTitle>
          <DialogDescription>
            <template v-if="dialog.open && dialog.mode === 'book'">
              {{ formatDateLong(date) }}, {{ dialog.label }} – Platz für dich reservieren?
            </template>
            <template v-else-if="dialog.open">
              {{ formatDateLong(date) }}, {{ dialog.label }} – diese Reservierung wirklich stornieren?
            </template>
          </DialogDescription>
        </DialogHeader>

        <div v-if="dialog.open && dialog.mode === 'book'" class="space-y-2">
          <Label for="booking-note">Notiz <span class="font-normal text-muted-foreground">(optional)</span></Label>
          <Input
            id="booking-note"
            v-model="note"
            maxlength="140"
            placeholder="z. B. Training, Turniervorbereitung, offen für Mitspieler …"
            @keydown.enter.prevent="confirm"
          />
          <p class="text-xs text-muted-foreground">Sehen andere Mitglieder im Belegungsplan.</p>
        </div>

        <DialogFooter>
          <Button variant="ghost" :disabled="working" @click="dialog = { open: false }">Abbrechen</Button>
          <Button
            :variant="dialog.open && dialog.mode === 'cancel' ? 'destructive' : 'default'"
            :disabled="working"
            @click="confirm"
          >
            {{ working ? 'Moment …' : (dialog.open && dialog.mode === 'cancel' ? 'Stornieren' : 'Reservieren') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
