/**
 * Öffentliche Belegung eines Tages. Gibt pro Slot frei/belegt/vergangen zurück.
 * Für eingeloggte Mitglieder wird die eigene Buchung markiert (mine + bookingId).
 * Fremde Buchungen werden NICHT mit Namen offengelegt.
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const date = typeof q.date === 'string' && isValidDateStr(q.date) ? q.date : todayStr()

  const slots = generateSlots(date)
  const { timeMin, timeMax } = dayBoundsUTC(date)
  const events = await listCourtEvents(timeMin, timeMax)

  const session = await getUserSession(event)
  const userEmail = session?.user?.email?.toLowerCase()

  const result = slots.map((s) => {
    const overlapping = events.filter((e) => e.startISO < s.endISO && e.endISO > s.startISO)
    const booked = overlapping.length >= BOOKING.courtCount
    const own = userEmail
      ? overlapping.find((e) => (e.memberEmail || '').toLowerCase() === userEmail)
      : undefined
    const past = !isBookable(s.startISO)
    const status: 'free' | 'busy' | 'past' = booked ? 'busy' : past ? 'past' : 'free'
    return {
      hour: s.hour,
      label: s.label,
      startISO: s.startISO,
      status,
      mine: Boolean(own),
      bookingId: own?.id,
    }
  })

  return {
    date,
    today: todayStr(),
    maxDate: maxDateStr(),
    slots: result,
    config: { openHour: BOOKING.openHour, closeHour: BOOKING.closeHour, advanceDays: BOOKING.advanceDays },
  }
})
