// Sliding-Session: Solange ein:e Nutzer:in aktiv ist, wird das 30-Tage-Fenster
// bei jedem Besuch (höchstens einmal pro Tag) neu gestartet, sodass man sich
// praktisch nicht mehr einloggen muss.
//
// Hintergrund: h3 verankert den Session-Ablauf an `session.createdAt` (= Login-
// Zeitpunkt) – ein reines `maxAge` wäre also ein absolutes Limit ab Login, kein
// Sliding. Deshalb ziehen wir `createdAt` nach und versiegeln das Cookie neu.

// Frühestens einmal pro Tag neu setzen – vermeidet ein Set-Cookie bei jedem Request.
const REFRESH_AFTER_MS = 1000 * 60 * 60 * 24

export default defineEventHandler(async (event) => {
  const path = event.path || ''

  // Build-Assets sowie die Auth-Endpunkte (verwalten die Session selbst) auslassen.
  if (
    path.startsWith('/_nuxt')
    || path.startsWith('/__')
    || path.startsWith('/api/auth')
    || /\.[a-z0-9]+$/i.test(path)
  ) {
    return
  }

  const session = await getUserSession(event)
  if (!session?.user) return

  const sessionName = useRuntimeConfig(event).session?.name || 'nuxt-session'
  const ctx = (event.context as { sessions?: Record<string, { createdAt?: number }> })
    .sessions?.[sessionName]
  if (!ctx) return

  const age = Date.now() - (ctx.createdAt || 0)
  if (age < REFRESH_AFTER_MS) return

  // Fenster verschieben und Cookie neu versiegeln (frisches expires + Seal-TTL).
  ctx.createdAt = Date.now()
  await setUserSession(event, {})
})
