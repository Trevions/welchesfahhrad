import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, RotateCw, Printer } from "lucide-react";
import { ToolShell, ToolCard, ToolDisclaimer } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/sicherheits-check")({
  head: () =>
    toolHead({
      title: "Sicherheits-Check fürs Fahrrad",
      description:
        "Interaktive Checkliste vor jeder längeren Ausfahrt — Bremsen, Beleuchtung, Reifen, Schrauben. StVZO-konform.",
      path: "/tools/sicherheits-check",
    }),
  component: CheckPage,
});

type Item = { id: string; group: string; text: string; hint?: string };

const ITEMS: Item[] = [
  { id: "brake-front", group: "Bremsen", text: "Vorderradbremse greift kräftig, Hebel nicht bis zum Lenker durchziehbar." },
  { id: "brake-rear", group: "Bremsen", text: "Hinterradbremse greift, ohne zu schleifen.", hint: "Rad anheben und drehen — kein Schleifen." },
  { id: "brake-pads", group: "Bremsen", text: "Bremsbeläge / -scheiben über Verschleißmarkierung." },
  { id: "tire-pressure", group: "Reifen", text: "Reifendruck im empfohlenen Bereich (Reifenflanke / unser Rechner)." },
  { id: "tire-tread", group: "Reifen", text: "Reifenprofil & Flanken ohne Risse, keine Glasscherben." },
  { id: "wheel-true", group: "Laufrad", text: "Laufräder rund und seitenschlagfrei, Speichen unter Spannung." },
  { id: "qr-axle", group: "Laufrad", text: "Schnellspanner / Steckachsen fest und korrekt geschlossen." },
  { id: "light-front", group: "Beleuchtung", text: "Frontlicht funktioniert (StVZO §67 Pflicht)." },
  { id: "light-rear", group: "Beleuchtung", text: "Rücklicht funktioniert, Standlicht-Funktion intakt." },
  { id: "reflectors", group: "Beleuchtung", text: "Reflektoren vorn, hinten, an Pedalen und Speichen vorhanden.", hint: "Speichenreflektoren oder reflektierende Reifen." },
  { id: "bell", group: "Beleuchtung", text: "Klingel laut und gut erreichbar (StVZO §64a)." },
  { id: "stem", group: "Cockpit", text: "Vorbau fest — zwischen Knie einklemmen, Lenker nicht verdrehbar." },
  { id: "headset", group: "Cockpit", text: "Steuersatz ohne Spiel — Vorderradbremse ziehen und Rad nach vorn/hinten wippen." },
  { id: "saddle", group: "Cockpit", text: "Sattel fest, Markierung an Sattelstütze noch sichtbar." },
  { id: "chain", group: "Antrieb", text: "Kette geschmiert, nicht trocken oder dreckig-fettig." },
  { id: "chain-wear", group: "Antrieb", text: "Kettenverschleiß OK (Kettenlehre: < 0,5 % Längung)." },
  { id: "shift", group: "Antrieb", text: "Schaltung wechselt sauber durch alle Gänge." },
  { id: "ebike-battery", group: "E-Bike", text: "Akku ausreichend geladen, Kontakte sauber." },
  { id: "tools-flat", group: "Gepäck", text: "Pannenset dabei: Ersatzschlauch, Reifenheber, Multitool, Mini-Pumpe oder CO₂." },
  { id: "id", group: "Gepäck", text: "Ausweis, Handy geladen, ggf. Versichertenkarte." },
];

const STORAGE = "radmap.safety-check";

function CheckPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked]);

  const groups = Array.from(new Set(ITEMS.map((i) => i.group)));
  const done = ITEMS.filter((i) => checked[i.id]).length;
  const pct = Math.round((done / ITEMS.length) * 100);

  return (
    <ToolShell
      eyebrow="Wartung · 01"
      title="Sicherheits-Check"
      description="Drei Minuten, die einen Unfall verhindern können. Alle Punkte folgen der Empfehlung von ADFC und StVZO."
      icon={ShieldCheck}
    >
      <ToolCard className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Fortschritt</div>
            <div className="mt-1 font-display text-3xl font-black">
              {done}<span className="text-base text-muted-foreground"> / {ITEMS.length}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChecked({})}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-card"
            >
              <RotateCw className="h-3.5 w-3.5" /> Zurücksetzen
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-card"
            >
              <Printer className="h-3.5 w-3.5" /> Drucken
            </button>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-background/60">
          <div
            className="h-full rounded-full bg-signal transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </ToolCard>

      <div className="grid gap-4">
        {groups.map((g) => (
          <ToolCard key={g}>
            <h2 className="font-display text-lg font-bold tracking-tight">{g}</h2>
            <ul className="mt-3 divide-y divide-border">
              {ITEMS.filter((i) => i.group === g).map((i) => (
                <li key={i.id} className="flex items-start gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={!!checked[i.id]}
                    onChange={(e) => setChecked((c) => ({ ...c, [i.id]: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-signal"
                  />
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm ${checked[i.id] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {i.text}
                    </div>
                    {i.hint && <div className="mt-0.5 text-xs text-muted-foreground">{i.hint}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </ToolCard>
        ))}
      </div>

      <ToolDisclaimer>
        Quellen: ADFC-Checkliste, StVZO §§ 64a, 65, 67. Bei Mängeln vor der Fahrt beheben oder
        in die Werkstatt. Speicherung lokal in deinem Browser, keine Übertragung.
      </ToolDisclaimer>
    </ToolShell>
  );
}
