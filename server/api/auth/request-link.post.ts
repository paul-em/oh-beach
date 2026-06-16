import { z } from 'zod'

const schema = z.object({ email: z.string().email() })

export default defineEventHandler(async (event) => {
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'Bitte eine gültige E-Mail angeben.' })
  }

  const member = await findMemberByEmail(parsed.data.email)
  // Nur an aktive Mitglieder versenden – Existenz wird nicht preisgegeben.
  if (member && member.active) {
    const token = await signPasswordToken(member.email)
    const base = useRuntimeConfig().public.siteUrl
    const link = `${base}/passwort/setzen?token=${encodeURIComponent(token)}`
    await sendPasswordLinkEmail(member.email, link)
  }

  return { ok: true }
})
