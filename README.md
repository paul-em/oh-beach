# O.H.BEACH – Vereinswebsite

Website des Beachvolleyball-Vereins **O.H.BEACH**: öffentliche Infoseiten plus ein
Mitgliederbereich zum Reservieren des Sandplatzes – **ganz ohne eigene Datenbank**.
Mitglieder liegen in einem Google Sheet, Reservierungen in einem Google Calendar.

## Tech-Stack

- **Nuxt 4** (Vue 3) – SSR/SSG + Server-Routen (Nitro)
- **Tailwind CSS v4** + **shadcn-vue** (reka-ui) – UI & Design-System
- **nuxt-auth-utils** – Login-Sessions über versiegelte Cookies (ohne DB)
- **googleapis** – Google Sheets (Mitglieder) & Google Calendar (Reservierungen)
- **Resend** – E-Mails für Passwort-Links · **jose** – signierte Einmal-Links · **bcryptjs** – Passwort-Hashing
- Hosting: **Vercel** (Free Tier)

## Features

- One-Pager-Landingpage, Statuten, Impressum, Datenschutz (DSGVO-Gerüst)
- Öffentliche Platzbelegung (`/kalender`) – frei/belegt ohne Namensnennung
- Mitglieder-Login, Passwort-Setzen/-Reset per E-Mail-Link
- Platzreservierung in festen Stundenslots (08–22 Uhr, 14 Tage Vorlauf) inkl. Storno
- Design-System „Sunny Beach" + Styleguide unter `/styleguide`
- Beach-Blobby (`/mitglieder/spiel`) – Mini-Volleyball, lokal zu zweit **oder online** gegen andere Mitglieder (WebRTC P2P)

## Lokale Entwicklung

```bash
npm install
cp .env.example .env   # Dev-Secrets generieren (siehe unten) oder leer lassen
npm run dev            # http://localhost:3000
```

### Dev-Mock-Modus (ohne Google/Resend)

Ist **keine** Google-Konfiguration gesetzt, nutzt die App automatisch einen
**In-Memory-Mitglieder- und Reservierungsstore** – so sind alle Flows lokal testbar.
Ohne Resend-Key wird der Passwort-Link in die **Server-Konsole** geschrieben.

Test-Logins im Dev-Mock:

| E-Mail | Passwort | Zweck |
|---|---|---|
| `test@oh-beach.test` | `beachvolley` | Login & Reservieren |
| `neu@oh-beach.test` | – (kein Passwort) | „Passwort setzen"-Flow testen |

Mindestens nötig in `.env` für den Dev-Mock:

```bash
NUXT_SESSION_PASSWORD=<min. 32 zufällige Zeichen>
NUXT_AUTH_TOKEN_SECRET=<zufälliges Secret>
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

(Beide Secrets z. B. via `openssl rand -hex 24` erzeugen.)

## Environment-Variablen

| Variable | Zweck |
|---|---|
| `NUXT_SESSION_PASSWORD` | Verschlüsselung des Login-Cookies (min. 32 Zeichen) |
| `NUXT_AUTH_TOKEN_SECRET` | Signieren der Passwort-Einmal-Links |
| `NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service-Account-E-Mail |
| `NUXT_GOOGLE_PRIVATE_KEY` | Service-Account-Private-Key (`\n` escaped) |
| `NUXT_GOOGLE_SHEET_ID` | ID des Mitglieder-Sheets |
| `NUXT_GOOGLE_CALENDAR_ID` | ID des Platzbelegungs-Kalenders |
| `NUXT_RESEND_API_KEY` | Resend API-Key (E-Mail-Versand) |
| `NUXT_EMAIL_FROM` | Absenderadresse (verifizierte Domain) |
| `NUXT_PUBLIC_SITE_URL` | Öffentliche Basis-URL (Links in E-Mails) |
| `NUXT_PUBLIC_JOIN_FORM_URL` | Link zum bestehenden Google-Anmeldeformular |
| `NUXT_PUBLIC_ICE_SERVERS` | *(optional)* JSON-Array mit ICE-Servern fürs Online-Spiel (inkl. TURN). Standard: öffentliche Google-STUN-Server |

➡️ **Externes Setup (Google Cloud, Sheet-Vorlage, Resend, Vercel):** siehe [`docs/SETUP.md`](docs/SETUP.md).

### Online-Spiel (Beach-Blobby): geteilter Zustand für Lobby & Signaling

Das Online-Spiel läuft Peer-to-Peer (WebRTC); der Server vermittelt nur Lobby
und Verbindungsaufbau (Signaling) über `server/api/play/*`. Dieser Zustand liegt
in Nitros Storage (`useStorage('play')`).

- **Lokal/Dev:** funktioniert sofort (In-Memory).
- **Produktion auf Vercel:** Serverless-Functions sind zustandslos – damit beide
  Spieler dieselben Daten sehen, muss ein **geteilter Storage-Treiber** unter dem
  Mount `play` konfiguriert werden, z. B. Vercel KV / Upstash Redis. Beispiel in
  `nuxt.config.ts`:

  ```ts
  nitro: {
    storage: {
      play: { driver: 'upstash' /* oder 'vercelKV' */ },
    },
  }
  ```

  Ohne geteilten Treiber findet das Matchmaking online keine Gegenspieler.
  Für zuverlässige Verbindungen über restriktive Netze zusätzlich einen
  TURN-Server via `NUXT_PUBLIC_ICE_SERVERS` hinterlegen.

## Design-System „Sunny Beach"

- Quelle der Wahrheit: [`app/assets/css/tailwind.css`](app/assets/css/tailwind.css) (CSS-Variablen)
- Maschinenlesbare Spiegelung für Marketing: [`design/tokens.json`](design/tokens.json)
- Lebende Doku: Route **`/styleguide`**
- Logo: `public/Logo-OHBeach*.png`, Komponente `BrandLogo` (`emblem` = Header, voll = Footer)
- Maskottchen „Faultier": `FaultierMascot` (Platzhalter-SVG, später durch finale Illustration ersetzbar)

## Buchungsregeln

Zentral in [`server/utils/booking-rules.ts`](server/utils/booking-rules.ts): Öffnungszeiten,
Slot-Länge, Anzahl Plätze, Vorlauf-Fenster, Zeitzone (`Europe/Vienna`). Standard:
1 Platz, 08–22 Uhr, Stundenslots, 14 Tage Vorlauf.

## Skripte

```bash
npm run dev        # Entwicklungsserver
npm run build      # Production-Build (.output)
npm run preview    # Production-Build lokal testen
npm run typecheck  # TypeScript-Prüfung (vue-tsc)
```

## Deployment (Vercel)

1. Repo mit Vercel verbinden – Nuxt wird automatisch erkannt (Nitro-Vercel-Preset).
2. Alle `NUXT_*`-Variablen unter **Settings → Environment Variables** eintragen
   (insb. `NUXT_GOOGLE_PRIVATE_KEY` mit korrekten Zeilenumbrüchen, siehe `docs/SETUP.md`).
3. Deployen. Build-Command/Output werden von Vercel automatisch gesetzt.

## Hinweis zu Rechtstexten

Statuten, Impressum und Datenschutzerklärung sind **Platzhalter-Gerüste** und müssen vom
Verein mit echten Daten befüllt und rechtlich geprüft werden.
