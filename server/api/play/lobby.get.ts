/**
 * Offene Online-Spiele für die Lobby. Nur für eingeloggte Mitglieder.
 * Liefert die Liste freier Spiele (ohne das eigene) + die eigene Identität.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const matches = await listOpenMatches()
  return {
    me: { email: user.email, name: user.name },
    matches: matches
      .filter((m) => m.host.email !== user.email)
      .map((m) => ({ id: m.id, hostName: m.host.name, createdAt: m.createdAt })),
  }
})
