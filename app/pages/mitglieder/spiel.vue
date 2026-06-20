<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gamepad2, ChevronLeft, ChevronRight, ChevronUp } from '@lucide/vue'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Beach-Blobby' })

const { user } = useUserSession()

// ---- Virtuelle Spielwelt (in dieser Auflösung wird gerechnet & gezeichnet) --
const VW = 800
const VH = 400
const GROUND_Y = 350 // Oberkante Sand
const R = 40 // Blob-Radius
const REST_Y = GROUND_Y - R // Blob-Mittelpunkt am Boden
const r = 16 // Ball-Radius
const NET_X = VW / 2
const NET_W = 10
const NET_H = 120
const NET_TOP = GROUND_Y - NET_H

const BLOB_SPEED = 5.5
const BLOB_GRAV = 0.9
const BLOB_JUMP = -16.5
const BALL_GRAV = 0.15
const BALL_MAX = 8
const BALL_MIN_AFTER_HIT = 3
const SERVE_FRAMES = 50
const POINTS_TO_WIN = 7

const P1_START = 160
const P2_START = VW - 160

// ---- Reaktiver UI-Zustand (Overlays, Scoreboard) --------------------------
const started = ref(false)
const winner = ref<0 | 1 | 2>(0)
const score1 = ref(0)
const score2 = ref(0)
const serving = ref(false)
const name1 = ref('')
const name2 = ref('')

// ---- Mobile: Vollbild im Querformat ---------------------------------------
// Am Handy macht das Spiel nur quer & im Vollbild Sinn (zwei D-Pads
// nebeneinander, breites Spielfeld). Wir wechseln darum beim Start in einen
// immersiven Layout-Modus, versuchen echtes Vollbild + Orientierungs-Lock und
// blenden ansonsten einen "bitte drehen"-Hinweis ein.
const isTouch = ref(false)
const isPortrait = ref(false)
const gameRoot = ref<HTMLElement | null>(null)
const immersive = computed(() => isTouch.value && started.value)

watchEffect(() => {
  if (!name1.value) name1.value = (user.value?.name || 'Spieler 1').split(' ')[0] || 'Spieler 1'
})

// ---- Eingaben (bewusst NICHT reaktiv – wird pro Frame gelesen) -------------
type Ctrl = 'left' | 'right' | 'jump'
type Player = 'p1' | 'p2'
const input = {
  p1: { left: false, right: false, jump: false },
  p2: { left: false, right: false, jump: false },
}

// D-Pad (mobil): Richtung ergibt sich aus der Daumenposition relativ zur Mitte.
// Erlaubt Diagonalen (z. B. oben-links = springen + nach links).
function padEval(player: Player, e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const dx = e.clientX - (rect.left + rect.width / 2)
  const dy = e.clientY - (rect.top + rect.height / 2)
  const th = rect.width * 0.16 // Totzone um die Mitte
  const inp = input[player]
  inp.left = dx < -th
  inp.right = dx > th
  inp.jump = dy < -th
}
function padStart(player: Player, e: PointerEvent) {
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  padEval(player, e)
}
function padEnd(player: Player) {
  const inp = input[player]
  inp.left = inp.right = inp.jump = false
}

// ---- Spielobjekte (plain, performance) -------------------------------------
interface Blob { x: number; y: number; vy: number; onGround: boolean }
interface Ball { x: number; y: number; px: number; vx: number; vy: number; angle: number }

const p1: Blob = { x: P1_START, y: REST_Y, vy: 0, onGround: true }
const p2: Blob = { x: P2_START, y: REST_Y, vy: 0, onGround: true }
const ball: Ball = { x: P1_START, y: 120, px: P1_START, vx: 0, vy: 0, angle: 0 }
let serveTimer = 0

let canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let lastTime = 0
let acc = 0
const STEP = 1000 / 60

// Sprites (clientseitig geladen). Bis sie da sind, wird ein einfacher Fallback gezeichnet.
let ballImg: HTMLImageElement | null = null
let faultierImg: HTMLImageElement | null = null
let faultierRatio = 238 / 456 // Breite/Höhe, wird nach dem Laden exakt gesetzt
const FAULTIER_SCALE = 1.3 // Höhe = 2*R * Scale
const BALL_SCALE = 1.4
function imgReady(img: HTMLImageElement | null): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0
}

