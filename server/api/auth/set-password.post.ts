import { z } from 'zod'
import bcrypt from 'bcryptjs'

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen haben.'),
})

export default defineEventHandler(async (event) => {
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.'
    throw createError({ statusCode: 422, statusMessage: msg })
  }

  const { email } = await verifyPasswordToken(parsed.data.token)
  const member = await findMemberByEmail(email)
  if (!member || !member.active) {
    throw createError({ statusCode: 400, statusMessage: 'Konto nicht gefunden oder nicht aktiv.' })
  }

  const hash = await bcrypt.hash(parsed.data.password, 10)
  await setMemberPasswordHash(email, hash)
  return { ok: true }
})
