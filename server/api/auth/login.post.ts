import { z } from 'zod'
import bcrypt from 'bcryptjs'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'Bitte E-Mail und Passwort angeben.' })
  }

  const member = await findMemberByEmail(parsed.data.email)
  const fail = () => createError({ statusCode: 401, statusMessage: 'E-Mail oder Passwort ist falsch.' })

  // Generische Fehlermeldung; kein Hinweis, ob die E-Mail existiert.
  if (!member || !member.active || !member.passwordHash) throw fail()
  const ok = await bcrypt.compare(parsed.data.password, member.passwordHash)
  if (!ok) throw fail()

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
