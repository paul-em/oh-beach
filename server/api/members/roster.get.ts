/**
 * Mitgliederliste für die Team-Auslosung. Nur für eingeloggte Mitglieder.
 * Gibt Anzeigename + Spielstärke (Skill) zurück – keine E-Mail-Adressen.
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const members = await listRoster()
  return { members }
})
