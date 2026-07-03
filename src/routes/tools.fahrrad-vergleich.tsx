import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GitCompare, Plus, X } from "lucide-react";
import { ToolShell, ToolCard } from "@/components/tools/ToolShell";
import { ToolReviewedBy, ToolFaq, ToolSeoSection } from "@/components/tools/ToolSeo";
import { toolHead } from "@/lib/tools/seo";

const SLUG = "fahrrad-vergleich";

const FAQ = [
  {
    question: "Nach welchen Kriterien sollte ich Fahrräder vergleichen?",
    answer:
      "Preis-Leistungs-Verhältnis zuerst — gemessen an Ausstattung (Schaltung, Bremsen, Reifen), Gewicht und Garantie. Bei E-Bikes zusätzlich Motor-Marke (Bosch, Shimano, Yamaha), Akku-Kapazität in Wh und Systemintegration. Danach kommen weiche Faktoren: Händlernetz, Ersatzteilverfügbarkeit, Rahmen-Garantie.",
  },
  {
    question: "Warum ist Gewicht so entscheidend?",
    answer:
      "Jedes Kilogramm zählt bei Anstiegen und Beschleunigung. Zwischen einem 9-kg-Rennrad und einem 13-kg-Fitnessbike liegt bei einer 500-hm-Tour rund 20 Watt Zusatzaufwand. Bei E-Bikes ist Gewicht weniger kritisch, aber wichtig für Transport und Handhabung im Alltag.",
  },
  {
    question: "Sind teurere Räder immer besser?",
    answer:
      "Nicht linear. Bis rund 1500 € skaliert die Ausstattungsqualität stark mit dem Preis. Zwischen 2000 und 4000 € kaufst du vor allem Gewichtsersparnis und Schaltungs-Präzision. Ab 5000 € zahlst du hauptsächlich für Rahmen-Material (Carbon), Aerodynamik und Marketing.",
  },
  {
    question: "Kann ich Räder verschiedener Kategorien vergleichen?",
    answer:
      "Technisch ja — praktisch selten sinnvoll. Ein Rennrad und ein E-Trekking-Bike lösen unterschiedliche Probleme. Der Rechner erlaubt jeden Vergleich, aber die aussagekräftigsten Ergebnisse gibt es innerhalb einer Kategorie oder eng benachbart (z. B. Gravel vs. Endurance-Rennrad).",
  },
];

export const Route = createFileRoute("/tools/fahrrad-vergleich")({
  head: () =>
    toolHead({
      title: "Fahrrad-Vergleich: Modelle direkt gegenüberstellen",
      description:
        "Fahrrad-Vergleichstool: bis zu drei Modelle nebeneinander — Preis, Gewicht, Schaltung, Bremsen, Motor, Akku und Garantie. Kuratierte Auswahl aktueller Trekking-, Gravel-, MTB- und E-Bike-Modelle.",
      path: "/tools/fahrrad-vergleich",
      slug: SLUG,
      faq: FAQ,
    }),
  component: VergleichPage,
});

type Bike = {
  id: string; name: string; cat: string; price: number; weight: number;
  drivetrain: string; brakes: string; tires: string; motor?: string; battery?: string; warranty: string;
};