function clampSpeed(b: Ball, max: number, min = 0) {
  const s = Math.hypot(b.vx, b.vy)
  if (s > max) { b.vx = (b.vx / s) * max; b.vy = (b.vy / s) * max }
  else if (min && s > 0 && s < min) { b.vx = (b.vx / s) * min; b.vy = (b.vy / s) * min }
}

// Ball über dem Aufschläger (= Verlierer des letzten Ballwechsels) platzieren.
function resetServe(serverSide: 1 | 2) {
  p1.x = P1_START; p1.y = REST_Y; p1.vy = 0; p1.onGround = true
  p2.x = P2_START; p2.y = REST_Y; p2.vy = 0; p2.onGround = true
  ball.x = serverSide === 1 ? P1_START : P2_START
  ball.px = ball.x
  ball.y = 110
  ball.vx = 0; ball.vy = 0
  serveTimer = SERVE_FRAMES
  serving.value = true
}

function startMatch() {
  score1.value = 0; score2.value = 0; winner.value = 0
  started.value = true
  if (isTouch.value) enterImmersive()
  resetServe(Math.random() < 0.5 ? 1 : 2)
}

// Echtes Vollbild + Querformat-Lock (best effort – iOS unterstützt beides
// nicht, dort sorgt das CSS-Vollbild + der Dreh-Hinweis für ein brauchbares
// Erlebnis). Muss aus einer User-Geste heraus aufgerufen werden.
async function enterImmersive() {
  const el = gameRoot.value
  try {
    if (el && !document.fullscreenElement && el.requestFullscreen) await el.requestFullscreen()
  } catch { /* vom Browser/Gerät nicht erlaubt */ }
  try {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }
    await orientation?.lock?.('landscape')
  } catch { /* Lock nicht unterstützt (z. B. iOS) */ }
}

function exitImmersive() {
  try { (screen.orientation as ScreenOrientation & { unlock?: () => void })?.unlock?.() } catch { /* egal */ }
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {})
}

// Spiel verlassen (Button im Vollbild) -> zurück zum Start-Overlay.
function leaveGame() {
  exitImmersive()
  started.value = false
  winner.value = 0
}

function awardPoint(scorer: 1 | 2) {
  if (scorer === 1) score1.value++
  else score2.value++
  if (score1.value >= POINTS_TO_WIN) { winner.value = 1; serving.value = false; return }
  if (score2.value >= POINTS_TO_WIN) { winner.value = 2; serving.value = false; return }
  resetServe(scorer === 1 ? 2 : 1) // Verlierer schlägt auf
}

function updateBlob(b: Blob, inp: { left: boolean; right: boolean; jump: boolean }, minX: number, maxX: number) {
  const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0)
  b.x += dir * BLOB_SPEED
  if (b.x < minX) b.x = minX
  if (b.x > maxX) b.x = maxX

  if (inp.jump && b.onGround) { b.vy = BLOB_JUMP; b.onGround = false }
  b.vy += BLOB_GRAV
  b.y += b.vy
  if (b.y >= REST_Y) { b.y = REST_Y; b.vy = 0; b.onGround = true }
}

function collideBlob(b: Blob) {
  const dx = ball.x - b.x
  const dy = ball.y - b.y
  const dist = Math.hypot(dx, dy)
  const minDist = r + R
  if (dist >= minDist) return
  const nx = dist === 0 ? 0 : dx / dist
  const ny = dist === 0 ? -1 : dy / dist
  // Ball aus dem Blob herausschieben
  ball.x = b.x + nx * minDist
  ball.y = b.y + ny * minDist
  // Reflexion entlang der Normalen, nur wenn sich der Ball annähert
  const rvx = ball.vx
  const rvy = ball.vy - b.vy
  const vn = rvx * nx + rvy * ny
  if (vn < 0) {
    ball.vx -= 2 * vn * nx
    ball.vy -= 2 * vn * ny
  }
  // Etwas Blob-Schwung mitgeben, Mindest-/Maximaltempo sichern
  ball.vy += b.vy * 0.4
  clampSpeed(ball, BALL_MAX, BALL_MIN_AFTER_HIT)
}

