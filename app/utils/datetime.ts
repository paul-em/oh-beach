const TZ = 'Europe/Vienna'

/** Heutiges Datum (YYYY-MM-DD) in Vereins-Zeitzone. */
export function viennaToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Verschiebt ein YYYY-MM-DD-Datum um n Tage. */
export function addDays(dateStr: string, n: number): string {
  const p = dateStr.split('-')
  return new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + n, 12)).toISOString().slice(0, 10)
}

/** "Freitag, 20. Juni 2026" */
export function formatDateLong(dateStr: string): string {
  const p = dateStr.split('-')
  const dt = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12))
  return new Intl.DateTimeFormat('de-AT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dt)
}

/** Wochentag-Kürzel eines YYYY-MM-DD-Datums, z. B. "Fr". */
export function formatWeekdayShort(dateStr: string): string {
  const p = dateStr.split('-')
  const dt = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12))
  return new Intl.DateTimeFormat('de-AT', { weekday: 'short', timeZone: 'UTC' }).format(dt).replace(/\.$/, '')
}

/** Tag im Monat (1–31) eines YYYY-MM-DD-Datums. */
export function dayOfMonth(dateStr: string): number {
  return Number(dateStr.split('-')[2])
}

/** Liste aller YYYY-MM-DD-Daten von `from` bis `to` (inklusive). */
export function dateRange(from: string, to: string): string[] {
  const out: string[] = []
  for (let d = from; d <= to; d = addDays(d, 1)) {
    out.push(d)
    if (out.length > 366) break // Sicherheitsnetz
  }
  return out
}

/** Uhrzeit eines UTC-Instants in Vereins-Zeitzone, z. B. "18:00". */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('de-AT', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  }).format(new Date(iso))
}

function formatDayShort(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('de-AT', { weekday: 'short', day: 'numeric', month: 'long', timeZone }).format(d)
}

/**
 * Zeitangabe für einen Vereinstermin, z. B.
 * "Sa, 20. Juni · 18:00 – 22:00", "Sa, 20. Juni · ganztägig",
 * "Sa, 20. Juni – So, 21. Juni" oder "Sa, 20. Juni 18:00 – So, 21. Juni 12:00".
 * Ganztägige Termine: start/end als YYYY-MM-DD, end exklusiv (wie bei Google).
 */
export function formatEventWhen(ev: { start: string; end: string; allDay: boolean }): string {
  if (ev.allDay) {
    const lastDay = addDays(ev.end, -1)
    const first = formatDayShort(new Date(`${ev.start}T12:00:00Z`), 'UTC')
    if (lastDay <= ev.start) return `${first} · ganztägig`
    return `${first} – ${formatDayShort(new Date(`${lastDay}T12:00:00Z`), 'UTC')}`
  }
  const s = new Date(ev.start)
  const e = new Date(ev.end)
  const sameDay = formatDayShort(s, TZ) === formatDayShort(e, TZ)
  if (sameDay) return `${formatDayShort(s, TZ)} · ${formatTime(ev.start)} – ${formatTime(ev.end)}`
  return `${formatDayShort(s, TZ)} ${formatTime(ev.start)} – ${formatDayShort(e, TZ)} ${formatTime(ev.end)}`
}

/** Monatskürzel + Tag für ein Kalenderblatt-Badge, z. B. { month: "Juni", day: "20" }. */
export function eventDateBadge(ev: { start: string; allDay: boolean }): { month: string; day: string } {
  const d = ev.allDay ? new Date(`${ev.start}T12:00:00Z`) : new Date(ev.start)
  const timeZone = ev.allDay ? 'UTC' : TZ
  return {
    month: new Intl.DateTimeFormat('de-AT', { month: 'short', timeZone }).format(d).replace(/\.$/, ''),
    day: new Intl.DateTimeFormat('de-AT', { day: 'numeric', timeZone }).format(d),
  }
}

/** "Fr, 20. Juni · 18:00 – 19:00" für eine Buchung. */
export function formatBookingWhen(startISO: string, endISO: string): string {
  const day = new Intl.DateTimeFormat('de-AT', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    timeZone: TZ,
  }).format(new Date(startISO))
  return `${day} · ${formatTime(startISO)} – ${formatTime(endISO)}`
}
