import { z } from 'zod'

const schema = z.object({
  date: z.string(),
  hour: z.number().int().min(0).max(23),
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.paid === false) {
    throw createError({ statusCode: 403, statusMessage: 'Reservierung erst nach Zahlungseingang möglich.' })
  }

  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success || !isValidDateStr(parsed.data.date)) {
    throw createError({ statusCode: 422, statusMessage: 'Ungültige Buchung.' })
  }

  const slot = generateSlots(parsed.data.date).find((s) => s.hour === parsed.data.hour)
  if (!slot) throw createError({ statusCode: 422, statusMessage: 'Diesen Slot gibt es nicht.' })
  if (!isBookable(slot.startISO)) {
    throw createError({ statusCode: 422, statusMessage: 'Dieser Slot liegt außerhalb des Buchungsfensters.' })
  }

  // Doppelbuchung verhindern: unmittelbar vor dem Anlegen erneut prüfen.
  const existing = await listCourtEvents(slot.startISO, slot.endISO)
  const overlapping = existing.filter((e) => e.startISO < slot.endISO && e.endISO > slot.startISO)
  if (overlapping.length >= BOOKING.courtCount) {
    throw createError({ statusCode: 409, statusMessage: 'Dieser Slot ist gerade belegt worden.' })
  }

  const ev = await createCourtEvent({
    startISO: slot.startISO,
    endISO: slot.endISO,
    memberEmail: session.user.email,
    memberName: session.user.name,
  })

  return { ok: true, bookingId: ev.id }
})
