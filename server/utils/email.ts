import { Resend } from 'resend'

/**
 * E-Mail-Versand via Resend. Ohne API-Key (lokale Entwicklung) wird der Link
 * stattdessen in die Server-Konsole geschrieben, damit der Flow testbar bleibt.
 */

const REPLY_TO = 'info@oh-beach.at'

// Footer-Daten = Impressum (§ 5 ECG). Eine echte Absender-Identität samt
// Postadresse ist ein wichtiges Positiv-Signal gegen Spam-Einstufung.
const ORG = {
  name: 'O.H. Beach',
  street: 'Gartenstraße 1',
  city: '4625 Offenhausen, Österreich',
  email: 'info@oh-beach.at',
}

const BRAND = '#ff6b5c'
const INK = '#2a2a2a'
const MUTED = '#7a6f5d'

function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return 'oh-beach.at'
  }
}

function buildText(to: string, link: string): string {
  const host = hostOf(link)
  return [
    'O.H. BEACH',
    '',
    'Hallo!',
    '',
    `Du hast einen Login-Link für O.H. Beach angefordert (für ${to}).`,
    `Öffne den folgenden Link, um dich anzumelden – du wirst zu ${host} weitergeleitet.`,
    'Der Link ist 30 Minuten gültig:',
    '',
    link,
    '',
    'Wenn du das nicht angefordert hast, ignoriere diese E-Mail einfach –',
    'es wird kein Konto erstellt und nichts verändert.',
    '',
    '—',
    `${ORG.name} · ${ORG.street} · ${ORG.city}`,
    `Fragen? Antworte einfach auf diese E-Mail oder schreib an ${ORG.email}.`,
  ].join('\n')
}

function buildHtml(to: string, link: string): string {
  const host = hostOf(link)
  // Vollständiges HTML-Dokument inkl. charset + Preheader (versteckter
  // Vorschautext). Unvollständiges HTML wird von Filtern leicht abgewertet.
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Dein Login-Link für O.H. Beach</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ef">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f5f3ef">Dein Login-Link für O.H. Beach – 30 Minuten gültig.</span>
  <div style="max-width:480px;margin:0 auto;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:${INK}">
    <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND}">O.H. Beach</h1>
    <p style="margin:0 0 12px">Hallo!</p>
    <p style="margin:0 0 12px">
      Du hast einen Login-Link für <strong>O.H. Beach</strong> angefordert
      (für ${to}). Mit einem Klick auf den Button meldest du dich an –
      du wirst zu <strong>${host}</strong> weitergeleitet. Der Link ist
      30&nbsp;Minuten gültig:
    </p>
    <p style="margin:0 0 20px">
      <a href="${link}" style="display:inline-block;background:${BRAND};color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600">
        Jetzt anmelden
      </a>
    </p>
    <p style="margin:0 0 20px;font-size:13px;color:${MUTED}">
      Wenn du das nicht angefordert hast, ignoriere diese E-Mail einfach –
      es wird kein Konto erstellt und nichts verändert.
    </p>
    <hr style="border:none;border-top:1px solid #e3ded6;margin:24px 0">
    <p style="margin:0;font-size:12px;color:${MUTED}">
      ${ORG.name} · ${ORG.street} · ${ORG.city}<br>
      Fragen? Antworte einfach auf diese E-Mail oder schreib an
      <a href="mailto:${ORG.email}" style="color:${MUTED}">${ORG.email}</a>.
    </p>
  </div>
</body>
</html>`
}

export async function sendLoginLinkEmail(to: string, link: string): Promise<void> {
  const c = useRuntimeConfig()

  if (!c.resendApiKey || !c.emailFrom) {
    // eslint-disable-next-line no-console
    console.info(`\n[DEV E-Mail] Login-Link für ${to}:\n${link}\n`)
    return
  }

  const resend = new Resend(c.resendApiKey)
  await resend.emails.send({
    from: c.emailFrom,
    to,
    replyTo: REPLY_TO,
    subject: 'Dein Login-Link für O.H. Beach',
    text: buildText(to, link),
    html: buildHtml(to, link),
  })
}
