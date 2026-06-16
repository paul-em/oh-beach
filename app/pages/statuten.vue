<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
useSeoMeta({ title: 'Statuten', description: 'Statuten des Beachvolleyball-Vereins O.H.BEACH.' })
</script>

<template>
  <LegalPage title="Statuten" updated="[Datum eintragen]">
    <Alert class="not-prose mb-8">
      <AlertTitle>Platzhalter-Vorlage</AlertTitle>
      <AlertDescription>
        Dies ist ein Struktur-Gerüst. Die verbindlichen Statuten werden vom Verein
        eingetragen und sollten vor Beschluss rechtlich geprüft werden.
      </AlertDescription>
    </Alert>

    <h2>§ 1 Name, Sitz und Tätigkeitsbereich</h2>
    <p>
      Der Verein führt den Namen „[Vereinsname]" und hat seinen Sitz in [Ort]. Er
      erstreckt seine Tätigkeit auf [Bundesland/Österreich]. Die Errichtung von
      Zweigvereinen ist [nicht] beabsichtigt.
    </p>

    <h2>§ 2 Zweck</h2>
    <p>
      Der Verein, dessen Tätigkeit nicht auf Gewinn gerichtet ist, bezweckt die
      Förderung und Ausübung des Beachvolleyballsports, insbesondere:
    </p>
    <ul>
      <li>die Pflege und Förderung des Beachvolleyballs in der Gemeinschaft,</li>
      <li>die Bereitstellung und Erhaltung von Sportanlagen (Sandplatz),</li>
      <li>die Organisation von Trainings, Turnieren und Vereinsveranstaltungen.</li>
    </ul>

    <h2>§ 3 Mittel zur Erreichung des Vereinszwecks</h2>
    <p>Der Vereinszweck soll durch die in den Abs. 1 und 2 angeführten ideellen und materiellen Mittel erreicht werden.</p>
    <h3>(1) Ideelle Mittel</h3>
    <ul>
      <li>Trainingsbetrieb und Spielbetrieb,</li>
      <li>Veranstaltungen, Turniere und gesellige Zusammenkünfte,</li>
      <li>Öffentlichkeitsarbeit (Website, Social Media).</li>
    </ul>
    <h3>(2) Materielle Mittel</h3>
    <ul>
      <li>Beitrittsgebühren und Mitgliedsbeiträge,</li>
      <li>Spenden, Förderungen und Subventionen,</li>
      <li>Erträge aus Veranstaltungen.</li>
    </ul>

    <h2>§ 4 Arten der Mitgliedschaft</h2>
    <p>
      Die Mitglieder des Vereins gliedern sich in ordentliche, außerordentliche und
      Ehrenmitglieder. [Definitionen ergänzen.]
    </p>

    <h2>§ 5 Erwerb der Mitgliedschaft</h2>
    <p>
      Über die Aufnahme von ordentlichen und außerordentlichen Mitgliedern
      entscheidet der Vorstand. Die Aufnahme kann ohne Angabe von Gründen verweigert
      werden. Die Anmeldung erfolgt über das Anmeldeformular des Vereins.
    </p>

    <h2>§ 6 Beendigung der Mitgliedschaft</h2>
    <p>Die Mitgliedschaft erlischt durch Tod, freiwilligen Austritt, Streichung oder Ausschluss. [Details ergänzen.]</p>

    <h2>§ 7 Rechte und Pflichten der Mitglieder</h2>
    <p>
      Die Mitglieder sind berechtigt, an allen Veranstaltungen des Vereins
      teilzunehmen und die Einrichtungen zu nutzen. Sie sind verpflichtet, die
      Interessen des Vereins zu fördern und die Statuten sowie Beschlüsse der
      Vereinsorgane einzuhalten und den Mitgliedsbeitrag zu entrichten.
    </p>

    <h2>§ 8 Vereinsorgane</h2>
    <p>Organe des Vereins sind die Generalversammlung, der Vorstand, die Rechnungsprüfer und das Schiedsgericht.</p>

    <h2>§ 9 Generalversammlung</h2>
    <p>[Einberufung, Beschlussfähigkeit, Aufgaben ergänzen.]</p>

    <h2>§ 10 Vorstand</h2>
    <p>[Zusammensetzung, Wahl, Aufgaben, Vertretung nach außen ergänzen.]</p>

    <h2>§ 11 Rechnungsprüfer</h2>
    <p>[Bestellung und Aufgaben ergänzen.]</p>

    <h2>§ 12 Schiedsgericht</h2>
    <p>[Zusammensetzung und Verfahren bei Streitigkeiten aus dem Vereinsverhältnis ergänzen.]</p>

    <h2>§ 13 Freiwillige Auflösung des Vereins</h2>
    <p>[Beschluss und Verwendung des Vereinsvermögens ergänzen.]</p>
  </LegalPage>
</template>
