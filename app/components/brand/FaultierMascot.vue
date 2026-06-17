<script setup lang="ts">
/*
  Maskottchen „Faultier" – offizielle Illustration (public/faultier.png).
  Verwendet eine web-optimierte 640px-Variante mit transparentem Hintergrund.
  Größe über `size` (Pixel, quadratisch).
*/
withDefaults(defineProps<{ size?: number | string }>(), { size: 160 })
</script>

<template>
  <img
    src="/faultier-640.png"
    alt="Faultier-Maskottchen von O.H.BEACH"
    :width="size"
    :height="size"
    class="select-none"
    draggable="false"
  />
</template>
