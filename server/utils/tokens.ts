import { SignJWT, jwtVerify } from 'jose'

/**
 * Signierte, kurzlebige Tokens für den Magic-Link-Login (stateless, kein DB).
 */

const PURPOSE = 'login'

function getSecret(): Uint8Array {
  const c = useRuntimeConfig()
  const secret = c.authTokenSecret
  if (!secret || secret.length < 16) {
    throw createError({ statusCode: 500, statusMessage: 'AUTH_TOKEN_SECRET fehlt/zu kurz' })
  }
  return new TextEncoder().encode(secret)
}

export async function signLoginToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), purpose: PURPOSE })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(getSecret())
}

export async function verifyLoginToken(token: string): Promise<{ email: string }> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.purpose !== PURPOSE || typeof payload.email !== 'string') {
      throw new Error('invalid')
    }
    return { email: payload.email }
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Link ungültig oder abgelaufen' })
  }
}