const CATALOG: Bike[] = [
  { id: "canyon-grail-7", name: "Canyon Grail 7", cat: "Gravel", price: 1899, weight: 9.4, drivetrain: "Shimano GRX 600 1×11", brakes: "Hydraulisch", tires: "Schwalbe G-One 40 mm", warranty: "6 Jahre Rahmen" },
  { id: "cube-touring-pro", name: "Cube Touring Pro", cat: "Trekking", price: 1299, weight: 14.5, drivetrain: "Shimano Deore 1×10", brakes: "Hydraulisch", tires: "Schwalbe Marathon 40 mm", warranty: "5 Jahre" },
  { id: "trek-fx-3-disc", name: "Trek FX 3 Disc", cat: "Fitness/Urban", price: 1099, weight: 11.3, drivetrain: "Shimano Acera 1×9", brakes: "Hydraulisch", tires: "Bontrager H2 35 mm", warranty: "Lebenslang Rahmen" },
  { id: "specialized-rockhopper", name: "Specialized Rockhopper Comp", cat: "MTB Hardtail", price: 999, weight: 13.8, drivetrain: "SRAM SX Eagle 1×12", brakes: "Hydraulisch", tires: "Specialized Fast Trak 2.35", warranty: "Lebenslang Rahmen" },
  { id: "riese-mueller-charger4", name: "Riese & Müller Charger4 GT", cat: "E-Trekking", price: 5599, weight: 27, drivetrain: "Shimano XT 1×12", brakes: "MT4120 4-Kolben", tires: "Schwalbe Marathon E-Plus 60 mm", motor: "Bosch Performance CX", battery: "750 Wh", warranty: "5 Jahre" },
  { id: "cube-reaction-hybrid", name: "Cube Reaction Hybrid Pro 750", cat: "E-MTB Hardtail", price: 3499, weight: 22.5, drivetrain: "Shimano Deore 1×12", brakes: "Shimano MT420 4-Kolben", tires: "Schwalbe Smart Sam 2.35", motor: "Bosch Performance CX", battery: "750 Wh", warranty: "5 Jahre" },
  { id: "rose-backroad", name: "Rose Backroad GRX 600", cat: "Gravel", price: 2099, weight: 9.1, drivetrain: "Shimano GRX 600 2×11", brakes: "Hydraulisch", tires: "Schwalbe G-One 40 mm", warranty: "10 Jahre Rahmen" },
  { id: "stevens-courier-luxe", name: "Stevens Courier Luxe", cat: "Urban", price: 1599, weight: 12.5, drivetrain: "Shimano Alfine 8 Nabe", brakes: "Hydraulisch", tires: "Schwalbe Big Apple 50 mm", warranty: "5 Jahre" },
  { id: "kalkhoff-image-3b", name: "Kalkhoff Image 3.B Move 500", cat: "E-City", price: 2799, weight: 25, drivetrain: "Shimano Nexus 7 Nabe", brakes: "Hydraulisch", tires: "Schwalbe Big Ben 50 mm", motor: "Bosch Active Line Plus", battery: "500 Wh", warranty: "5 Jahre" },
  { id: "vsf-tx-1000", name: "VSF Fahrradmanufaktur TX-1000", cat: "Trekking", price: 1899, weight: 14, drivetrain: "Shimano Deore XT 1×11", brakes: "Hydraulisch", tires: "Schwalbe Marathon Mondial 47 mm", warranty: "10 Jahre Rahmen" },
];

const FIELDS: { key: keyof Bike; label: string; format?: (b: Bike) => string }[] = [
  { key: "cat", label: "Kategorie" },
  { key: "price", label: "Preis", format: (b) => `${b.price.toLocaleString("de-DE")} €` },
  { key: "weight", label: "Gewicht", format: (b) => `${b.weight} kg` },
  { key: "drivetrain", label: "Schaltung" },
  { key: "brakes", label: "Bremsen" },
  { key: "tires", label: "Reifen" },
  { key: "motor", label: "Motor", format: (b) => b.motor ?? "—" },
  { key: "battery", label: "Akku", format: (b) => b.battery ?? "—" },
  { key: "warranty", label: "Garantie" },
];

