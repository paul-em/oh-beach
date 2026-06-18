<script setup lang="ts">
import { Menu, X } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

const { loggedIn, clear } = useUserSession()

const nav = [
  { to: '/', label: 'Start' },
  { to: '/turnier', label: 'Turnier' },
  { to: '/kalender', label: 'Platzbelegung' },
  { to: '/statuten', label: 'Statuten' },
  { to: '/verhaltenskodex', label: 'Verhaltenskodex' },
]
const year = 2026

const menuOpen = ref(false)

// Menü bei Navigation schließen
const route = useRoute()
watch(() => route.fullPath, () => {
  menuOpen.value = false
})

async function onLogout() {
  menuOpen.value = false
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <div class="sand-grain min-h-dvh flex flex-col bg-background text-foreground">
    <!-- Header -->
    <header class="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <NuxtLink to="/" class="shrink-0" aria-label="Zur Startseite">
          <BrandLogo variant="landscape-small" class="h-8" />
        </NuxtLink>

        <nav class="hidden items-center gap-1 md:flex">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            active-class="text-foreground"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <template v-if="loggedIn">
            <Button as-child variant="ghost" size="sm" class="hidden sm:inline-flex">
              <NuxtLink to="/mitglieder">Mein Bereich</NuxtLink>
            </Button>
            <Button size="sm" variant="outline" @click="onLogout">Logout</Button>
          </template>
          <template v-else>
            <Button as-child size="sm">
              <NuxtLink to="/login">Login</NuxtLink>
            </Button>
          </template>

          <Button
            variant="ghost"
            size="icon"
            class="md:hidden"
            :aria-expanded="menuOpen"
            aria-label="Menü öffnen"
            @click="menuOpen = !menuOpen"
          >
            <X v-if="menuOpen" class="size-5" />
            <Menu v-else class="size-5" />
          </Button>
        </div>
      </div>

      <!-- Mobile-Menü -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="-translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <nav
          v-if="menuOpen"
          class="border-t border-border/70 md:hidden"
        >
          <div class="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4">
            <NuxtLink
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              class="rounded-md px-3 py-2.5 text-base font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              active-class="bg-muted text-foreground"
            >
              {{ item.label }}
            </NuxtLink>

            <template v-if="loggedIn">
              <NuxtLink
                to="/mitglieder"
                class="rounded-md px-3 py-2.5 text-base font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                active-class="bg-muted text-foreground"
              >
                Mein Bereich
              </NuxtLink>
            </template>
          </div>
        </nav>
      </Transition>
    </header>

    <!-- Seiteninhalt -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-brand-navy text-white">
      <div class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between">
        <div class="space-y-4">
          <BrandLogo variant="portrait" color="white" class="h-24" />
          <p class="max-w-sm text-sm text-white/70">
            Der entspannteste Beachvolleyball-Verein. Sand zwischen den Zehen,
            Faultier im Herzen.
          </p>
        </div>

        <nav class="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          <NuxtLink to="/turnier" class="text-white/70 transition-colors hover:text-white">Turnier</NuxtLink>
          <NuxtLink to="/kalender" class="text-white/70 transition-colors hover:text-white">Platzbelegung</NuxtLink>
          <NuxtLink to="/statuten" class="text-white/70 transition-colors hover:text-white">Statuten</NuxtLink>
          <NuxtLink to="/verhaltenskodex" class="text-white/70 transition-colors hover:text-white">Verhaltenskodex</NuxtLink>
          <NuxtLink to="/impressum" class="text-white/70 transition-colors hover:text-white">Impressum</NuxtLink>
          <NuxtLink to="/datenschutz" class="text-white/70 transition-colors hover:text-white">Datenschutz</NuxtLink>
          <NuxtLink to="/login" class="text-white/70 transition-colors hover:text-white">Mitglieder-Login</NuxtLink>
        </nav>
      </div>
      <div class="border-t border-white/15">
        <div class="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-white/60">
          © {{ year }} O.H. Beach Volleyballverein
        </div>
      </div>
    </footer>

    <Toaster rich-colors position="top-center" />
  </div>
</template>
