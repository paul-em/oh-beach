import { Resend } from 'resend'

/**
 * E-Mail-Versand via Resend. Ohne API-Key (lokale Entwicklung) wird der Link
 * stattdessen in die Server-Konsole geschrieben, damit der Flow testbar bleibt.
 */
export async function sendPasswordLinkEmail(to: string, link: string): Promise<void> {
  const c = useRuntimeConfig()

  if (!c.resendApiKey || !c.emailFrom) {
    // eslint-disable-next-line no-console
    console.info(`\n[DEV E-Mail] Passwort-Link für ${to}:\n${link}\n`)
    return
  }

  const resend = new Resend(c.resendApiKey)
  await resend.emails.send({
    from: c.emailFrom,
    to,
    subject: 'Dein Passwort-Link für oh-beach',
    html: `
      <div style="font-family:sans-serif;line-height:1.6;color:#2a2a2a">
        <h2 style="color:#ff6b5c">oh-beach</h2>
        <p>Hallo!</p>
        <p>Über den folgenden Link kannst du dein Passwort setzen. Der Link ist 30 Minuten gültig:</p>
        <p>
          <a href="${link}" style="display:inline-block;background:#ff6b5c;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none">
            Passwort setzen
          </a>
        </p>
        <p style="font-size:13px;color:#7a6f5d">Wenn du das nicht angefordert hast, ignoriere diese E-Mail einfach.</p>
      </div>
    `,
  })
}
