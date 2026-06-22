import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import {
  ToolShell,
  ToolCard,
  ToolLabel,
  ToolInput,
  ToolSelect,
  ToolDisclaimer,
} from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/wartungsintervalle")({
  head: () =>
    toolHead({
      title: "Wartungs-Intervalle für dein Fahrrad",
      description:
        "Service-Plan nach Kilometern und Saison — Kette, Bremsen, Züge, Lager, Inspektion. Für Stadt-, Trekking-, MTB-, Rennrad- und E-Bike-Nutzung.",
      path: "/tools/wartungsintervalle",
    }),
  component: WartungPage,
});

type BikeType = "city" | "trekking" | "mtb" | "road" | "ebike";

type Task = { name: string; everyKm: number; note: string };

const PLANS: Record<BikeType, Task[]> = {
  city: [
    { name: "Kette ölen", everyKm: 200, note: "Bei Regen häufiger." },
    { name: "Reifendruck prüfen", everyKm: 100, note: "Alle 1–2 Wochen." },
    { name: "Bremsbeläge prüfen", everyKm: 1000, note: "Verschleißmarkierung beachten." },
    { name: "Schaltung justieren", everyKm: 2000, note: "Oder bei unsauberem Schalten." },
    { name: "Schaltzüge tauschen", everyKm: 5000, note: "Mindestens 1× pro Jahr." },
    { name: "Kette messen / tauschen", everyKm: 3000, note: "0,5–0,75 % Verschleiß = tauschen." },
    { name: "Große Inspektion (Werkstatt)", everyKm: 5000, note: "Lager, Steuersatz, Speichen." },
  ],
  trekking: [
    { name: "Kette ölen", everyKm: 250, note: "Trockenöl im Sommer, Nassöl Herbst." },
    { name: "Reifendruck prüfen", everyKm: 200, note: "" },
    { name: "Bremsbeläge prüfen", everyKm: 1500, note: "" },
    { name: "Schaltung justieren", everyKm: 2500, note: "" },
    { name: "Kette messen / tauschen", everyKm: 3500, note: "" },
    { name: "Schaltzüge tauschen", everyKm: 6000, note: "" },
    { name: "Große Inspektion", everyKm: 5000, note: "" },
  ],
  mtb: [
    { name: "Kette ölen", everyKm: 150, note: "Nach jeder Schlamm-Fahrt." },
    { name: "Bremsbeläge prüfen", everyKm: 500, note: "MTB-Bremsen verschleißen schneller." },
    { name: "Dämpfer / Gabel-Service", everyKm: 3000, note: "Lower-Leg-Service nach Herstellerangabe." },
    { name: "Kette messen / tauschen", everyKm: 2000, note: "Kürzeres Intervall durch Schmutz." },
    { name: "Lager prüfen (Steuersatz, Tretlager, Hauptlager)", everyKm: 4000, note: "" },
    { name: "Tubeless-Milch nachfüllen", everyKm: 1500, note: "Oder alle 2–3 Monate." },
  ],
  road: [
    { name: "Kette ölen", everyKm: 300, note: "Sauberes Setup → längere Intervalle." },
    { name: "Reifendruck prüfen", everyKm: 100, note: "Vor jeder Ausfahrt." },
    { name: "Bremsbeläge prüfen", everyKm: 2500, note: "" },
    { name: "Schaltzüge tauschen", everyKm: 8000, note: "Bei Di2/AXS: Batterien laden." },
    { name: "Kette messen / tauschen", everyKm: 4000, note: "" },
    { name: "Reifen tauschen", everyKm: 4000, note: "Schnittfeste Performance-Reifen → früher tauschen." },
    { name: "Große Inspektion", everyKm: 5000, note: "" },
  ],
  ebike: [
    { name: "Kette ölen", everyKm: 200, note: "Hohes Drehmoment → Kette stärker belastet." },
    { name: "Kette messen / tauschen", everyKm: 2500, note: "Spezielle E-Bike-Ketten verwenden." },
    { name: "Bremsbeläge prüfen", everyKm: 1500, note: "Höheres Gewicht → schnellerer Verschleiß." },
    { name: "Motor-Firmware-Update", everyKm: 5000, note: "Oder jährlich beim Händler." },
    { name: "Akku-Check / Diagnose", everyKm: 5000, note: "Bei Bosch/Shimano via Händler-Tool." },
    { name: "Große Inspektion", everyKm: 3000, note: "Erstinspektion nach 200–500 km!" },
  ],
};

function WartungPage() {
  const [type, setType] = useState<BikeType>("trekking");
  const [kmYear, setKmYear] = useState(3000);

  const rows = useMemo(() => {
    return PLANS[type].map((t) => {
      const timesPerYear = Math.max(1, Math.round(kmYear / t.everyKm));
      const daysBetween = Math.round(365 / timesPerYear);
      return { ...t, timesPerYear, daysBetween };
    });
  }, [type, kmYear]);

  return (
    <ToolShell
      eyebrow="Wartung · 04"
      title="Wartungs-Intervalle"
      description="Wann ist welches Teil dran? Service-Plan abgestimmt auf Radtyp und Jahreskilometer."
      icon={CalendarClock}
    >
      <div className="grid gap-6">
        <ToolCard>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <ToolLabel>Radtyp</ToolLabel>
              <ToolSelect value={type} onChange={(e) => setType(e.target.value as BikeType)}>
                <option value="city">City / Stadtrad</option>
                <option value="trekking">Trekking</option>
                <option value="mtb">MTB</option>
                <option value="road">Rennrad</option>
                <option value="ebike">E-Bike</option>
              </ToolSelect>
            </div>
            <div>
              <ToolLabel>Kilometer pro Jahr</ToolLabel>
              <ToolInput
                type="number"
                value={kmYear}
                onChange={(e) => setKmYear(+e.target.value || 0)}
              />
            </div>
          </div>
        </ToolCard>

        <ToolCard className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="py-2 pr-3">Aufgabe</th>
                <th className="py-2 pr-3">Intervall</th>
                <th className="py-2 pr-3">Pro Jahr</th>
                <th className="py-2 pr-3">≈ Alle</th>
                <th className="py-2 pr-3">Hinweis</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pr-3 font-medium">{r.name}</td>
                  <td className="py-3 pr-3 font-mono">{r.everyKm} km</td>
                  <td className="py-3 pr-3 font-mono">{r.timesPerYear}×</td>
                  <td className="py-3 pr-3 font-mono">{r.daysBetween} Tage</td>
                  <td className="py-3 pr-3 text-muted-foreground">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ToolCard>
      </div>

      <ToolDisclaimer>
        Werte sind Erfahrungswerte aus der Werkstatt und decken sich mit Empfehlungen von
        Shimano, SRAM und Bosch. Reale Intervalle hängen von Fahrstil, Wetter und Pflege ab.
      </ToolDisclaimer>
    </ToolShell>
  );
}
