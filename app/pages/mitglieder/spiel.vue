<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Gamepad2, ChevronLeft, ChevronRight, ChevronUp, Users, Globe, Loader2 } from '@lucide/vue'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Beach-Blobby' })

// ---- Virtuelle Spielwelt --------------------------------------------------
// Physik & Maße sind dem Original "Blobby Volley 2" (Open Source) nachempfunden,
// damit sich der Ball gemächlich und kontrollierbar verhält. 800 Einheiten breit.
const VW = 800
const VH = 524 // etwas Sand-Streifen unter der Bodenlinie
const GROUND_Y = 500 // GROUND_PLANE_HEIGHT_MAX – Ball-Boden / Punktlinie
const REST_Y = 455.5 // GROUND_PLANE_HEIGHT – Blob-Mittelpunkt am Boden

// Blob = zwei Kugeln (oben kleiner, unten größer) wie im Original.
const UPPER_OFF = 19 // BLOBBY_UPPER_SPHERE (Versatz nach oben)
const UPPER_R = 25 // BLOBBY_UPPER_RADIUS
const LOWER_OFF = 13 // BLOBBY_LOWER_SPHERE (Versatz nach unten)
const LOWER_R = 33 // BLOBBY_LOWER_RADIUS
const BLOB_HALF = LOWER_OFF + LOWER_R // 46 – untere Reichweite (Boden/Wand-Anschlag)

const NET_X = 400 // NET_POSITION_X
const NET_R = 7 // NET_RADIUS
const NET_TOP = 284 // NET_SPHERE_POSITION – Mittelpunkt der oberen Netzkugel

const BALL_R = 31.5 // BALL_RADIUS
const BALL_GRAV = 0.287 // BALL_GRAVITATION
const BALL_COLLISION_V = Math.sqrt(0.75 * 800 * BALL_GRAV) // ≈ 13.12 – feste Abprall-Geschw.

const BLOB_GRAV = (15.1 * 15.1) / 293.625 // GRAVITATION ≈ 0.777
const BLOB_JUMP = -15.1 // BLOBBY_JUMP_ACCELERATION (nach oben)
const BLOB_SPEED = 4.5 // BLOBBY_SPEED (horizontal)
const SERVE_Y = 300.5 // STANDARD_BALL_HEIGHT
const SERVE_COOLDOWN = 60 // Frames (~1 s) Verschnaufpause vor jedem Aufschlag
const POINTS_TO_WIN = 7

const P1_START = 200
const P2_START = 600

// Bewegungsgrenzen je Spielfeldseite (linke/rechte Hälfte, Netz in der Mitte).
const P1_MIN = LOWER_R
const P1_MAX = NET_X - NET_R - LOWER_R
const P2_MIN = NET_X + NET_R + LOWER_R
const P2_MAX = VW - LOWER_R

// ---- Spielmodus -----------------------------------------------------------
// 'local' = zwei Spieler an einem Gerät (wie bisher). 'online' = je ein Spieler
// pro Gerät, verbunden über WebRTC. mode === null -> Auswahlmenü.
const mode = ref<'local' | 'online' | null>(null)
const net = usePlayNetwork()
const { phase: netPhase, role: netRole, openMatches, opponentName: oppName, statusText: netStatus, errorText: netError } = net
const netDisconnected = ref(false)

// ---- Reaktiver UI-Zustand (Overlays, Scoreboard) --------------------------
const started = ref(false)
const winner = ref<0 | 1 | 2>(0)
const score1 = ref(0)
const score2 = ref(0)
const serving = ref(false)
const cooldown = ref(0) // > 0 = kurze Pause, in der noch nichts passiert

