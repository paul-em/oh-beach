<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
useSeoMeta({ title: 'Datenschutzerklärung', description: 'Datenschutzerklärung des Vereins O.H.BEACH gemäß DSGVO.' })
</script>

<template>
  <LegalPage title="Datenschutzerklärung" updated="Juni 2026">
    <Alert class="not-prose mb-8">
      <AlertTitle>Hinweis</AlertTitle>
      <AlertDescription>
        Diese Erklärung bildet die tatsächlich eingesetzten Dienste ab und sollte
        vor Veröffentlichung rechtlich geprüft werden.
      </AlertDescription>
    </Alert>

    <h2>1. Verantwortlicher</h2>
    <p>
      Verantwortlich für die Datenverarbeitung ist O.H. Beach, Gartenstraße 1,
      4625 Offenhausen, E-Mail: info@oh-beach.at. Bei Fragen zum Datenschutz
      wende dich an diese Adresse.
    </p>

    <h2>2. Welche Daten wir verarbeiten</h2>
    <ul>
      <li><strong>Mitgliederdaten:</strong> Name, E-Mail-Adresse, Beitrittsdatum, Zahlungsstatus.</li>
      <li><strong>Zugangsdaten:</strong> ein <em>gehashtes</em> Passwort (das Klartext-Passwort wird nie gespeichert).</li>
      <li><strong>Reservierungsdaten:</strong> Name und Zeitraum der von dir gebuchten Platz-Slots.</li>
      <li><strong>Technische Daten:</strong> Server-Logs (IP-Adresse, Zeitpunkt) durch den Hosting-Anbieter.</li>
    </ul>

    <h2>3. Zwecke und Rechtsgrundlagen</h2>
    <ul>
      <li>Verwaltung der Mitgliedschaft und des Mitgliedsbeitrags (Art. 6 Abs. 1 lit. b DSGVO – Vertrag).</li>
      <li>Bereitstellung des Mitglieder-Logins und der Platzreservierung (Art. 6 Abs. 1 lit. b DSGVO).</li>
      <li>Anzeige der Platzbelegung (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO).</li>
    </ul>

    <h2>4. Eingesetzte Dienste (Auftragsverarbeiter)</h2>
    <p>Zur Bereitstellung der Website und ihrer Funktionen setzen wir folgende Dienste ein:</p>
    <ul>
      <li>
        <strong>Vercel Inc.</strong> – Hosting der Website. Dabei können Server-Logs
        (inkl. IP-Adresse) verarbeitet werden.
      </li>
      <li>
        <strong>Google Ireland Ltd. (Google Sheets &amp; Google Calendar):</strong>
        Speicherung der Mitgliederliste (Google Sheets) sowie der Platzreservierungen
        (Google Calendar).
      </li>
      <li>
        <strong>Resend (resend.com):</strong> Versand von E-Mails zum Setzen bzw.
        Zurücksetzen des Passworts.
      </li>
      <li>
        <strong>Cloudflare, Inc.:</strong> DNS-Hosting für unsere Domain. Der
        Proxy ist aktiviert, sodass der Datenverkehr über Cloudflare geleitet und
        zwischengespeichert (Caching) wird. Dabei können technische Daten
        (inkl. IP-Adresse) verarbeitet werden.
      </li>
    </ul>
    <p>
      Mit diesen Anbietern bestehen Auftragsverarbeitungsverträge. Soweit Daten in
      Drittländer (z. B. USA) übertragen werden, erfolgt dies auf Basis geeigneter
      Garantien (z. B. EU-Standardvertragsklauseln / Data Privacy Framework).
    </p>

    <h2>5. Cookies und Login-Sitzung</h2>
    <p>
      Für den Mitglieder-Login setzen wir ein technisch notwendiges, verschlüsseltes
      Sitzungs-Cookie. Es dient ausschließlich der Anmeldung und enthält keine
      Tracking-Informationen. Es werden keine Analyse- oder Marketing-Cookies gesetzt.
    </p>

    <h2>6. Speicherdauer</h2>
    <p>
      Mitgliederdaten werden für die Dauer der Mitgliedschaft und darüber hinaus im
      Rahmen gesetzlicher Aufbewahrungspflichten gespeichert. Reservierungsdaten werden
      spätestens 12 Monate nach dem gebuchten Termin gelöscht bzw. archiviert.
    </p>

    <h2>7. Deine Rechte</h2>
    <p>
      Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
      Verarbeitung, Datenübertragbarkeit und Widerspruch. Außerdem kannst du dich bei
      der österreichischen Datenschutzbehörde (dsb.gv.at) beschweren.
    </p>

    <h2>8. Kontakt in Datenschutzfragen</h2>
    <p>Schreib uns jederzeit an info@oh-beach.at.</p>
  </LegalPage>
</template>
