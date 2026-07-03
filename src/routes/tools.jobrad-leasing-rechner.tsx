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
} from "@/components/tools/ToolShell";
import { ToolReviewedBy, ToolFaq, ToolSeoSection } from "@/components/tools/ToolSeo";
import { toolHead } from "@/lib/tools/seo";

const SLUG = "jobrad-leasing-rechner";

const FAQ = [
  {
    question: "Was ist die 0,25-%-Regel?",
    answer:
      "Seit 2020 wird der geldwerte Vorteil bei privater Nutzung eines Dienstrads mit 0,25 % des auf 100 € abgerundeten Listenpreises pro Monat versteuert — ein Viertel des Ansatzes für Verbrenner-Firmenwagen. Deshalb ist Dienstrad-Leasing so attraktiv: die monatliche Steuerlast bleibt minimal.",
  },
  {
    question: "Kann jeder ein Dienstrad leasen?",
    answer:
      "Nur Angestellte in Unternehmen, die einen Rahmenvertrag mit JobRad, Bikeleasing, Eurorad oder ähnlichen Anbietern haben. Selbstständige und Freiberufler können privates Leasing nutzen, aber ohne Gehaltsumwandlung-Vorteil. Beamte in einigen Bundesländern inzwischen ebenfalls.",
  },
  {
    question: "Was passiert nach 36 Monaten?",
    answer:
      "Drei Optionen: (1) Rad übernehmen zum vom Finanzamt akzeptierten Restwert (i. d. R. 18 %), (2) neues Leasing starten und Rad zurückgeben, (3) Rückgabe ohne Übernahme. Viele Anbieter bieten Übernahme zu ~10 %, dann wird die Differenz zur 18-%-Regel als geldwerter Vorteil versteuert.",
  },
  {
    question: "Lohnt sich Leasing gegenüber Barkauf?",
    answer:
      "Bei einem 3000-€-Rad und 40 % Grenzsteuersatz liegt die Ersparnis typisch bei 25–40 %. Umso höher das Rad und der Steuersatz, umso deutlicher der Vorteil. Bei Rädern unter 1500 € und niedrigem Einkommen ist der Vorteil marginal — dann bleibt der Barkauf einfacher.",
  },
];

export const Route = createFileRoute("/tools/jobrad-leasing-rechner")({
  head: () =>
    toolHead({
      title: "JobRad-Rechner: Dienstrad-Leasing Kosten & Ersparnis",
      description:
        "JobRad- und Dienstrad-Leasing-Rechner mit Gehaltsumwandlung, 0,25-%-Regel und Übernahmewert. Vergleich zum Barkauf — realistische Netto-Belastung pro Monat.",
      path: "/tools/jobrad-leasing-rechner",
      slug: SLUG,
      faq: FAQ,
    }),
  component: JobRadPage,
});