function updateBall() {
  ball.px = ball.x
  ball.vy += BALL_GRAV
  clampSpeed(ball, BALL_MAX)
  ball.x += ball.vx
  ball.y += ball.vy
  ball.angle += ball.vx * 0.03

  // Seitenwände
  if (ball.x < r) { ball.x = r; ball.vx = Math.abs(ball.vx) }
  if (ball.x > VW - r) { ball.x = VW - r; ball.vx = -Math.abs(ball.vx) }
  // Decke (nur Begrenzung)
  if (ball.y < r) { ball.y = r; ball.vy = Math.abs(ball.vy) }

  // Netz
  if (ball.x > NET_X - NET_W / 2 - r && ball.x < NET_X + NET_W / 2 + r) {
    if (ball.y > NET_TOP) {
      // seitlich am Netzpfosten -> zur näheren Seite abprallen
      if (ball.px <= NET_X) { ball.x = NET_X - NET_W / 2 - r; ball.vx = -Math.abs(ball.vx) }
      else { ball.x = NET_X + NET_W / 2 + r; ball.vx = Math.abs(ball.vx) }
    } else {
      // über der Netzkante -> Abprall an der runden Kappe
      const dx = ball.x - NET_X
      const dy = ball.y - NET_TOP
      const dist = Math.hypot(dx, dy)
      if (dist < r + NET_W / 2) {
        const nx = dist === 0 ? 0 : dx / dist
        const ny = dist === 0 ? -1 : dy / dist
        const vn = ball.vx * nx + ball.vy * ny
        if (vn < 0) { ball.vx -= 2 * vn * nx; ball.vy -= 2 * vn * ny }
        ball.x = NET_X + nx * (r + NET_W / 2)
        ball.y = NET_TOP + ny * (r + NET_W / 2)
      }
    }
  }

  collideBlob(p1)
  collideBlob(p2)

  // Boden -> Punkt für die Gegenseite
  if (ball.y + r >= GROUND_Y) {
    ball.y = GROUND_Y - r
    awardPoint(ball.x < NET_X ? 2 : 1)
  }
}

function step() {
  if (!started.value || winner.value) return
  // Blobs lassen sich immer steuern (auch während des Aufschlag-Countdowns)
  updateBlob(p1, input.p1, R, NET_X - NET_W / 2 - R)
  updateBlob(p2, input.p2, NET_X + NET_W / 2 + R, VW - R)

  if (serveTimer > 0) {
    serveTimer--
    if (serveTimer === 0) { ball.vy = 2; serving.value = false }
  } else {
    updateBall()
  }
}

// ---- Zeichnen --------------------------------------------------------------
function drawShadow(c: CanvasRenderingContext2D, x: number, y: number, rx: number) {
  // Bodenschatten – schrumpft, je höher das Objekt über dem Boden ist.
  const lift = Math.max(0, GROUND_Y - y)
  const scale = Math.max(0.4, 1 - lift / 320)
  c.save()
  c.fillStyle = 'rgba(0,0,0,0.12)'
  c.beginPath()
  c.ellipse(x, GROUND_Y, rx * scale, 7 * scale, 0, 0, Math.PI * 2)
  c.fill()
  c.restore()
}

