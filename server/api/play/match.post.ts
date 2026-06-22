/** Ein offenes Online-Spiel eröffnen (oder das bestehende eigene zurückgeben). */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const match = await createMatch({ email: user.email, name: user.name })
  return { match }
})
