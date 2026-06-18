<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { X } from '@lucide/vue'

export interface BookingSlot {
  hour: number
  label: string
  startISO: string
  status: 'free' | 'busy' | 'past'
  mine: boolean
  bookingId?: string
  bookedBy?: string
}

withDefaults(
  defineProps<{ slots: BookingSlot[]; interactive?: boolean; pending?: boolean }>(),
  { interactive: false, pending: false },
)
const emit = defineEmits<{ book: [number]; cancel: [string] }>()
</script>

<template>
  <div>
    <div v-if="pending" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <Skeleton v-for="i in 8" :key="i" class="h-20 rounded-xl" />
    </div>

    <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <template v-for="s in slots" :key="s.hour">
        <!-- Frei + buchbar -->
        <button
          v-if="s.status === 'free' && interactive"
          type="button"
          class="group flex h-20 flex-col items-start justify-between rounded-xl border-2 border-brand-sky/40 bg-brand-sky/5 p-3 text-left transition-colors hover:border-brand-sky hover:bg-brand-sky/10"
          @click="emit('book', s.hour)"
        >
          <span class="font-display font-semibold">{{ s.label }}</span>
          <span class="text-sm font-semibold text-brand-sky-dark">Frei · buchen</span>
        </button>

        <!-- Frei, nur Anzeige -->
        <div
          v-else-if="s.status === 'free'"
          class="flex h-20 flex-col items-start justify-between rounded-xl border border-border bg-card p-3"
        >
          <span class="font-display font-semibold">{{ s.label }}</span>
          <span class="text-sm font-semibold text-brand-sky-dark">Frei</span>
        </div>

        <!-- Eigene Buchung -->
        <div
          v-else-if="s.status === 'busy' && s.mine"
          class="flex h-20 flex-col items-start justify-between rounded-xl border-2 border-brand-coral/50 bg-brand-coral/10 p-3"
        >
          <span class="font-display font-semibold">{{ s.label }}</span>
          <div class="flex w-full items-center justify-between">
            <span class="text-sm font-semibold text-brand-coral-dark">Deine Buchung</span>
            <Button
              v-if="interactive && s.bookingId"
              variant="ghost"
              size="icon-sm"
              aria-label="Stornieren"
              @click="emit('cancel', s.bookingId)"
            >
              <X class="size-4" />
            </Button>
          </div>
        </div>

        <!-- Belegt (fremd) -->
        <div
          v-else-if="s.status === 'busy'"
          class="flex h-20 flex-col items-start justify-between rounded-xl border border-border bg-muted p-3"
        >
          <span class="font-display font-semibold text-muted-foreground">{{ s.label }}</span>
          <span class="w-full truncate text-sm font-semibold text-muted-foreground" :title="s.bookedBy || 'Belegt'">{{ s.bookedBy || 'Belegt' }}</span>
        </div>

        <!-- Vergangen -->
        <div
          v-else
          class="flex h-20 flex-col items-start justify-between rounded-xl border border-dashed border-border/60 p-3 opacity-50"
        >
          <span class="font-display font-semibold">{{ s.label }}</span>
          <span class="text-sm">Vorbei</span>
        </div>
      </template>
    </div>
  </div>
</template>
