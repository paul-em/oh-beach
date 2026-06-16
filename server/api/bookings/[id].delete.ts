export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Keine Buchungs-ID.' })

  const ev = await getCourtEvent(id)
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Buchung nicht gefunden.' })

  // Nur eigene Buchungen dürfen storniert werden.
  if ((ev.memberEmail || '').toLowerCase() !== session.user.email.toLowerCase()) {
    throw createError({ statusCode: 403, statusMessage: 'Das ist nicht deine Buchung.' })
  }

  await deleteCourtEvent(id)
  return { ok: true }
})
