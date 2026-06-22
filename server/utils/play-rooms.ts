/**
 * Online-Multiplayer für Beach-Blobby – Lobby & WebRTC-Signaling.
 *
 * Das eigentliche Spiel läuft Peer-to-Peer (WebRTC DataChannel) direkt zwischen
 * den zwei Browsern. Der Server wird nur für zwei Dinge gebraucht:
 *   1. Lobby: offene Spiele auflisten, eröffnen, beitreten.
 *   2. Signaling: SDP-Offer/Answer und ICE-Kandidaten austauschen, bis die
 *      P2P-Verbindung steht. Danach fließt kein Spiel-Traffic mehr über uns.
 *
 * Zustand liegt in Nitros Storage-Abstraktion (`useStorage('play')`). Lokal ist
 * das ein In-Memory-Store; in Produktion (Vercel = zustandslose Serverless-
 * Functions) muss ein geteilter Treiber gemountet werden, z. B. Vercel KV /
 * Upstash Redis. Siehe README. Der Code hier bleibt bewusst treiberneutral.
 *
 * Aufräumen passiert "lazy": abgelaufene Einträge werden beim Lesen entfernt,
 * sodass kein Hintergrund-Job nötig ist.
 */

export interface PlayerRef {
  email: string
  name: string
}

export type MatchStatus = 'open' | 'connecting' | 'active'

export interface Match {
  id: string
  host: PlayerRef
  guest: PlayerRef | null
  status: MatchStatus
  createdAt: number
  updatedAt: number
}

export type SignalRole = 'host' | 'guest'

export interface SignalMessage {
  id: string // eindeutiger Key, Client dedupliziert darüber
  type: 'offer' | 'answer' | 'ice'
  data: unknown
}

// Ein offenes Spiel verschwindet aus der Lobby, wenn der Host nicht mehr
// "lebt" (kein Heartbeat). Während des Verbindungsaufbaus etwas großzügiger.
const OPEN_TTL = 15_000
const MATCH_TTL = 90_000
const SIGNAL_TTL = 120_000

function store() {
  return useStorage('play')
}

function genId(): string {
  // Kurzer, gut teilbarer Code (Kleinbuchstaben + Ziffern, ohne 0/o/1/l-Verwechslung).
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return s
}

const matchKey = (id: string) => `match:${id}`
const sigPrefix = (id: string, to: SignalRole) => `sig:${id}:${to}:`

// ---- Matches --------------------------------------------------------------

export async function createMatch(host: PlayerRef): Promise<Match> {
  // Pro Mitglied nur ein offenes Spiel – ein bestehendes wird wiederverwendet.
  const existing = (await listMatches()).find(
    (m) => m.host.email === host.email && m.status === 'open',
  )
  if (existing) {
    existing.updatedAt = Date.now()
    await store().setItem(matchKey(existing.id), existing)
    return existing
  }

  const now = Date.now()
  const match: Match = {
    id: genId(),
    host,
    guest: null,
    status: 'open',
    createdAt: now,
    updatedAt: now,
  }
  await store().setItem(matchKey(match.id), match)
  return match
}

export async function getMatch(id: string): Promise<Match | null> {
  const m = await store().getItem<Match>(matchKey(id))
  if (!m) return null
  if (isExpired(m)) {
    await store().removeItem(matchKey(id))
    return null
  }
  return m
}

export async function joinMatch(id: string, guest: PlayerRef): Promise<Match> {
  const m = await getMatch(id)
  if (!m) throw createError({ statusCode: 404, statusMessage: 'Spiel nicht gefunden.' })
  if (m.host.email === guest.email) {
    throw createError({ statusCode: 409, statusMessage: 'Du bist bereits der Host dieses Spiels.' })
  }
  if (m.status !== 'open' || m.guest) {
    throw createError({ statusCode: 409, statusMessage: 'Dieses Spiel ist nicht mehr frei.' })
  }
  m.guest = guest
  m.status = 'connecting'
  m.updatedAt = Date.now()
  await store().setItem(matchKey(id), m)
  return m
}

export async function heartbeatMatch(id: string, email: string): Promise<Match | null> {
  const m = await getMatch(id)
  if (!m) return null
  if (m.host.email !== email && m.guest?.email !== email) return m
  m.updatedAt = Date.now()
  await store().setItem(matchKey(id), m)
  return m
}

export async function leaveMatch(id: string, email: string): Promise<void> {
  const m = await getMatch(id)
  if (!m) return
  // Host beendet -> Spiel ganz entfernen. Gast verlässt -> wieder freigeben.
  if (m.host.email === email) {
    await removeMatch(id)
  } else if (m.guest?.email === email) {
    m.guest = null
    m.status = 'open'
    m.updatedAt = Date.now()
    await store().setItem(matchKey(id), m)
  }
}

async function removeMatch(id: string): Promise<void> {
  await store().removeItem(matchKey(id))
  // zugehörige Signaling-Nachrichten gleich mit entfernen
  for (const role of ['host', 'guest'] as const) {
    const keys = await store().getKeys(sigPrefix(id, role))
    await Promise.all(keys.map((k) => store().removeItem(k)))
  }
}

function isExpired(m: Match): boolean {
  const age = Date.now() - m.updatedAt
  return m.status === 'open' ? age > OPEN_TTL : age > MATCH_TTL
}

async function listMatches(): Promise<Match[]> {
  const keys = await store().getKeys('match:')
  const out: Match[] = []
  for (const k of keys) {
    const m = await store().getItem<Match>(k)
    if (!m) continue
    if (isExpired(m)) {
      await store().removeItem(k)
      continue
    }
    out.push(m)
  }
  return out
}

/** Offene, noch freie Spiele für die Lobby-Liste. */
export async function listOpenMatches(): Promise<Match[]> {
  return (await listMatches())
    .filter((m) => m.status === 'open' && !m.guest)
    .sort((a, b) => a.createdAt - b.createdAt)
}

// ---- Signaling ------------------------------------------------------------

/** Rolle eines Mitglieds in einem Match bestimmen (oder null, wenn fremd). */
export function roleInMatch(m: Match, email: string): SignalRole | null {
  if (m.host.email === email) return 'host'
  if (m.guest?.email === email) return 'guest'
  return null
}

/** Eine Signaling-Nachricht an die jeweils andere Seite ablegen. */
export async function postSignal(
  id: string,
  to: SignalRole,
  type: SignalMessage['type'],
  data: unknown,
): Promise<void> {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  await store().setItem(sigPrefix(id, to) + uid, { type, data, ts: Date.now() })
}

/**
 * Alle für eine Rolle hinterlegten Nachrichten holen und konsumieren.
 * Jede Nachricht ist ein eigener Key – dadurch gibt es kein Read-Modify-Write
 * und keine Races zwischen parallelen Serverless-Aufrufen. Der Client
 * dedupliziert zusätzlich über `id`.
 */
export async function drainSignals(id: string, to: SignalRole): Promise<SignalMessage[]> {
  const prefix = sigPrefix(id, to)
  const keys = await store().getKeys(prefix)
  const out: SignalMessage[] = []
  for (const k of keys) {
    const msg = await store().getItem<{ type: SignalMessage['type']; data: unknown; ts: number }>(k)
    if (!msg) {
      await store().removeItem(k)
      continue
    }
    if (Date.now() - msg.ts > SIGNAL_TTL) {
      await store().removeItem(k)
      continue
    }
    out.push({ id: k, type: msg.type, data: msg.data })
    await store().removeItem(k) // konsumiert
  }
  return out
}
