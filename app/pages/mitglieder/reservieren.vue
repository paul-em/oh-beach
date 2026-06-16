<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'vue-sonner'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Platz reservieren' })

const date = useDateParam()
const { data, pending, refresh } = await useFetch('/api/bookings', {
  query: { date },
  default: () => null,
})

type DialogState =
  | { open: false }
  | { open: true; mode: 'book'; hour: number; label: string }
  | { open: true; mode: 'cancel'; bookingId: string; label: string }

const dialog = ref<DialogState>({ open: false })
const working = ref(false)

function askBook(hour: number) {
  const slot = data.value?.slots.find((s) => s.hour === hour)
  if (!slot) return
  dialog.value = { open: true, mode: 'book', hour, label: slot.label }
}
function askCancel(bookingId: string) {
  const slot = data.value?.slots.find((s) => s.bookingId === bookingId)
  dialog.value = { open: true, mode: 'cancel', bookingId, label: slot?.label ?? '' }
}

async function confirm() {
  if (!dialog.value.open) return
  working.value = true
  try {
    if (dialog.value.mode === 'book') {
      await $fetch('/api/bookings', { method: 'POST', body: { date: date.value, hour: dialog.value.hour } })
      toast.success('Platz reserviert. Viel Spaß!')
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
