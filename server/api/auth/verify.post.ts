import { z } from 'zod'

const schema = z.object({ token: z.string().min(10) })

export default defineEventHandler(async (event) => {
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'Ungültiger Anmelde-Link.' })
  }

  const { email } = await verifyLoginToken(parsed.data.token)
  const member = await findMemberByEmail(email)
  if (!member || !member.active) {
    throw createError({ statusCode: 400, statusMessage: 'Konto nicht gefunden oder nicht aktiv.' })
  }

  await setUserSession(event, {
    user: {
      email: member.email,
      name: member.name,
      role: member.role,
      paid: member.paid,
    },
  })
  return { ok: true }
})
