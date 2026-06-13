import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { LegalPage, Section, InfoBox } from "@/components/LegalPage";
import { toast } from "sonner";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt — radmap.de" },
      { name: "description", content: "Kontaktiere die Redaktion von radmap.de: Tipps, Pressemitteilungen, Werbeanfragen und Feedback." },
      { property: "og:title", content: "Kontakt — radmap.de" },
      { property: "og:description", content: "Schreib uns: Redaktion, Presse, Werbung, Feedback." },
      { property: "og:url", content: "https://radmap.de/kontakt" },
    ],
    links: [{ rel: "canonical", href: "https://radmap.de/kontakt" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [topic, setTopic] = useState("redaktion");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Nachricht vorgemerkt", {
      description: "Bitte sende deine Anfrage an die im Impressum hinterlegte E-Mail-Adresse — das Kontaktformular wird in Kürze freigeschaltet.",
    });
  };

  return (
    <LegalPage
      eyebrow="Verlag"
      title="Kontakt"
      lead="Wir freuen uns über Hinweise, Pressemitteilungen, Korrekturen und Kooperationsanfragen. Wähle einen Bereich und schreib uns."
    >
      <Section title="Direkter Kontakt">
        <div className="grid sm:grid-cols-2 gap-4 not-prose">
          <div className="border border-border bg-card p-5">
            <Mail className="h-4 w-4 text-signal" />
            <div className="mt-3 eyebrow-sm text-muted-foreground">E-Mail</div>
            <a
              href="mailto:support@radmap.de"
              className="mt-1 inline-block text-sm text-foreground hover:text-signal transition-colors"
            >
              support@radmap.de
            </a>
          </div>
          <div className="border border-border bg-card p-5">
            <MapPin className="h-4 w-4 text-signal" />
            <div className="mt-3 eyebrow-sm text-muted-foreground">Anbieter</div>
            <div className="mt-1 text-sm text-foreground">
              DigiMarket Bulgaria<br />
              6400 Dimitrovgrad, Bulgarien
            </div>
          </div>

        </div>
      </Section>

      <Section title="Nachricht senden">
        <form onSubmit={onSubmit} className="not-prose space-y-4">
          <div>
            <label className="eyebrow-sm text-muted-foreground">Anliegen</label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "redaktion", label: "Redaktion" },
                { id: "presse", label: "Presse" },
                { id: "werbung", label: "Werbung" },
                { id: "sonstiges", label: "Sonstiges" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.id)}
                  className={
                    "border px-3 py-2.5 eyebrow-sm transition-colors " +
                    (topic === t.id
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground")
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="eyebrow-sm text-muted-foreground" htmlFor="k-name">Name</label>
              <input
                id="k-name"
                required
                className="mt-2 w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="eyebrow-sm text-muted-foreground" htmlFor="k-mail">E-Mail</label>
              <input
                id="k-mail"
                type="email"
                required
                className="mt-2 w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="eyebrow-sm text-muted-foreground" htmlFor="k-betreff">Betreff</label>
            <input
              id="k-betreff"
              required
              className="mt-2 w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <div>
            <label className="eyebrow-sm text-muted-foreground" htmlFor="k-msg">Nachricht</label>
            <textarea
              id="k-msg"
              required
              rows={6}
              className="mt-2 w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors resize-y"
            />
          </div>

          <label className="flex items-start gap-3 text-xs text-muted-foreground">
            <input type="checkbox" required className="mt-0.5" />
            <span>
              Ich habe die{" "}
              <Link to="/datenschutz" className="text-signal hover:underline">Datenschutzerklärung</Link>{" "}
              gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung
              meiner Anfrage zu. Die Daten werden nicht an Dritte weitergegeben.
            </span>
          </label>

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-3 eyebrow-sm hover:bg-signal hover:text-signal-foreground transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            Nachricht senden
          </button>
        </form>

        <InfoBox>
          Bis zur technischen Freischaltung des Formular-Versands erreichst du
          uns am schnellsten per E-Mail an{" "}
          <a href="mailto:support@radmap.de" className="text-signal hover:underline">
            support@radmap.de
          </a>.
        </InfoBox>

      </Section>
    </LegalPage>
  );
}
