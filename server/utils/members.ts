import { google } from 'googleapis'
import bcrypt from 'bcryptjs'

/**
 * Mitglieder-Zugriff – Quelle ist das bestehende Google Sheet (Google-Form-Antworten).
 * Ist keine Google-Config gesetzt (lokale Entwicklung), wird ein In-Memory-
 * Dev-Store mit Testdaten verwendet, damit alle Flows ohne Google testbar sind.
 *
 * Erwartetes Sheet (Tab-Name via NUXT_GOOGLE_SHEET_TAB, Standard "Form responses 1"):
 *   Vorname | Nachname | E-Mail* | PasswordHash* | Funktion | Bezahlt <Jahr> | ...
 *   (*) Spalten "E-Mail" und "PasswordHash" müssen ergänzt werden.
 */

export interface Member {
  rowNumber?: number // 1-basierte Zeile im Sheet (nur im Produktivpfad)
  name: string
  email: string
  passwordHash: string
  paid: boolean // für das laufende Jahr bezahlt -> Buchungs-Freigabe
  active: boolean // laufendes oder Vorjahr bezahlt -> Login erlaubt
  role: 'member' | 'admin'
}

function getTab(): string {
  return useRuntimeConfig().googleSheetTab || 'Form responses 1'
}

function isGoogleConfigured() {
  const c = useRuntimeConfig()
  return Boolean(c.googleServiceAccountEmail && c.googlePrivateKey && c.googleSheetId)
}

function currentYear(): number {
  return Number(
    new Intl.DateTimeFormat('en', { timeZone: 'Europe/Vienna', year: 'numeric' }).format(new Date()),
  )
}

function toBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  const s = String(v).trim().toLowerCase()
  return s === 'true' || s === 'wahr' || s === 'ja' || s === '1' || s === 'x'
}

const ADMIN_FUNKTIONEN = /obmann|obfrau|vorstand|vorständ|kassier|kassa|schriftführ|präsident|leitung/

function columnLetter(index: number): string {
  let n = index
  let s = ''
  do {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return s
}

// ---- Google Sheets Implementierung ---------------------------------------

function getSheetsClient() {
  const c = useRuntimeConfig()
  const auth = new google.auth.JWT({
    email: c.googleServiceAccountEmail,
    key: c.googlePrivateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

interface ColIndex {
  vorname: number
  nachname: number
  email: number
  passwordHash: number
  paidCur: number
  paidPrev: number
  funktion: number
}
interface SheetLayout {
  members: Member[]
  colIndex: ColIndex
}
const EMPTY_COLS: ColIndex = {
  vorname: -1, nachname: -1, email: -1, passwordHash: -1, paidCur: -1, paidPrev: -1, funktion: -1,
}

async function readSheet(): Promise<SheetLayout> {
  const c = useRuntimeConfig()
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: c.googleSheetId,
    range: `'${getTab()}'!A1:Z2000`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  })
  const rows = (res.data.values || []) as unknown[][]
  const headerRow = rows[0]
  if (!headerRow) return { members: [], colIndex: EMPTY_COLS }

  const header = headerRow.map((h) => String(h ?? '').trim().toLowerCase())
  const find = (...names: string[]) => {
    for (const n of names) {
      const i = header.indexOf(n)
      if (i !== -1) return i
    }
    return -1
  }
  const y = currentYear()
  const colIndex: ColIndex = {
    vorname: find('vorname', 'first name'),
    nachname: find('nachname', 'last name'),
    email: find('email', 'e-mail', 'e-mail-adresse', 'email address', 'e-mail adresse'),
    passwordHash: find('passwordhash', 'password hash', 'password', 'passwort'),
    paidCur: find(`bezahlt ${y}`, 'bezahlt', 'paid'),
    paidPrev: find(`bezahlt ${y - 1}`),
    funktion: find('funktion', 'rolle', 'role'),
  }

  const get = (row: unknown[], idx: number) => (idx >= 0 ? row[idx] : undefined)

  const members: Member[] = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row) continue
    const email = String(get(row, colIndex.email) ?? '').trim()
    if (!email) continue // ohne E-Mail kein Login möglich -> Zeile überspringen

    const name = `${String(get(row, colIndex.vorname) ?? '').trim()} ${String(get(row, colIndex.nachname) ?? '').trim()}`.trim()
    const paid = toBool(get(row, colIndex.paidCur))
    const paidPrev = toBool(get(row, colIndex.paidPrev))
    const funktion = String(get(row, colIndex.funktion) ?? '').toLowerCase()

    members.push({
      rowNumber: r + 1,
      name: name || email,
      email,
      passwordHash: String(get(row, colIndex.passwordHash) ?? '').trim(),
      paid,
      active: paid || paidPrev,
      role: ADMIN_FUNKTIONEN.test(funktion) ? 'admin' : 'member',
    })
  }
  return { members, colIndex }
}

// ---- Dev In-Memory Store --------------------------------------------------

let devMembers: Member[] | null = null
function getDevMembers(): Member[] {
  if (!devMembers) {
    devMembers = [
      {
        name: 'Test Faultier',
        email: 'test@oh-beach.test',
        passwordHash: bcrypt.hashSync('beachvolley', 10),
        paid: true,
        active: true,
        role: 'member',
      },
      {
        // Mitglied ohne Passwort -> zum Testen des "Passwort setzen"-Flows
        name: 'Neue Spielerin',
        email: 'neu@oh-beach.test',
        passwordHash: '',
        paid: true,
        active: true,
        role: 'member',
      },
    ]
  }
  return devMembers
}

// ---- Öffentliche API ------------------------------------------------------

export async function findMemberByEmail(email: string): Promise<Member | null> {
  const needle = email.trim().toLowerCase()
  if (!isGoogleConfigured()) {
    return getDevMembers().find((m) => m.email.toLowerCase() === needle) ?? null
  }
  const { members } = await readSheet()
  return members.find((m) => m.email.toLowerCase() === needle) ?? null
}

export async function setMemberPasswordHash(email: string, hash: string): Promise<void> {
  const needle = email.trim().toLowerCase()
  if (!isGoogleConfigured()) {
    const m = getDevMembers().find((x) => x.email.toLowerCase() === needle)
    if (m) m.passwordHash = hash
    return
  }
  const c = useRuntimeConfig()
  const { members, colIndex } = await readSheet()
  if (colIndex.passwordHash < 0) {
    throw createError({ statusCode: 500, statusMessage: 'Spalte "PasswordHash" fehlt im Sheet.' })
  }
  const member = members.find((m) => m.email.toLowerCase() === needle)
  if (!member || !member.rowNumber) {
    throw createError({ statusCode: 500, statusMessage: 'Mitglied nicht gefunden.' })
  }
  const cell = `'${getTab()}'!${columnLetter(colIndex.passwordHash)}${member.rowNumber}`
  const sheets = getSheetsClient()
  await sheets.spreadsheets.values.update({
    spreadsheetId: c.googleSheetId,
    range: cell,
    valueInputOption: 'RAW',
    requestBody: { values: [[hash]] },
  })
}

export { isGoogleConfigured }
