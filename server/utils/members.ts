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
  // Spielstärke aus der Sheet-Spalte "Skill": 1 = Liga-Spieler (stärkster),
  // 2 = guter, gezielter Angreifer, 3 = gute Ballkontrolle. null = keine Wertung.
  skill: 1 | 2 | 3 | null
}

/** Eintrag für die Team-Auslosung – nur Anzeigename und Spielstärke. */
export interface RosterEntry {
  name: string
  skill: 1 | 2 | 3 | null
}

/**
 * Vom Mitglied selbst bearbeitbares Profil. Bewusst NICHT enthalten und damit
 * nicht selbst änderbar: Funktion (Admin-Rolle) und Bezahlt-Status – diese
 * pflegt nur der Vorstand.
 */
export interface MemberProfile {
  vorname: string
  nachname: string
  email: string
  telefon: string
  wohnort: string
  talente: string
  skill: 1 | 2 | 3 | null
}

/** Welche Profilfelder ein Mitglied per API setzen darf (partielle Updates). */
export type MemberProfilePatch = Partial<MemberProfile>

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

/**
 * Skill-Wert aus einer Sheet-Zelle lesen. Akzeptiert Zahlen (1/2/3) ebenso wie
 * Text mit führender Ziffer (z. B. "1 - Liga-Spieler"). Alles andere -> null.
 */
function toSkill(v: unknown): 1 | 2 | 3 | null {
  if (v === null || v === undefined || v === '') return null
  const m = String(v).trim().match(/[123]/)
  if (!m) return null
  return Number(m[0]) as 1 | 2 | 3
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
  paidCur: number
  paidPrev: number
  funktion: number
  skill: number
}
interface SheetLayout {
  members: Member[]
  colIndex: ColIndex
}
const EMPTY_COLS: ColIndex = {
  vorname: -1, nachname: -1, email: -1, paidCur: -1, paidPrev: -1, funktion: -1, skill: -1,
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
    skill: find('skill', 'spielstärke', 'stärke', 'level'),
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
      skill: toSkill(get(row, colIndex.skill)),
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
interface ExtraLayout {
  members: Member[]
  skillCol: number // -1, falls der Tab keine Skill-Spalte hat
}

async function readExtraMembers(): Promise<ExtraLayout> {
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
    return { members: [], skillCol: -1 } // Tab existiert (noch) nicht
  }
  const headerRow = rows[0]
  if (!headerRow) return { members: [], skillCol: -1 }

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
    skill: find('skill', 'spielstärke', 'stärke', 'level'),
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
      skill: toSkill(get(row, cols.skill)),
    })
  }
  return { members, skillCol: cols.skill }
}

// ---- Dev In-Memory Store --------------------------------------------------
// Eine einzige Quelle: vollständige Profile inkl. Bezahl-/Rollen-Status. Daraus
// werden sowohl die Auth-Member (getDevMembers) als auch die Profile abgeleitet,
// damit Profil-Änderungen im Dev-Betrieb überall konsistent sichtbar sind.

interface DevRecord extends MemberProfile {
  paid: boolean
  active: boolean
  role: 'member' | 'admin'
}

let devStore: DevRecord[] | null = null
function getDevStore(): DevRecord[] {
  if (!devStore) {
    const base = (vorname: string, nachname: string, email: string, skill: 1 | 2 | 3 | null): DevRecord => ({
      vorname, nachname, email, telefon: '', wohnort: '', talente: '', skill,
      paid: true, active: true, role: 'member',
    })
    devStore = [
      { ...base('Test', 'Faultier', 'test@oh-beach.test', 1), telefon: '0660 1234567', wohnort: 'Offenhausen', talente: 'Maschine' },
      base('Neue', 'Spielerin', 'neu@oh-beach.test', 2),
      base('Anna', 'Angriff', 'anna@oh-beach.test', 2),
      base('Bernd', 'Block', 'bernd@oh-beach.test', 3),
      base('Carla', 'Control', 'carla@oh-beach.test', 3),
      base('David', 'Diagonal', 'david@oh-beach.test', 1),
      base('Eva', 'Effizient', 'eva@oh-beach.test', null),
      base('Felix', 'Flink', 'felix@oh-beach.test', 2),
    ]
  }
  return devStore
}