const inGame = computed(() =>
  (mode.value === 'local' && started.value) || (mode.value === 'online' && netPhase.value === 'playing'),
)
// Im Online-Spiel ist der Host immer links (p1), der Gast rechts (p2).
const leftLabel = computed(() =>
  mode.value === 'online' ? (netRole.value === 'host' ? 'Du' : oppName.value || 'Host') : 'Links',
)
const rightLabel = computed(() =>
  mode.value === 'online' ? (netRole.value === 'guest' ? 'Du' : oppName.value || 'Gast') : 'Rechts',
)

// ---- Mobile: Vollbild im Querformat ---------------------------------------
const isTouch = ref(false)
const isPortrait = ref(false)
const gameRoot = ref<HTMLElement | null>(null)
const immersive = computed(() => isTouch.value && inGame.value)

// ---- Eingaben (bewusst NICHT reaktiv – wird pro Frame gelesen) -------------
type Ctrl = 'left' | 'right' | 'jump'
type Player = 'p1' | 'p2'
const input = {
  p1: { left: false, right: false, jump: false },
  p2: { left: false, right: false, jump: false },
}
// Welche Seite der lokale Spieler online steuert.
const localPlayer = computed<Player>(() => (netRole.value === 'guest' ? 'p2' : 'p1'))
function localInput() {
  return mode.value === 'online' ? input[localPlayer.value] : null
}

// D-Pad (mobil): Richtung ergibt sich aus der Daumenposition relativ zur Mitte.
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
const ball: Ball = { x: P1_START, y: SERVE_Y, px: P1_START, vx: 0, vy: 0, angle: 0 }

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
const BLOB_DRAW_H = UPPER_OFF + UPPER_R + LOWER_OFF + LOWER_R // ~90 (Kopf bis Fuß)
const FAULTIER_SCALE = 1.15 // Höhe = BLOB_DRAW_H * Scale
const BALL_SCALE = 1.0
function imgReady(img: HTMLImageElement | null): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0
}

// Ball über dem Aufschläger (= Verlierer des letzten Ballwechsels) platzieren.
function resetServe(serverSide: 1 | 2) {
  p1.x = P1_START; p1.y = REST_Y; p1.vy = 0; p1.onGround = true
  p2.x = P2_START; p2.y = REST_Y; p2.vy = 0; p2.onGround = true
  ball.x = serverSide === 1 ? P1_START : P2_START
  ball.px = ball.x
  ball.y = SERVE_Y
  ball.vx = 0; ball.vy = 0
  serving.value = true
  cooldown.value = SERVE_COOLDOWN
}

function resetIdle() {
  p1.x = P1_START; p1.y = REST_Y; p1.vy = 0; p1.onGround = true
  p2.x = P2_START; p2.y = REST_Y; p2.vy = 0; p2.onGround = true
  ball.x = P1_START; ball.px = P1_START; ball.y = SERVE_Y; ball.vx = 0; ball.vy = 0; ball.angle = 0
}

function beginMatch() {
  score1.value = 0; score2.value = 0; winner.value = 0
  started.value = true
  resetServe(Math.random() < 0.5 ? 1 : 2)
}

// ---- Modusauswahl & Lobby --------------------------------------------------
function chooseLocal() {
  mode.value = 'local'
  if (isTouch.value) enterImmersive()
  beginMatch()
}
function chooseOnline() {
  mode.value = 'online'
  net.startLobby()
}
async function openGame() {
  try { await net.host() } catch { /* z. B. Netzwerkfehler – Lobby bleibt offen */ }
}
async function joinOpen(id: string) {
  try { await net.join(id) } catch { await net.refreshLobby() }
}
function cancelConnecting() {
  net.leave()
  net.startLobby()
}
function backToMenu() {
  exitImmersive()
  if (mode.value === 'online') { net.leave(); net.stopLobby() }
  mode.value = null
  started.value = false
  winner.value = 0
  netDisconnected.value = false
  resetIdle()
}
function backToLobby() {
  netDisconnected.value = false
  started.value = false
  winner.value = 0
  net.leave()
  net.startLobby()
}
// Revanche: nur der Host steuert den Spielablauf; der Gast folgt per Snapshot.
function rematch() {
  if (mode.value === 'online') {
    if (netRole.value !== 'host') return
    winner.value = 0
    resetServe(Math.random() < 0.5 ? 1 : 2)
  } else {
    beginMatch()
  }
}

