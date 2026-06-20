import { z } from 'zod'

// Nur selbst-bearbeitbare Felder. Funktion (Rolle) und Bezahlt-Status sind
// bewusst NICHT enthalten und können daher nicht über diese Route geändert werden.
// Alle Felder optional -> partielle Updates. E-Mail muss gültig bleiben (Login).
const schema = z.object({
  vorname: z.string().trim().min(1, 'Vorname darf nicht leer sein.').max(60).optional(),
  nachname: z.string().trim().min(1, 'Nachname darf nicht leer sein.').max(60).optional(),
  email: z.string().trim().email('Bitte eine gültige E-Mail angeben.').max(120).optional(),
  telefon: z.string().trim().max(40).optional(),
  wohnort: z.string().trim().max(80).optional(),
  talente: z.string().trim().max(200).optional(),
  skill: z.union([z.literal(1), z.literal(2), z.literal(3), z.null()]).optional(),
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || 'Ungültige Eingabe.'
    throw createError({ statusCode: 422, statusMessage: msg })
  }

  const updated = await updateMemberProfile(session.user.email, parsed.data)

  // Session nachziehen – Name/E-Mail können sich geändert haben. Rolle und
  // Bezahlt-Status kommen autoritativ aus dem Sheet (nicht aus dem Request).
  const member = await findMemberByEmail(updated.email)
  if (member) {
    await setUserSession(event, {
      user: { email: member.email, name: member.name, role: member.role, paid: member.paid },
    })
  }

  return { profile: updated }
})
