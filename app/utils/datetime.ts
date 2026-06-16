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
