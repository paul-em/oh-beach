/** Persönlicher Kalender-Abo-Link des eingeloggten Mitglieds. */
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const token = await createFeedToken(session.user.email)

  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const httpsUrl = `${siteUrl}/api/events/calendar.ics?token=${encodeURIComponent(token)}`
  const webcalUrl = httpsUrl.replace(/^https?:\/\//, 'webcal://')

  return {
    url: httpsUrl,
    webcalUrl,
    googleUrl: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`,
  }
})
