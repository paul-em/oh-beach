import { z } from 'zod'

const schema = z.object({ id: z.string().min(1) })

/** Ein Match verlassen. Host -> Spiel wird entfernt, Gast -> Spiel wird wieder frei. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 422, statusMessage: 'Spiel-ID fehlt.' })

  await leaveMatch(parsed.data.id, user.email)
  return { ok: true }
})
