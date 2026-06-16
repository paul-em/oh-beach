<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarX } from '@lucide/vue'
import { toast } from 'vue-sonner'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Meine Buchungen' })

const { data, pending, refresh } = await useFetch('/api/bookings/mine', { default: () => ({ bookings: [] }) })
const cancelling = ref<string | null>(null)

async function cancel(id: string) {
  cancelling.value = id
  try {
    await $fetch(`/api/bookings/${id}`, { method: 'DELETE' })
    toast.success('Reservierung storniert.')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Stornieren fehlgeschlagen.')
  } finally {
    cancelling.value = null
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-4 py-12">
    <header class="mb-8 flex items-center justify-between gap-4">
      <h1 class="text-4xl">Meine Buchungen</h1>
      <Button as-child variant="outline" size="sm"><NuxtLink to="/mitglieder/reservieren">Neu reservieren</NuxtLink></Button>
    </header>

    <div v-if="pending" class="text-muted-foreground">Lädt …</div>

    <div v-else-if="!data.bookings.length" class="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-12 text-center">
      <CalendarX class="size-10 text-muted-foreground" />
      <p class="text-muted-foreground">Du hast aktuell keine kommenden Reservierungen.</p>
      <Button as-child><NuxtLink to="/mitglieder/reservieren">Jetzt Platz reservieren</NuxtLink></Button>
    </div>

    <div v-else class="space-y-3">
      <Card v-for="b in data.bookings" :key="b.id">
        <CardContent class="flex items-center justify-between gap-4 py-4">
          <span class="font-display font-semibold capitalize">{{ formatBookingWhen(b.startISO, b.endISO) }}</span>
          <Button variant="destructive" size="sm" :disabled="cancelling === b.id" @click="cancel(b.id)">
            {{ cancelling === b.id ? '…' : 'Stornieren' }}
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