// Echtes Vollbild + Querformat-Lock (best effort). Muss aus einer User-Geste kommen.
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

function awardPoint(scorer: 1 | 2) {
  if (scorer === 1) score1.value++
  else score2.value++
  if (score1.value >= POINTS_TO_WIN) { winner.value = 1; serving.value = false; return }
  if (score2.value >= POINTS_TO_WIN) { winner.value = 2; serving.value = false; return }
  resetServe(scorer === 1 ? 2 : 1) // Verlierer schlägt auf
}

function updateBlob(b: Blob, inp: { left: boolean; right: boolean; jump: boolean }, minX: number, maxX: number) {
  b.x += ((inp.right ? 1 : 0) - (inp.left ? 1 : 0)) * BLOB_SPEED
  if (b.x < minX) b.x = minX
  if (b.x > maxX) b.x = maxX

  if (inp.jump && b.onGround) { b.vy = BLOB_JUMP; b.onGround = false }
  // Variabler Sprung: solange die Sprungtaste gehalten wird und der Blob steigt,
  // wirkt etwas weniger Schwerkraft (entspricht dem JUMP_BUFFER im Original).
  const g = BLOB_GRAV - (inp.jump && b.vy < 0 ? BLOB_GRAV / 2 : 0)
  b.y += b.vy + 0.5 * g
  b.vy += g
  if (b.y >= REST_Y) { b.y = REST_Y; b.vy = 0; b.onGround = true }
}

// Zwei-Kugel-Hitbox. Beim Treffer wird der Ball – wie im Original – auf eine
// FESTE Geschwindigkeit in Richtung „vom Kugelmittelpunkt weg" gesetzt.
function collideBlob(b: Blob) {
  const spheres = [
    { cx: b.x, cy: b.y - UPPER_OFF, rad: UPPER_R },
    { cx: b.x, cy: b.y + LOWER_OFF, rad: LOWER_R },
  ]
  let hit: { cx: number; cy: number; dist: number; minD: number } | null = null
  let bestOverlap = -1
  for (const s of spheres) {
    const dist = Math.hypot(ball.x - s.cx, ball.y - s.cy)
    const minD = BALL_R + s.rad
    const overlap = minD - dist
    if (overlap > 0 && overlap > bestOverlap) {
      bestOverlap = overlap
      hit = { cx: s.cx, cy: s.cy, dist, minD }
    }
  }
  if (!hit) return
  const nx = hit.dist === 0 ? 0 : (ball.x - hit.cx) / hit.dist
  const ny = hit.dist === 0 ? -1 : (ball.y - hit.cy) / hit.dist
  ball.x = hit.cx + nx * hit.minD // aus der Kugel schieben
  ball.y = hit.cy + ny * hit.minD
  ball.vx = nx * BALL_COLLISION_V
  ball.vy = ny * BALL_COLLISION_V
}

