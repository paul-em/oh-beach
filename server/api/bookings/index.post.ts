import { z } from 'zod'

const schema = z.object({
  date: z.string(),
  hours: z.array(z.number().int().min(0).max(23)).min(1).max(24),
  note: z.string().trim().max(140).optional(),
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

  // Stunden sortieren, deduplizieren und auf einen zusammenhängenden Block prüfen.
  const hours = [...new Set(parsed.data.hours)].sort((a, b) => a - b)
  const contiguous = hours.every((h, i) => i === 0 || h === hours[i - 1]! + 1)
  if (!contiguous) throw createError({ statusCode: 422, statusMessage: 'Nur zusammenhängende Slots buchbar.' })

  const slots = generateSlots(parsed.data.date)
  const first = slots.find((s) => s.hour === hours[0])
  const last = slots.find((s) => s.hour === hours[hours.length - 1])
  if (!first || !last) throw createError({ statusCode: 422, statusMessage: 'Diese Slots gibt es nicht.' })
  if (!isBookable(first.startISO) || !isBookable(last.startISO)) {
    throw createError({ statusCode: 422, statusMessage: 'Diese Slots liegen außerhalb des Buchungsfensters.' })
  }

  // Doppelbuchung verhindern: gesamten Block unmittelbar vor dem Anlegen erneut prüfen.
  const existing = await listCourtEvents(first.startISO, last.endISO)
  const overlapping = existing.filter((e) => e.startISO < last.endISO && e.endISO > first.startISO)
  if (overlapping.length >= BOOKING.courtCount) {
    throw createError({ statusCode: 409, statusMessage: 'Mindestens ein Slot ist gerade belegt worden.' })
  }

  const ev = await createCourtEvent({
    startISO: first.startISO,
    endISO: last.endISO,
    memberEmail: session.user.email,
    memberName: session.user.name,
    note: parsed.data.note,
  })

  return { ok: true, bookingId: ev.id }
})
