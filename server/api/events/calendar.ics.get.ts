/**
 * ICS-Feed der Vereinstermine zum Abonnieren in Kalender-Apps.
 * Authentifizierung über den persönlichen Token in der URL (Kalender-Apps
 * können keine Login-Cookies mitschicken).
 */
export default defineEventHandler(async (event) => {
  const token = String(getQuery(event).token || '')
  const feed = token ? await readFeedToken(token) : null
  if (!feed) {
    throw createError({ statusCode: 403, statusMessage: 'Ungültiger Kalender-Link.' })
  }

  const member = await findMemberByEmail(feed.email)
  if (!member || !member.active) {
    throw createError({ statusCode: 403, statusMessage: 'Kalender-Link nicht mehr gültig.' })
  }

  // Auch vergangene Termine der letzten 3 Monate mitliefern, damit sie in der
  // Kalender-App nicht sofort verschwinden.
  const now = Date.now()
  const timeMin = new Date(now - 90 * 86400000).toISOString()
  const timeMax = new Date(now + 365 * 86400000).toISOString()

  let events
  try {
    events = await listClubEvents(timeMin, timeMax)
  } catch (e) {
    console.error('[events/ics] Google Calendar konnte nicht gelesen werden:', e)
    throw createError({ statusCode: 502, statusMessage: 'Termine konnten gerade nicht geladen werden.' })
  }

  setHeader(event, 'Content-Type', 'text/calendar; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'inline; filename="oh-beach-termine.ics"')
  // Persönlich -> nicht in geteilten Caches ablegen
  setHeader(event, 'Cache-Control', 'private, max-age=900')

  return buildIcs(events, {
    calendarName: 'O.H.BEACH Termine',
    siteUrl: useRuntimeConfig().public.siteUrl,
  })
})