function drawBlob(c: CanvasRenderingContext2D, b: Blob, color: string, flip: boolean) {
  drawShadow(c, b.x, b.y, R * 1.3)
  if (imgReady(faultierImg)) {
    const h = 2 * R * FAULTIER_SCALE
    const w = h * faultierRatio
    c.save()
    c.translate(b.x, b.y + R) // Ankerpunkt = Füße am Boden des Hitbox-Kreises
    if (flip) c.scale(-1, 1)
    c.drawImage(faultierImg, -w / 2, -h, w, h)
    c.restore()
    return
  }
  // Fallback: einfacher Blob mit Augen
  c.save()
  c.fillStyle = color
  c.beginPath(); c.arc(b.x, b.y, R, 0, Math.PI * 2); c.fill()
  const eyeOffX = b.x < NET_X ? 8 : -8
  for (const ex of [eyeOffX - 9, eyeOffX + 9]) {
    const eyeX = b.x + ex
    const eyeY = b.y - 12
    c.fillStyle = '#fff'
    c.beginPath(); c.arc(eyeX, eyeY, 7, 0, Math.PI * 2); c.fill()
    const a = Math.atan2(ball.y - eyeY, ball.x - eyeX)
    c.fillStyle = '#13283d'
    c.beginPath(); c.arc(eyeX + Math.cos(a) * 3, eyeY + Math.sin(a) * 3, 3.5, 0, Math.PI * 2); c.fill()
  }
  c.restore()
}

function drawBall(c: CanvasRenderingContext2D) {
  drawShadow(c, ball.x, ball.y, r * 1.6)
  c.save()
  c.translate(ball.x, ball.y)
  c.rotate(ball.angle)
  if (imgReady(ballImg)) {
    const d = 2 * r * BALL_SCALE
    c.drawImage(ballImg, -d / 2, -d / 2, d, d)
  } else {
    c.fillStyle = '#ffffff'
    c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill()
    c.strokeStyle = '#13283d'
    c.lineWidth = 1.5
    c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke()
  }
  c.restore()
}

function render() {
  const c = ctx
  if (!c) return
  // Himmel
  const sky = c.createLinearGradient(0, 0, 0, GROUND_Y)
  sky.addColorStop(0, '#bfe8ff')
  sky.addColorStop(1, '#eaf7ff')
  c.fillStyle = sky
  c.fillRect(0, 0, VW, GROUND_Y)
  // Sand
  c.fillStyle = '#e7d29a'
  c.fillRect(0, GROUND_Y, VW, VH - GROUND_Y)
  c.fillStyle = 'rgba(0,0,0,0.05)'
  c.fillRect(0, GROUND_Y, VW, 4)

  // Netz
  c.fillStyle = '#ffffff'
  c.fillRect(NET_X - NET_W / 2, NET_TOP, NET_W, NET_H)
  c.fillStyle = '#13283d'
  c.beginPath(); c.arc(NET_X, NET_TOP, NET_W / 2 + 1, 0, Math.PI * 2); c.fill()

  // Spieler 1 links (normal), Spieler 2 rechts (gespiegelt -> schaut zum Netz)
  drawBlob(c, p1, '#ff6b5c', false)
  drawBlob(c, p2, '#13283d', true)

  drawBall(c)
}

function frame(now: number) {
  if (!lastTime) lastTime = now
  acc += now - lastTime
  lastTime = now
  if (acc > 200) acc = 200
  while (acc >= STEP) { step(); acc -= STEP }
  render()
  raf = requestAnimationFrame(frame)
}

// ---- Tastatur --------------------------------------------------------------
const KEY_MAP: Record<string, [('p1' | 'p2'), Ctrl]> = {
  KeyA: ['p1', 'left'], KeyD: ['p1', 'right'], KeyW: ['p1', 'jump'],
  ArrowLeft: ['p2', 'left'], ArrowRight: ['p2', 'right'], ArrowUp: ['p2', 'jump'],
}
function onKey(down: boolean) {
  return (e: KeyboardEvent) => {
    const m = KEY_MAP[e.code]
    if (!m) return
    e.preventDefault()
    input[m[0]][m[1]] = down
  }
}
const keydown = onKey(true)
const keyup = onKey(false)

function setupCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = VW * dpr
  canvas.height = VH * dpr
  ctx = canvas.getContext('2d')
  ctx?.scale(dpr, dpr)
}

function loadSprites() {
  faultierImg = new Image()
  faultierImg.src = '/faultier-jump.png'
  faultierImg.onload = () => {
    if (faultierImg && faultierImg.naturalHeight > 0) faultierRatio = faultierImg.naturalWidth / faultierImg.naturalHeight
  }
  ballImg = new Image()
  ballImg.src = '/volleyball.png'
}

