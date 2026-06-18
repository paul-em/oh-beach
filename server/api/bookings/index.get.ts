/**
 * Öffentliche Belegung eines Tages. Gibt pro Slot frei/belegt/vergangen zurück.
 * Für eingeloggte Mitglieder wird die eigene Buchung markiert (mine + bookingId)
 * und die Namen der Reservierenden offengelegt (bookedBy). Für Gäste bleibt nur
 * der Status sichtbar – ohne Namen.
 */
function bookedByName(summary: string, note?: string): string {
  let name = summary.replace(/^Reserviert\s*[–-]\s*/, '').trim()
  // Notiz steckt im Titel als "Name: Notiz" – für die Namensanzeige wieder entfernen.
  if (note && name.endsWith(`: ${note}`)) name = name.slice(0, -(`: ${note}`).length).trim()
  return name || 'Reserviert'
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const date = typeof q.date === 'string' && isValidDateStr(q.date) ? q.date : todayStr()

  const slots = generateSlots(date)
  const { timeMin, timeMax } = dayBoundsUTC(date)
  const [events, weather] = await Promise.all([
    listCourtEvents(timeMin, timeMax),
    weatherForDate(date),
  ])

  const session = await getUserSession(event)
  const userEmail = session?.user?.email?.toLowerCase()
  const loggedIn = Boolean(userEmail)

  const result = slots.map((s) => {
    const overlapping = events.filter((e) => e.startISO < s.endISO && e.endISO > s.startISO)
    const booked = overlapping.length >= BOOKING.courtCount
    const own = userEmail
      ? overlapping.find((e) => (e.memberEmail || '').toLowerCase() === userEmail)
      : undefined
    const past = !isBookable(s.startISO)
    const status: 'free' | 'busy' | 'past' = booked ? 'busy' : past ? 'past' : 'free'
    const bookedBy = loggedIn && booked
      ? overlapping.map((e) => bookedByName(e.summary, e.note)).join(', ')
      : undefined
    const note = loggedIn && booked
      ? overlapping.map((e) => e.note).filter(Boolean).join(' · ') || undefined
      : undefined
    return {
      hour: s.hour,
      label: s.label,
      startISO: s.startISO,
      status,
      mine: Boolean(own),
      bookingId: own?.id,
      bookedBy,
      note,
      weather: weather.hours[s.hour] ?? null,
    }
  })

  return {
    date,
    today: todayStr(),
    maxDate: maxDateStr(),
    slots: result,
    weather: weather.day,
    config: { openHour: BOOKING.openHour, closeHour: BOOKING.closeHour, advanceDays: BOOKING.advanceDays },
  }
})
