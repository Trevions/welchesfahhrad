import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LifeBuoy, ChevronDown } from "lucide-react";
import { ToolShell, ToolCard, ToolDisclaimer } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/pannenhilfe")({
  head: () =>
    toolHead({
      title: "Pannenhilfe-Guide für Radfahrer",
      description:
        "Schritt-für-Schritt durch die häufigsten Fahrradpannen — Platten, Kette, Schaltung, Bremse, Speiche und E-Bike-Fehler.",
      path: "/tools/pannenhilfe",
    }),
  component: PannenPage,
});

const guides: { id: string; title: string; tools: string; steps: string[] }[] = [
  {
    id: "flat",
    title: "Platten reparieren (Schlauch)",
    tools: "Reifenheber, Ersatzschlauch / Flicken, Pumpe",
    steps: [
      "Bike umdrehen oder hochstellen, Bremse öffnen (V-Brake/Cantilever), Laufrad ausbauen.",
      "Restluft ablassen, Reifen mit zwei Hebern ab der Felge hebeln (nicht beide Seiten).",
      "Schlauch entnehmen, Reifeninnenseite mit Finger abtasten — Fremdkörper entfernen!",
      "Ursache prüfen: Stelle am Schlauch markieren und mit Reifenstelle abgleichen.",
      "Neuen / geflickten Schlauch leicht aufpumpen, einsetzen, Reifen wieder auf die Felge ziehen.",
      "Mit 1 bar prüfen ob Schlauch nirgends eingeklemmt ist, dann auf Soll-Druck pumpen.",
    ],
  },
  {
    id: "tubeless",
    title: "Tubeless: Loch dichtet nicht",
    tools: "Plug-Set, evtl. Schlauch als Fallback",
    steps: [
      "Loch nach unten drehen, kurz aufpumpen — Milch in Position bringen.",
      'Bei größerem Loch: Tubeless-Plug („Bacon Strip") einsetzen, Reifen drehen.',
      "Wenn weiter undicht: Mantel entfernen, von innen mit Patch-Kit kleben oder Notfall-Schlauch einbauen.",
    ],
  },
  {
    id: "chain",
    title: "Kette gerissen",
    tools: "Kettennieter, Kettenschloss (passend zur Schaltung 9/10/11/12-fach)",
    steps: [
      "Beschädigte Glieder mit Kettennieter ausdrücken — bis 2 saubere Außenlaschen entstehen.",
      "Kette wieder durch Schaltwerk und Umwerfer fädeln (über kleinem Ritzel und kleinem Kettenblatt).",
      "Kettenschloss einsetzen, Kurbel rückwärts treten bis es einrastet.",
      "Schalten testen, bei zu kurzer Kette langsam nach Hause schalten — niemals großes KB + großes Ritzel.",
    ],
  },
  {
    id: "derailleur",
    title: "Schaltung springt / wechselt nicht sauber",
    tools: "3-mm-Inbus / Schraubendreher",
    steps: [
      "Auf größtes Ritzel schalten — Schaltauge & Schaltwerk müssen vertikal stehen.",
      "Zugspannung an Einstellschraube am Schaltwerk: bei Verzögerung beim Hochschalten 1/4 Umdrehung gegen Uhrzeigersinn.",
      'Wechselt nicht runter aufs kleinste Ritzel? Anschlagschraube „H" leicht öffnen.',
      'Wechselt nicht rauf? Anschlagschraube „L" leicht öffnen.',
      "Letzter Check: Schaltauge verbogen → in Werkstatt richten lassen.",
    ],
  },
  {
    id: "brake",
    title: "Bremse schleift",
    tools: "5-mm-Inbus, evtl. Bremsbelag-Spreizer",
    steps: [
      "Bei Felgenbremse: Beläge gleichmäßig zur Felge ausrichten, Zugspannung an Tonne nachjustieren.",
      "Bei Scheibenbremse: Sattel-Schrauben lösen, Hebel ziehen und halten, Schrauben überkreuz wieder anziehen.",
      "Scheibe verzogen? Mit Sattel-Spreizer oder verstellbarem Schraubenschlüssel vorsichtig zurückbiegen.",
      "Hydraulik schwammig? Entlüften lassen — kein Eingriff ohne Erfahrung.",
    ],
  },
  {
    id: "spoke",
    title: "Speiche gebrochen",
    tools: "Speichenschlüssel, ggf. Ersatz-Speiche",
    steps: [
      "Gebrochene Speiche um die Nachbarspeiche wickeln (sicher fixieren) — Notfall-Heimfahrt möglich.",
      "Schleift das Rad an Bremse / Rahmen: Bremse öffnen, vorsichtig fahren.",
      "Zuhause: Speiche tauschen und Laufrad zentrieren (oder zur Werkstatt).",
    ],
  },
  {
    id: "ebike",
    title: "E-Bike: Motor läuft nicht",
    tools: "—",
    steps: [
      "Akku ab- und wieder anstecken, System neu starten.",
      "Kontakte an Akku und Rahmen säubern (trockenes Tuch).",
      "Display-Fehlercode notieren und im Handbuch nachschlagen.",
      "Geschwindigkeitssensor am Hinterrad richtig positioniert? Magnet muss am Sensor vorbeilaufen.",
      "Nach Sturz: Drehmoment-Sensor kann blockieren — System aus, 30 s warten, neu starten.",
    ],
  },
];

function PannenPage() {
  const [open, setOpen] = useState<string | null>("flat");

  return (
    <ToolShell
      eyebrow="Wartung · 02"
      title="Pannenhilfe-Guide"
      description="Die häufigsten Pannen — und wie du sie unterwegs ohne Werkstatt löst. Mit Werkzeug-Hinweis und nachvollziehbaren Schritten."
      icon={LifeBuoy}
    >
      <div className="grid gap-3">
        {guides.map((g) => {
          const isOpen = open === g.id;
          return (
            <div key={g.id} className="overflow-hidden rounded-2xl border border-border bg-card/60">
              <button
                onClick={() => setOpen(isOpen ? null : g.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-card"
              >
                <div className="min-w-0">
                  <h2 className="font-display text-base font-bold tracking-tight">{g.title}</h2>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Werkzeug: <span className="font-mono">{g.tools}</span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-signal transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <ol className="space-y-2 border-t border-border bg-background/40 p-5 text-sm text-muted-foreground">
                  {g.steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-signal/15 text-xs font-bold text-signal">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>
      <ToolDisclaimer>
        Hinweis: hydraulische Bremsen entlüften, Lager tauschen und Carbon-Reparaturen gehören
        in die Werkstatt. Im Zweifel: ADFC-Pannenhilfe-App oder lokale Pannenservices.
      </ToolDisclaimer>
    </ToolShell>
  );
}
