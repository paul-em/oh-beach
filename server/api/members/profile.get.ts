/** Eigenes Profil des eingeloggten Mitglieds (zum Bearbeiten). */
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const profile = await getMemberProfile(session.user.email)
  if (!profile) {
    throw createError({ statusCode: 404, statusMessage: 'Profil nicht gefunden.' })
  }
  return { profile }
})
