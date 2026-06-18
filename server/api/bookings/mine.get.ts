/** Kommende Buchungen des eingeloggten Mitglieds. */
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const email = session.user.email.toLowerCase()

  const now = new Date()
  const timeMin = now.toISOString()
  const timeMax = new Date(now.getTime() + (BOOKING.advanceDays + 2) * 86400000).toISOString()

  const events = await listCourtEvents(timeMin, timeMax)
  const bookings = events
    .filter((e) => (e.memberEmail || '').toLowerCase() === email)
    .map((e) => ({ id: e.id, startISO: e.startISO, endISO: e.endISO, note: e.note }))
    .sort((a, b) => a.startISO.localeCompare(b.startISO))

  return { bookings }
})
