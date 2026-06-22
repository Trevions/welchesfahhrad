import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Receipt, Search } from "lucide-react";
import { ToolShell, ToolCard, ToolDisclaimer } from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/bussgeld")({
  head: () =>
    toolHead({
      title: "Bußgeld-Tabelle für Radfahrer",
      description:
        "Aktuelle Bußgelder, Punkte und Folgen für Radfahrer — durchsuchbar nach Verstoß. Nach dem aktuellen Bundeseinheitlichen Tatbestandskatalog.",
      path: "/tools/bussgeld",
    }),
  component: BussgeldPage,
});

type Row = { violation: string; fine: string; points: number; note?: string };

const ROWS: Row[] = [
  { violation: "Rote Ampel überfahren", fine: "60 €", points: 1 },
  { violation: "Rote Ampel überfahren (Rotphase > 1 s)", fine: "100 €", points: 1 },
  { violation: "Rote Ampel mit Gefährdung", fine: "160 €", points: 1 },
  { violation: "Rote Ampel mit Sachbeschädigung", fine: "180 €", points: 1 },
  { violation: "Gehweg befahren", fine: "55 €", points: 0 },
  { violation: "Gehweg mit Gefährdung", fine: "80 €", points: 0 },
  { violation: "Falsche Fahrtrichtung auf Radweg", fine: "20 €", points: 0 },
  { violation: "Falsche Fahrtrichtung mit Gefährdung", fine: "35 €", points: 0 },
  { violation: "Radweg nicht benutzt trotz Pflicht (Zeichen 237/240/241)", fine: "20 €", points: 0 },
  { violation: "Nebeneinander fahren mit Behinderung", fine: "20 €", points: 0 },
  { violation: "Handy in der Hand", fine: "55 €", points: 0 },
  { violation: "Ohne Licht bei Dunkelheit", fine: "20 €", points: 0 },
  { violation: "Ohne Licht mit Gefährdung", fine: "35 €", points: 0 },
  { violation: "Fahrrad ohne vorgeschriebene Bremsen / Klingel", fine: "15 €", points: 0 },
  { violation: "Falsches Abbiegen ohne Handzeichen", fine: "10 €", points: 0 },
  { violation: "Vorfahrt nicht beachtet", fine: "25 €", points: 0 },
  { violation: "Vorfahrt nicht beachtet mit Gefährdung", fine: "85 €", points: 0 },
  { violation: "Alkohol 0,3 ‰ + Auffälligkeit (rel. Fahruntüchtigkeit)", fine: "Strafverfahren", points: 3, note: "MPU möglich" },
  { violation: "Alkohol 1,6 ‰ (absolute Fahruntüchtigkeit)", fine: "Strafverfahren", points: 3, note: "MPU & Fahrverbot" },
  { violation: "Kopfhörer mit Behinderung des Gehörs", fine: "15 €", points: 0 },
  { violation: "Telefonieren mit Headset (Lautstärke kritisch)", fine: "10 €", points: 0 },
  { violation: "Kinder ohne Sitz mitgenommen", fine: "5 €", points: 0 },
  { violation: "Reifen ohne ausreichendes Profil / defekt", fine: "10 €", points: 0 },
  { violation: "Hupen, statt klingeln", fine: "15 €", points: 0 },
  { violation: "Festhalten an einem Fahrzeug", fine: "5 €", points: 0 },
];

function BussgeldPage() {
  const [q, setQ] = useState("");
  const norm = q.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      !norm
        ? ROWS
        : ROWS.filter(
            (r) =>
              r.violation.toLowerCase().includes(norm) ||
              r.note?.toLowerCase().includes(norm),
          ),
    [norm],
  );

  return (
    <ToolShell
      eyebrow="Recht · 02"
      title="Bußgeld-Tabelle"
      description="Was kostet welcher Verstoß? Tabelle nach dem Bundeseinheitlichen Tatbestandskatalog — durchsuchbar."
      icon={Receipt}
    >
      <ToolCard className="mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Suche: Ampel, Gehweg, Handy, Promille…"
            className="w-full rounded-xl border border-border bg-background/60 py-3 pl-10 pr-4 text-sm outline-none focus:border-signal/60 focus:ring-2 focus:ring-signal/20"
          />
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {filtered.length} von {ROWS.length} Verstößen
        </div>
      </ToolCard>

      <ToolCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <th className="py-2 pr-3">Verstoß</th>
              <th className="py-2 pr-3 text-right">Bußgeld</th>
              <th className="py-2 pr-3 text-right">Punkte</th>
              <th className="py-2 pr-3">Hinweis</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="py-3 pr-3 font-medium">{r.violation}</td>
                <td className="py-3 pr-3 text-right font-mono font-bold text-signal">{r.fine}</td>
                <td className="py-3 pr-3 text-right font-mono">{r.points || "—"}</td>
                <td className="py-3 pr-3 text-muted-foreground">{r.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ToolCard>

      <ToolDisclaimer>
        Quelle: Bundeseinheitlicher Tatbestandskatalog (BKat-Bike, aktuelle Fassung).
        Punkte werden in Flensburg nur eingetragen, wenn auch ein Kfz-Führerschein besteht.
        Stand 2025 — keine Rechtsberatung.
      </ToolDisclaimer>
    </ToolShell>
  );
}