function VergleichPage() {
  const [picks, setPicks] = useState<string[]>([CATALOG[0].id, CATALOG[1].id]);
  const bikes = picks.map((id) => CATALOG.find((b) => b.id === id)).filter(Boolean) as Bike[];
  const addSlot = () => {
    if (picks.length >= 3) return;
    const next = CATALOG.find((b) => !picks.includes(b.id));
    if (next) setPicks([...picks, next.id]);
  };
  const removeSlot = (i: number) => setPicks(picks.filter((_, idx) => idx !== i));
  const updateSlot = (i: number, id: string) => {
    const next = [...picks];
    next[i] = id;
    setPicks(next);
  };

  return (
    <ToolShell
      eyebrow="Kaufberatung · 02"
      title="Fahrrad-Vergleich"
      description="Bis zu drei Modelle direkt nebeneinander. Kuratierte Auswahl gängiger Trekking-, Gravel-, MTB- und E-Bike-Modelle."
      icon={GitCompare}
    >
      <ToolReviewedBy slug={SLUG} />

      <div className="mt-6 mb-6 flex flex-wrap gap-3">
        {picks.map((id, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-card/60 p-2">
            <select value={id} onChange={(e) => updateSlot(i, e.target.value)} className="bg-transparent text-sm font-semibold outline-none">
              {CATALOG.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
            </select>
            {picks.length > 1 && (
              <button onClick={() => removeSlot(i)} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-background/60">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {picks.length < 3 && (
          <button onClick={addSlot} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" /> Modell hinzufügen
          </button>
        )}
      </div>

      <ToolCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-3 pr-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Eigenschaft</th>
              {bikes.map((b) => (<th key={b.id} className="py-3 pr-3 font-display text-base font-bold tracking-tight">{b.name}</th>))}
            </tr>
          </thead>
          <tbody>
            {FIELDS.map((f) => {
              const vals = bikes.map((b) => (f.format ? f.format(b) : String(b[f.key] ?? "—")));
              const allSame = vals.every((v) => v === vals[0]);
              return (
                <tr key={f.key} className="border-b border-border/50">
                  <td className="py-3 pr-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{f.label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className={`py-3 pr-3 ${!allSame ? "font-semibold text-signal" : "text-foreground"}`}>{v}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </ToolCard>

      <ToolSeoSection slug={SLUG} heading="So funktioniert der Fahrrad-Vergleich">
        <p>
          Das Vergleichstool stellt bis zu drei Modelle nebeneinander und markiert
          Unterschiede in <span style={{ color: "var(--signal)" }}>Signal-Farbe</span>. Der
          Katalog enthält aktuell zehn redaktionell gepflegte Referenzmodelle aus den Kategorien
          Gravel, Trekking, Fitness/Urban, MTB, E-Trekking, E-MTB und E-City.
        </p>

        <h3>Vergleichs-Kriterien</h3>
        <ul>
          <li><strong>Preis:</strong> UVP des Herstellers, Straßenpreise können 5–15 % darunter liegen.</li>
          <li><strong>Gewicht:</strong> in kg, hersteller­gemessen — real oft +0,3 bis +1,0 kg.</li>
          <li><strong>Schaltung:</strong> Kettenschaltung nach Shimano/SRAM-Hierarchie, Nabenschaltung nach Gang-Anzahl.</li>
          <li><strong>Bremsen:</strong> hydraulisch vs. mechanisch, 2- vs. 4-Kolben.</li>
          <li><strong>Reifen:</strong> Marke, Modell, Breite in mm.</li>
          <li><strong>Motor & Akku:</strong> nur bei E-Bikes — Marke, Nennwerte in Wh.</li>
          <li><strong>Garantie:</strong> Rahmen und Bauteile getrennt betrachten.</li>
        </ul>

        <h3>Was der Vergleich nicht abbildet</h3>
        <p>
          Fahrgefühl und Geometrie lassen sich in einer Tabelle nicht messen. Ein Canyon Grail
          fährt sich völlig anders als ein Rose Backroad, obwohl beide „Gravel mit Shimano GRX
          600" sind. Für die Kaufentscheidung führen zwei Wege am Vergleich vorbei:
          Testberichte lesen und Probefahrt beim Händler.
        </p>

        <h3>Wann welcher Vergleich sinnvoll ist</h3>
        <ol>
          <li><strong>Erste Kategorie-Auswahl:</strong> zwei Kandidaten aus verschiedenen Kategorien (z. B. Gravel vs. Trekking), um Grundsatz-Entscheidung zu treffen.</li>
          <li><strong>Ausstattungs-Feintuning:</strong> zwei Modelle aus einer Kategorie im ähnlichen Preisbereich, um Preis-Leistungs-Sieger zu finden.</li>
          <li><strong>Preis-Referenz:</strong> ein Referenzmodell + zwei günstigere Alternativen zeigen, wo du sparen kannst und wo Kompromisse anfangen.</li>
        </ol>
      </ToolSeoSection>

      <ToolFaq items={FAQ} slug={SLUG} />
    </ToolShell>
  );
}
