import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Section, InfoBox } from "@/components/LegalPage";

export const Route = createFileRoute("/sicherheit")({
  head: () => ({
    meta: [
      { title: "Sicherheit & Vertrauen — welchesfahrrad.de" },
      {
        name: "description",
        content:
          "Wie welchesfahrrad.de Nutzerdaten schützt: Authentifizierung, Datenverarbeitung, Drittdienste und Kontakt für Sicherheitsfragen.",
      },
      { property: "og:title", content: "Sicherheit & Vertrauen — welchesfahrrad.de" },
      {
        property: "og:description",
        content:
          "Transparenter Überblick über Sicherheit, Datenschutz und Subdienstleister bei welchesfahrrad.de.",
      },
      { property: "og:url", content: "https://welchesfahrrad.de/sicherheit" },
    ],
    links: [{ rel: "canonical", href: "https://welchesfahrrad.de/sicherheit" }],
  }),
  component: TrustPage,
});

function TrustPage() {
  return (
    <LegalPage
      eyebrow="Vertrauen"
      title="Sicherheit & Vertrauen"
      lead="Diese Seite wird von der Redaktion von welchesfahrrad.de gepflegt und beantwortet die häufigsten Fragen zu Sicherheit, Datenschutz und Betrieb unserer Plattform. Sie ist eine sachliche Selbstauskunft — keine unabhängige Zertifizierung."
      updated="22. Juni 2026"
    >
      <InfoBox tone="signal">
        <strong className="text-foreground">Geteilte Verantwortung:</strong>{" "}
        welchesfahrrad.de ist für den Anwendungs-Code, Inhalte und Konfiguration
        verantwortlich. Hosting, Datenbank, Authentifizierung und E-Mail-Versand
        laufen über etablierte Anbieter (siehe Abschnitt „Subdienstleister"). Du
        bist für ein sicheres Passwort und den Schutz deines Zugangs
        verantwortlich.
      </InfoBox>

      <Section title="1. Authentifizierung & Zugriff">
        <p>
          Nutzerkonten werden über unseren Backend-Anbieter mit
          E-Mail/Passwort und Google-OAuth abgesichert. Passwörter werden
          niemals im Klartext gespeichert; das Hashing erfolgt serverseitig
          beim Backend-Anbieter. Sitzungen werden über sichere Tokens
          verwaltet und können jederzeit über das Abmelden beendet werden.
        </p>
        <p>
          Redaktions- und Admin-Funktionen sind über serverseitige
          Rollenprüfungen geschützt. Berechtigungen werden in einer
          separaten Rollen-Tabelle gespeichert und auf Datenbank-Ebene
          erzwungen (Row-Level-Security).
        </p>
      </Section>

      <Section title="2. Plattform & Hosting">
        <p>
          Die Anwendung läuft auf einer Edge-Runtime und wird über ein
          Content-Delivery-Network ausgeliefert. Datenbank und
          Authentifizierung werden von einem dedizierten Backend-Anbieter in
          der EU betrieben. Die Verbindung zwischen Browser und Server
          erfolgt ausschließlich über HTTPS (TLS).
        </p>
      </Section>

      <Section title="3. Welche Daten wir verarbeiten">
        <p>
          Wir erheben so wenig personenbezogene Daten wie möglich. Im
          Detail werden verarbeitet:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Kontodaten</strong> (nur bei
            Registrierung): E-Mail-Adresse, optionaler Anzeigename, Avatar.
          </li>
          <li>
            <strong className="text-foreground">Newsletter</strong>: E-Mail
            und Bestätigungs-Status, sofern abonniert.
          </li>
          <li>
            <strong className="text-foreground">Kontaktformular</strong>:
            Name, E-Mail, Nachricht — ausschließlich zur Bearbeitung deiner
            Anfrage.
          </li>
          <li>
            <strong className="text-foreground">Server-Logs</strong>:
            technische Anfragedaten zur Fehlerbehebung; Aufbewahrung max.
            14 Tage.
          </li>
          <li>
            <strong className="text-foreground">Lokaler Browser-Speicher</strong>:
            Theme-Einstellung, Merkliste, Cookie-Auswahl. Verlässt dein
            Gerät nicht.
          </li>
        </ul>
        <p>
          Vollständige Details findest du in der{" "}
          <Link to="/datenschutz" className="text-signal hover:underline">
            Datenschutzerklärung
          </Link>
          .
        </p>
      </Section>

      <Section title="4. Subdienstleister & Integrationen">
        <p>
          Wir nutzen folgende Dienste zur Erbringung der Plattform.
          Auftragsverarbeitungs­verträge bzw. Standardvertragsklauseln
          liegen jeweils vor.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Backend-Anbieter (Datenbank, Auth, Storage) — EU-Region</li>
          <li>Hosting/CDN für statische Auslieferung der Anwendung</li>
          <li>E-Mail-Versand für Newsletter & Transaktionsmails</li>
        </ul>
      </Section>

      <Section title="5. Cookies & Tracking">
        <p>
          welchesfahrrad.de setzt keine Tracking-Cookies, keine Werbenetzwerke und
          kein Drittanbieter-Analytics ein. Es werden ausschließlich
          technisch notwendige Cookies und lokaler Browser-Speicher für
          Einstellungen verwendet. Details:{" "}
          <Link to="/cookies" className="text-signal hover:underline">
            Cookie-Richtlinie
          </Link>
          .
        </p>
      </Section>

      <Section title="6. Aufbewahrung & Löschung">
        <p>
          Konten und damit verknüpfte Profildaten kannst du jederzeit
          löschen lassen — schreib uns dazu eine kurze Nachricht. Newsletter-
          Abonnements können über den Abmelde-Link in jeder E-Mail oder
          unter{" "}
          <Link to="/newsletter/abmelden" className="text-signal hover:underline">
            Newsletter abmelden
          </Link>{" "}
          beendet werden. Server-Logs werden nach 14 Tagen automatisch
          gelöscht.
        </p>
      </Section>

      <Section title="7. Datenschutz-Anfragen">
        <p>
          Anfragen nach Art. 15–22 DSGVO (Auskunft, Berichtigung, Löschung,
          Einschränkung, Datenübertragbarkeit, Widerspruch) richtest du an{" "}
          <a
            href="mailto:support@welchesfahrrad.de"
            className="text-signal hover:underline"
          >
            support@welchesfahrrad.de
          </a>
          . Wir antworten innerhalb der gesetzlichen Frist.
        </p>
      </Section>

      <Section title="8. Sicherheitskontakt & Schwachstellenmeldung">
        <p>
          Du hast eine mögliche Schwachstelle entdeckt? Bitte melde sie
          vertraulich an{" "}
          <a
            href="mailto:support@welchesfahrrad.de"
            className="text-signal hover:underline"
          >
            support@welchesfahrrad.de
          </a>
          . Wir bestätigen den Eingang zeitnah und arbeiten kooperativ an
          einer Lösung. Bitte führe keine destruktiven Tests gegen unsere
          Systeme durch.
        </p>
      </Section>

      <Section title="9. Compliance-Hinweis">
        <p>
          welchesfahrrad.de hält die Anforderungen der DSGVO und des deutschen
          TDDDG ein. Diese Seite stellt jedoch keine unabhängige
          Zertifizierung (z.B. ISO 27001, SOC 2) dar. Alle Aussagen sind
          Selbstauskünfte der Redaktion.
        </p>
      </Section>
    </LegalPage>
  );
}
