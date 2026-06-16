import { google } from 'googleapis'
import bcrypt from 'bcryptjs'

/**
 * Mitglieder-Zugriff – Quelle ist das Google Sheet.
 * Ist keine Google-Config gesetzt (lokale Entwicklung), wird ein In-Memory-
 * Dev-Store mit Testdaten verwendet, damit alle Flows ohne Google testbar sind.
 */

export interface Member {
  rowNumber?: number // 1-basierte Zeile im Sheet (nur im Produktivpfad)
  name: string
  email: string
  passwordHash: string
  paid: boolean
  active: boolean
  role: 'member' | 'admin'
}

const SHEET_TAB = 'Mitglieder'
const RANGE = `${SHEET_TAB}!A1:Z2000`

function isGoogleConfigured() {
  const c = useRuntimeConfig()
  return Boolean(c.googleServiceAccountEmail && c.googlePrivateKey && c.googleSheetId)
}

function toBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  const s = String(v).trim().toLowerCase()
  return s === 'true' || s === 'wahr' || s === 'ja' || s === '1' || s === 'x'
}

function columnLetter(index: number): string {
  // 0 -> A, 25 -> Z, 26 -> AA
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
    // In Env-Variablen sind Zeilenumbrüche oft als \n escaped
    key: c.googlePrivateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

interface ColIndex {
  name: number
  email: number
  passwordHash: number
  paid: number
  active: number
  role: number
}
interface SheetLayout {
  members: Member[]
  colIndex: ColIndex
}
const EMPTY_COLS: ColIndex = { name: -1, email: -1, passwordHash: -1, paid: -1, active: -1, role: -1 }

async function readSheet(): Promise<SheetLayout> {
  const c = useRuntimeConfig()
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: c.googleSheetId,
    range: RANGE,
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
  const colIndex = {
    name: find('name'),
    email: find('email', 'e-mail'),
    passwordHash: find('passwordhash', 'password', 'passwort'),
    paid: find('paid', 'bezahlt'),
    active: find('active', 'aktiv'),
    role: find('role', 'rolle'),
  }

  const members: Member[] = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row) continue
    const email = String(row[colIndex.email] ?? '').trim()
    if (!email) continue
    members.push({
      rowNumber: r + 1,
      name: String(row[colIndex.name] ?? '').trim(),
      email,
      passwordHash: String(row[colIndex.passwordHash] ?? '').trim(),
      paid: toBool(row[colIndex.paid]),
      active: toBool(row[colIndex.active]),
      role: String(row[colIndex.role] ?? 'member').trim() === 'admin' ? 'admin' : 'member',
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
  const member = members.find((m) => m.email.toLowerCase() === needle)
  if (!member || !member.rowNumber || colIndex.passwordHash < 0) {
    throw createError({ statusCode: 500, statusMessage: 'Mitglied/Spalte nicht gefunden' })
  }
  const cell = `${SHEET_TAB}!${columnLetter(colIndex.passwordHash)}${member.rowNumber}`
  const sheets = getSheetsClient()
  await sheets.spreadsheets.values.update({
    spreadsheetId: c.googleSheetId,
    range: cell,
    valueInputOption: 'RAW',
    requestBody: { values: [[hash]] },
  })
}

export { isGoogleConfigured }
