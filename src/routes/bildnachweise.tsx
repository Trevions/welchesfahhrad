import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Section, InfoBox } from "@/components/LegalPage";

export const Route = createFileRoute("/bildnachweise")({
  head: () => ({
    meta: [
      { title: "Bildnachweise — welchesfahrrad.de" },
      {
        name: "description",
        content:
          "Quellenangaben und Urheberrechtsnachweise für Bilder, Grafiken und Illustrationen auf welchesfahrrad.de gemäß § 13 UrhG.",
      },
      { property: "og:title", content: "Bildnachweise — welchesfahrrad.de" },
      { property: "og:url", content: "https://welchesfahrrad.de/bildnachweise" },
    ],
    links: [{ rel: "canonical", href: "https://welchesfahrrad.de/bildnachweise" }],
  }),
  component: BildnachweisePage,
});

function BildnachweisePage() {
  return (
    <LegalPage
      eyebrow="Recht"
      title="Bildnachweise"
      lead="Quellenangaben und Urheberrechtsnachweise für sämtliche auf welchesfahrrad.de verwendeten Bilder, Grafiken und Illustrationen gemäß § 13 UrhG (Anerkennung der Urheberschaft)."
      updated="13. Juni 2026"
    >
      <InfoBox tone="signal">
        <p>
          Wir achten die Urheberrechte Dritter. Alle auf welchesfahrrad.de
          verwendeten Bildmedien stammen entweder aus eigenen Aufnahmen, sind
          lizenziert oder unterliegen freien Lizenzen (Creative Commons,
          Public Domain). Sollten Sie dennoch eine ungekennzeichnete
          Verwendung eines geschützten Werks bemerken, bitten wir um
          umgehende Mitteilung an{" "}
          <a href="mailto:support@welchesfahrrad.de" className="text-signal hover:underline">
            support@welchesfahrrad.de
          </a>
          .
        </p>
      </InfoBox>

      <Section title="Eigene Aufnahmen">
        <p>
          Sofern nicht anders gekennzeichnet, stammen alle redaktionellen
          Fotografien von Mitgliedern der Redaktion von welchesfahrrad.de und
          unterliegen dem deutschen Urheberrecht (§§ 1 ff. UrhG). Eine
          Nutzung außerhalb des privaten Gebrauchs (§ 53 UrhG) bedarf der
          vorherigen schriftlichen Zustimmung.
        </p>
      </Section>

      <Section title="Lizenzierte Bildquellen">
        <p>
          Für ergänzendes Bildmaterial nutzen wir folgende Anbieter und
          Lizenzmodelle:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-3">
          <li>
            <strong className="text-foreground">Unsplash</strong> —{" "}
            <a
              href="https://unsplash.com/license"
              target="_blank"
              rel="noopener noreferrer"
              className="text-signal hover:underline"
            >
              Unsplash License
            </a>{" "}
            (kostenfrei, kommerzielle Nutzung gestattet, Namensnennung empfohlen).
          </li>
          <li>
            <strong className="text-foreground">Pexels</strong> —{" "}
            <a
              href="https://www.pexels.com/license/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-signal hover:underline"
            >
              Pexels License
            </a>{" "}
            (kostenfrei, kommerzielle Nutzung gestattet).
          </li>
          <li>
            <strong className="text-foreground">Adobe Stock</strong> —{" "}
            <a
              href="https://stock.adobe.com/de/license-terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-signal hover:underline"
            >
              Standard- und Extended-Lizenzen
            </a>{" "}
            (kostenpflichtig, Lizenz pro Asset).
          </li>
          <li>
            <strong className="text-foreground">Creative Commons</strong> — Werke unter{" "}
            <a
              href="https://creativecommons.org/licenses/?lang=de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-signal hover:underline"
            >
              CC BY 4.0 / CC BY-SA 4.0
            </a>{" "}
            mit jeweiliger Namensnennung am Einzelbild.
          </li>
        </ul>
      </Section>

      <Section title="Pressefotos &amp; Herstellerbilder">
        <p>
          Produktabbildungen von Fahrrädern, Komponenten und Zubehör
          stammen, sofern nicht anders gekennzeichnet, aus offiziellen
          Pressedatenbanken der jeweiligen Hersteller und werden im Rahmen
          der von den Rechteinhabern eingeräumten redaktionellen
          Nutzungsrechte verwendet (§ 50 UrhG — Berichterstattung über
          Tagesereignisse). Die Rechte verbleiben beim jeweiligen Hersteller.
        </p>
      </Section>

      <Section title="KI-generierte Bilder">
        <p>
          Einzelne dekorative Illustrationen wurden mit Hilfe generativer
          KI-Systeme erstellt. Solche Bilder sind im Beitrag entsprechend
          gekennzeichnet (&bdquo;Illustration: KI-generiert&ldquo;). Nach
          aktueller deutscher Rechtslage entstehen an rein KI-generierten
          Werken keine Urheberrechte (§ 2 Abs. 2 UrhG — fehlende persönliche
          geistige Schöpfung).
        </p>
      </Section>

      <Section title="Symbole &amp; Icons">
        <p>
          Verwendete UI-Icons stammen aus dem Open-Source-Set{" "}
          <a
            href="https://lucide.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal hover:underline"
          >
            Lucide
          </a>{" "}
          (ISC-Lizenz, freie kommerzielle Nutzung).
        </p>
      </Section>

      <Section title="Schriften">
        <p>
          Eingesetzte Schriftarten werden über lokale Bereitstellung
          (self-hosted) eingebunden, sodass keine Verbindungsdaten an
          Drittanbieter übermittelt werden (vgl.{" "}
          <a
            href="https://www.lg-muenchen-i.bayern.de/media/images/lgmuenchen1/3_zivilrechtspressemit/2022/30122022_endurteil_3_o_17493_20_pseudo.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal hover:underline"
          >
            LG München I, Urt. v. 20.01.2022, 3 O 17493/20 — Google Fonts
          </a>
          ).
        </p>
      </Section>

      <Section title="Meldung von Rechtsverletzungen">
        <p>
          Sollte trotz unserer Sorgfalt ein Bildwerk ohne korrekte
          Lizenzierung oder Quellenangabe veröffentlicht worden sein, melden
          Sie dies bitte mit Nachweis der Inhaberschaft unter Verwendung
          unseres{" "}
          <Link to="/kontakt" className="text-signal hover:underline">
            Kontaktformulars
          </Link>{" "}
          oder per E-Mail an{" "}
          <a
            href="mailto:support@welchesfahrrad.de?subject=Bildrechte"
            className="text-signal hover:underline"
          >
            support@welchesfahrrad.de
          </a>
          . Wir prüfen jede Meldung unverzüglich und entfernen oder
          ergänzen den Nachweis nach den Grundsätzen des Notice-and-Action
          Verfahrens gemäß Art. 16 DSA (VO (EU) 2022/2065).
        </p>
      </Section>
    </LegalPage>
  );
}
