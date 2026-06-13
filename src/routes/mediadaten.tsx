import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Section, InfoBox } from "@/components/LegalPage";

export const Route = createFileRoute("/mediadaten")({
  head: () => ({
    meta: [
      { title: "Mediadaten — radmap.de" },
      { name: "description", content: "Werbung auf radmap.de: Reichweite, Zielgruppe, Formate und Konditionen für Display- und Content-Kooperationen." },
      { property: "og:title", content: "Mediadaten — radmap.de" },
      { property: "og:description", content: "Reichweite, Zielgruppe und Werbeformate auf radmap.de." },
      { property: "og:url", content: "https://radmap.de/mediadaten" },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/mediadaten" }],
  }),
  component: MediadatenPage,
});

function MediadatenPage() {
  return (
    <LegalPage
      eyebrow="Verlag"
      title="Mediadaten 2026"
      lead="radmap.de erreicht eine engagierte Community aus Pendler:innen, Sport- und Genussradler:innen sowie Fachpublikum aus Handel und Industrie. Hier finden Sie alle Informationen für eine Kooperation."
    >
      <Section title="Zielgruppe">
        <ul className="list-disc pl-5 space-y-2">
          <li>Alter: überwiegend 25–55 Jahre</li>
          <li>Region: Deutschland, Österreich, Schweiz</li>
          <li>Interessen: Rennrad, Gravel, MTB, E-Bike, Urban Mobility, Bikepacking</li>
          <li>Kaufkraft: überdurchschnittlich, technikaffin, qualitätsorientiert</li>
        </ul>
      </Section>

      <Section title="Werbeformate">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Display Banner</strong> — Leaderboard, Medium Rectangle, Halfpage</li>
          <li><strong>Sponsored Article</strong> — redaktionell gestaltete Themenpartnerschaft, klar als „Anzeige" gekennzeichnet</li>
          <li><strong>Newsletter-Platzierung</strong> — wöchentlicher Versand an die Abonnent:innen</li>
          <li><strong>Test- &amp; Reviewkooperationen</strong> — unabhängige Produktprüfung nach festen Standards</li>
        </ul>
      </Section>

      <Section title="Standards">
        <p>
          Werbung wird auf radmap.de gemäß § 6 TMG und § 5a UWG eindeutig
          gekennzeichnet. Redaktionelle Bewertungen bleiben unabhängig von
          Werbekunden. Inhalte, die im Rahmen einer Kooperation entstehen,
          sind transparent als „Anzeige", „Sponsored" oder „Werbung"
          ausgewiesen.
        </p>
      </Section>

      <Section title="Konditionen &amp; Buchung">
        <p>
          Preise auf Anfrage. Für die vollständige Preisliste,
          Beispielplatzierungen und Reichweiten­zahlen melden Sie sich
          bitte direkt bei uns.
        </p>
        <InfoBox tone="signal">
          <strong className="text-foreground">Ansprechpartner Werbung:</strong>
          <br />
          E-Mail an die im{" "}
          <Link to="/impressum" className="text-signal hover:underline">Impressum</Link>{" "}
          hinterlegte Adresse mit Betreff „Mediadaten" — oder über unser{" "}
          <Link to="/kontakt" className="text-signal hover:underline">Kontaktformular</Link>.
        </InfoBox>
      </Section>

      <Section title="Allgemeine Geschäftsbedingungen">
        <p>
          Für alle Werbekooperationen gelten unsere{" "}
          <Link to="/agb" className="text-signal hover:underline">AGB</Link>.
          Sonderkonditionen werden individuell vereinbart und schriftlich
          bestätigt.
        </p>
      </Section>
    </LegalPage>
  );
}
