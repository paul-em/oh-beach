/**
 * Online-Multiplayer-Netzwerk für Beach-Blobby.
 *
 * Matchmaking läuft über kleine REST-Endpunkte (Lobby + Signaling, siehe
 * server/api/play/*), das Spiel selbst danach Peer-to-Peer über einen WebRTC
 * DataChannel. Diese Composable kapselt den kompletten Lebenszyklus:
 *   Lobby pollen -> Spiel eröffnen/beitreten -> WebRTC-Handshake -> DataChannel.
 *
 * Bewusst transport-agnostisch: was über den Channel geschickt wird (Inputs,
 * Spielzustand), definiert die Spielseite. Hier geht es nur um Verbindung.
 */

export type PlayPhase =
  | 'lobby' // Liste offener Spiele, eigenes eröffnen/beitreten
  | 'connecting' // Match steht, WebRTC wird aufgebaut
  | 'playing' // DataChannel offen
  | 'error'

export type PlayRole = 'host' | 'guest'

export interface OpenMatch {
  id: string
  hostName: string
  createdAt: number
}

interface MatchDto {
  id: string
  host: { email: string; name: string }
  guest: { email: string; name: string } | null
  status: 'open' | 'connecting' | 'active'
}

interface SignalDto {
  id: string
  type: 'offer' | 'answer' | 'ice'
  data: unknown
}

