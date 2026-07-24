import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Section, SubSection, InfoBox } from "@/components/LegalPage";

export const Route = createFileRoute("/barrierefreiheit")({
  head: () => ({
    meta: [
      { title: "Barrierefreiheitserklärung — welchesfahrrad.de" },
      {
        name: "description",
        content:
          "Erklärung zur digitalen Barrierefreiheit gemäß Barrierefreiheitsstärkungsgesetz (BFSG), EAA (EU 2019/882) und WCAG 2.1 AA.",
      },
      { property: "og:title", content: "Barrierefreiheitserklärung — welchesfahrrad.de" },
      { property: "og:url", content: "https://welchesfahrrad.de/barrierefreiheit" },
    ],
    links: [{ rel: "canonical", href: "https://welchesfahrrad.de/barrierefreiheit" }],
  }),
  component: BarrierefreiheitPage,
});

function BarrierefreiheitPage() {
  return (
    <LegalPage
      eyebrow="Recht"
      title="Barrierefreiheitserklärung"
      lead="Diese Erklärung beschreibt den Stand der digitalen Barrierefreiheit von welchesfahrrad.de gemäß Barrierefreiheitsstärkungsgesetz (BFSG), European Accessibility Act (EU 2019/882) und WCAG 2.1 Level AA."
      updated="13. Juni 2026"
    >
      <InfoBox tone="signal">
        <p>
          <strong className="text-foreground">Gesetzliche Grundlage:</strong> Diese
          Erklärung erfolgt in Anwendung des{" "}
          <a
            href="https://www.gesetze-im-internet.de/bfsg/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal hover:underline"
          >
            Barrierefreiheitsstärkungsgesetz (BFSG)
          </a>{" "}
          vom 16. Juli 2021, das die{" "}
          <a
            href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32019L0882"
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal hover:underline"
          >
            Richtlinie (EU) 2019/882 (European Accessibility Act)
          </a>{" "}
          in deutsches Recht umsetzt und seit 28. Juni 2025 verbindlich gilt.
        </p>
      </InfoBox>

      <Section title="1. Geltungsbereich">
        <p>
          Diese Erklärung gilt für die unter{" "}
          <a href="https://welchesfahrrad.de" className="text-signal hover:underline">
            welchesfahrrad.de
          </a>{" "}
          veröffentlichte Website einschließlich aller Unterseiten und
          interaktiven Funktionen (Kontaktformular, Lesezeichen, Newsletter,
          Suche, Nutzerkonto).
        </p>
      </Section>

      <Section title="2. Stand der Konformität">
        <p>
          welchesfahrrad.de ist mit den Anforderungen der{" "}
          <a
            href="https://www.w3.org/TR/WCAG21/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal hover:underline"
          >
            Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
          </a>{" "}
          sowie der harmonisierten europäischen Norm{" "}
          <a
            href="https://www.etsi.org/deliver/etsi_en/301500_301599/301549/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal hover:underline"
          >
            EN 301 549 V3.2.1
          </a>{" "}
          <strong className="text-foreground">weitgehend konform</strong>. Eine
          Selbstbewertung wurde am 13. Juni 2026 durchgeführt.
        </p>

        <SubSection title="Umgesetzte Maßnahmen">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Semantisches HTML5 mit korrekter Landmark-Struktur (header, main, footer, nav).</li>
            <li>Vollständige Tastaturbedienbarkeit aller interaktiven Elemente.</li>
            <li>Sichtbarer Fokus-Indikator (focus-visible) auf allen Bedienelementen.</li>
            <li>ARIA-Labels für icon-only Buttons (Menü, Suche, Schließen, Lesezeichen).</li>
            <li>Kontrastverhältnisse ≥ 4,5:1 für Fließtext und ≥ 3:1 für Großtext.</li>
            <li>Responsives Layout — bedienbar auf Smartphone, Tablet und Desktop.</li>
            <li>Touch-Ziele ≥ 44×44 px auf mobilen Endgeräten.</li>
            <li>Lang-Attribut (de) auf html-Element für Screenreader.</li>
            <li>Skip-Link / single &lt;main&gt; landmark zur schnellen Navigation.</li>
            <li>Alternativtexte für alle inhaltlich relevanten Bilder.</li>
            <li>Heller und dunkler Modus für reduzierte Augenbelastung.</li>
          </ul>
        </SubSection>

        <SubSection title="Bekannte Einschränkungen">
          <p>
            Wir arbeiten kontinuierlich daran, Barrieren abzubauen. Bekannte
            Einschränkungen, die im Rahmen einer angemessenen Belastung
            (§ 17 BFSG) noch bestehen:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Einzelne ältere Bildunterschriften enthalten noch keine vollständigen Alternativtexte — wir ergänzen diese laufend.</li>
            <li>Komplexe Datenvisualisierungen (Tabellen, Diagramme) werden derzeit nicht zusätzlich als Langbeschreibung angeboten.</li>
            <li>Eingebettete Videos Dritter unterliegen nicht unserer redaktionellen Kontrolle hinsichtlich Untertitelung.</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="3. Erstellung dieser Erklärung">
        <p>
          Diese Erklärung wurde am <strong className="text-foreground">13. Juni 2026</strong>{" "}
          erstellt. Die Bewertung basiert auf einer Selbstbewertung mittels
          automatisierter Prüftools (Lighthouse, axe-core) sowie manueller
          Prüfung gegen WCAG 2.1 AA. Die Erklärung wird mindestens einmal
          jährlich überprüft.
        </p>
      </Section>

      <Section title="4. Feedback &amp; Kontakt zur Barrierefreiheit">
        <p>
          Sind Ihnen Mängel beim barrierefreien Zugang zu Inhalten von
          welchesfahrrad.de aufgefallen? Möchten Sie Inhalte in einer zugänglichen
          Form anfordern? Kontaktieren Sie unsere Ansprechstelle:
        </p>
        <InfoBox tone="muted">
          <p>
            <strong className="text-foreground">Ansprechpartner Barrierefreiheit</strong><br />
            DigiMarket Bulgaria<br />
            6400 Dimitrovgrad, Bulgarien<br />
            E-Mail:{" "}
            <a
              href="mailto:support@welchesfahrrad.de?subject=Barrierefreiheit"
              className="text-signal hover:underline"
            >
              support@welchesfahrrad.de
            </a>
          </p>
          <p className="mt-3 text-xs">
            Wir bemühen uns, Ihre Anfrage innerhalb von 14 Tagen zu beantworten.
          </p>
        </InfoBox>
      </Section>

      <Section title="5. Durchsetzungsverfahren">
        <p>
          Sollten auch nach Ihrem Feedback an uns zufriedenstellende Lösungen
          nicht gefunden werden, können Sie sich an die zuständige
          Marktüberwachungs- und Schlichtungsstelle wenden:
        </p>

        <SubSection title="Bundesfachstelle Barrierefreiheit (Deutschland)">
          <p>
            Bundesfachstelle für Barrierefreiheit<br />
            Krögerstraße 2, 60313 Frankfurt am Main<br />
            E-Mail:{" "}
            <a
              href="mailto:info@bundesfachstelle-barrierefreiheit.de"
              className="text-signal hover:underline"
            >
              info@bundesfachstelle-barrierefreiheit.de
            </a>
            <br />
            Web:{" "}
            <a
              href="https://www.bundesfachstelle-barrierefreiheit.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-signal hover:underline"
            >
              www.bundesfachstelle-barrierefreiheit.de
            </a>
          </p>
        </SubSection>

        <SubSection title="Schlichtungsstelle nach § 16 BGG">
          <p>
            Schlichtungsstelle nach dem Behindertengleichstellungsgesetz<br />
            bei dem Beauftragten der Bundesregierung für die Belange von
            Menschen mit Behinderungen<br />
            Mauerstraße 53, 10117 Berlin<br />
            E-Mail:{" "}
            <a
              href="mailto:info@schlichtungsstelle-bgg.de"
              className="text-signal hover:underline"
            >
              info@schlichtungsstelle-bgg.de
            </a>
            <br />
            Web:{" "}
            <a
              href="https://www.schlichtungsstelle-bgg.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-signal hover:underline"
            >
              www.schlichtungsstelle-bgg.de
            </a>
          </p>
        </SubSection>

        <SubSection title="Marktüberwachung (BFSG)">
          <p>
            Marktüberwachungsstelle der Länder für die Barrierefreiheit von
            Produkten und Dienstleistungen (MLBF)<br />
            c/o Landesamt für soziale Dienste Schleswig-Holstein<br />
            Web:{" "}
            <a
              href="https://mlbf.bund.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-signal hover:underline"
            >
              mlbf.bund.de
            </a>
          </p>
        </SubSection>
      </Section>

      <Section title="6. Weitere Informationen">
        <p>
          Hinweise zur Datenverarbeitung im Rahmen von Anfragen zur
          Barrierefreiheit finden Sie in unserer{" "}
          <Link to="/datenschutz" className="text-signal hover:underline">
            Datenschutzerklärung
          </Link>
          . Allgemeine Rechtsgrundlagen sind im{" "}
          <Link to="/impressum" className="text-signal hover:underline">
            Impressum
          </Link>{" "}
          aufgeführt.
        </p>
      </Section>
    </LegalPage>
  );
}
