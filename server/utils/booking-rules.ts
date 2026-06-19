/**
 * Zentrale Buchungsregeln. Hier (und nur hier) werden Öffnungszeiten, Slot-Länge,
 * Anzahl Plätze und Vorlauf-Fenster definiert – leicht anpassbar.
 */
export const BOOKING = {
  openHour: 8, // erster Slot beginnt 08:00
  closeHour: 22, // letzter Slot endet 22:00 (Start also bis 21:00)
  slotMinutes: 60,
  advanceDays: 14, // wie weit im Voraus buchbar
  timeZone: 'Europe/Vienna',
  courtCount: 1, // bei >1 Platz: Verfügbarkeit pro courtId zählen
}

export interface Slot {
  hour: number
  label: string
  startISO: string
  endISO: string
}

/** Zerlegt "YYYY-MM-DD" sicher in Jahr/Monat/Tag. */
function ymd(dateStr: string): { y: number; mo: number; d: number } {
  const p = dateStr.split('-')
  return { y: Number(p[0]), mo: Number(p[1]), d: Number(p[2]) }
}

/** Offset (ms) der Zeitzone zum gegebenen Zeitpunkt – DST-sicher via Intl. */
function tzOffsetMs(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = dtf.formatToParts(date)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  return asUTC - date.getTime()
}

/** Wandelt eine lokale (Vienna-)Zeit in den korrekten UTC-Zeitpunkt um. */
function localToUTC(y: number, mo: number, d: number, h: number, min = 0): Date {
  const guess = Date.UTC(y, mo - 1, d, h, min, 0)
  const offset = tzOffsetMs(new Date(guess), BOOKING.timeZone)
  return new Date(guess - offset)
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function isValidDateStr(s: string): boolean {
  return DATE_RE.test(s)
}

/** Heutiges Datum (YYYY-MM-DD) in der Vereins-Zeitzone. */
export function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BOOKING.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Letztes buchbares Datum (heute + advanceDays). */
export function maxDateStr(): string {
  const { y, mo, d } = ymd(todayStr())
  const dt = new Date(Date.UTC(y, mo - 1, d + BOOKING.advanceDays))
  return dt.toISOString().slice(0, 10)
}

/** Erzeugt alle Slots eines Tages mit korrekten UTC-Zeitpunkten. */
export function generateSlots(dateStr: string): Slot[] {
  const { y, mo, d } = ymd(dateStr)
  const slots: Slot[] = []
  for (let h = BOOKING.openHour; h < BOOKING.closeHour; h++) {
    const start = localToUTC(y, mo, d, h)
    const end = localToUTC(y, mo, d, h + 1)
    slots.push({
      hour: h,
      label: `${h} – ${h + 1} Uhr`,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    })
  }
  return slots
}

/** UTC-Grenzen eines Vereinstags (für Calendar timeMin/timeMax). */
export function dayBoundsUTC(dateStr: string): { timeMin: string; timeMax: string } {
  const { y, mo, d } = ymd(dateStr)
  return {
    timeMin: localToUTC(y, mo, d, 0).toISOString(),
    timeMax: localToUTC(y, mo, d + 1, 0).toISOString(),
  }
}

/** Ist der Slot in der Zukunft und innerhalb des Vorlauf-Fensters? */
export function isBookable(startISO: string): boolean {
  const start = new Date(startISO).getTime()
  const now = Date.now()
  if (start <= now) return false
  const limit = now + BOOKING.advanceDays * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000
  return start <= limit
}
