<script setup lang="ts">
const props = defineProps<{ modelValue: string; today: string; maxDate: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const days = computed(() => dateRange(props.today, props.maxDate))

const scroller = ref<HTMLElement | null>(null)
watch(() => props.modelValue, async () => {
  await nextTick()
  scroller.value?.querySelector('[aria-pressed="true"]')
    ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
})
</script>

<template>
  <div ref="scroller" class="-mx-1 overflow-x-auto pb-1">
    <div class="flex min-w-max gap-1.5 px-1">
      <button
        v-for="d in days"
        :key="d"
        type="button"
        :aria-pressed="d === modelValue"
        :aria-label="formatDateLong(d)"
        class="flex w-12 shrink-0 flex-col items-center gap-0.5 rounded-xl border py-2 text-center transition-colors"
        :class="d === modelValue
          ? 'border-brand-coral bg-brand-coral text-white shadow-sm'
          : 'border-border/70 hover:border-brand-sky hover:bg-brand-sky/10'"
        @click="emit('update:modelValue', d)"
      >
        <span
          class="text-[0.65rem] font-semibold uppercase tracking-wide"
          :class="d === modelValue ? 'text-white/80' : 'text-muted-foreground'"
        >{{ formatWeekdayShort(d) }}</span>
        <span class="font-display text-lg font-semibold leading-none tabular-nums">{{ dayOfMonth(d) }}</span>
        <span
          v-if="d === today"
          class="text-[0.6rem] font-medium leading-none"
          :class="d === modelValue ? 'text-white/80' : 'text-brand-coral'"
        >heute</span>
      </button>
    </div>
  </div>
</template>
