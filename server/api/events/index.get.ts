/**
 * Kommende Vereinstermine (nur für eingeloggte Mitglieder).
 * Query: ?limit=3 für eine Vorschau (z. B. auf der Mitglieder-Startseite).
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 100)

  const now = new Date()
  const timeMin = now.toISOString()
  const timeMax = new Date(now.getTime() + 365 * 86400000).toISOString()

  try {
    const events = await listClubEvents(timeMin, timeMax)
    return { events: events.slice(0, limit) }
  } catch (e) {
    console.error('[events] Google Calendar konnte nicht gelesen werden:', e)
    throw createError({
      statusCode: 502,
      statusMessage: 'Termine konnten gerade nicht geladen werden.',
    })
  }
})
