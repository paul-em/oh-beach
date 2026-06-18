<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

interface DayWeather {
  kind: 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'
  tempMax: number
  tempMin: number
  windMax: number
  windy: boolean
}

const props = defineProps<{ modelValue: string; today: string; maxDate: string; weather?: DayWeather | null }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const canPrev = computed(() => props.modelValue > props.today)
const canNext = computed(() => props.modelValue < props.maxDate)

function go(n: number) {
  emit('update:modelValue', addDays(props.modelValue, n))
}
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <Button variant="outline" size="icon" :disabled="!canPrev" aria-label="Vorheriger Tag" @click="go(-1)">
      <ChevronLeft class="size-4" />
    </Button>
    <div class="flex flex-col items-center gap-1.5 text-center">
      <p class="font-display text-lg font-semibold capitalize">{{ formatDateLong(modelValue) }}</p>
      <BookingWeatherBadge v-if="weather" :weather="weather" />
      <button
        v-if="modelValue !== today"
        class="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        @click="emit('update:modelValue', today)"
      >
        Zurück zu heute
      </button>
    </div>
    <Button variant="outline" size="icon" :disabled="!canNext" aria-label="Nächster Tag" @click="go(1)">
      <ChevronRight class="size-4" />
    </Button>
  </div>
</template>
