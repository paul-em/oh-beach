import { google } from 'googleapis'

/**
 * Mitglieder-Zugriff – Quelle ist das bestehende Google Sheet (Google-Form-Antworten).
 * Ist keine Google-Config gesetzt (lokale Entwicklung), wird ein In-Memory-
 * Dev-Store mit Testdaten verwendet, damit alle Flows ohne Google testbar sind.
 *
 * Login läuft passwortlos über Magic-Links – es genügt die E-Mail-Spalte.
 *
 * Erwartetes Sheet (Tab-Name via NUXT_GOOGLE_SHEET_TAB, Standard "Form responses 1"):
 *   Vorname | Nachname | E-Mail* | Funktion | Bezahlt <Jahr> | ...
 *   (*) Spalte "E-Mail" muss ergänzt werden.
 *
 * Zusätzlich gibt es außerordentliche Mitglieder in einem eigenen Tab
 * (NUXT_GOOGLE_SHEET_TAB_EXTRA, Standard "Ausserordentliche Mitglieder") mit den
 * Spalten Vorname | Nachname | E-Mail. Sie dürfen sich einloggen und buchen
 * (paid + active = true), sind aber nie Admins.
 */

export interface Member {
  rowNumber?: number // 1-basierte Zeile im Sheet (nur im Produktivpfad)
  name: string
  email: string
  paid: boolean // für das laufende Jahr bezahlt -> Buchungs-Freigabe
  active: boolean // laufendes oder Vorjahr bezahlt -> Login erlaubt
  role: 'member' | 'admin'
}

function getTab(): string {
  return useRuntimeConfig().googleSheetTab || 'Form responses 1'
}

function getExtraTab(): string {
  return useRuntimeConfig().googleSheetTabExtra || 'Ausserordentliche Mitglieder'
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
  paidCur: number
  paidPrev: number
  funktion: number
}
interface SheetLayout {
  members: Member[]
  colIndex: ColIndex
}
const EMPTY_COLS: ColIndex = {
  vorname: -1, nachname: -1, email: -1, paidCur: -1, paidPrev: -1, funktion: -1,
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
      paid,
      active: paid || paidPrev,
      role: ADMIN_FUNKTIONEN.test(funktion) ? 'admin' : 'member',
    })
  }
  return { members, colIndex }
}

/**
 * Außerordentliche Mitglieder aus eigenem Tab (Vorname | Nachname | E-Mail).
 * Sie sind immer login- und buchungsberechtigt (paid + active = true) und
 * werden nie als Admin behandelt. Fehlt der Tab, wird er stillschweigend
 * übersprungen, damit der reguläre Login weiter funktioniert.
 */
async function readExtraMembers(): Promise<Member[]> {
  const c = useRuntimeConfig()
  const sheets = getSheetsClient()
  let rows: unknown[][]
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: c.googleSheetId,
      range: `'${getExtraTab()}'!A1:Z2000`,
      valueRenderOption: 'UNFORMATTED_VALUE',
    })
    rows = (res.data.values || []) as unknown[][]
  } catch {
    return [] // Tab existiert (noch) nicht -> keine außerordentlichen Mitglieder
  }
  const headerRow = rows[0]
  if (!headerRow) return []

  const header = headerRow.map((h) => String(h ?? '').trim().toLowerCase())
  const find = (...names: string[]) => {
    for (const n of names) {
      const i = header.indexOf(n)
      if (i !== -1) return i
    }
    return -1
  }
  const cols = {
    vorname: find('vorname', 'first name'),
    nachname: find('nachname', 'last name'),
    email: find('email', 'e-mail', 'e-mail-adresse', 'email address', 'e-mail adresse'),
  }
  const get = (row: unknown[], idx: number) => (idx >= 0 ? row[idx] : undefined)

  const members: Member[] = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row) continue
    const email = String(get(row, cols.email) ?? '').trim()
    if (!email) continue

    const name = `${String(get(row, cols.vorname) ?? '').trim()} ${String(get(row, cols.nachname) ?? '').trim()}`.trim()
    members.push({
      rowNumber: r + 1,
      name: name || email,
      email,
      paid: true,
      active: true,
      role: 'member',
    })
  }
  return members
}

// ---- Dev In-Memory Store --------------------------------------------------

let devMembers: Member[] | null = null
function getDevMembers(): Member[] {
  if (!devMembers) {
    devMembers = [
      {
        name: 'Test Faultier',
        email: 'test@oh-beach.test',
        paid: true,
        active: true,
        role: 'member',
      },
      {
        name: 'Neue Spielerin',
        email: 'neu@oh-beach.test',
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
  // Reguläre Mitglieder haben Vorrang (echter Bezahl-/Admin-Status).
  const regular = members.find((m) => m.email.toLowerCase() === needle)
  if (regular) return regular

  const extra = await readExtraMembers()
  return extra.find((m) => m.email.toLowerCase() === needle) ?? null
}

export { isGoogleConfigured }
