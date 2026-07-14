import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Section, InfoBox } from "@/components/LegalPage";

export const Route = createFileRoute("/nutzungsbedingungen")({
  head: () => ({
    meta: [
      { title: "Nutzungsbedingungen — radmap.de" },
      { name: "description", content: "Nutzungsbedingungen für radmap.de nach TMG/DDG, DSA (Verordnung (EU) 2022/2065) und Urheberrecht." },
      { property: "og:title", content: "Nutzungsbedingungen — radmap.de" },
      { property: "og:url", content: "https://radmap.de/nutzungsbedingungen" },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/nutzungsbedingungen" }],
  }),
  component: TermsPage,
});

const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-signal hover:underline break-words">
    {children}
  </a>
);

function TermsPage() {
  return (
    <LegalPage
      eyebrow="Recht"
      title="Nutzungsbedingungen"
      lead="Diese Nutzungsbedingungen regeln den Zugriff auf radmap.de und die Nutzung der angebotenen Inhalte. Für entgeltliche Leistungen (Werbung, Kooperationen) gelten ergänzend unsere AGB."
      updated="13. Juni 2026"
    >
      <InfoBox>
        Wenn du radmap.de nutzt, erkennst du diese Bedingungen an. Bitte lies
        sie sorgfältig. Verbindlich ergänzend gelten unsere{" "}
        <Link to="/agb" className="text-signal hover:underline">AGB</Link>,
        die <Link to="/datenschutz" className="text-signal hover:underline">Datenschutzerklärung</Link>{" "}
        und die <Link to="/cookies" className="text-signal hover:underline">Cookie-Richtlinie</Link>.
      </InfoBox>

      <Section title="§ 1 Anbieter und Geltungsbereich">
        <p>
          Anbieter dieser Website ist <strong className="text-foreground">DigiMarket Bulgaria</strong>,
          6400 Dimitrovgrad, Bulgarien (im Folgenden „Anbieter"). Diese
          Bedingungen gelten für die kostenfreie redaktionelle Nutzung von
          radmap.de durch Verbraucher:innen und gewerbliche Nutzer:innen.
        </p>
      </Section>

      <Section title="§ 2 Leistungen und Verfügbarkeit">
        <p>
          radmap.de stellt redaktionelle Inhalte rund um Fahrräder, E-Bikes
          und Radkultur kostenfrei und ohne Registrierungs­pflicht bereit. Ein
          Anspruch auf ständige Verfügbarkeit, eine bestimmte
          Erreichbarkeits­quote oder auf das Bereithalten einzelner Inhalte
          besteht nicht. Wartung, technische Störungen und Änderungen am
          Angebot bleiben vorbehalten.
        </p>
      </Section>

      <Section title="§ 3 Erlaubte und untersagte Nutzung">
        <p>Du verpflichtest dich, radmap.de nur im Rahmen der geltenden Gesetze und dieser Bedingungen zu nutzen. Untersagt sind insbesondere:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>automatisiertes Auslesen (Scraping, Crawling) ohne ausdrückliche schriftliche Zustimmung;</li>
          <li>das Umgehen technischer Schutz­maßnahmen oder Zugangs­beschränkungen;</li>
          <li>Eingriffe in die Sicherheit, Integrität oder Verfügbarkeit der Dienste (z. B. DDoS, Schad­software);</li>
          <li>die Nutzung zu rechts­widrigen Zwecken, insbesondere zur Verbreitung rechts­widriger Inhalte;</li>
          <li>jede Handlung, die geeignet ist, die Funktionalität der Website oder anderer Nutzer:innen unzumutbar zu beeinträchtigen.</li>
        </ul>
      </Section>

      <Section title="§ 4 Urheberrechte und Lizenz zur Nutzung">
        <p>
          Sämtliche Inhalte auf radmap.de — Texte, Bilder, Grafiken, Layouts,
          Logos, Audio- und Videoinhalte — sind urheber­rechtlich geschützt
          (§§ 1 ff. UrhG; Richtlinie 2001/29/EG). Eine Vervielfältigung,
          Bearbeitung, Verbreitung oder öffentliche Wiedergabe außerhalb der
          Grenzen des Urheberrechts (z. B. Zitatrecht § 51 UrhG) ist nur mit
          vorheriger schriftlicher Zustimmung des jeweiligen Rechte­inhabers
          zulässig.
        </p>
        <p className="text-sm text-muted-foreground">
          Volltext UrhG:{" "}
          <Ext href="https://www.gesetze-im-internet.de/urhg/">
            gesetze-im-internet.de
          </Ext>
        </p>
      </Section>

      <Section title="§ 5 Inhalte Dritter, Links und Werbung">
        <p>
          radmap.de kann Links zu externen Angeboten enthalten. Für deren
          Inhalte sind ausschließlich die jeweiligen Anbieter verantwortlich
          (§§ 7–10 TMG / DDG). Werbliche Inhalte werden als solche
          gekennzeichnet (§ 6 TMG / DDG; § 22 MStV).
        </p>
      </Section>

      <Section title="§ 6 Meldung rechtswidriger Inhalte (DSA, Verordnung (EU) 2022/2065)">
        <p>
          radmap.de ist ein Hosting-Dienst im Sinne des Digital Services Act.
          Du kannst rechtswidrige Inhalte über folgende Kontaktstelle melden:
        </p>
        <p>
          E-Mail:{" "}
          <a href="mailto:support@radmap.de" className="text-signal hover:underline">
            support@radmap.de
          </a>
          <br />
          <span className="text-sm text-muted-foreground">
            Sprache der Kommunikation: Deutsch, Englisch
          </span>
        </p>
        <p>
          Wir prüfen jede Meldung unverzüglich nach Art. 16 DSA und entfernen
          oder sperren rechtswidrige Inhalte, sobald wir Kenntnis von ihrer
          Rechtswidrigkeit erlangen. Du wirst gemäß Art. 16 Abs. 5 DSA über
          unsere Entscheidung sowie etwaige Rechtsbehelfe informiert.
        </p>
        <p className="text-sm text-muted-foreground">
          Volltext DSA:{" "}
          <Ext href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32022R2065">
            Verordnung (EU) 2022/2065
          </Ext>
        </p>
      </Section>

      <Section title="§ 7 Barrierefreiheit (BFSG, Richtlinie (EU) 2019/882)">
        <p>
          Wir streben eine möglichst barrierefreie Nutzung im Sinne der
          Richtlinie (EU) 2019/882 (European Accessibility Act) und des
          Barriere­freiheits­stärkungs­gesetzes (BFSG) an. Hinweise auf
          Barrieren nehmen wir per E-Mail entgegen.
        </p>
      </Section>

      <Section title="§ 8 Haftungs­begrenzung">
        <p>
          Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit
          sowie nach dem Produkthaftungs­gesetz und für die Verletzung von
          Leben, Körper und Gesundheit. Für leichte Fahrlässigkeit haftet er
          nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf
          den vertrags­typischen, vorhersehbaren Schaden. Eine darüber
          hinausgehende Haftung — insbesondere für die ununterbrochene
          Verfügbarkeit, die Vollständigkeit oder Aktualität redaktioneller
          Inhalte — ist ausgeschlossen.
        </p>
      </Section>

      <Section title="§ 9 Datenschutz und Cookies">
        <p>
          Informationen zur Verarbeitung personen­bezogener Daten findest du
          in unserer{" "}
          <Link to="/datenschutz" className="text-signal hover:underline">Datenschutzerklärung</Link>{" "}
          und in der{" "}
          <Link to="/cookies" className="text-signal hover:underline">Cookie-Richtlinie</Link>.
        </p>
      </Section>

      <Section title="§ 10 Anwendbares Recht, Streit­beilegung">
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss
          des UN-Kaufrechts. Zwingende verbraucher­schützende Vorschriften des
          Staates, in dem die Verbraucher:in ihren gewöhnlichen Aufenthalt hat,
          bleiben unberührt (Art. 6 Rom-I-VO).
        </p>
        <p>
          Plattform der EU-Kommission zur Online-Streitbeilegung:{" "}
          <Ext href="https://ec.europa.eu/consumers/odr/">
            ec.europa.eu/consumers/odr
          </Ext>. Wir sind nicht bereit oder verpflichtet, an einem
          Streitbeilegungs­verfahren vor einer Verbraucher­schlichtungsstelle
          teilzunehmen (§ 36 VSBG).
        </p>
      </Section>

      <Section title="§ 11 Änderungen dieser Bedingungen">
        <p>
          Wir behalten uns vor, diese Nutzungs­bedingungen mit Wirkung für die
          Zukunft anzupassen, soweit dies aufgrund geänderter Rechtslage,
          höchstrichterlicher Rechtsprechung oder Änderungen am Angebot
          erforderlich wird. Die jeweils aktuelle Fassung ist auf dieser Seite
          abrufbar.
        </p>
      </Section>

      <Section title="§ 12 Salvatorische Klausel">
        <p>
          Sollten einzelne Bestimmungen dieser Nutzungs­bedingungen unwirksam
          sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen
          davon unberührt.
        </p>
      </Section>
    </LegalPage>
  );
}
