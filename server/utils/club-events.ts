import { google } from 'googleapis'

/**
 * Vereinstermine (interner Event-/Terminkalender) aus einem eigenen Google Calendar.
 *
 * Der Vorstand pflegt die Termine direkt im Google Calendar; die Website liest sie
 * nur (Scope calendar.readonly) und zeigt sie im Mitgliederbereich an.
 * Termine haben bewusst KEINEN Einfluss auf die Platzreservierung.
 *
 * Ohne Konfiguration (lokale Entwicklung) werden Beispiel-Termine geliefert.
 */

export interface ClubEvent {
  id: string
  title: string
  /** Ganztägig: YYYY-MM-DD, sonst UTC-ISO-Instant. */
  start: string
  /** Ganztägig: YYYY-MM-DD (exklusiv, wie bei Google), sonst UTC-ISO-Instant. */
  end: string
  allDay: boolean
  location?: string
  description?: string
}

export function isEventsCalendarConfigured(): boolean {
  const c = useRuntimeConfig()
  return Boolean(c.googleServiceAccountEmail && c.googlePrivateKey && c.googleEventsCalendarId)
}

function getReadonlyCalendarClient() {
  const c = useRuntimeConfig()
  const auth = new google.auth.JWT({
    email: c.googleServiceAccountEmail,
    key: c.googlePrivateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  })
  return google.calendar({ version: 'v3', auth })
}

/**
 * Google-Beschreibungen können einfaches HTML enthalten (<br>, <a>, <b> …), wenn sie
 * im Web-UI formatiert wurden. Für die Anzeige wandeln wir sie in reinen Text um.
 */
function descriptionToText(html?: string | null): string | undefined {
  if (!html) return undefined
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    // Links: sichtbaren Text behalten, URL anhängen, falls abweichend
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (_m, href: string, label: string) =>
      label && label !== href ? `${label} (${href})` : href)
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return text || undefined
}

// ---- Dev-Beispieldaten -----------------------------------------------------

function devEvents(): ClubEvent[] {
  const day = (offset: number) => {
    const d = new Date(Date.now() + offset * 86400000)
    return d.toISOString().slice(0, 10)
  }
  const at = (offset: number, hourUTC: number) => `${day(offset)}T${String(hourUTC).padStart(2, '0')}:00:00.000Z`
  return [
    {
      id: 'dev-1',
      title: 'Vorstandssitzung',
      start: at(3, 17),
      end: at(3, 19),
      allDay: false,
      location: 'Vereinsheim',
      description: 'Themen: Saisonplanung, Platzpflege, Sponsoren.',
    },
    {
      id: 'dev-2',
      title: 'Platzpflege-Tag',
      start: day(10),
      end: day(11),
      allDay: true,
      location: 'Beachplatz',
      description: 'Bitte Rechen und Handschuhe mitbringen. Danach Grillen!',
    },
    {
      id: 'dev-3',
      title: 'Saisonabschluss-Feier',
      start: at(24, 16),
      end: at(24, 22),
      allDay: false,
      location: 'Beachplatz',
    },
  ]
}

// ---- Öffentliche API -------------------------------------------------------

export async function listClubEvents(timeMin: string, timeMax: string): Promise<ClubEvent[]> {
  if (!isEventsCalendarConfigured()) {
    return devEvents().filter((e) => e.end > timeMin.slice(0, e.allDay ? 10 : undefined) && e.start < timeMax)
  }
  const c = useRuntimeConfig()
  const cal = getReadonlyCalendarClient()
  const res = await cal.events.list({
    calendarId: c.googleEventsCalendarId,
    timeMin,
    timeMax,
    singleEvents: true, // Serientermine einzeln auflösen
    orderBy: 'startTime',
    maxResults: 100,
  })
  return (res.data.items || [])
    .filter((it) => it.status !== 'cancelled')
    .map((it) => {
      const allDay = Boolean(it.start?.date && !it.start?.dateTime)
      return {
        id: it.id!,
        title: it.summary?.trim() || 'Termin',
        start: allDay ? it.start!.date! : new Date(it.start!.dateTime!).toISOString(),
        end: allDay ? it.end!.date! : new Date(it.end!.dateTime!).toISOString(),
        allDay,
        location: it.location?.trim() || undefined,
        description: descriptionToText(it.description),
      }
    })
}