function updateBall() {
  ball.px = ball.x
  // Original-Integration: pos += vel + 0.5*g ; vel += g
  ball.x += ball.vx
  ball.y += ball.vy + 0.5 * BALL_GRAV
  ball.vy += BALL_GRAV
  ball.angle += ball.vx * 0.02

  // Seitenwände
  if (ball.x - BALL_R < 0 && ball.vx < 0) { ball.vx = -ball.vx; ball.x = BALL_R }
  if (ball.x + BALL_R > VW && ball.vx > 0) { ball.vx = -ball.vx; ball.x = VW - BALL_R }
  // Decke (sanfte Begrenzung)
  if (ball.y - BALL_R < 0 && ball.vy < 0) { ball.vy = -ball.vy; ball.y = BALL_R }

  // Netz
  if (ball.y >= NET_TOP && Math.abs(ball.x - NET_X) < BALL_R + NET_R) {
    if (ball.px <= NET_X) { ball.vx = -Math.abs(ball.vx); ball.x = NET_X - BALL_R - NET_R }
    else { ball.vx = Math.abs(ball.vx); ball.x = NET_X + BALL_R + NET_R }
  } else if (ball.y < NET_TOP) {
    const dx = ball.x - NET_X
    const dy = ball.y - NET_TOP
    const dist = Math.hypot(dx, dy)
    if (dist < BALL_R + NET_R) {
      const nx = dist === 0 ? 0 : dx / dist
      const ny = dist === 0 ? -1 : dy / dist
      const vn = ball.vx * nx + ball.vy * ny
      if (vn < 0) {
        const perpx = vn * nx, perpy = vn * ny
        const parax = ball.vx - perpx, paray = ball.vy - perpy
        ball.vx = parax * 0.95 - perpx * 0.84
        ball.vy = paray * 0.95 - perpy * 0.84
      }
      ball.x = NET_X + nx * (BALL_R + NET_R)
      ball.y = NET_TOP + ny * (BALL_R + NET_R)
    }
  }

  collideBlob(p1)
  collideBlob(p2)

  // Boden -> Punkt für die Gegenseite
  if (ball.y + BALL_R >= GROUND_Y) {
    ball.y = GROUND_Y - BALL_R
    awardPoint(ball.x < NET_X ? 2 : 1)
  }
}

// Ein Simulationsschritt der maßgeblichen Physik (lokal & Host teilen ihn sich).
function simulate(p2Input: { left: boolean; right: boolean; jump: boolean }) {
  if (winner.value) return
  if (cooldown.value > 0) { cooldown.value--; return }
  updateBlob(p1, input.p1, P1_MIN, P1_MAX)
  updateBlob(p2, p2Input, P2_MIN, P2_MAX)
  if (serving.value) {
    // Ball schwebt beim Aufschlag und fällt nicht von selbst – erst eine
    // Berührung setzt ihn in Bewegung und startet den Ballwechsel.
    collideBlob(p1)
    collideBlob(p2)
    if (ball.vx !== 0 || ball.vy !== 0) serving.value = false
  } else {
    updateBall()
  }
}

// ---- Netzwerk-Protokoll (über den WebRTC DataChannel) ----------------------
// Host -> Gast: ['s', seq, p1x,p1y, p2x,p2y, bx,by,bangle, s1,s2, serving, cooldown, winner]
// Gast -> Host: ['i', left, right, jump]
interface Snap {
  seq: number; p1x: number; p1y: number; p2x: number; p2y: number
  bx: number; by: number; ba: number; s1: number; s2: number; sv: number; cd: number; win: 0 | 1 | 2
}
let snapSeq = 0
let lastSnapSeq = -1
let lastSnap: Snap | null = null

function sendSnapshot() {
  net.send([
    's', snapSeq++,
    Math.round(p1.x), Math.round(p1.y), Math.round(p2.x), Math.round(p2.y),
    Math.round(ball.x), Math.round(ball.y), Number(ball.angle.toFixed(2)),
    score1.value, score2.value, serving.value ? 1 : 0, cooldown.value, winner.value,
  ])
}

function onNetMessage(msg: unknown) {
  if (!Array.isArray(msg)) return
  if (msg[0] === 'i' && netRole.value === 'host') {
    input.p2.left = !!msg[1]; input.p2.right = !!msg[2]; input.p2.jump = !!msg[3]
  } else if (msg[0] === 's' && netRole.value === 'guest') {
    const seq = msg[1] as number
    if (seq <= lastSnapSeq) return // veraltetes Paket (Channel ist ungeordnet)
    lastSnapSeq = seq
    lastSnap = {
      seq, p1x: msg[2], p1y: msg[3], p2x: msg[4], p2y: msg[5],
      bx: msg[6], by: msg[7], ba: msg[8], s1: msg[9], s2: msg[10], sv: msg[11], cd: msg[12], win: msg[13] as 0 | 1 | 2,
    }
  }
}

