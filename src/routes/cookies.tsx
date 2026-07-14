import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Section, SubSection, InfoBox } from "@/components/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie-Richtlinie — radmap.de" },
      { name: "description", content: "Cookie-Richtlinie nach § 25 TDDDG (vormals TTDSG), ePrivacy-Richtlinie 2002/58/EG und DSGVO. Übersicht aller auf radmap.de eingesetzten Technologien." },
      { property: "og:title", content: "Cookie-Richtlinie — radmap.de" },
      { property: "og:url", content: "https://radmap.de/cookies" },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/cookies" }],
  }),
  component: CookiePage,
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

function CookiePage() {
  return (
    <LegalPage
      eyebrow="Recht"
      title="Cookie-Richtlinie"
      lead="Diese Richtlinie erläutert, welche Cookies und vergleichbaren Technologien (lokaler Speicher) wir auf radmap.de einsetzen — nach § 25 TDDDG (vormals TTDSG), der ePrivacy-Richtlinie 2002/58/EG und der DSGVO (Verordnung (EU) 2016/679)."
      updated="13. Juni 2026"
    >
      <InfoBox tone="signal">
        radmap.de setzt <strong className="text-foreground">keine Werbe-,
        Marketing- oder Tracking-Cookies</strong> ein. Es findet kein
        Cross-Site-Tracking statt. Wir verwenden ausschließlich technisch
        notwendigen lokalen Speicher, der unbedingt erforderlich ist
        (§ 25 Abs. 2 Nr. 2 TDDDG). Aus diesem Grund ist ein Consent-Banner
        gesetzlich nicht vorgeschrieben.
      </InfoBox>

      <Section title="1. Was sind Cookies und vergleichbare Technologien?">
        <p>
          Cookies sind kleine Textdateien, die ein Webserver auf deinem
          Endgerät ablegt. Vergleichbare Technologien sind
          <code className="px-1 bg-muted rounded-sm mx-1">localStorage</code>,
          <code className="px-1 bg-muted rounded-sm mx-1">sessionStorage</code>,
          IndexedDB, Pixel/Tracking-Pixel und Fingerprinting-Methoden. Sie
          unterliegen sämtlich § 25 TDDDG und Art. 5 Abs. 3 der
          ePrivacy-Richtlinie 2002/58/EG.
        </p>
        <p className="text-sm text-muted-foreground">
          Rechtstexte:{" "}
          <Ext href="https://www.gesetze-im-internet.de/tddg/__25.html">
            § 25 TDDDG
          </Ext>{" "}
          ·{" "}
          <Ext href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32002L0058">
            Richtlinie 2002/58/EG (ePrivacy)
          </Ext>
        </p>
      </Section>

      <Section title="2. Rechtliche Einordnung">
        <p>
          Nach § 25 Abs. 1 TDDDG ist die Speicherung von Informationen auf
          deinem Endgerät oder der Zugriff darauf grundsätzlich nur mit deiner
          ausdrücklichen Einwilligung zulässig. Eine Einwilligung ist
          ausnahmsweise nicht erforderlich, wenn:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-foreground">§ 25 Abs. 2 Nr. 1 TDDDG</strong>{" "}
            — die Speicherung allein dem Zweck der Übertragung einer Nachricht
            über ein Telekommunikations­netz dient, oder
          </li>
          <li>
            <strong className="text-foreground">§ 25 Abs. 2 Nr. 2 TDDDG</strong>{" "}
            — die Speicherung unbedingt erforderlich ist, damit der vom Nutzer
            ausdrücklich gewünschte Telemediendienst zur Verfügung gestellt
            werden kann.
          </li>
        </ul>
        <p>
          Alle nachfolgend aufgeführten Speicherinhalte fallen unter die
          Ausnahme nach § 25 Abs. 2 Nr. 2 TDDDG.
        </p>
      </Section>

      <Section title="3. Übersicht der eingesetzten Technologien">
        <SubSection title="Kategorie 1 — Unbedingt erforderlich (keine Einwilligung notwendig)">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-sm border border-border">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-3 border-b border-border">Name</th>
                  <th className="text-left p-3 border-b border-border">Typ</th>
                  <th className="text-left p-3 border-b border-border">Zweck</th>
                  <th className="text-left p-3 border-b border-border">Speicherdauer</th>
                </tr>
              </thead>
              <tbody className="font-light">
                <tr className="border-b border-border align-top">
                  <td className="p-3 font-mono text-xs">radmap-theme</td>
                  <td className="p-3">localStorage</td>
                  <td className="p-3">Speichert die gewählte Darstellung (hell/dunkel/System).</td>
                  <td className="p-3 whitespace-nowrap">dauerhaft, bis manuell gelöscht</td>
                </tr>
                <tr className="border-b border-border align-top">
                  <td className="p-3 font-mono text-xs">radmap:bookmarks:v1</td>
                  <td className="p-3">localStorage</td>
                  <td className="p-3">Speichert deine persönliche Merkliste lokal in deinem Browser.</td>
                  <td className="p-3 whitespace-nowrap">dauerhaft, bis manuell gelöscht</td>
                </tr>
                <tr className="border-b border-border align-top">
                  <td className="p-3 font-mono text-xs">sb-&lt;projekt&gt;-auth-token</td>
                  <td className="p-3">localStorage</td>
                  <td className="p-3">Nur für eingeloggte Redakteur:innen im Admin-Bereich (Session).</td>
                  <td className="p-3 whitespace-nowrap">Sitzung / bis Logout</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SubSection>

        <SubSection title="Kategorie 2 — Statistik, Marketing, Tracking">
          <p>
            <strong className="text-foreground">Keine.</strong> Wir setzen
            keinerlei Analyse-, Tracking-, Marketing- oder
            Social-Media-Cookies ein. Es werden keine Daten an Google
            Analytics, Meta/Facebook, TikTok, LinkedIn oder andere
            Drittanbieter übermittelt.
          </p>
        </SubSection>
      </Section>

      <Section title="4. Sollten künftig einwilligungs­pflichtige Cookies eingesetzt werden">
        <p>
          Falls wir zukünftig Cookies oder Technologien einführen, die nach
          § 25 Abs. 1 TDDDG einer Einwilligung bedürfen, werden wir vor der
          Speicherung deine ausdrückliche, freiwillige, informierte und
          jederzeit widerrufliche Einwilligung über ein Consent-Banner
          einholen (Art. 7 DSGVO). Bis dahin ist ein Banner gesetzlich nicht
          erforderlich (so auch DSK, OH Telemedien 2021, Ziff. 3.2).
        </p>
      </Section>

      <Section title="5. Verwaltung und Löschung in deinem Browser">
        <p>
          Du kannst Cookies und lokalen Speicher jederzeit in den
          Einstellungen deines Browsers verwalten oder löschen. Anleitungen
          der gängigsten Browser:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <Ext href="https://support.mozilla.org/de/kb/cookies-und-website-daten-in-firefox-loschen">
              Firefox — Cookies und Website-Daten löschen
            </Ext>
          </li>
          <li>
            <Ext href="https://support.google.com/chrome/answer/95647?hl=de">
              Google Chrome — Cookies verwalten und löschen
            </Ext>
          </li>
          <li>
            <Ext href="https://support.apple.com/de-de/guide/safari/sfri11471/mac">
              Safari (macOS) — Cookies und Daten verwalten
            </Ext>
          </li>
          <li>
            <Ext href="https://support.microsoft.com/de-de/microsoft-edge/cookies-in-microsoft-edge-l%C3%B6schen-63947406-40ac-c3b8-57b9-2a946a29ae09">
              Microsoft Edge — Cookies löschen
            </Ext>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Hinweis: Werden technisch notwendige Daten gelöscht, gehen
          Einstellungen wie deine Merkliste oder die Theme-Wahl verloren.
        </p>
      </Section>

      <Section title="6. Weiterführende Informationen">
        <p>
          Allgemeine Informationen zu Datenverarbeitungen findest du in
          unserer{" "}
          <Link to="/datenschutz" className="text-signal hover:underline">
            Datenschutzerklärung
          </Link>.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <Ext href="https://www.datenschutzkonferenz-online.de/media/oh/20211220_oh_telemedien.pdf">
              Datenschutzkonferenz (DSK) — Orientierungshilfe Telemedien (PDF)
            </Ext>
          </li>
          <li>
            <Ext href="https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-022023-technical-scope-art-53-eprivacy-directive_de">
              EDSA — Leitlinien 2/2023 zum Anwendungsbereich Art. 5 Abs. 3 ePrivacy-RL
            </Ext>
          </li>
          <li>
            <Ext href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679">
              Verordnung (EU) 2016/679 (DSGVO) — Volltext
            </Ext>
          </li>
        </ul>
      </Section>
    </LegalPage>
  );
}
