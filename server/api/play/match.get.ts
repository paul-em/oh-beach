/**
 * Aktuellen Stand eines Matches abfragen (Polling). Liefert das Match plus die
 * eigene Rolle, damit der Client weiß, ob der Gegner schon beigetreten ist.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = String(getQuery(event).id ?? '')
  if (!id) throw createError({ statusCode: 422, statusMessage: 'Spiel-ID fehlt.' })

  const match = await getMatch(id)
  if (!match) return { match: null, role: null }

  return { match, role: roleInMatch(match, user.email) }
})
