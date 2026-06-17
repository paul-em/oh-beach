<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
useSeoMeta({ title: 'Impressum', description: 'Impressum und Offenlegung des Vereins O.H.BEACH.' })
</script>

<template>
  <LegalPage title="Impressum" updated="Juni 2026">
    <Alert class="not-prose mb-8">
      <AlertTitle>Hinweis</AlertTitle>
      <AlertDescription>
        Die ZVR-Zahl wird nach der Eintragung im Vereinsregister ergänzt.
        Offenlegung gem. § 25 MedienG und § 5 ECG – im Zweifel rechtlich prüfen lassen.
      </AlertDescription>
    </Alert>

    <h2>Medieninhaber &amp; Herausgeber</h2>
    <p>
      O.H. Beach<br />
      Gartenstraße 1<br />
      4625 Offenhausen, Österreich
    </p>

    <h2>Vereinsdaten</h2>
    <ul>
      <li><strong>ZVR-Zahl:</strong> wird nach Eintragung ergänzt</li>
      <li><strong>Vereinssitz:</strong> Offenhausen</li>
      <li><strong>Vereinsbehörde:</strong> Bezirkshauptmannschaft Wels-Land</li>
      <li><strong>Vereinszweck:</strong> Förderung und Ausübung des Beachvolleyballsports</li>
      <li>
        <strong>Vertretungsbefugte Organe:</strong> Michael Sterrer (Obmann),
        Paul Emathinger (Obmann-Stellvertreter), Peter Emathinger (Kassier)
      </li>
    </ul>

    <h2>Kontakt</h2>
    <ul>
      <li><strong>E-Mail:</strong> info@oh-beach.at</li>
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