function hostStep() {
  simulate(input.p2) // p2-Eingaben kommen vom Gast übers Netz
  sendSnapshot()
}

function guestStep() {
  const inp = input.p2
  net.send(['i', inp.left ? 1 : 0, inp.right ? 1 : 0, inp.jump ? 1 : 0])
  const snap = lastSnap
  if (!snap) return
  // Gegner (Host = p1) und Ball aus dem autoritativen Zustand übernehmen.
  p1.x = snap.p1x; p1.y = snap.p1y
  ball.x = snap.bx; ball.y = snap.by; ball.angle = snap.ba
  score1.value = snap.s1; score2.value = snap.s2
  serving.value = !!snap.sv; cooldown.value = snap.cd; winner.value = snap.win
  // Eigene Seite (p2) lokal vorhersagen, damit sich die Steuerung direkt
  // anfühlt; bei großer Abweichung zum Host-Zustand korrigieren (Anti-Desync).
  const frozen = snap.cd > 0 || snap.win !== 0
  if (frozen) {
    p2.x = snap.p2x; p2.y = snap.p2y; p2.vy = 0; p2.onGround = true
  } else {
    updateBlob(p2, inp, P2_MIN, P2_MAX)
    if (Math.abs(p2.x - snap.p2x) > 35) p2.x = snap.p2x
    if (Math.abs(p2.y - snap.p2y) > 60) { p2.y = snap.p2y; p2.vy = 0 }
  }
}

function step() {
  if (mode.value === 'online') {
    if (netPhase.value !== 'playing') return
    if (netRole.value === 'host') hostStep()
    else guestStep()
    return
  }
  // Lokal: beide Seiten an einem Gerät.
  if (!started.value) return
  simulate(input.p2)
}

// ---- Zeichnen --------------------------------------------------------------
function drawShadow(c: CanvasRenderingContext2D, x: number, y: number, rx: number) {
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
  drawShadow(c, b.x, b.y, LOWER_R * 1.25)
  if (imgReady(faultierImg)) {
    const h = BLOB_DRAW_H * FAULTIER_SCALE
    const w = h * faultierRatio
    c.save()
    c.translate(b.x, b.y + BLOB_HALF)
    if (flip) c.scale(-1, 1)
    c.drawImage(faultierImg, -w / 2, -h, w, h)
    c.restore()
    return
  }
  c.save()
  c.fillStyle = color
  c.beginPath(); c.arc(b.x, b.y + LOWER_OFF, LOWER_R, 0, Math.PI * 2); c.fill()
  c.beginPath(); c.arc(b.x, b.y - UPPER_OFF, UPPER_R, 0, Math.PI * 2); c.fill()
  const eyeOffX = b.x < NET_X ? 6 : -6
  for (const ex of [eyeOffX - 8, eyeOffX + 8]) {
    const eyeX = b.x + ex
    const eyeY = b.y - UPPER_OFF - 4
    c.fillStyle = '#fff'
    c.beginPath(); c.arc(eyeX, eyeY, 6, 0, Math.PI * 2); c.fill()
    const a = Math.atan2(ball.y - eyeY, ball.x - eyeX)
    c.fillStyle = '#13283d'
    c.beginPath(); c.arc(eyeX + Math.cos(a) * 3, eyeY + Math.sin(a) * 3, 3, 0, Math.PI * 2); c.fill()
  }
  c.restore()
}

