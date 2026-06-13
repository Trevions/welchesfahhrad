import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Section, InfoBox } from "@/components/LegalPage";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum — radmap.de" },
      { name: "description", content: "Impressum und Anbieterkennzeichnung gemäß § 5 TMG und § 18 MStV für radmap.de." },
      { property: "og:title", content: "Impressum — radmap.de" },
      { property: "og:url", content: "https://radmap.de/impressum" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/impressum" }],
  }),
  component: ImpressumPage,
});

function ImpressumPage() {
  return (
    <LegalPage
      eyebrow="Recht"
      title="Impressum"
      lead="Anbieterkennzeichnung gemäß § 5 Telemediengesetz (TMG) und § 18 Abs. 2 Medienstaatsvertrag (MStV)."
    >
      <InfoBox tone="signal">
        <strong className="text-foreground">Hinweis für den Betreiber:</strong> Die nachfolgenden Platzhalter
        <code className="mx-1 px-1.5 py-0.5 bg-muted text-foreground rounded-sm text-xs">[…]</code>
        müssen vor Veröffentlichung mit den vollständigen, korrekten und
        wahrheitsgemäßen Daten ersetzt werden. Ein unvollständiges Impressum
        kann nach § 5 TMG abgemahnt werden.
      </InfoBox>

      <Section title="Angaben gemäß § 5 TMG">
        <p>
          [Vor- und Nachname / Firmenbezeichnung]<br />
          [Straße und Hausnummer]<br />
          [PLZ und Ort]<br />
          Deutschland
        </p>
      </Section>

      <Section title="Kontakt">
        <p>
          Telefon: [+49 …]<br />
          E-Mail: [kontakt@radmap.de]
        </p>
      </Section>

      <Section title="Umsatzsteuer-ID">
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG:<br />
          [DE… — falls vorhanden, sonst Abschnitt entfernen]
        </p>
      </Section>

      <Section title="Redaktionell verantwortlich (§ 18 Abs. 2 MStV)">
        <p>
          [Vor- und Nachname]<br />
          [Straße und Hausnummer]<br />
          [PLZ und Ort]
        </p>
      </Section>

      <Section title="EU-Streitschlichtung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal hover:underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse findest du oben im Impressum.
        </p>
      </Section>

      <Section title="Verbraucherstreitbeilegung / Universalschlichtungsstelle">
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungs­verfahren
          vor einer Verbraucher­schlichtungsstelle teilzunehmen.
        </p>
      </Section>

      <Section title="Haftung für Inhalte">
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte
          auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
          §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen oder nach Umständen zu forschen, die auf eine
          rechtswidrige Tätigkeit hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
          Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
          Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
          Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden
          von entsprechenden Rechtsverletzungen werden wir diese Inhalte
          umgehend entfernen.
        </p>
      </Section>

      <Section title="Haftung für Links">
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
          fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
          verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
          der Seiten verantwortlich.
        </p>
      </Section>

      <Section title="Urheberrecht">
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
          diesen Seiten unterliegen dem deutschen Urheberrecht. Die
          Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
          Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
          schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>
      </Section>
    </LegalPage>
  );
}
