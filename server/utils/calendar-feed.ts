import { EncryptJWT, jwtDecrypt } from 'jose'
import { createHash } from 'node:crypto'
import type { ClubEvent } from './club-events'

/**
 * Persönliche Kalender-Abo-Links (ICS-Feed) für Mitglieder.
 *
 * Jedes Mitglied bekommt einen eigenen, dauerhaft gültigen Token. Er ist
 * verschlüsselt (nicht nur signiert), damit die E-Mail-Adresse nicht im Klartext
 * in der Abo-URL steht – solche URLs landen bei Google/Apple/Microsoft.
 * Beim Abruf wird geprüft, ob das Mitglied noch aktiv ist; Ausgetretene bekommen
 * so automatisch keine Termine mehr.
 */

const PURPOSE = 'calendar-feed'

function getFeedKey(): Uint8Array {
  const secret = useRuntimeConfig().authTokenSecret
  if (!secret || secret.length < 16) {
    throw createError({ statusCode: 500, statusMessage: 'AUTH_TOKEN_SECRET fehlt/zu kurz' })
  }
  // Eigenen 256-Bit-Schlüssel ableiten, getrennt vom Login-Token-Schlüssel.
  return new Uint8Array(createHash('sha256').update(`${PURPOSE}:${secret}`).digest())
}

export async function createFeedToken(email: string): Promise<string> {
  return new EncryptJWT({ email: email.toLowerCase(), purpose: PURPOSE })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .encrypt(getFeedKey())
}

export async function readFeedToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtDecrypt(token, getFeedKey())
    if (payload.purpose !== PURPOSE || typeof payload.email !== 'string') return null
    return { email: payload.email }
  } catch {
    return null
  }
}

// ---- ICS (RFC 5545) --------------------------------------------------------

function escapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Zeilen auf max. 75 Oktette falten (UTF-8-sicher, Fortsetzung mit Leerzeichen). */
function fold(line: string): string {
  const enc = new TextEncoder()
  if (enc.encode(line).length <= 75) return line
  const parts: string[] = []
  let current = ''
  let bytes = 0
  for (const ch of line) {
    const len = enc.encode(ch).length
    const limit = parts.length === 0 ? 75 : 74 // Folgezeilen beginnen mit einem Leerzeichen
    if (bytes + len > limit) {
      parts.push(current)
      current = ''
      bytes = 0
    }
    current += ch
    bytes += len
  }
  parts.push(current)
  return parts.join('\r\n ')
}

/** 2026-06-20T16:00:00.000Z -> 20260620T160000Z */
function icsDateTime(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** 2026-06-20 -> 20260620 */
function icsDate(date: string): string {
  return date.replace(/-/g, '')
}

export function buildIcs(events: ClubEvent[], opts: { calendarName: string; siteUrl: string }): string {
  const host = (() => {
    try { return new URL(opts.siteUrl).hostname } catch { return 'oh-beach' }
  })()
  const stamp = icsDateTime(new Date().toISOString())

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//O.H.BEACH//Vereinstermine//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(opts.calendarName)}`,
    'X-WR-TIMEZONE:Europe/Vienna',
    // Hinweis an Kalender-Apps, wie oft sie neu laden sollen (nicht alle halten sich daran)
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
  ]

  for (const ev of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.id}@${host}`)
    lines.push(`DTSTAMP:${stamp}`)
    if (ev.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${icsDate(ev.start)}`)
      lines.push(`DTEND;VALUE=DATE:${icsDate(ev.end)}`)
    } else {
      lines.push(`DTSTART:${icsDateTime(ev.start)}`)
      lines.push(`DTEND:${icsDateTime(ev.end)}`)
    }
    lines.push(`SUMMARY:${escapeText(ev.title)}`)
    if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`)
    if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}
