import { google } from 'googleapis'
import { randomUUID } from 'node:crypto'

/**
 * Platzbelegung über einen dedizierten Google Calendar.
 * Ohne Calendar-Config (lokale Entwicklung) wird ein In-Memory-Store genutzt.
 */

export interface CourtEvent {
  id: string
  startISO: string
  endISO: string
  summary: string
  memberEmail?: string
  courtId?: string
}

const APP_TAG = 'oh-beach'

/**
 * Google liefert Event-Zeiten mit Zeitzonen-Offset (z. B. "...+02:00"), unsere
 * Slots in UTC ("...Z"). Da Belegung/Überschneidungen per String-Vergleich
 * geprüft werden, normalisieren wir alle Event-Zeiten auf kanonisches UTC-ISO.
 */
function normalizeEventISO(dateTime?: string | null, date?: string | null): string {
  if (dateTime) return new Date(dateTime).toISOString()
  if (date) return date // ganztägige Termine: YYYY-MM-DD belassen
  return ''
}

export function isCalendarConfigured(): boolean {
  const c = useRuntimeConfig()
  return Boolean(c.googleServiceAccountEmail && c.googlePrivateKey && c.googleCalendarId)
}

function getCalendarClient() {
  const c = useRuntimeConfig()
  const auth = new google.auth.JWT({
    email: c.googleServiceAccountEmail,
    key: c.googlePrivateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
  return google.calendar({ version: 'v3', auth })
}

// ---- Dev In-Memory Store --------------------------------------------------

let devEvents: CourtEvent[] = []

// ---- Öffentliche API ------------------------------------------------------

export async function listCourtEvents(timeMin: string, timeMax: string): Promise<CourtEvent[]> {
  if (!isCalendarConfigured()) {
    return devEvents.filter((e) => e.endISO > timeMin && e.startISO < timeMax)
  }
  const c = useRuntimeConfig()
  const cal = getCalendarClient()
  const res = await cal.events.list({
    calendarId: c.googleCalendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  })
  return (res.data.items || []).map((it) => ({
    id: it.id!,
    startISO: normalizeEventISO(it.start?.dateTime, it.start?.date),
    endISO: normalizeEventISO(it.end?.dateTime, it.end?.date),
    summary: it.summary || 'Reserviert',
    memberEmail: it.extendedProperties?.private?.memberEmail,
    courtId: it.extendedProperties?.private?.courtId,
  }))
}

export async function getCourtEvent(id: string): Promise<CourtEvent | null> {
  if (!isCalendarConfigured()) {
    return devEvents.find((e) => e.id === id) ?? null
  }
  const c = useRuntimeConfig()
  const cal = getCalendarClient()
  try {
    const res = await cal.events.get({ calendarId: c.googleCalendarId, eventId: id })
    const it = res.data
    return {
      id: it.id!,
      startISO: normalizeEventISO(it.start?.dateTime, it.start?.date),
      endISO: normalizeEventISO(it.end?.dateTime, it.end?.date),
      summary: it.summary || 'Reserviert',
      memberEmail: it.extendedProperties?.private?.memberEmail,
      courtId: it.extendedProperties?.private?.courtId,
    }
  } catch {
    return null
  }
}

export async function createCourtEvent(input: {
  startISO: string
  endISO: string
  memberEmail: string
  memberName: string
  courtId?: string
}): Promise<CourtEvent> {
  const courtId = input.courtId ?? '1'
  const summary = `Reserviert – ${input.memberName}`
  if (!isCalendarConfigured()) {
    const ev: CourtEvent = {
      id: randomUUID(),
      startISO: input.startISO,
      endISO: input.endISO,
      summary,
      memberEmail: input.memberEmail,
      courtId,
    }
    devEvents.push(ev)
    return ev
  }
  const c = useRuntimeConfig()
  const cal = getCalendarClient()
  const res = await cal.events.insert({
    calendarId: c.googleCalendarId,
    requestBody: {
      summary,
      description: `Platzreservierung über oh-beach (${input.memberEmail})`,
      start: { dateTime: input.startISO },
      end: { dateTime: input.endISO },
      extendedProperties: {
        private: { memberEmail: input.memberEmail, courtId, app: APP_TAG },
      },
    },
  })
  const it = res.data
  return {
    id: it.id!,
    startISO: it.start?.dateTime || input.startISO,
    endISO: it.end?.dateTime || input.endISO,
    summary,
    memberEmail: input.memberEmail,
    courtId,
  }
}

export async function deleteCourtEvent(id: string): Promise<void> {
  if (!isCalendarConfigured()) {
    devEvents = devEvents.filter((e) => e.id !== id)
    return
  }
  const c = useRuntimeConfig()
  const cal = getCalendarClient()
  await cal.events.delete({ calendarId: c.googleCalendarId, eventId: id })
}
