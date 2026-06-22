import { z } from 'zod'

const schema = z.object({ id: z.string().min(1) })

/** Einem offenen Spiel als Gast beitreten. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 422, statusMessage: 'Spiel-ID fehlt.' })

  const match = await joinMatch(parsed.data.id, { email: user.email, name: user.name })
  return { match }
})
