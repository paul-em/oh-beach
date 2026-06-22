import { z } from 'zod'

const schema = z.object({
  id: z.string().min(1),
  type: z.enum(['offer', 'answer', 'ice']),
  data: z.unknown(),
})

/**
 * Eine Signaling-Nachricht (Offer/Answer/ICE) an die Gegenseite ablegen.
 * Die Rolle wird serverseitig aus der Session bestimmt – Absender kann also
 * nicht in fremde Postfächer schreiben.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 422, statusMessage: 'Ungültige Signaling-Nachricht.' })

  const match = await getMatch(parsed.data.id)
  if (!match) throw createError({ statusCode: 404, statusMessage: 'Spiel nicht gefunden.' })

  const myRole = roleInMatch(match, user.email)
  if (!myRole) throw createError({ statusCode: 403, statusMessage: 'Du gehörst nicht zu diesem Spiel.' })

  const to = myRole === 'host' ? 'guest' : 'host'
  await postSignal(parsed.data.id, to, parsed.data.type, parsed.data.data)
  return { ok: true }
})