function devToMember(r: DevRecord): Member {
  return {
    name: `${r.vorname} ${r.nachname}`.trim() || r.email,
    email: r.email,
    paid: r.paid,
    active: r.active,
    role: r.role,
    skill: r.skill,
  }
}

function getDevMembers(): Member[] {
  return getDevStore().map(devToMember)
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
  return extra.members.find((m) => m.email.toLowerCase() === needle) ?? null
}

/** Spaltenindex (0-basiert) -> A1-Buchstabe, z. B. 0 -> "A", 27 -> "AB". */
function colLetter(idx: number): string {
  let n = idx + 1
  let s = ''
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

// ---- Profil lesen / schreiben ---------------------------------------------

interface ProfileCols {
  vorname: number
  nachname: number
  email: number
  telefon: number
  wohnort: number
  talente: number
  skill: number
}

function findProfileCols(header: string[]): ProfileCols {
  const find = (...names: string[]) => {
    for (const n of names) {
      const i = header.indexOf(n)
      if (i !== -1) return i
    }
    return -1
  }
  return {
    vorname: find('vorname', 'first name'),
    nachname: find('nachname', 'last name'),
    email: find('email', 'e-mail', 'e-mail-adresse', 'email address', 'e-mail adresse'),
    telefon: find('telefonnummer', 'telefon', 'handynummer', 'mobil', 'phone'),
    wohnort: find('wohnort', 'ort', 'stadt', 'city'),
    talente: find('deine talente', 'talente', 'talents'),
    skill: find('skill', 'spielstärke', 'stärke', 'level'),
  }
}

async function readTabRows(tab: string): Promise<unknown[][]> {
  const c = useRuntimeConfig()
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: c.googleSheetId,
    range: `'${tab}'!A1:Z2000`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  })
  return (res.data.values || []) as unknown[][]
}

interface ProfileLocation {
  tab: string
  rowNumber: number // 1-basiert
  cols: ProfileCols
  row: unknown[]
}

/** Findet die Zeile eines Mitglieds anhand der E-Mail – im Haupt- und Extra-Tab. */
async function locateProfile(email: string): Promise<ProfileLocation | null> {
  const needle = email.trim().toLowerCase()
  for (const tab of [getTab(), getExtraTab()]) {
    let rows: unknown[][]
    try {
      rows = await readTabRows(tab)
    } catch {
      continue // Tab existiert nicht (z. B. Extra-Tab) -> nächster
    }
    const headerRow = rows[0]
    if (!headerRow) continue
    const header = headerRow.map((h) => String(h ?? '').trim().toLowerCase())
    const cols = findProfileCols(header)
    if (cols.email < 0) continue
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row) continue
      if (String(row[cols.email] ?? '').trim().toLowerCase() === needle) {
        return { tab, rowNumber: r + 1, cols, row }
      }
    }
  }
  return null
}

/** Vollständiges Profil eines Mitglieds (für die eigene Bearbeitung). */
export async function getMemberProfile(email: string): Promise<MemberProfile | null> {
  const needle = email.trim().toLowerCase()
  if (!isGoogleConfigured()) {
    const r = getDevStore().find((m) => m.email.toLowerCase() === needle)
    if (!r) return null
    const { vorname, nachname, email: e, telefon, wohnort, talente, skill } = r
    return { vorname, nachname, email: e, telefon, wohnort, talente, skill }
  }
  const loc = await locateProfile(needle)
  if (!loc) return null
  const { row, cols } = loc
  const str = (i: number) => (i >= 0 ? String(row[i] ?? '').trim() : '')
  return {
    vorname: str(cols.vorname),
    nachname: str(cols.nachname),
    email: str(cols.email),
    telefon: str(cols.telefon),
    wohnort: str(cols.wohnort),
    talente: str(cols.talente),
    skill: toSkill(cols.skill >= 0 ? row[cols.skill] : undefined),
  }
}

