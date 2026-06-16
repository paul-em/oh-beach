<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
useSeoMeta({ title: 'Impressum', description: 'Impressum und Offenlegung des Vereins O.H.BEACH.' })
</script>

<template>
  <LegalPage title="Impressum" updated="[Datum eintragen]">
    <Alert class="not-prose mb-8">
      <AlertTitle>Platzhalter-Vorlage</AlertTitle>
      <AlertDescription>
        Bitte mit den echten Vereinsdaten befüllen (Offenlegung gem. § 25 MedienG
        und § 5 ECG). Im Zweifel rechtlich prüfen lassen.
      </AlertDescription>
    </Alert>

    <h2>Medieninhaber &amp; Herausgeber</h2>
    <p>
      [Vereinsname]<br />
      [Straße Nr.]<br />
      [PLZ Ort], Österreich
    </p>

    <h2>Vereinsdaten</h2>
    <ul>
      <li><strong>ZVR-Zahl:</strong> [ZVR-Zahl]</li>
      <li><strong>Vereinssitz:</strong> [Ort]</li>
      <li><strong>Vereinszweck:</strong> Förderung und Ausübung des Beachvolleyballsports</li>
      <li><strong>Vertretungsbefugte Organe:</strong> [Obmann/Obfrau, Schriftführer:in, Kassier:in]</li>
    </ul>

    <h2>Kontakt</h2>
    <ul>
      <li><strong>E-Mail:</strong> [kontakt@verein.at]</li>
      <li><strong>Telefon:</strong> [optional]</li>
    </ul>

    <h2>Haftung für Inhalte</h2>
    <p>
      Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die
      Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr
      übernommen.
    </p>

    <h2>Haftung für Links</h2>
    <p>
      Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir
      keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der
      jeweilige Anbieter oder Betreiber verantwortlich.
    </p>

    <h2>Urheberrecht</h2>
    <p>
      Inhalte und Werke auf diesen Seiten unterliegen dem Urheberrecht. Logo und
      Maskottchen des Vereins sind geschützt.
    </p>
  </LegalPage>
</template>
