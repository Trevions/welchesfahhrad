import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Section, InfoBox } from "@/components/LegalPage";

export const Route = createFileRoute("/agb")({
  head: () => ({
    meta: [
      { title: "AGB — radmap.de" },
      { name: "description", content: "Allgemeine Geschäftsbedingungen für die Nutzung von radmap.de sowie für Werbe- und Kooperationsleistungen." },
      { property: "og:title", content: "AGB — radmap.de" },
      { property: "og:url", content: "https://radmap.de/agb" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/agb" }],
  }),
  component: AgbPage,
});

function AgbPage() {
  return (
    <LegalPage
      eyebrow="Recht"
      title="Allgemeine Geschäftsbedingungen"
      lead="Diese AGB regeln die Nutzung von radmap.de sowie die Erbringung von Werbe- und Kooperationsleistungen."
      updated="13. Juni 2026"
    >



      <Section title="§ 1 Geltungsbereich">
        <p>
          Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der
          Website radmap.de sowie für alle Vereinbarungen über
          Werbeleistungen, Kooperationen und Inhaltslizenzen zwischen dem
          im{" "}
          <Link to="/impressum" className="text-signal hover:underline">Impressum</Link>{" "}
          genannten Anbieter und seinen Kund:innen.
        </p>
      </Section>

      <Section title="§ 2 Leistungen">
        <p>
          radmap.de stellt redaktionelle Inhalte rund um Fahrräder, E-Bikes
          und Radkultur kostenfrei bereit. Werbeleistungen und Kooperationen
          erfolgen auf Grundlage individueller Vereinbarungen und gemäß
          unserer{" "}
          <Link to="/mediadaten" className="text-signal hover:underline">Mediadaten</Link>.
        </p>
      </Section>

      <Section title="§ 3 Nutzung der Website">
        <p>
          Die Nutzung von radmap.de ist nur im Rahmen der geltenden Gesetze
          und dieser AGB zulässig. Eine missbräuchliche oder
          rechts­widrige Nutzung (z. B. automatisiertes Auslesen, Umgehung
          technischer Schutz­maßnahmen, Verbreitung rechtswidriger Inhalte)
          ist untersagt.
        </p>
      </Section>

      <Section title="§ 4 Urheberrecht">
        <p>
          Alle auf radmap.de veröffentlichten Inhalte (Texte, Bilder, Grafiken,
          Layouts) sind urheberrechtlich geschützt. Eine Weiterverwendung
          außerhalb der gesetzlichen Schranken bedarf der vorherigen
          schriftlichen Zustimmung.
        </p>
      </Section>

      <Section title="§ 5 Werbeleistungen">
        <p>
          Werbeaufträge kommen durch schriftliche Bestätigung des Anbieters
          zustande. Inhalte und Gestaltung von Anzeigen liegen in der
          Verantwortung des Kunden. Der Anbieter behält sich vor, Aufträge
          ohne Angabe von Gründen abzulehnen, insbesondere wenn Inhalte
          gegen Gesetze, behördliche Bestimmungen oder die guten Sitten
          verstoßen.
        </p>
      </Section>

      <Section title="§ 6 Vergütung &amp; Zahlung">
        <p>
          Vergütungen werden individuell vereinbart. Rechnungen sind, sofern
          nicht anders vereinbart, innerhalb von 14 Tagen ohne Abzug fällig.
        </p>
      </Section>

      <Section title="§ 7 Haftung">
        <p>
          Der Anbieter haftet unbeschränkt für Vorsatz und grobe
          Fahrlässigkeit. Für leichte Fahrlässigkeit haftet er nur bei
          Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) und
          begrenzt auf den vertragstypischen, vorhersehbaren Schaden. Die
          Haftung nach dem Produkthaftungsgesetz und für Schäden aus der
          Verletzung des Lebens, des Körpers oder der Gesundheit bleibt
          unberührt.
        </p>
      </Section>

      <Section title="§ 8 Datenschutz">
        <p>
          Hinweise zur Verarbeitung personen­bezogener Daten findest du in
          unserer{" "}
          <Link to="/datenschutz" className="text-signal hover:underline">Datenschutzerklärung</Link>.
        </p>
      </Section>

      <Section title="§ 9 Schlussbestimmungen">
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss
          des UN-Kaufrechts. Sofern der Kunde Kaufmann, juristische Person
          des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen
          ist, ist Gerichtsstand der Sitz des Anbieters.
        </p>
        <p>
          Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder
          werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon
          unberührt.
        </p>
      </Section>
    </LegalPage>
  );
}