function drawBall(c: CanvasRenderingContext2D) {
  drawShadow(c, ball.x, ball.y, BALL_R * 0.9)
  c.save()
  c.translate(ball.x, ball.y)
  c.rotate(ball.angle)
  if (imgReady(ballImg)) {
    const d = 2 * BALL_R * BALL_SCALE
    c.drawImage(ballImg, -d / 2, -d / 2, d, d)
  } else {
    c.fillStyle = '#ffffff'
    c.beginPath(); c.arc(0, 0, BALL_R, 0, Math.PI * 2); c.fill()
    c.strokeStyle = '#13283d'
    c.lineWidth = 1.5
    c.beginPath(); c.arc(0, 0, BALL_R, 0, Math.PI * 2); c.stroke()
  }
  c.restore()
}

function render() {
  const c = ctx
  if (!c) return
  const sky = c.createLinearGradient(0, 0, 0, GROUND_Y)
  sky.addColorStop(0, '#bfe8ff')
  sky.addColorStop(1, '#eaf7ff')
  c.fillStyle = sky
  c.fillRect(0, 0, VW, GROUND_Y)
  c.fillStyle = '#e7d29a'
  c.fillRect(0, GROUND_Y, VW, VH - GROUND_Y)
  c.fillStyle = 'rgba(0,0,0,0.05)'
  c.fillRect(0, GROUND_Y, VW, 4)

  c.fillStyle = '#ffffff'
  c.fillRect(NET_X - NET_R, NET_TOP, NET_R * 2, GROUND_Y - NET_TOP)
  c.fillStyle = '#13283d'
  c.beginPath(); c.arc(NET_X, NET_TOP, NET_R + 1, 0, Math.PI * 2); c.fill()

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
// Online steuert jeder nur seine eigene Seite – beide Tastenschemata greifen.
const ONLINE_KEY: Record<string, Ctrl> = {
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  KeyW: 'jump', ArrowUp: 'jump', Space: 'jump',
}
function onKey(down: boolean) {
  return (e: KeyboardEvent) => {
    if (mode.value === 'online') {
      const ctrl = ONLINE_KEY[e.code]
      const inp = localInput()
      if (!ctrl || !inp) return
      e.preventDefault()
      inp[ctrl] = down
      return
    }
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

// Online: auf "verbunden" reagieren (Spiel starten) und Verbindungsabbruch behandeln.
watch(netPhase, (p) => {
  if (p !== 'playing') return
  netDisconnected.value = false
  lastSnap = null; lastSnapSeq = -1; snapSeq = 0
  input.p1.left = input.p1.right = input.p1.jump = false
  input.p2.left = input.p2.right = input.p2.jump = false
  if (isTouch.value) enterImmersive()
  if (netRole.value === 'host') beginMatch()
  else { started.value = true; winner.value = 0; score1.value = 0; score2.value = 0 }
})
function onNetClose() {
  if (mode.value === 'online' && netPhase.value === 'playing') netDisconnected.value = true
}

onMounted(() => {
  setupCanvas()
  loadSprites()
  net.setHandlers({ onData: onNetMessage, onClose: onNetClose })
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
  net.dispose()
  portraitMq?.removeEventListener('change', updateOrientation)
  window.removeEventListener('keydown', keydown)
  window.removeEventListener('keyup', keyup)
})

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000))
  return s < 60 ? `vor ${s}s` : `vor ${Math.round(s / 60)}min`
}
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
      v-if="inGame"
      :class="immersive
        ? 'pointer-events-none absolute inset-x-0 top-2 z-20 flex items-center justify-center gap-3 font-display text-base text-white drop-shadow'
        : 'mb-3 flex items-center justify-center gap-4 font-display text-lg'"
    >
      <span>{{ leftLabel }}</span>
      <span class="rounded-md bg-brand-navy px-3 py-1 font-bold text-white tabular-nums">{{ score1 }} : {{ score2 }}</span>
      <span>{{ rightLabel }}</span>
    </div>

    <!-- Vollbild verlassen -->
    <button
      v-if="immersive"
      type="button"
      class="absolute right-3 top-2 z-20 rounded-full bg-white/85 px-3 py-1 text-sm font-semibold text-brand-navy shadow"
      @click="backToMenu"
    >Beenden</button>

    <!-- Spielfeld -->
    <div
      :class="immersive ? 'relative max-h-full max-w-full' : 'relative overflow-hidden rounded-xl border border-border shadow-sm'"
      :style="immersive ? 'aspect-ratio: 800 / 524; width: min(100vw, 152.7dvh)' : ''"
    >
      <canvas
        ref="canvasRef"
        :class="immersive ? 'block h-full w-full select-none' : 'block w-full select-none'"
        style="touch-action: none; aspect-ratio: 800 / 524"
      />

      <!-- Modus-Auswahl -->
      <div v-if="mode === null" class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-brand-navy/70 px-6 text-center text-white backdrop-blur-sm">
        <h2 class="font-display text-2xl font-bold">Bereit zum Match?</h2>
        <div class="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" class="gap-2" @click="chooseLocal"><Users class="size-5" /> Lokal spielen</Button>
          <Button size="lg" variant="secondary" class="gap-2" @click="chooseOnline"><Globe class="size-5" /> Online spielen</Button>
        </div>
        <p class="max-w-md text-xs text-white/70">
          Lokal: zwei Spieler an einem Gerät. Online: gegen ein anderes eingeloggtes Mitglied – eröffne ein Spiel oder tritt einem bei.
        </p>
      </div>

      <!-- Online-Lobby -->
      <div v-else-if="mode === 'online' && netPhase === 'lobby'" class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-brand-navy/75 px-6 text-center text-white backdrop-blur-sm">
        <h2 class="font-display text-2xl font-bold">Online-Lobby</h2>
        <div class="w-full max-w-sm rounded-xl bg-white/10 p-3 text-left">
          <p class="mb-2 px-1 text-xs uppercase tracking-wide text-white/60">Offene Spiele</p>
          <ul v-if="openMatches.length" class="flex max-h-44 flex-col gap-1.5 overflow-y-auto">
            <li v-for="m in openMatches" :key="m.id" class="flex items-center justify-between gap-2 rounded-lg bg-white/10 px-3 py-2">
              <span class="truncate text-sm font-medium">{{ m.hostName }}<span class="ml-2 text-xs text-white/50">{{ timeAgo(m.createdAt) }}</span></span>
              <Button size="sm" @click="joinOpen(m.id)">Beitreten</Button>
            </li>
          </ul>
          <p v-else class="px-1 py-3 text-sm text-white/60">Gerade wartet niemand – eröffne ein Spiel und lass dich herausfordern.</p>
        </div>
        <div class="flex gap-3">
          <Button size="lg" class="gap-2" @click="openGame"><Globe class="size-5" /> Spiel eröffnen</Button>
          <Button size="lg" variant="ghost" class="text-white hover:text-white" @click="backToMenu">Zurück</Button>
        </div>
      </div>

      <!-- Verbindungsaufbau -->
      <div v-else-if="mode === 'online' && netPhase === 'connecting'" class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-brand-navy/80 px-6 text-center text-white backdrop-blur-sm">
        <Loader2 class="size-10 animate-spin" />
        <h2 class="font-display text-xl font-bold">{{ netStatus }}</h2>
        <p v-if="oppName" class="text-white/70">Gegner: {{ oppName }}</p>
        <Button variant="ghost" class="text-white hover:text-white" @click="cancelConnecting">Abbrechen</Button>
      </div>

      <!-- Verbindungsfehler -->
      <div v-else-if="mode === 'online' && netPhase === 'error'" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-navy/85 px-6 text-center text-white backdrop-blur-sm">
        <span class="text-4xl">📡</span>
        <h2 class="font-display text-xl font-bold">Verbindung fehlgeschlagen</h2>
        <p class="max-w-xs text-sm text-white/75">{{ netError || 'Es konnte keine direkte Verbindung aufgebaut werden.' }}</p>
        <Button class="mt-1" @click="backToLobby">Zur Lobby</Button>
      </div>

      <!-- Verbindung getrennt -->
      <div v-else-if="netDisconnected" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-navy/85 px-6 text-center text-white backdrop-blur-sm">
        <span class="text-4xl">🔌</span>
        <h2 class="font-display text-xl font-bold">Verbindung getrennt</h2>
        <p class="max-w-xs text-sm text-white/75">Der andere Spieler ist nicht mehr erreichbar.</p>
        <div class="mt-1 flex gap-3">
          <Button @click="backToLobby">Zur Lobby</Button>
          <Button variant="ghost" class="text-white hover:text-white" @click="backToMenu">Menü</Button>
        </div>
      </div>

      <!-- Sieg-Overlay -->
      <div v-else-if="inGame && winner" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-navy/75 px-6 text-center text-white backdrop-blur-sm">
        <span class="text-4xl">🏐🎉</span>
        <h2 class="font-display text-3xl font-bold">{{ winner === 1 ? leftLabel : rightLabel }} gewinnt!</h2>
        <p class="text-white/80">Endstand {{ score1 }} : {{ score2 }}</p>
        <template v-if="mode === 'online' && netRole === 'guest'">
          <p class="mt-1 text-sm text-white/70">Warte auf den Host für eine Revanche …</p>
          <Button variant="ghost" class="text-white hover:text-white" @click="backToLobby">Zur Lobby</Button>
        </template>
        <template v-else>
          <Button size="lg" class="mt-1" @click="rematch">Revanche</Button>
          <Button variant="ghost" class="text-white hover:text-white" @click="backToMenu">Beenden</Button>
        </template>
      </div>

      <!-- Aufschlag-Hinweis -->
      <div v-else-if="inGame && serving" class="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
        <span class="rounded-full bg-white/85 px-3 py-1 text-sm font-semibold text-brand-navy shadow">{{ cooldown > 0 ? 'Gleich geht\'s los …' : 'Aufschlag – berühre den Ball' }}</span>
      </div>
    </div>

    <!-- Touch-Steuerung: D-Pad. Lokal zwei (je Seite), online nur das eigene. -->
    <div
      v-if="inGame"
      :class="immersive
        ? 'pointer-events-none fixed inset-x-0 bottom-3 z-20 flex items-end px-4'
        : 'mt-4 flex items-start gap-4 sm:hidden'"
      :style="mode === 'online' ? 'justify-content: center' : 'justify-content: space-between'"
    >
      <div
        v-for="pad in (mode === 'online'
          ? [{ player: localPlayer, label: 'Du', color: netRole === 'guest' ? 'text-brand-navy' : 'text-brand-coral' }]
          : ([
            { player: 'p1', label: 'Links', color: 'text-brand-coral' },
            { player: 'p2', label: 'Rechts', color: 'text-brand-navy' },
          ] as const))"
        :key="pad.player"
        :class="['flex flex-1 flex-col items-center gap-1.5', immersive && 'pointer-events-auto', mode === 'online' && 'max-w-44']"
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

    <p v-if="!immersive && mode === 'local'" class="mt-4 hidden text-center text-xs text-muted-foreground sm:block">
      Spieler 1 (Coral): <kbd>A</kbd> <kbd>D</kbd> bewegen, <kbd>W</kbd> springen · Spieler 2 (Navy): <kbd>←</kbd> <kbd>→</kbd> bewegen, <kbd>↑</kbd> springen
    </p>
    <p v-else-if="!immersive && mode === 'online' && inGame" class="mt-4 hidden text-center text-xs text-muted-foreground sm:block">
      Deine Seite ({{ netRole === 'guest' ? 'rechts' : 'links' }}): <kbd>A</kbd>/<kbd>←</kbd> <kbd>D</kbd>/<kbd>→</kbd> bewegen, <kbd>W</kbd>/<kbd>↑</kbd>/<kbd>Leertaste</kbd> springen
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
