/**
 * Team-Auslosung für das Mitglieder-Tool.
 *
 * Ziel: möglichst gleich starke Teams, aber mit Zufall. Die Spielstärke ("Skill")
 * geht 1 = stärkster (Liga-Spieler) bis 3 = gute Ballkontrolle. Spieler ohne
 * Wertung werden fürs Balancing als Mittelfeld (2) gerechnet.
 *
 * Niemand bleibt sitzen und niemand spielt allein: ALLE Anwesenden werden auf
 * Teams mit mindestens 2 Spielern verteilt. Geht die gewählte Teamgröße nicht
 * glatt auf, weichen einzelne Teams um einen Spieler ab (z. B. bei „4 pro Team"
 * dann auch Teams mit 3; bei „2 pro Team" und ungerader Anzahl ein Team mit 3).
 *
 * Vorgehen:
 *  1. Anzahl Teams = aufgerundet (Spieler / Teamgröße), aber höchstens
 *     floor(Spieler / 2) -> so hat kein Team weniger als 2 Spieler, keine Bank.
 *  2. Alle zufällig mischen, dann nach Stärke sortieren (bei Gleichstand bleibt
 *     die Zufallsreihenfolge erhalten) und im Snake-Draft (1-2-3-3-2-1 …) auf die
 *     Teams verteilen. So sind die Teams im Schnitt gleich stark und die
 *     Teamgrößen unterscheiden sich um höchstens einen Spieler.
 */

export interface DrawPlayer {
  name: string
  skill: 1 | 2 | 3 | null
  guest: boolean
}

export interface DrawTeam {
  players: DrawPlayer[]
  avgSkill: number // Durchschnitt der gewichteten Stärke (1 = stark, 3 = solide)
}

export interface DrawResult {
  teams: DrawTeam[]
}

/** Wertung fürs Balancing – fehlende Wertung zählt als Mittelfeld (2). */
function weight(p: DrawPlayer): number {
  return p.skill ?? 2
}

/** Fisher-Yates-Shuffle auf einer Kopie. */
function shuffled<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export function drawTeams(players: readonly DrawPlayer[], teamSize: number): DrawResult {
  const size = Math.max(1, Math.floor(teamSize))
  if (players.length === 0) return { teams: [] }

  // Aufrunden für möglichst kleine Teams, aber höchstens floor(n/2) Teams, damit
  // kein Team allein (mit 1 Spieler) dasteht. Ein evtl. Einzelner wird so einem
  // anderen Team zugeschlagen (-> ein Team mit einem Spieler mehr).
  const numTeams = Math.max(1, Math.min(Math.ceil(players.length / size), Math.floor(players.length / 2)))

  // Zufällig mischen, dann nach Stärke sortieren (stabil -> Gleichstand bleibt
  // zufällig). Round-robin/Snake verteilt anschließend alle gleichmäßig.
  const pool = shuffled(players)
  const ordered = [...pool].sort((a, b) => weight(a) - weight(b))

  const teams: DrawPlayer[][] = Array.from({ length: numTeams }, () => [])
  ordered.forEach((p, i) => {
    const round = Math.floor(i / numTeams)
    const pos = i % numTeams
    const teamIndex = round % 2 === 0 ? pos : numTeams - 1 - pos
    teams[teamIndex]!.push(p)
  })

  return {
    teams: teams.map((ps) => ({
      players: ps,
      avgSkill: ps.reduce((s, p) => s + weight(p), 0) / ps.length,
    })),
  }
}
