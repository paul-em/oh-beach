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
