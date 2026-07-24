import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Section } from "@/components/LegalPage";

export const Route = createFileRoute("/redaktion")({
  head: () => ({
    meta: [
      { title: "Redaktion — welchesfahrrad.de" },
      { name: "description", content: "Die Redaktion von welchesfahrrad.de: Arbeitsweise, Standards, Kontakt für Tipps und Pressemitteilungen." },
      { property: "og:title", content: "Redaktion — welchesfahrrad.de" },
      { property: "og:description", content: "Wer hinter welchesfahrrad.de steckt und wie wir arbeiten." },
      { property: "og:url", content: "https://welchesfahrrad.de/redaktion" },
    ],
    links: [{ rel: "canonical", href: "https://welchesfahrrad.de/redaktion" }],
  }),
  component: EditorialPage,
});

function EditorialPage() {
  return (
    <LegalPage
      eyebrow="Verlag"
      title="Die Redaktion"
      lead="Wir sind ein digitales Redaktionsteam mit Sitz in Deutschland. Alle Inhalte auf welchesfahrrad.de entstehen unter redaktioneller Verantwortung — ohne Einflussnahme durch Hersteller, Händler oder Werbekunden."
    >
      <Section title="Arbeitsweise">
        <p>
          Beiträge auf welchesfahrrad.de werden von der Redaktion welchesfahrrad.de
          verantwortet. Recherchen basieren auf offiziellen Quellen,
          eigenen Tests und Fachgesprächen mit Branchen­vertreter:innen.
          Jeder Artikel durchläuft eine fachliche Gegenprüfung vor der
          Veröffentlichung.
        </p>
        <p>
          Wir nutzen unterstützend redaktionelle Werkzeuge zur Recherche
          und Strukturierung — die journalistische Verantwortung,
          Quellen­prüfung und Faktencheck liegen ausschließlich beim
          Redaktions­team.
        </p>
      </Section>

      <Section title="Transparenz">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Trennung von Redaktion und Werbung:</strong> Werbliche
            Inhalte werden als „Anzeige" oder „Sponsored" gekennzeichnet.
          </li>
          <li>
            <strong>Affiliate-Links:</strong> Empfehlungen mit Provision
            sind mit einem Sternchen (*) markiert. Sie haben keinen
            Einfluss auf unsere Bewertung.
          </li>
          <li>
            <strong>Testräder &amp; Leihgaben:</strong> Wir kennzeichnen,
            wenn Testprodukte vom Hersteller bereitgestellt wurden, und
            geben sie nach dem Test zurück.
          </li>
          <li>
            <strong>Korrekturen:</strong> Fehler werden offen korrigiert
            und am Artikelende dokumentiert.
          </li>
        </ul>
      </Section>

      <Section title="Verantwortlich im Sinne des § 18 Abs. 2 MStV">
        <p>
          Verantwortlich für den redaktionellen Inhalt nach § 18 Abs. 2
          Medienstaatsvertrag ist die im{" "}
          <Link to="/impressum" className="text-signal hover:underline">Impressum</Link>{" "}
          genannte Person.
        </p>
      </Section>

      <Section title="Kontakt zur Redaktion">
        <p>
          Tipps, Hinweise und Pressemitteilungen erreichen uns über das{" "}
          <Link to="/kontakt" className="text-signal hover:underline">Kontaktformular</Link>{" "}
          oder per E-Mail an die im Impressum hinterlegte Adresse. Für
          Werbekooperationen siehe unsere{" "}
          <Link to="/mediadaten" className="text-signal hover:underline">Mediadaten</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