/**
 * Eigenes Profil aktualisieren. Schreibt nur die übergebenen Felder in die
 * eigene Sheet-Zeile. Liefert das aktualisierte Profil zurück.
 * Felder ohne passende Spalte im Sheet werden stillschweigend übersprungen.
 */
export async function updateMemberProfile(email: string, patch: MemberProfilePatch): Promise<MemberProfile> {
  const needle = email.trim().toLowerCase()

  if (!isGoogleConfigured()) {
    const r = getDevStore().find((m) => m.email.toLowerCase() === needle)
    if (!r) throw createError({ statusCode: 404, statusMessage: 'Mitglied nicht gefunden.' })
    Object.assign(r, patch)
    const { vorname, nachname, email: e, telefon, wohnort, talente, skill } = r
    return { vorname, nachname, email: e, telefon, wohnort, talente, skill }
  }

  const loc = await locateProfile(needle)
  if (!loc) throw createError({ statusCode: 404, statusMessage: 'Mitglied nicht gefunden.' })

  const c = useRuntimeConfig()
  const sheets = getSheetsClient()
  const { tab, rowNumber, cols } = loc

  const cellValue = (key: keyof MemberProfile): string | number => {
    const v = patch[key]
    if (key === 'skill') return v == null ? '' : (v as number)
    return v == null ? '' : String(v).trim()
  }

  const data: { range: string; values: (string | number)[][] }[] = []
  ;(Object.keys(patch) as (keyof MemberProfile)[]).forEach((key) => {
    const col = cols[key]
    if (col < 0) return // Spalte fehlt im Sheet -> überspringen
    data.push({ range: `'${tab}'!${colLetter(col)}${rowNumber}`, values: [[cellValue(key)]] })
  })

  if (data.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: c.googleSheetId,
      requestBody: { valueInputOption: 'RAW', data },
    })
  }

  const updated = await getMemberProfile(patch.email ?? needle)
  if (!updated) throw createError({ statusCode: 500, statusMessage: 'Profil konnte nach dem Speichern nicht gelesen werden.' })
  return updated
}

/**
 * Mitgliederliste für die Team-Auslosung: ALLE Mitglieder mit Namen aus Haupt-
 * und Extra-Tab – unabhängig davon, ob eine E-Mail hinterlegt oder der Beitrag
 * bezahlt ist. (Die strengeren Auth-Filter in readSheet gelten nur fürs Login;
 * für die Anwesenheits-Auswahl wollen wir wirklich jeden sehen.)
 * Liefert nur Anzeigename + Spielstärke, nach Name dedupliziert und sortiert.
 */
export async function listRoster(): Promise<RosterEntry[]> {
  if (!isGoogleConfigured()) {
    return getDevMembers()
      .map((m) => ({ name: m.name, skill: m.skill }))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }

  const out: RosterEntry[] = []
  const seen = new Set<string>()
  for (const tab of [getTab(), getExtraTab()]) {
    let rows: unknown[][]
    try {
      rows = await readTabRows(tab)
    } catch {
      continue // Tab existiert nicht -> nächster
    }
    const headerRow = rows[0]
    if (!headerRow) continue
    const header = headerRow.map((h) => String(h ?? '').trim().toLowerCase())
    const cols = findProfileCols(header)
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row) continue
      const vorname = cols.vorname >= 0 ? String(row[cols.vorname] ?? '').trim() : ''
      const nachname = cols.nachname >= 0 ? String(row[cols.nachname] ?? '').trim() : ''
      const name = `${vorname} ${nachname}`.trim()
      if (!name) continue // Zeilen ohne Namen (z. B. Leerzeilen) überspringen
      const key = name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ name, skill: toSkill(cols.skill >= 0 ? row[cols.skill] : undefined) })
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, 'de'))
}

export { isGoogleConfigured }
