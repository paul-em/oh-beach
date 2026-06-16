<script setup lang="ts">
/*
  Platzhalter-Maskottchen "Faultier" als Inline-SVG in Sunny-Beach-Farben.
  Später durch die finale Illustration ersetzbar (gleiche Props/Größe beibehalten).
  Nutzung: <FaultierMascot :size="160" />
*/
withDefaults(defineProps<{ size?: number | string }>(), { size: 160 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Faultier-Maskottchen von O.H.BEACH"
  >
    <!-- Sonne hinter dem Kopf -->
    <circle cx="100" cy="96" r="74" fill="var(--brand-sun)" opacity="0.25" />
    <!-- Kopf -->
    <ellipse cx="100" cy="100" rx="60" ry="56" fill="#b08d57" />
    <ellipse cx="100" cy="104" rx="46" ry="44" fill="#d8b98a" />
    <!-- Augenflecken (typisch Faultier) -->
    <ellipse cx="80" cy="98" rx="16" ry="20" fill="#7c5e3b" transform="rotate(-12 80 98)" />
    <ellipse cx="120" cy="98" rx="16" ry="20" fill="#7c5e3b" transform="rotate(12 120 98)" />
    <!-- Augen -->
    <circle cx="81" cy="100" r="6" fill="#2a2a2a" />
    <circle cx="119" cy="100" r="6" fill="#2a2a2a" />
    <circle cx="83" cy="98" r="2" fill="#fff" />
    <circle cx="121" cy="98" r="2" fill="#fff" />
    <!-- Nase -->
    <ellipse cx="100" cy="118" rx="7" ry="5" fill="#2a2a2a" />
    <!-- entspanntes Lächeln -->
    <path d="M88 130 Q100 140 112 130" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round" fill="none" />
    <!-- Ärmchen, das sich festhält -->
    <path d="M40 70 Q60 120 90 140" stroke="#b08d57" stroke-width="14" stroke-linecap="round" fill="none" />
    <!-- kleines Strandelement: Volleyball -->
    <circle cx="150" cy="150" r="20" fill="#fff" stroke="var(--brand-turquoise)" stroke-width="3" />
    <path d="M150 130 Q150 150 150 170 M132 142 Q150 150 168 158 M132 158 Q150 150 168 142"
      stroke="var(--brand-turquoise)" stroke-width="2.5" fill="none" stroke-linecap="round" />
  </svg>
</template>
