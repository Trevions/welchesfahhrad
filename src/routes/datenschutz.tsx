import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Section, SubSection } from "@/components/LegalPage";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutzerklärung — radmap.de" },
      { name: "description", content: "Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO auf radmap.de." },
      { property: "og:title", content: "Datenschutzerklärung — radmap.de" },
      { property: "og:url", content: "https://radmap.de/datenschutz" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/datenschutz" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Recht"
      title="Datenschutzerklärung"
      lead="Wir nehmen den Schutz deiner persönlichen Daten ernst. Diese Datenschutzerklärung informiert dich über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten auf radmap.de — gemäß DSGVO und BDSG."
      updated="13. Juni 2026"
    >



      <Section title="1. Verantwortlicher">
        <p>
          Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO):
        </p>
        <p>
          <strong className="text-foreground">DigiMarket Bulgaria</strong><br />
          6400 Dimitrovgrad, Bulgarien<br />
          E-Mail:{" "}
          <a href="mailto:support@radmap.de" className="text-signal hover:underline">
            support@radmap.de
          </a>
        </p>
      </Section>


      <Section title="2. Allgemeines zur Datenverarbeitung">
        <SubSection title="Umfang der Verarbeitung">
          <p>
            Wir verarbeiten personenbezogene Daten unserer Nutzer:innen
            grundsätzlich nur, soweit dies zur Bereitstellung einer
            funktions­fähigen Website sowie unserer Inhalte und Leistungen
            erforderlich ist oder eine entsprechende Einwilligung vorliegt.
          </p>
        </SubSection>
        <SubSection title="Rechtsgrundlagen">
          <ul className="list-disc pl-5 space-y-1">
            <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
            <li>Art. 6 Abs. 1 lit. b DSGVO (Vertrag / vorvertragliche Maßnahmen)</li>
            <li>Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)</li>
            <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="3. Bereitstellung der Website &amp; Server-Logfiles">
        <p>
          Beim Aufruf der Website werden automatisch Informationen erfasst, die
          dein Browser an unseren Server übermittelt (IP-Adresse,
          Browsertyp/-version, Betriebssystem, Referrer-URL, Datum und Uhrzeit
          des Zugriffs). Die Verarbeitung erfolgt auf Grundlage von Art. 6
          Abs. 1 lit. f DSGVO zur Sicherstellung eines stabilen und sicheren
          Betriebs. Die Logs werden nach spätestens 14 Tagen gelöscht oder
          anonymisiert.
        </p>
      </Section>

      <Section title="4. Cookies &amp; lokaler Speicher">
        <p>
          Wir verwenden technisch notwendige Cookies sowie lokalen Speicher
          (z. B. <code className="px-1 bg-muted rounded-sm">localStorage</code>), um Funktionen wie
          Theme-Wahl und Merkliste bereitzustellen. Diese Daten verbleiben
          ausschließlich in deinem Browser und werden nicht an uns
          übertragen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO bzw. § 25
          Abs. 2 Nr. 2 TTDSG.
        </p>
        <p>
          Für nicht zwingend erforderliche Cookies und Drittdienste (z. B.
          Analyse) holen wir vorab deine Einwilligung gemäß § 25 Abs. 1 TTDSG
          ein.
        </p>
      </Section>

      <Section title="5. Kontaktformular und E-Mail-Kontakt">
        <p>
          Wenn du uns über das Kontaktformular oder per E-Mail kontaktierst,
          werden deine Angaben zur Bearbeitung der Anfrage und für mögliche
          Anschlussfragen gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. b
          oder lit. f DSGVO. Diese Daten geben wir nicht ohne deine
          Einwilligung weiter.
        </p>
      </Section>

      <Section title="6. Newsletter">
        <p>
          Für den Versand des Newsletters nutzen wir das Double-Opt-In-Verfahren.
          Eine Abmeldung ist jederzeit möglich. Rechtsgrundlage: Art. 6 Abs. 1
          lit. a DSGVO.
        </p>
      </Section>

      <Section title="7. Hosting">
        <p>
          Diese Website wird bei einem Auftragsverarbeiter gehostet. Der
          Hoster verarbeitet Daten in unserem Auftrag auf Grundlage eines
          Auftragsverarbeitungs­vertrags (Art. 28 DSGVO).
        </p>
      </Section>

      <Section title="8. Empfänger und Drittlandtransfers">
        <p>
          Eine Übermittlung deiner Daten an Dritte erfolgt nur, soweit dies
          gesetzlich zulässig oder erforderlich ist. Eine Übermittlung in
          Drittländer außerhalb der EU/des EWR erfolgt nur auf Basis
          geeigneter Garantien gemäß Art. 44 ff. DSGVO (z. B.
          Standardvertrags­klauseln).
        </p>
      </Section>

      <Section title="9. Speicherdauer">
        <p>
          Wir speichern personenbezogene Daten nur so lange, wie es für den
          jeweiligen Zweck erforderlich ist oder gesetzliche
          Aufbewahrungs­fristen es vorschreiben.
        </p>
      </Section>

      <Section title="10. Deine Rechte">
        <ul className="list-disc pl-5 space-y-1">
          <li>Auskunft (Art. 15 DSGVO)</li>
          <li>Berichtigung (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch (Art. 21 DSGVO)</li>
          <li>Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
          <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
        </ul>
      </Section>

      <Section title="11. Änderungen dieser Datenschutzerklärung">
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit
          sie stets den aktuellen rechtlichen Anforderungen entspricht oder um
          Änderungen unserer Leistungen umzusetzen.
        </p>
      </Section>
    </LegalPage>
  );
}