export function usePlayNetwork() {
  const config = useRuntimeConfig()
  const iceServers = config.public.iceServers as RTCIceServer[]

  const phase = ref<PlayPhase>('lobby')
  const role = ref<PlayRole | null>(null)
  const matchId = ref<string | null>(null)
  const openMatches = ref<OpenMatch[]>([])
  const opponentName = ref('')
  const statusText = ref('')
  const errorText = ref('')

  let pc: RTCPeerConnection | null = null
  let dc: RTCDataChannel | null = null
  let onData: ((msg: unknown) => void) | null = null
  let onClose: (() => void) | null = null

  // Timer-Handles
  let lobbyTimer: ReturnType<typeof setInterval> | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let matchPollTimer: ReturnType<typeof setInterval> | null = null
  let signalTimer: ReturnType<typeof setInterval> | null = null

  // ICE-Kandidaten, die vor der Remote-Description eintreffen, zwischenspeichern.
  const pendingIce: RTCIceCandidateInit[] = []
  let remoteReady = false
  const seenSignals = new Set<string>()

  function setHandlers(opts: { onData: (msg: unknown) => void; onClose: () => void }) {
    onData = opts.onData
    onClose = opts.onClose
  }

  function send(msg: unknown) {
    if (dc && dc.readyState === 'open') {
      try { dc.send(typeof msg === 'string' ? msg : JSON.stringify(msg)) } catch { /* Channel evtl. gerade zu */ }
    }
  }

  // ---- Lobby --------------------------------------------------------------

  async function refreshLobby() {
    try {
      const res = await $fetch<{ matches: OpenMatch[] }>('/api/play/lobby')
      openMatches.value = res.matches
    } catch { /* offline o. ä. – Liste bleibt einfach stehen */ }
  }

  function startLobby() {
    phase.value = 'lobby'
    refreshLobby()
    stopTimer('lobby')
    lobbyTimer = setInterval(refreshLobby, 2500)
  }

  // ---- Match eröffnen / beitreten ----------------------------------------

  async function host() {
    const res = await $fetch<{ match: MatchDto }>('/api/play/match', { method: 'POST' })
    enterMatch(res.match, 'host')
    // Host wartet auf einen Gegner und baut dann als Offerer die Verbindung auf.
    matchPollTimer = setInterval(async () => {
      if (!matchId.value) return
      try {
        const r = await $fetch<{ match: MatchDto | null }>('/api/play/match', { query: { id: matchId.value } })
        if (r.match?.guest) {
          opponentName.value = r.match.guest.name
          stopTimer('matchPoll')
          await beginWebRtc('host')
        }
      } catch { /* weiter versuchen */ }
    }, 1500)
  }

  async function join(id: string) {
    const res = await $fetch<{ match: MatchDto }>('/api/play/join', { method: 'POST', body: { id } })
    enterMatch(res.match, 'guest')
    opponentName.value = res.match.host.name
    await beginWebRtc('guest')
  }

  function enterMatch(match: MatchDto, r: PlayRole) {
    stopTimer('lobby')
    matchId.value = match.id
    role.value = r
    phase.value = 'connecting'
    statusText.value = r === 'host' ? 'Warte auf Gegenspieler …' : 'Verbinde mit Host …'
    // Match am Leben halten, solange wir verbinden.
    heartbeatTimer = setInterval(() => {
      if (matchId.value) $fetch('/api/play/heartbeat', { method: 'POST', body: { id: matchId.value } }).catch(() => {})
    }, 5000)
  }

  // ---- WebRTC -------------------------------------------------------------

  async function beginWebRtc(r: PlayRole) {
    statusText.value = 'Stelle Verbindung her …'
    pc = new RTCPeerConnection({ iceServers })

    pc.onicecandidate = (e) => {
      if (e.candidate) postSignal('ice', e.candidate.toJSON())
    }
    pc.onconnectionstatechange = () => {
      if (!pc) return
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        fail('Verbindung verloren.')
      }
    }

    if (r === 'host') {
      const channel = pc.createDataChannel('game', { ordered: false, maxRetransmits: 0 })
      wireChannel(channel)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      await postSignal('offer', offer)
    } else {
      pc.ondatachannel = (e) => wireChannel(e.channel)
    }

    // Signaling-Postfach pollen, bis die Verbindung steht.
    signalTimer = setInterval(pollSignals, 700)
    pollSignals()
  }

  function wireChannel(channel: RTCDataChannel) {
    dc = channel
    dc.onopen = () => {
      phase.value = 'playing'
      statusText.value = ''
      stopTimer('signal') // Handshake fertig
    }
    dc.onmessage = (e) => {
      if (!onData) return
      try { onData(typeof e.data === 'string' ? JSON.parse(e.data) : e.data) } catch { /* defektes Paket ignorieren */ }
    }
    dc.onclose = () => { if (onClose) onClose() }
  }

  async function postSignal(type: SignalDto['type'], data: unknown) {
    if (!matchId.value) return
    try {
      await $fetch('/api/play/signal', { method: 'POST', body: { id: matchId.value, type, data } })
    } catch { /* wird beim nächsten Kandidaten erneut versucht */ }
  }

  async function pollSignals() {
    if (!matchId.value || !pc) return
    let messages: SignalDto[] = []
    try {
      const res = await $fetch<{ messages: SignalDto[] }>('/api/play/signal', { query: { id: matchId.value } })
      messages = res.messages
    } catch { return }

    for (const msg of messages) {
      if (seenSignals.has(msg.id)) continue
      seenSignals.add(msg.id)
      await handleSignal(msg)
    }
  }

  async function handleSignal(msg: SignalDto) {
    if (!pc) return
    try {
      if (msg.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit))
        remoteReady = true
        await flushPendingIce()
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        await postSignal('answer', answer)
      } else if (msg.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit))
        remoteReady = true
        await flushPendingIce()
      } else if (msg.type === 'ice') {
        const cand = msg.data as RTCIceCandidateInit
        if (remoteReady) await pc.addIceCandidate(cand)
        else pendingIce.push(cand)
      }
    } catch { /* einzelne fehlerhafte Nachricht überspringen */ }
  }

  async function flushPendingIce() {
    if (!pc) return
    while (pendingIce.length) {
      const c = pendingIce.shift()!
      try { await pc.addIceCandidate(c) } catch { /* ignorieren */ }
    }
  }

  // ---- Aufräumen ----------------------------------------------------------

  function fail(message: string) {
    errorText.value = message
    phase.value = 'error'
    teardownConnection()
  }

  function stopTimer(which: 'lobby' | 'heartbeat' | 'matchPoll' | 'signal') {
    const map = { lobby: lobbyTimer, heartbeat: heartbeatTimer, matchPoll: matchPollTimer, signal: signalTimer }
    const t = map[which]
    if (t) clearInterval(t)
    if (which === 'lobby') lobbyTimer = null
    if (which === 'heartbeat') heartbeatTimer = null
    if (which === 'matchPoll') matchPollTimer = null
    if (which === 'signal') signalTimer = null
  }

  function teardownConnection() {
    stopTimer('heartbeat'); stopTimer('matchPoll'); stopTimer('signal')
    try { dc?.close() } catch { /* egal */ }
    try { pc?.close() } catch { /* egal */ }
    dc = null
    pc = null
    remoteReady = false
    pendingIce.length = 0
    seenSignals.clear()
  }

  /** Verbindung & Match komplett verlassen und zurück in die Lobby. */
  async function leave() {
    const id = matchId.value
    teardownConnection()
    matchId.value = null
    role.value = null
    opponentName.value = ''
    if (id) await $fetch('/api/play/leave', { method: 'POST', body: { id } }).catch(() => {})
  }

  function dispose() {
    stopTimer('lobby')
    teardownConnection()
    const id = matchId.value
    if (id) navigator.sendBeacon?.('/api/play/leave', new Blob([JSON.stringify({ id })], { type: 'application/json' }))
  }

  return {
    // Zustand
    phase, role, matchId, openMatches, opponentName, statusText, errorText,
    // Lobby
    startLobby, refreshLobby, stopLobby: () => stopTimer('lobby'),
    // Match
    host, join, leave, dispose,
    // Daten
    setHandlers, send,
  }
}
