/**
 * Die für die eigene Rolle hinterlegten Signaling-Nachrichten abholen (Polling).
 * Nachrichten werden dabei konsumiert; der Client dedupliziert über `id`.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = String(getQuery(event).id ?? '')
  if (!id) throw createError({ statusCode: 422, statusMessage: 'Spiel-ID fehlt.' })

  const match = await getMatch(id)
  if (!match) return { messages: [] }

  const myRole = roleInMatch(match, user.email)
  if (!myRole) throw createError({ statusCode: 403, statusMessage: 'Du gehörst nicht zu diesem Spiel.' })

  const messages = await drainSignals(id, myRole)
  return { messages }
})