type TaxClass = "1" | "3" | "5";

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
  const [takeover, setTakeover] = useState(18);

  const result = useMemo(() => {
    const months = 36;
    const monthlyLeaseGross = price * (insured ? 0.0295 : 0.027);
    const rate = marginalRate(brutto, tc);
    const monthlyNetCost = monthlyLeaseGross * (1 - rate);
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
      <ToolReviewedBy slug={SLUG} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Konditionen</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <ToolLabel>UVP / Bruttopreis Rad (€)</ToolLabel>
              <ToolInput type="number" value={price} onChange={(e) => setPrice(+e.target.value || 0)} />
            </div>
            <div>
              <ToolLabel>Brutto-Monatsgehalt (€)</ToolLabel>
              <ToolInput type="number" value={brutto} onChange={(e) => setBrutto(+e.target.value || 0)} />
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
              <input type="checkbox" checked={insured} onChange={(e) => setInsured(e.target.checked)} className="h-4 w-4 accent-signal" />
            </div>
            <div>
              <ToolLabel>Übernahmewert nach 36 Monaten (%)</ToolLabel>
              <ToolInput type="number" min={10} max={40} value={takeover} onChange={(e) => setTakeover(+e.target.value || 0)} />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Finanzamt akzeptiert i. d. R. 18 % ohne Steuer; viele Anbieter bieten ~10 %.
              </p>
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <h2 className="font-display text-lg font-bold tracking-tight">Deine Belastung</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ToolResultStat label="Monatlich netto" value={result.monthlyTotal} unit="€" hint={`Grenzsteuersatz ~${result.rate}%`} />
            <ToolResultStat label="36 Monate gesamt" value={result.total36} unit="€" />
            <ToolResultStat label="Übernahme" value={result.takeoverCost} unit="€" hint={`${takeover}% vom UVP`} />
            <ToolResultStat label="Gesamtkosten" value={result.totalWithTakeover} unit="€" />
          </div>
          <div className="mt-6 rounded-xl border border-signal/30 bg-signal/5 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-signal">Ersparnis vs. Barkauf</div>
            <div className="mt-1 font-display text-3xl font-black text-foreground">
              {result.savings > 0 ? "+" : ""}{result.savings.toLocaleString("de-DE")} €
              <span className="ml-2 text-base font-medium text-muted-foreground">({result.savingsPct}%)</span>
            </div>
          </div>
        </ToolCard>
      </div>

      <ToolSeoSection slug={SLUG} heading="So funktioniert der JobRad-Rechner">
        <p>
          Dienstrad-Leasing über Gehaltsumwandlung ist eines der attraktivsten Steuermodelle für
          Angestellte. Das Rad wird vom Arbeitgeber über 36 Monate geleast, du zahlst die Rate
          nicht netto, sondern brutto — dein zu versteuerndes Einkommen sinkt entsprechend.
        </p>

        <h3>So rechnet der Rechner</h3>
        <p>
          <strong>Leasingrate</strong> ~2,7–2,95 % vom UVP pro Monat (typische Marktwerte
          JobRad/Bikeleasing, mit Versicherung und Service etwas höher).
          <strong> Netto-Kosten</strong> = Leasingrate × (1 − Grenzsteuersatz). Dazu kommt der
          <strong> geldwerte Vorteil</strong> nach der 0,25-%-Regel:
          0,25 % vom auf 100 € abgerundeten UVP × Grenzsteuersatz.
          <strong> Gesamtkosten</strong> = Netto-Rate + Steuer auf Vorteil, mal 36 Monate, plus
          Übernahmewert nach Leasing-Ende.
        </p>

        <h3>Beispiel: 3500 € Rad, 4200 € Brutto, Steuerklasse I</h3>
        <table>
          <thead><tr><th>Position</th><th>Wert</th></tr></thead>
          <tbody>
            <tr><td>Leasingrate brutto (mit Versicherung)</td><td>103 €/Monat</td></tr>
            <tr><td>Grenzsteuersatz</td><td>~39 %</td></tr>
            <tr><td>Netto-Belastung Rate</td><td>63 €/Monat</td></tr>
            <tr><td>Geldwerter Vorteil (0,25 %)</td><td>8,75 €/Monat</td></tr>
            <tr><td>Steuer auf Vorteil</td><td>3,40 €/Monat</td></tr>
            <tr><td>Monatliche Netto-Belastung</td><td>~66 €</td></tr>
            <tr><td>36 Monate gesamt</td><td>2380 €</td></tr>
            <tr><td>Übernahme (18 %)</td><td>630 €</td></tr>
            <tr><td>Gesamt</td><td>3010 €</td></tr>
            <tr><td>Ersparnis vs. Barkauf</td><td>~14 %</td></tr>
          </tbody>
        </table>

        <h3>Wann sich Leasing besonders lohnt</h3>
        <ul>
          <li>Hoher Grenzsteuersatz (ab ~40 %): jede Rate wird stärker steuerlich reduziert.</li>
          <li>Teureres Rad (ab 2500 €): der 0,25-%-Vorteil skaliert absolut mit dem UVP.</li>
          <li>Versicherung & Service inklusive: bei Alltagsrädern spart das jährliche Werkstattkosten.</li>
          <li>Übernahme zu 10 % vom Anbieter: rechnerisch günstiger, aber Differenz zur 18-%-Regel wird versteuert.</li>
        </ul>

        <h3>Grenzen des Rechners</h3>
        <p>
          Grenzsteuersatz ist geschätzt (Progression, Kirchensteuer, Freibeträge sind nicht
          exakt abgebildet). Kein Ersatz für Beratung durch Steuerberater oder Arbeitgeber.
          Stand: 2025. Bei Rechenbeispielen für die eigene Steuererklärung immer den konkreten
          Leasingvertrag und die persönlichen Lohnsteuer-Werte heranziehen.
        </p>
      </ToolSeoSection>

      <ToolFaq items={FAQ} slug={SLUG} />
    </ToolShell>
  );
}