const portraitMq = import.meta.client ? window.matchMedia('(orientation: portrait)') : null
function updateOrientation() { if (portraitMq) isPortrait.value = portraitMq.matches }

onMounted(() => {
  setupCanvas()
  loadSprites()
  isTouch.value = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window
  updateOrientation()
  portraitMq?.addEventListener('change', updateOrientation)
  window.addEventListener('keydown', keydown)
  window.addEventListener('keyup', keyup)
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  exitImmersive()
  portraitMq?.removeEventListener('change', updateOrientation)
  window.removeEventListener('keydown', keydown)
  window.removeEventListener('keyup', keyup)
})
</script>

<template>
  <div
    ref="gameRoot"
    :class="immersive
      ? 'fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-brand-navy'
      : 'mx-auto w-full max-w-4xl px-4 py-8'"
  >
    <header v-if="!immersive" class="mb-5 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-coral/15 text-brand-coral">
          <Gamepad2 class="size-6" />
        </div>
        <div>
          <h1 class="text-3xl">Beach-Blobby</h1>
          <p class="text-sm text-muted-foreground">Das Mini-Match für die Wartezeit – erster auf {{ POINTS_TO_WIN }} Punkte gewinnt.</p>
        </div>
      </div>
      <Button as-child variant="ghost" size="sm" class="hidden sm:inline-flex"><NuxtLink to="/mitglieder">Zurück</NuxtLink></Button>
    </header>

    <!-- Scoreboard (im Vollbild als Overlay oben) -->
    <div
      :class="immersive
        ? 'pointer-events-none absolute inset-x-0 top-2 z-20 flex items-center justify-center gap-3 font-display text-base text-white drop-shadow'
        : 'mb-3 flex items-center justify-center gap-4 font-display text-lg'"
    >
      <span class="flex items-center gap-2"><span class="size-3 rounded-full bg-brand-coral" /> {{ name1 || 'Spieler 1' }}</span>
      <span class="rounded-md bg-brand-navy px-3 py-1 font-bold text-white tabular-nums">{{ score1 }} : {{ score2 }}</span>
      <span class="flex items-center gap-2">{{ name2 || 'Spieler 2' }} <span class="size-3 rounded-full bg-brand-navy" /></span>
    </div>

    <!-- Vollbild verlassen -->
    <button
      v-if="immersive"
      type="button"
      class="absolute right-3 top-2 z-20 rounded-full bg-white/85 px-3 py-1 text-sm font-semibold text-brand-navy shadow"
      @click="leaveGame"
    >Beenden</button>

    <!-- Spielfeld -->
    <div
      :class="immersive ? 'relative max-h-full max-w-full' : 'relative overflow-hidden rounded-xl border border-border shadow-sm'"
      :style="immersive ? 'aspect-ratio: 800 / 400; width: min(100vw, 200dvh)' : ''"
    >
      <canvas
        ref="canvasRef"
        :class="immersive ? 'block h-full w-full select-none' : 'block w-full select-none'"
        style="touch-action: none; aspect-ratio: 800 / 400"
      />

      <!-- Start-Overlay -->
      <div v-if="!started" class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-brand-navy/70 px-6 text-center text-white backdrop-blur-sm">
        <h2 class="font-display text-2xl font-bold">Bereit zum Match?</h2>
        <div class="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <div class="flex-1 space-y-1 text-left">
            <Label class="text-white/80">Spieler 1 (links)</Label>
            <Input v-model="name1" class="border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="Name" />
          </div>
          <div class="flex-1 space-y-1 text-left">
            <Label class="text-white/80">Spieler 2 (rechts)</Label>
            <Input v-model="name2" class="border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="Name" />
          </div>
        </div>
        <Button size="lg" class="mt-1" @click="startMatch">Spiel starten</Button>
        <p class="max-w-md text-xs text-white/70">
          Tastatur: Spieler 1 = A / D bewegen, W springen · Spieler 2 = ◀ / ▶ bewegen, ▲ springen.
          Am Handy startet das Spiel quer im Vollbild – die D-Pads in den unteren Ecken steuern je eine Seite.
        </p>
      </div>

      <!-- Sieg-Overlay -->
      <div v-else-if="winner" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-navy/75 px-6 text-center text-white backdrop-blur-sm">
        <span class="text-4xl">🏐🎉</span>
        <h2 class="font-display text-3xl font-bold">{{ winner === 1 ? (name1 || 'Spieler 1') : (name2 || 'Spieler 2') }} gewinnt!</h2>
        <p class="text-white/80">Endstand {{ score1 }} : {{ score2 }}</p>
        <Button size="lg" class="mt-1" @click="startMatch">Revanche</Button>
      </div>

      <!-- Aufschlag-Hinweis -->
      <div v-else-if="serving" class="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
        <span class="rounded-full bg-white/85 px-3 py-1 text-sm font-semibold text-brand-navy shadow">Aufschlag …</span>
      </div>
    </div>

    <!-- Touch-Steuerung: D-Pad je Spieler (Diagonale = springen + laufen).
         Im Vollbild als Overlay in den unteren Ecken, sonst unter dem Feld. -->
    <div
      :class="immersive
        ? 'pointer-events-none fixed inset-x-0 bottom-3 z-20 flex items-end justify-between px-4'
        : 'mt-4 flex items-start justify-between gap-4 sm:hidden'"
    >
      <div
        v-for="pad in ([
          { player: 'p1', label: name1 || 'Spieler 1', color: 'text-brand-coral' },
          { player: 'p2', label: name2 || 'Spieler 2', color: 'text-brand-navy' },
        ] as const)"
        :key="pad.player"
        :class="['flex flex-col items-center gap-1.5', immersive && 'pointer-events-auto']"
      >
        <span :class="['text-xs font-medium', immersive ? 'text-white drop-shadow' : 'text-muted-foreground']">{{ pad.label }}</span>
        <div
          :class="['relative grid size-36 grid-cols-3 grid-rows-3 rounded-2xl border shadow-inner select-none',
            immersive ? 'border-white/40 bg-white/25 backdrop-blur-sm' : 'border-border bg-muted/70']"
          style="touch-action: none"
          @pointerdown.prevent="padStart(pad.player, $event)"
          @pointermove.prevent="padEval(pad.player, $event)"
          @pointerup="padEnd(pad.player)"
          @pointercancel="padEnd(pad.player)"
          @lostpointercapture="padEnd(pad.player)"
        >
          <ChevronUp :class="['pointer-events-none col-start-2 row-start-1 size-8 self-center justify-self-center', pad.color]" />
          <ChevronLeft :class="['pointer-events-none col-start-1 row-start-2 size-8 self-center justify-self-center', pad.color]" />
          <span class="pointer-events-none col-start-2 row-start-2 size-3 self-center justify-self-center rounded-full bg-border" />
          <ChevronRight :class="['pointer-events-none col-start-3 row-start-2 size-8 self-center justify-self-center', pad.color]" />
        </div>
      </div>
    </div>

    <!-- "Bitte drehen": im Vollbild, solange das Gerät hochkant gehalten wird -->
    <div
      v-if="immersive && isPortrait"
      class="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-brand-navy px-8 text-center text-white"
    >
      <span class="animate-pulse text-5xl">📱↻</span>
      <h2 class="font-display text-2xl font-bold">Bitte dreh dein Gerät</h2>
      <p class="max-w-xs text-sm text-white/80">Beach-Blobby spielt sich quer am besten – dreh dein Handy ins Querformat.</p>
    </div>

    <p v-if="!immersive" class="mt-4 hidden text-center text-xs text-muted-foreground sm:block">
      Spieler 1 (Coral): <kbd>A</kbd> <kbd>D</kbd> bewegen, <kbd>W</kbd> springen · Spieler 2 (Navy): <kbd>←</kbd> <kbd>→</kbd> bewegen, <kbd>↑</kbd> springen
    </p>
  </div>
</template>

<style scoped>
kbd {
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.7rem;
  background: var(--muted);
}
</style>
