import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wrench } from "lucide-react";
import { ToolShell, ToolCard, ToolDisclaimer } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/werkzeug-liste")({
  head: () =>
    toolHead({
      title: "Werkzeug-Liste fürs Fahrrad",
      description:
        "Was wirklich in die Satteltasche gehört — und welche Werkzeuge in der Heimwerkstatt nicht fehlen dürfen. Kuratiert von der Redaktion.",
      path: "/tools/werkzeug-liste",
    }),
  component: ToolsListPage,
});

type Tab = "bag" | "shop";

const lists: Record<Tab, { item: string; why: string }[]> = {
  bag: [
    { item: "Mini-Multitool (Inbus 2–8 mm, Torx T25, Schraubendreher)", why: "Schaltung, Sattel, Vorbau, Bremsen nachstellen." },
    { item: "Ersatzschlauch (passend zu Reifengröße und Ventil)", why: "Schneller als jedes Flicken." },
    { item: "2× Reifenheber aus Kunststoff", why: "Stahl-Heber beschädigen Felgenbett & Schlauch." },
    { item: "Mini-Pumpe oder CO₂-Patrone + Adapter", why: "Min. 6 bar — sonst Reifen-Slip in der Kurve." },
    { item: "Tubeless-Plugs", why: "Bei Tubeless-Setup Pflicht." },
    { item: "Kettenschloss (passend zur Schaltung)", why: "9/10/11/12-fach-spezifisch — vorher checken." },
    { item: "Kabelbinder (3×)", why: "Provisorische Befestigung von allem." },
    { item: "Klebebandstreifen (Panzertape um Pumpe gewickelt)", why: "Notfall-Patch für Reifenflanke." },
    { item: "Putzlappen / Einweghandschuhe", why: "Kette schmutzig — Hände bleiben sauber." },
    { item: "Notfall-Karte / Versichertenkarte / Bargeld", why: "Akku leer = kein Apple Pay." },
  ],
  shop: [
    { item: "Drehmomentschlüssel 2–24 Nm", why: "Carbon-Komponenten brauchen exakte Werte." },
    { item: "Inbus-Set (1,5–10 mm) + Torx (T10–T30)", why: "Standard aller Marken." },
    { item: "Kettennieter (für 8–12-fach)", why: "Kette kürzen und Schloss montieren." },
    { item: "Kettenlehre / Kettenmessgerät", why: "Verschleiß rechtzeitig erkennen (< 0,5 %)." },
    { item: "Speichenschlüssel (Set mit gängigen Größen)", why: "Laufrad zentrieren." },
    { item: "Innenlager- / Kassetten-Abzieher (modellspezifisch)", why: "Verschleißteile tauschen." },
    { item: "Steuersatz-Werkzeug / Kassetten-Peitsche", why: "Für Service ohne Werkstatt." },
    { item: "Montageständer", why: "Spart Rücken und Zeit." },
    { item: "Kettenöl (nass/trocken passend zur Saison)", why: "Wichtigste Wartungs-Investition überhaupt." },
    { item: "Bremsen-Reiniger & Universal-Entfetter", why: "Niemals Bremsscheibe mit Kettenmittel berühren." },
    { item: "Werkstatt-Pumpe mit Manometer", why: "Mini-Pumpe ist Notfall — nicht Alltag." },
    { item: "Erste-Hilfe-Set für Carbon: Drehmomentpaste & Sattelstützenfett", why: "Verhindert Knacken und Setz-Probleme." },
  ],
};

function ToolsListPage() {
  const [tab, setTab] = useState<Tab>("bag");

  return (
    <ToolShell
      eyebrow="Wartung · 03"
      title="Werkzeug-Liste"
      description="Zwei Listen. Eine für unterwegs in der Satteltasche, eine für die Heimwerkstatt. Beide gelesen — beides spart Geld."
      icon={Wrench}
    >
      <div className="mb-6 inline-flex rounded-xl border border-border bg-card/60 p-1">
        {(
          [
            { id: "bag", label: "Satteltasche" },
            { id: "shop", label: "Heimwerkstatt" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "bg-signal text-signal-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ToolCard>
        <ul className="divide-y divide-border">
          {lists[tab].map((entry, i) => (
            <li key={i} className="flex items-start gap-4 py-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-border bg-background/40 text-xs font-bold text-signal">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="font-medium text-foreground">{entry.item}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">{entry.why}</div>
              </div>
            </li>
          ))}
        </ul>
      </ToolCard>

      <ToolDisclaimer>
        Empfehlungen sind markenneutral. Wir verlinken bewusst keine Shops — Werkzeug ist
        Geschmackssache, aber jedes Stück auf dieser Liste hat sich in unserer Werkstatt
        bewährt.
      </ToolDisclaimer>
    </ToolShell>
  );
}
