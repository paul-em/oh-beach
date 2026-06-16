# Externes Setup – O.H.BEACH

Diese Schritte sind einmalig nötig, um die App produktiv mit Google Sheets,
Google Calendar, Resend und Vercel zu verbinden. Lokal funktioniert ohne all das
der **Dev-Mock-Modus** (siehe README).

---

## 1. Google Cloud: Projekt & Service Account

1. In der [Google Cloud Console](https://console.cloud.google.com/) ein **neues Projekt** anlegen.
2. Unter **APIs & Dienste → Bibliothek** aktivieren:
   - **Google Sheets API**
   - **Google Calendar API**
3. Unter **APIs & Dienste → Anmeldedaten → Anmeldedaten erstellen → Dienstkonto**
   ein Service-Konto anlegen (Name z. B. `oh-beach-app`).
4. Beim Service-Konto unter **Schlüssel → Schlüssel hinzufügen → JSON** einen Key
   erzeugen und herunterladen. Daraus brauchst du:
   - `client_email` → `NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `NUXT_GOOGLE_PRIVATE_KEY`

> **Private Key in Env-Variablen:** Der Key enthält `\n`. In einer lokalen `.env`
> kannst du ihn als ein-Zeiler mit literalen `\n` setzen (die App ersetzt `\n` durch
> echte Zeilenumbrüche). In Vercel den Key entweder mit echten Zeilenumbrüchen oder
> als ein-Zeiler mit `\n` eintragen.

---

## 2. Mitglieder-Sheet (bestehendes Google-Form-Sheet)

Die App nutzt euer **bestehendes** Sheet mit den Formular-Antworten. Tab-Name standardmäßig
**`Form responses 1`** (über `NUXT_GOOGLE_SHEET_TAB` anpassbar, falls anders benannt).

Die App liest diese Spalten automatisch (Namen werden case-insensitiv erkannt):

| Spalte im Sheet | wird verwendet als |
|---|---|
| `Vorname` + `Nachname` | Anzeigename |
| `Funktion` | Rolle (enthält „Obmann/Vorstand/Kassier/…" → `admin`, sonst `member`) |
| `Bezahlt <aktuelles Jahr>` (z. B. `Bezahlt 2026`) | **bezahlt** → Buchungs-Freigabe |
| `Bezahlt <Vorjahr>` | zählt für „Login erlaubt" (aktuelles **oder** Vorjahr bezahlt) |

**Zwei Spalten müsst ihr noch ergänzen:**

1. **`E-Mail`** – Login-Kennung. Pflicht: Ohne E-Mail kann sich ein Mitglied nicht
   anmelden (Zeilen ohne E-Mail werden ignoriert).
   - Für bestehende Mitglieder die Adresse eintragen.
   - Im **Google Formular** „E-Mail-Adressen erfassen" aktivieren, damit neue Anmeldungen
     automatisch eine E-Mail-Spalte bekommen (`E-Mail-Adresse` wird ebenfalls erkannt).
2. **`PasswordHash`** – bleibt leer; wird von der App befüllt, sobald das Mitglied sein
   Passwort setzt.

Danach:

3. Sheet mit der **Service-Account-E-Mail** teilen (Rolle **Bearbeiter** – die App schreibt
   den Passwort-Hash zurück).
4. **Sheet-ID** aus der URL kopieren (`/spreadsheets/d/<ID>/edit`) → `NUXT_GOOGLE_SHEET_ID`.
5. Falls der Tab anders heißt → `NUXT_GOOGLE_SHEET_TAB` setzen.

> Ablauf: Neue Anmeldungen landen weiter über euer Formular im Sheet. Sobald
> `Bezahlt <Jahr>` abgehakt ist, kann sich das Mitglied über „Passwort setzen" anmelden.
> Wer (noch) nicht fürs laufende Jahr bezahlt hat, sieht im Login-Bereich einen Hinweis
> und kann erst nach Zahlungseingang reservieren.

> **Datenschutz:** Das Sheet enthält personenbezogene Daten und Passwort-Hashes –
> **nicht öffentlich teilen**, nur mit Service-Account und Vorstand.

---

## 3. Platzbelegungs-Kalender

1. In Google Calendar einen **neuen Kalender** anlegen (z. B. „O.H.BEACH Platz").
2. Unter **Einstellungen → Für bestimmte Personen freigeben** den Service-Account
   hinzufügen mit Berechtigung **„Änderungen an Terminen vornehmen"**.
3. Optional **öffentlich machen** (nur „Verfügbarkeit" oder „Alle Details"), falls ihr
   den Kalender zusätzlich einbetten wollt – für die App nicht nötig.
4. **Kalender-ID** aus den Kalendereinstellungen kopieren → `NUXT_GOOGLE_CALENDAR_ID`
   (sieht aus wie `...@group.calendar.google.com`).

---

## 4. Resend (E-Mail)

1. Account auf [resend.com](https://resend.com) anlegen.
2. Eure **Domain verifizieren** (DNS-Einträge). Ohne verifizierte Domain ist nur
   Test-Versand möglich.
3. **API-Key** erstellen → `NUXT_RESEND_API_KEY`.
4. Absenderadresse festlegen → `NUXT_EMAIL_FROM` (z. B. `no-reply@euer-verein.at`).

> Free Tier: ~100 E-Mails/Tag, 3.000/Monat – für einen Verein reichlich.

---

## 5. Vercel

1. Repo in Vercel importieren – Nuxt wird automatisch erkannt.
2. Unter **Settings → Environment Variables** alle `NUXT_*`-Variablen eintragen
   (siehe Tabelle im README), inkl. `NUXT_PUBLIC_SITE_URL` = eure echte Domain.
3. Deployen.

---

## Checkliste

- [ ] Sheets API + Calendar API aktiviert
- [ ] Service-Account-Key als Env-Variablen hinterlegt
- [ ] Sheet `Mitglieder` mit Kopfzeile, mit Service-Account geteilt (Bearbeiter)
- [ ] Kalender angelegt, mit Service-Account geteilt (Änderungen erlaubt)
- [ ] Resend-Domain verifiziert, API-Key + Absender gesetzt
- [ ] Alle `NUXT_*`-Variablen in Vercel hinterlegt
- [ ] Test: Mitglied im Sheet (`active`=ja) → „Passwort setzen" → Login → Reservieren
