import { z } from 'zod'

const schema = z.object({ id: z.string().min(1) })

/** Hält ein Match (offen oder im Aufbau) am Leben. Liefert den aktuellen Stand. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 422, statusMessage: 'Spiel-ID fehlt.' })

  const match = await heartbeatMatch(parsed.data.id, user.email)
  return { match, role: match ? roleInMatch(match, user.email) : null }
})
