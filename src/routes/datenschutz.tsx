import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Section, SubSection, InfoBox } from "@/components/LegalPage";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutzerklärung — radmap.de" },
      { name: "description", content: "Datenschutzerklärung nach DSGVO (Verordnung (EU) 2016/679), BDSG, TTDSG und bulgarischem ZZLD für radmap.de." },
      { property: "og:title", content: "Datenschutzerklärung — radmap.de" },
      { property: "og:url", content: "https://radmap.de/datenschutz" },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/datenschutz" }],
  }),
  component: PrivacyPage,
});

const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-signal hover:underline break-words"
  >
    {children}
  </a>
);

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Recht"
      title="Datenschutzerklärung"
      lead="Diese Erklärung informiert dich nach Art. 13 und 14 DSGVO über die Verarbeitung personenbezogener Daten auf radmap.de — auf Grundlage der Verordnung (EU) 2016/679 (DSGVO), des deutschen Telekommunikation-Digitale-Dienste-Datenschutz-Gesetzes (TDDDG, vormals TTDSG), des Bundesdatenschutz­gesetzes (BDSG) sowie des bulgarischen Gesetzes zum Schutz personenbezogener Daten (ZZLD)."
      updated="13. Juni 2026"
    >
      <InfoBox tone="signal">
        <strong className="text-foreground">Kurzfassung:</strong> Wir verarbeiten so
        wenige Daten wie möglich. Es werden keine Tracking-Cookies, kein
        Profiling, keine Werbenetzwerke und keine Analyse-Tools von Drittanbietern
        eingesetzt. Server-Logs werden nach 14 Tagen gelöscht. Lokal in deinem
        Browser werden nur Einstellungen wie Theme und Merkliste gespeichert.
        Details siehe unten und in unserer{" "}
        <Link to="/cookies" className="text-signal hover:underline">Cookie-Richtlinie</Link>.
      </InfoBox>

      <Section title="1. Verantwortlicher (Art. 4 Nr. 7 DSGVO)">
        <p>
          Verantwortlich für die Datenverarbeitung im Sinne der DSGVO und
          weiterer nationaler Datenschutzgesetze der Mitgliedstaaten ist:
        </p>
        <p>
          <strong className="text-foreground">DigiMarket Bulgaria</strong><br />
          6400 Dimitrovgrad<br />
          Bulgarien<br />
          E-Mail:{" "}
          <a href="mailto:support@radmap.de" className="text-signal hover:underline">
            support@radmap.de
          </a>
        </p>
        <p className="text-sm text-muted-foreground">
          Eine Pflicht zur Bestellung einer/eines Datenschutzbeauftragten besteht
          nach Art. 37 DSGVO derzeit nicht. Anfragen rund um den Datenschutz
          richtest du bitte an die oben genannte E-Mail-Adresse.
        </p>
      </Section>

      <Section title="2. Geltende Rechtsgrundlagen (Art. 6 DSGVO)">
        <ul className="list-disc pl-5 space-y-1">
          <li>Art. 6 Abs. 1 lit. a DSGVO — Einwilligung</li>
          <li>Art. 6 Abs. 1 lit. b DSGVO — Vertrag oder vorvertragliche Maßnahmen</li>
          <li>Art. 6 Abs. 1 lit. c DSGVO — rechtliche Verpflichtung</li>
          <li>Art. 6 Abs. 1 lit. f DSGVO — berechtigtes Interesse</li>
          <li>§ 25 TDDDG (vormals TTDSG) — Schutz der Endeinrichtung (Cookies, Speicher)</li>
          <li>ZZLD (Закон за защита на личните данни) — bulgarisches Umsetzungsgesetz zur DSGVO</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Volltext DSGVO:{" "}
          <Ext href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679">
            eur-lex.europa.eu — Verordnung (EU) 2016/679
          </Ext>.
          {" "}TDDDG:{" "}
          <Ext href="https://www.gesetze-im-internet.de/tddg/">
            gesetze-im-internet.de
          </Ext>.
          {" "}BDSG:{" "}
          <Ext href="https://www.gesetze-im-internet.de/bdsg_2018/">
            gesetze-im-internet.de
          </Ext>.
        </p>
      </Section>

      <Section title="3. Bereitstellung der Website &amp; Server-Logfiles">
        <p>
          Bei jedem Aufruf von radmap.de übermittelt dein Browser automatisch
          technische Informationen, die der Provider in sogenannten Logfiles
          speichert. Erfasst werden:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>IP-Adresse des anfragenden Endgeräts (gekürzt / anonymisiert nach 14 Tagen)</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>aufgerufene URL und HTTP-Statuscode</li>
          <li>übertragene Datenmenge</li>
          <li>Browsertyp/-version und Betriebssystem</li>
          <li>Referrer-URL (zuvor besuchte Seite)</li>
        </ul>
        <p>
          <strong className="text-foreground">Zweck:</strong> Bereitstellung,
          Sicherheit und Stabilität der Website, Abwehr von Angriffen und
          Missbrauch (z. B. DDoS, Brute-Force).<br />
          <strong className="text-foreground">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse).<br />
          <strong className="text-foreground">Speicherdauer:</strong> max. 14 Tage,
          anschließend Löschung oder Anonymisierung.
        </p>
      </Section>

      <Section title="4. Cookies, lokaler Speicher und vergleichbare Technologien">
        <p>
          radmap.de setzt <strong className="text-foreground">keine
          Tracking-Cookies und keine Analyse- oder Werbe-Cookies von
          Drittanbietern</strong> ein. Wir verwenden ausschließlich technisch
          notwendigen lokalen Speicher (<code className="px-1 bg-muted rounded-sm">localStorage</code>),
          um persönliche Einstellungen wie Theme-Wahl und deine Merkliste auf
          deinem Endgerät zu speichern. Diese Daten verbleiben in deinem
          Browser und werden nicht an unsere Server übertragen.
        </p>
        <p>
          <strong className="text-foreground">Rechtsgrundlage:</strong>{" "}
          § 25 Abs. 2 Nr. 2 TDDDG (unbedingt erforderlich für den vom Nutzer
          ausdrücklich gewünschten Telemediendienst) i. V. m. Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <p>
          Eine vollständige Übersicht aller eingesetzten Technologien, ihrer
          Zwecke und Speicherdauern findest du in unserer{" "}
          <Link to="/cookies" className="text-signal hover:underline">
            Cookie-Richtlinie
          </Link>.
        </p>
      </Section>

      <Section title="5. Kontaktformular und E-Mail-Kontakt">
        <p>
          Bei Nutzung unseres{" "}
          <Link to="/kontakt" className="text-signal hover:underline">Kontaktformulars</Link>{" "}
          oder bei Kontakt per E-Mail werden folgende Daten verarbeitet:
          Name, E-Mail-Adresse, Betreff, Nachricht, Datum/Uhrzeit, User-Agent
          und ein gekürzter Hash der IP-Adresse (Spam-/Missbrauchsschutz).
        </p>
        <p>
          <strong className="text-foreground">Zweck:</strong> Beantwortung
          deiner Anfrage und Anschluss­kommunikation.<br />
          <strong className="text-foreground">Rechtsgrundlage:</strong> Art. 6
          Abs. 1 lit. b DSGVO (Anbahnung) bzw. lit. f DSGVO (berechtigtes
          Interesse an einer effizienten Kommunikation).<br />
          <strong className="text-foreground">Speicherdauer:</strong> bis zur
          vollständigen Bearbeitung; gesetzliche Aufbewahrungs­pflichten bleiben
          unberührt.
        </p>
      </Section>

      <Section title="6. Hosting und Auftrags­verarbeitung (Art. 28 DSGVO)">
        <p>
          Die Website wird auf der Plattform <strong className="text-foreground">Lovable Cloud</strong>{" "}
          betrieben (Infrastruktur: Cloudflare Workers, Supabase EU). Mit den
          Auftrags­verarbeitern bestehen Verträge nach Art. 28 DSGVO. Die
          Verarbeitung erfolgt vorrangig in Rechenzentren innerhalb der
          Europäischen Union.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            Cloudflare, Inc. (CDN, DDoS-Schutz):{" "}
            <Ext href="https://www.cloudflare.com/privacypolicy/">Datenschutzerklärung</Ext>
          </li>
          <li>
            Supabase Inc. (Datenbank, Auth, Storage):{" "}
            <Ext href="https://supabase.com/privacy">Datenschutzerklärung</Ext>
          </li>
        </ul>
      </Section>

      <Section title="7. Übermittlungen in Drittländer (Art. 44 ff. DSGVO)">
        <p>
          Sofern Daten in Länder außerhalb des EWR übermittelt werden, erfolgt
          dies ausschließlich auf Grundlage geeigneter Garantien:
          EU-Standardvertrags­klauseln (Beschluss 2021/914) und – soweit
          einschlägig – auf Grundlage des
          {" "}<Ext href="https://eur-lex.europa.eu/eli/dec_impl/2023/1795/oj">
            EU-US Data Privacy Framework
          </Ext>{" "}
          (Angemessenheits­beschluss der Kommission vom 10. Juli 2023).
        </p>
      </Section>

      <Section title="8. Empfänger personenbezogener Daten">
        <p>
          Eine Weitergabe deiner Daten an Dritte erfolgt nur, wenn
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>du ausdrücklich eingewilligt hast (Art. 6 Abs. 1 lit. a DSGVO),</li>
          <li>dies zur Vertragserfüllung erforderlich ist (lit. b),</li>
          <li>eine gesetzliche Verpflichtung besteht (lit. c) oder</li>
          <li>dies aufgrund überwiegender berechtigter Interessen zulässig ist (lit. f).</li>
        </ul>
        <p>
          Empfänger sind ausschließlich die unter Ziff. 6 genannten
          Auftrags­verarbeiter sowie ggf. Behörden auf gesetzlicher Grundlage.
        </p>
      </Section>

      <Section title="9. Speicherdauer und Löschung">
        <p>
          Personenbezogene Daten werden nur so lange gespeichert, wie es für
          den jeweiligen Zweck erforderlich ist oder gesetzliche
          Aufbewahrungs­pflichten (z. B. § 257 HGB, § 147 AO, 6/10 Jahre) eine
          längere Speicherung vorschreiben. Nach Ablauf werden die Daten
          gelöscht oder anonymisiert.
        </p>
      </Section>

      <Section title="10. Deine Rechte als betroffene Person">
        <p>Du hast nach der DSGVO insbesondere folgende Rechte uns gegenüber:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Recht auf Auskunft — Art. 15 DSGVO</li>
          <li>Recht auf Berichtigung — Art. 16 DSGVO</li>
          <li>Recht auf Löschung („Recht auf Vergessenwerden") — Art. 17 DSGVO</li>
          <li>Recht auf Einschränkung der Verarbeitung — Art. 18 DSGVO</li>
          <li>Recht auf Datenübertragbarkeit — Art. 20 DSGVO</li>
          <li>Recht auf Widerspruch — Art. 21 DSGVO</li>
          <li>Recht auf Widerruf einer Einwilligung — Art. 7 Abs. 3 DSGVO</li>
          <li>Recht, nicht einer ausschließlich automatisierten Entscheidung unterworfen zu werden — Art. 22 DSGVO</li>
          <li>Recht auf Beschwerde bei einer Aufsichtsbehörde — Art. 77 DSGVO</li>
        </ul>
        <p>
          Zur Ausübung deiner Rechte genügt eine formlose Nachricht an{" "}
          <a href="mailto:support@radmap.de" className="text-signal hover:underline">
            support@radmap.de
          </a>.
        </p>
      </Section>

      <Section title="11. Zuständige Aufsichtsbehörden">
        <SubSection title="Federführende Aufsichtsbehörde (Lead Supervisory Authority)">
          <p>
            Da sich die Hauptniederlassung des Verantwortlichen in Bulgarien
            befindet, ist nach Art. 56 DSGVO die bulgarische
            Datenschutzbehörde federführend zuständig:
          </p>
          <p>
            <strong className="text-foreground">
              Комисия за защита на личните данни (КЗЛД)
            </strong><br />
            Commission for Personal Data Protection<br />
            ул. „Проф. Цветан Лазаров" № 2, 1592 София, България<br />
            E-Mail:{" "}
            <a href="mailto:kzld@cpdp.bg" className="text-signal hover:underline">
              kzld@cpdp.bg
            </a>
            <br />
            Website:{" "}
            <Ext href="https://www.cpdp.bg/">
              www.cpdp.bg
            </Ext>
          </p>
        </SubSection>
        <SubSection title="Aufsichtsbehörden in Deutschland">
          <p>
            Nutzer:innen in Deutschland können sich nach Art. 77 DSGVO
            wahlweise an die Aufsichtsbehörde ihres Bundeslandes oder an die
            Bundesbeauftragte für den Datenschutz und die Informationsfreiheit
            (BfDI) wenden:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <Ext href="https://www.bfdi.bund.de/">
                Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI)
              </Ext>
            </li>
            <li>
              <Ext href="https://www.datenschutzkonferenz-online.de/datenschutzbehoerden.html">
                Übersicht der Landes­datenschutz­behörden (DSK)
              </Ext>
            </li>
          </ul>
        </SubSection>
      </Section>

      <Section title="12. Sicherheit der Verarbeitung (Art. 32 DSGVO)">
        <p>
          Wir setzen technische und organisatorische Maßnahmen ein, um deine
          Daten gegen unbeabsichtigte oder unrechtmäßige Vernichtung, Verlust,
          Veränderung oder unbefugte Offenlegung zu schützen. Dazu gehören u. a.
          TLS-Verschlüsselung (HTTPS), Zugriffs­kontrollen, regelmäßige Updates
          und ein Berechtigungs­konzept für interne Systeme.
        </p>
      </Section>

      <Section title="13. Keine automatisierte Entscheidung im Einzelfall (Art. 22 DSGVO)">
        <p>
          Wir nutzen keine automatisierte Entscheidungs­findung einschließlich
          Profiling, die dir gegenüber rechtliche Wirkung entfaltet oder dich
          in ähnlicher Weise erheblich beeinträchtigt.
        </p>
      </Section>

      <Section title="14. Aktualität und Änderung dieser Erklärung">
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit
          sie stets den aktuellen rechtlichen Anforderungen entspricht oder um
          Änderungen unserer Leistungen umzusetzen. Die jeweils aktuelle
          Version ist auf dieser Seite abrufbar. Stand siehe oben.
        </p>
      </Section>
    </LegalPage>
  );
}
