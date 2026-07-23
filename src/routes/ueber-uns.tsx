import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Section } from "@/components/LegalPage";

export const Route = createFileRoute("/ueber-uns")({
  head: () => ({
    meta: [
      { title: "Über uns — radmap.de" },
      { name: "description", content: "radmap.de ist das unabhängige deutsche Fachmagazin für Fahrräder, E-Bikes und Radkultur. Erfahre mehr über unsere Redaktion, unsere Werte und unseren Anspruch." },
      { property: "og:title", content: "Über uns — radmap.de" },
      { property: "og:description", content: "Das unabhängige deutsche Fachmagazin für Fahrräder, E-Bikes und Radkultur." },
      { property: "og:url", content: "https://radmap.de/ueber-uns" },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/ueber-uns" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <LegalPage
      eyebrow="Verlag"
      title="Über radmap.de"
      lead="Unabhängiges Fachmagazin für Fahrradkultur, E-Mobilität und Radsport — recherchiert in Deutschland, geschrieben für Menschen, die das Rad lieben."
    >
      <Section title="Unsere Mission">
        <p>
          radmap.de ist ein digitales Fachmagazin für alle, die das Fahrrad als
          Sportgerät, als Verkehrsmittel und als Ausdruck eines Lebensgefühls
          verstehen. Wir berichten tagesaktuell über Branche, Technik,
          Infrastruktur und Politik — sachlich, recherchiert und ohne
          Gefälligkeit gegenüber Industrie oder Verbänden.
        </p>
        <p>
          Unser Anspruch: Qualitätsjournalismus, der einordnet statt nur
          weiterleitet. Wir prüfen Produkte, hinterfragen Hersteller­versprechen
          und erklären komplexe Zusammenhänge so, dass sie nützlich werden — für
          Pendler:innen, Sportler:innen, Werkstattbesitzer:innen und alle, die
          ihre nächste Tour planen.
        </p>
      </Section>

      <Section title="Was uns auszeichnet">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Unabhängigkeit:</strong> Redaktionelle Inhalte werden klar
            getrennt von werblichen Formaten. Sponsored Content ist als solcher
            gekennzeichnet (§ 6 TMG, § 5a UWG).
          </li>
          <li>
            <strong>Recherche:</strong> Quellen werden geprüft, Aussagen
            belegt, Korrekturen transparent ergänzt.
          </li>
          <li>
            <strong>Fachkompetenz:</strong> Unsere Tests und Hintergrund­stücke
            entstehen mit Fachjournalist:innen, Mechaniker:innen und
            Ingenieur:innen aus der Branche.
          </li>
          <li>
            <strong>Lokalbezug:</strong> Wir berichten über Deutschland,
            Österreich und die Schweiz — Infrastruktur, Politik und Hersteller
            aus der DACH-Region.
          </li>
        </ul>
      </Section>

      <Section title="Themenwelten">
        <p>
          Unsere Berichterstattung gliedert sich in vier feste Ressorts:{" "}
          <Link to="/" className="text-signal hover:underline">Nachrichten</Link>{" "}
          (Politik, Branche, Infrastruktur),{" "}
          <Link to="/ratgeber" className="text-signal hover:underline">Ratgeber</Link>{" "}
          (Kauf, Wartung, Recht),{" "}
          <Link to="/e-bikes" className="text-signal hover:underline">E-Bikes</Link>{" "}
          (Antriebe, Akkus, Förderprogramme) und{" "}
          <Link to="/fahrraeder" className="text-signal hover:underline">Tests</Link>{" "}
          (Räder, Komponenten, Zubehör).
        </p>
      </Section>

      <Section title="Pressekodex &amp; Standards">
        <p>
          radmap.de orientiert sich am Pressekodex des Deutschen Presserats.
          Wir wahren die journalistische Sorgfaltspflicht, kennzeichnen
          Werbung, achten den Persönlichkeitsschutz und korrigieren Fehler
          umgehend und transparent.
        </p>
      </Section>

      <Section title="Kontakt">
        <p>
          Du hast einen Tipp, eine Pressemitteilung oder eine Frage? Wir freuen
          uns über Nachrichten an unsere{" "}
          <Link to="/redaktion" className="text-signal hover:underline">Redaktion</Link>{" "}
          oder über das{" "}
          <Link to="/kontakt" className="text-signal hover:underline">Kontaktformular</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
