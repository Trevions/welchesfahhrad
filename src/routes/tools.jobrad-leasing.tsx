import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import {
  ToolShell,
  ToolCard,
  ToolLabel,
  ToolInput,
  ToolSelect,
  ToolResultStat,
  ToolDisclaimer,
} from "@/components/tools/ToolShell";
import { toolHead } from "@/lib/tools/seo";

export const Route = createFileRoute("/tools/jobrad-leasing")({
  head: () =>
    toolHead({
      title: "JobRad / Dienstrad-Leasing Rechner",
      description:
        "Berechne deine monatliche Netto-Belastung und die Ersparnis gegenüber dem Barkauf — Gehaltsumwandlung, 1 % Versteuerung, Übernahmewert.",
      path: "/tools/jobrad-leasing",
    }),
  component: JobRadPage,
});

type TaxClass = "1" | "3" | "5";

// Vereinfachte Marginalsteuer-Schätzung (Einkommensteuer + Soli + KV/RV/AV/PV)
// Steuerklasse 3: niedriger, 5: höher.
function marginalRate(brutto: number, tc: TaxClass): number {
  const base = brutto < 3000 ? 0.32 : brutto < 5000 ? 0.39 : brutto < 7500 ? 0.44 : 0.48;
  if (tc === "3") return Math.max(0.2, base - 0.05);
  if (tc === "5") return Math.min(0.55, base + 0.07);
  return base;
}

function JobRadPage() {
  const [price, setPrice] = useState(3500);
  const [brutto, setBrutto] = useState(4200);
  const [tc, setTc] = useState<TaxClass>("1");
  const [insured, setInsured] = useState(true);
  const [takeover, setTakeover] = useState(18); // % vom UVP nach 36 Monaten

  const r = useMemo(() => {
    const months = 36;
    // Leasingrate (typisch ~2,8 %/Monat vom UVP brutto, inkl. Service/Versicherung)
    const monthlyLeaseGross = price * (insured ? 0.0295 : 0.027);
    // Gehaltsumwandlung: Brutto sinkt um Leasingrate
    const rate = marginalRate(brutto, tc);
    const monthlyNetCost = monthlyLeaseGross * (1 - rate);
    // 1-%-Regel: 0,25 % vom UVP (gerundet auf 100 €) als geldwerter Vorteil
    const listRounded = Math.floor(price / 100) * 100;
    const gwv = listRounded * 0.0025;
    const taxOnGwv = gwv * rate;

    const monthlyTotal = monthlyNetCost + taxOnGwv;
    const total36 = monthlyTotal * months;
    const takeoverCost = (price * takeover) / 100;
    const totalWithTakeover = total36 + takeoverCost;
    const savings = price - totalWithTakeover;
    const savingsPct = (savings / price) * 100;

    return {
      monthlyLeaseGross: Math.round(monthlyLeaseGross),
      monthlyTotal: Math.round(monthlyTotal),
      total36: Math.round(total36),
      takeoverCost: Math.round(takeoverCost),
      totalWithTakeover: Math.round(totalWithTakeover),
      savings: Math.round(savings),
      savingsPct: +savingsPct.toFixed(1),
      rate: Math.round(rate * 100),
    };
  }, [price, brutto, tc, insured, takeover]);

  return (
    <ToolShell
      eyebrow="Rechner · 06"
      title="JobRad / Leasing-Rechner"
      description="Wie viel kostet dich das Dienstrad wirklich — netto, jeden Monat? Vergleich mit dem Barkauf inklusive Übernahmewert."
      icon={Wallet}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Konditionen</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <ToolLabel>UVP / Bruttopreis Rad (€)</ToolLabel>
              <ToolInput
                type="number"
                value={price}
                onChange={(e) => setPrice(+e.target.value || 0)}
              />
            </div>
            <div>
              <ToolLabel>Brutto-Monatsgehalt (€)</ToolLabel>
              <ToolInput
                type="number"
                value={brutto}
                onChange={(e) => setBrutto(+e.target.value || 0)}
              />
            </div>
            <div>
              <ToolLabel>Steuerklasse</ToolLabel>
              <ToolSelect value={tc} onChange={(e) => setTc(e.target.value as TaxClass)}>
                <option value="1">I / IV (ledig)</option>
                <option value="3">III (verheiratet, Hauptverdiener)</option>
                <option value="5">V (verheiratet, niedriger Verdienst)</option>
              </ToolSelect>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
              <span className="text-sm">Versicherung & Service inklusive</span>
              <input
                type="checkbox"
                checked={insured}
                onChange={(e) => setInsured(e.target.checked)}
                className="h-4 w-4 accent-signal"
              />
            </div>
            <div>
              <ToolLabel>Übernahmewert nach 36 Monaten (%)</ToolLabel>
              <ToolInput
                type="number"
                min={10}
                max={40}
                value={takeover}
                onChange={(e) => setTakeover(+e.target.value || 0)}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Finanzamt akzeptiert i. d. R. 18 % ohne Steuer; viele Anbieter bieten ~10 %.
              </p>
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Deine Belastung</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ToolResultStat
              label="Monatlich netto"
              value={result.monthlyTotal}
              unit="€"
              hint={`Grenzsteuersatz ~${result.rate}%`}
            />
            <ToolResultStat
              label="36 Monate gesamt"
              value={result.total36}
              unit="€"
            />
            <ToolResultStat
              label="Übernahme"
              value={result.takeoverCost}
              unit="€"
              hint={`${takeover}% vom UVP`}
            />
            <ToolResultStat
              label="Gesamtkosten"
              value={result.totalWithTakeover}
              unit="€"
            />
          </div>
          <div className="mt-6 rounded-xl border border-signal/30 bg-signal/5 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-signal">
              Ersparnis vs. Barkauf
            </div>
            <div className="mt-1 font-display text-3xl font-black text-foreground">
              {result.savings > 0 ? "+" : ""}
              {result.savings.toLocaleString("de-DE")} €
              <span className="ml-2 text-base font-medium text-muted-foreground">
                ({result.savingsPct}%)
              </span>
            </div>
          </div>
        </ToolCard>
      </div>

      <ToolDisclaimer>
        Annahmen: 36 Monate Laufzeit, Leasingrate {insured ? "2,95" : "2,7"} % vom UVP/Monat
        (typische Marktwerte JobRad/Bikeleasing), 0,25-%-Regel (Versteuerung 0,25 % vom auf 100 €
        abgerundeten Listenpreis). Grenzsteuersatz geschätzt — kein Ersatz für Beratung von
        Steuerberater oder Arbeitgeber. Stand 2025.
      </ToolDisclaimer>
    </ToolShell>
  );
}
