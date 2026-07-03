import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Bike,
  Gauge,
  Battery,
  Wallet,
  Ruler,
  Printer,
} from "lucide-react";
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
import { analyzeKaufberater } from "@/lib/kaufberater/analysis.functions";
import type { KaufberaterInput, CalculationResult, AiAnalysis } from "@/lib/kaufberater/types";
import { getBikeProfile, saveBikeProfile } from "@/lib/bike-profile";
import { toast } from "sonner";
import { BikeGeometryChart } from "@/components/tools/kaufberater/BikeGeometryChart";

export const Route = createFileRoute("/tools/kaufberater-ai")({
  head: () =>
    toolHead({
      title: "KI-Kaufberater Fahrrad & E-Bike",
      description:
        "Der genaueste Kaufberater für Fahrräder & E-Bikes in Deutschland. Rahmengröße, Reifen, Motor, Reichweite, Budget — mit KI-Analyse und konkreten Empfehlungen.",
      path: "/tools/kaufberater-ai",
    }),
  component: KaufberaterAi,
});

type BikeType = KaufberaterInput["bikeType"];

const BIKE_TYPES: { value: BikeType; label: string; ebike?: boolean }[] = [
  { value: "road", label: "Rennrad" },
  { value: "gravel", label: "Gravel" },
  { value: "mtb-hardtail", label: "MTB Hardtail" },
  { value: "mtb-fully", label: "MTB Fully" },
  { value: "trekking", label: "Trekking" },
  { value: "city", label: "City" },
  { value: "e-trekking", label: "E-Trekking", ebike: true },
  { value: "e-mtb", label: "E-MTB", ebike: true },
  { value: "e-city", label: "E-City", ebike: true },
  { value: "cargo", label: "Lastenrad (E)", ebike: true },
];

const USES = [
  { value: "commute", label: "Alltag / Pendeln" },
  { value: "touring", label: "Touren & Reisen" },
  { value: "sport", label: "Sport / Training" },
  { value: "offroad", label: "Offroad / Trail" },
  { value: "family", label: "Familie & Freizeit" },
  { value: "travel", label: "Fernreise" },
];

const TERRAINS = [
  { value: "flat", label: "Flach" },
  { value: "hilly", label: "Hügelig" },
  { value: "mountainous", label: "Bergig" },
  { value: "mixed", label: "Gemischt" },
];

const MUST_HAVES = [
  { id: "schutzbleche", label: "Schutzbleche" },
  { id: "gepaecktraeger", label: "Gepäckträger" },
  { id: "beleuchtung", label: "Beleuchtung StVZO" },
  { id: "nabenschaltung", label: "Nabenschaltung" },
  { id: "riemen", label: "Gates Riemen" },
  { id: "federgabel", label: "Federgabel" },
  { id: "tubeless", label: "Tubeless" },
  { id: "scheibenbremsen-hydraulisch", label: "Scheibenbremsen hydraulisch" },
];

type PriorityKey = keyof KaufberaterInput["priorities"];

function isEbike(t: BikeType) {
  return t === "e-trekking" || t === "e-mtb" || t === "e-city" || t === "cargo";
}

function defaultInput(): KaufberaterInput {
  const p = getBikeProfile();
  return {
    bodyHeightCm: p?.bodyHeightCm ?? 178,
    inseamCm: p?.inseamCm ?? 83,
    measureMode: "quick",
    armLengthCm: null,
    torsoCm: null,
    shoulderWidthCm: null,
    thighCm: null,
    shinCm: null,
    sitBonesMm: null,
    footLengthCm: null,
    usesClipless: false,
    sitAndReachCm: null,
    shoulderRotationDeg: null,
    hipFlexDeg: null,
    weightKg: p?.weightKg ?? 78,
    gender: "m",
    age: null,
    flexibility: 3,
    bikeType: "e-trekking",
    use: "touring",
    weeklyKm: 80,
    terrain: "hilly",
    surfaceAsphaltPct: 70,
    surfaceGravelPct: 20,
    surfaceTrailPct: 10,
    motorPref: "any",
    motorPosition: "any",
    assistProfile: "balanced",
    minTorqueNm: null,
    dualBattery: false,
    speedClass: "pedelec25",
    frameStyle: "any",
    extraLoadKg: 0,
    desiredRangeKm: 100,
    supportLevel: "tour",
    budgetEur: p?.budgetEur ?? 3500,
    priorities: {
      comfort: 4,
      sport: 3,
      durability: 4,
      weight: 3,
      lowMaintenance: 4,
      style: 3,
    },
    mustHave: ["schutzbleche", "beleuchtung", "gepaecktraeger"],
  };
}

function KaufberaterAi() {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<KaufberaterInput>(defaultInput);
  const analyze = useServerFn(analyzeKaufberater);
  const mut = useMutation({
    mutationFn: (data: KaufberaterInput) => analyze({ data }),
  });

  const totalSurface = input.surfaceAsphaltPct + input.surfaceGravelPct + input.surfaceTrailPct;
  const surfaceOk = totalSurface === 100;
  const showEbike = isEbike(input.bikeType);
  const maxStep = showEbike ? 4 : 3;

  const submit = () => {
    if (!surfaceOk) {
      toast.error("Untergrund-Anteile müssen zusammen 100 % ergeben.");
      setStep(2);
      return;
    }
    mut.mutate(input);
    setTimeout(() => {
      const el = document.getElementById("kb-result");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const patch = <K extends keyof KaufberaterInput>(k: K, v: KaufberaterInput[K]) =>
    setInput((s) => ({ ...s, [k]: v }));
  const patchP = (k: PriorityKey, v: number) =>
    setInput((s) => ({ ...s, priorities: { ...s.priorities, [k]: v } }));
  const toggleMust = (id: string) =>
    setInput((s) => ({
      ...s,
      mustHave: s.mustHave.includes(id) ? s.mustHave.filter((x) => x !== id) : [...s.mustHave, id],
    }));

  const applyToProfile = () => {
    saveBikeProfile({
      bodyHeightCm: input.bodyHeightCm,
      inseamCm: input.inseamCm,
      weightKg: input.weightKg,
      budgetEur: input.budgetEur,
      bikeTypes: [
        input.bikeType.startsWith("mtb")
          ? "mtb"
          : input.bikeType === "road"
          ? "road"
          : input.bikeType === "gravel"
          ? "gravel"
          : input.bikeType === "cargo"
          ? "cargo"
          : isEbike(input.bikeType)
          ? "ebike"
          : input.bikeType === "city"
          ? "city"
          : input.bikeType === "trekking"
          ? "trekking"
          : "city",
      ],
    });
    toast.success("In dein Radprofil übernommen.");
  };

  return (
    <ToolShell
      eyebrow="Kaufberatung · KI"
      title="KI-Kaufberater"
      description="Deutschlands genauester Rechner für Rahmengröße, Reifen, Motor, Reichweite und Budget — mit KI-Analyse, konkreten Empfehlungen und Marktdaten 2025/26."
      icon={Sparkles}
    >
      {/* Progress */}
      <div className="mb-8 flex items-center justify-between gap-3">
        {Array.from({ length: maxStep }).map((_, i) => {
          const n = i + 1;
          const active = step >= n;
          return (
            <div key={n} className="flex flex-1 items-center gap-2">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                  active ? "border-signal bg-signal/10 text-signal" : "border-border text-muted-foreground"
                }`}
              >
                {n}
              </div>
              {n < maxStep && (
                <div className={`h-px flex-1 ${step > n ? "bg-signal" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* LEFT: wizard */}
        <ToolCard>
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-signal">
                <Ruler className="h-3.5 w-3.5" /> Schritt 1 · Körpermaße
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold tracking-tight">Deine Maße</h2>
                <div className="flex gap-1 text-[10px] uppercase tracking-[0.14em]">
                  {(["quick", "precise"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => patch("measureMode", m)}
                      className={`px-2.5 py-1 border transition-colors ${
                        input.measureMode === m
                          ? "border-signal bg-signal text-background"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "quick" ? "Schnell (2 Min)" : "Präzise (Bikefit, 8 Min)"}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {input.measureMode === "precise"
                  ? "Bikefitter-Niveau: alle Maße für präzise Reach/Stack/Sattelbreite. Fehlende Werte werden aus DIN 33402-2 geschätzt."
                  : "Basis-Werte reichen — wir schätzen den Rest per Anthropometrie-Regressionen (DIN 33402-2)."}
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <ToolLabel>Körpergröße (cm)</ToolLabel>
                  <ToolInput
                    type="number"
                    min={120}
                    max={220}
                    value={input.bodyHeightCm}
                    onChange={(e) => patch("bodyHeightCm", +e.target.value || 0)}
                  />
                </div>
                <div>
                  <ToolLabel>Schrittlänge (cm)</ToolLabel>
                  <ToolInput
                    type="number"
                    min={55}
                    max={110}
                    value={input.inseamCm}
                    onChange={(e) => patch("inseamCm", +e.target.value || 0)}
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Barfuß, Buch zwischen die Beine bis zum Schritt, vom Boden bis Buchoberkante messen.
                  </p>
                </div>
                <div>
                  <ToolLabel>Gewicht (kg)</ToolLabel>
                  <ToolInput
                    type="number"
                    min={30}
                    max={200}
                    value={input.weightKg}
                    onChange={(e) => patch("weightKg", +e.target.value || 0)}
                  />
                </div>
                <div>
                  <ToolLabel>Geschlecht</ToolLabel>
                  <ToolSelect
                    value={input.gender}
                    onChange={(e) => patch("gender", e.target.value as KaufberaterInput["gender"])}
                  >
                    <option value="m">männlich</option>
                    <option value="w">weiblich</option>
                    <option value="d">divers</option>
                  </ToolSelect>
                </div>
                <div>
                  <ToolLabel>Alter (optional)</ToolLabel>
                  <ToolInput
                    type="number"
                    min={10}
                    max={99}
                    value={input.age ?? ""}
                    onChange={(e) => patch("age", e.target.value ? +e.target.value : null)}
                  />
                </div>
                <div>
                  <ToolLabel>Flexibilität: {input.flexibility}/5</ToolLabel>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={input.flexibility}
                    onChange={(e) => patch("flexibility", +e.target.value)}
                    className="mt-3 w-full accent-signal"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    1 = sehr steif · 5 = sehr flexibel (Yoga/Sport)
                  </p>
                </div>
              </div>

              {/* Präzisions-Maße (Bikefitter) */}
              {input.measureMode === "precise" && (
                <div className="mt-6 border-t border-border pt-5">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-signal">
                    Bikefit-Maße
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Optional — je mehr du eingibst, desto präziser der Report. Leere Felder werden geschätzt.
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <ToolLabel>Torso (C7 → Sitzknochen, cm)</ToolLabel>
                      <ToolInput type="number" min={40} max={90} value={input.torsoCm ?? ""}
                        onChange={(e) => patch("torsoCm", e.target.value ? +e.target.value : null)} />
                    </div>
                    <div>
                      <ToolLabel>Armlänge (Schulter → Handgelenk, cm)</ToolLabel>
                      <ToolInput type="number" min={40} max={90} value={input.armLengthCm ?? ""}
                        onChange={(e) => patch("armLengthCm", e.target.value ? +e.target.value : null)} />
                    </div>
                    <div>
                      <ToolLabel>Schulterbreite (cm)</ToolLabel>
                      <ToolInput type="number" min={28} max={60} value={input.shoulderWidthCm ?? ""}
                        onChange={(e) => patch("shoulderWidthCm", e.target.value ? +e.target.value : null)} />
                    </div>
                    <div>
                      <ToolLabel>Oberschenkel (cm)</ToolLabel>
                      <ToolInput type="number" min={30} max={70} value={input.thighCm ?? ""}
                        onChange={(e) => patch("thighCm", e.target.value ? +e.target.value : null)} />
                    </div>
                    <div>
                      <ToolLabel>Unterschenkel (cm)</ToolLabel>
                      <ToolInput type="number" min={25} max={60} value={input.shinCm ?? ""}
                        onChange={(e) => patch("shinCm", e.target.value ? +e.target.value : null)} />
                    </div>
                    <div>
                      <ToolLabel>Sitzknochen-Abstand (mm)</ToolLabel>
                      <ToolInput type="number" min={80} max={170} value={input.sitBonesMm ?? ""}
                        onChange={(e) => patch("sitBonesMm", e.target.value ? +e.target.value : null)} />
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Auf Wellpappe setzen, Abdruck mitte-mitte messen.
                      </p>
                    </div>
                    <div>
                      <ToolLabel>Fußlänge (cm)</ToolLabel>
                      <ToolInput type="number" min={18} max={35} value={input.footLengthCm ?? ""}
                        onChange={(e) => patch("footLengthCm", e.target.value ? +e.target.value : null)} />
                    </div>
                    <label className="flex items-end gap-2 text-xs text-muted-foreground pb-2">
                      <input type="checkbox" checked={!!input.usesClipless}
                        onChange={(e) => patch("usesClipless", e.target.checked)} className="accent-signal" />
                      Klickpedale (Cleat-Setback berechnen)
                    </label>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div>
                      <ToolLabel>Sit-and-Reach (cm, ± 0 = Zehenspitzen)</ToolLabel>
                      <ToolInput type="number" min={-30} max={40} value={input.sitAndReachCm ?? ""}
                        onChange={(e) => patch("sitAndReachCm", e.target.value ? +e.target.value : null)} />
                    </div>
                    <div>
                      <ToolLabel>Schulter-Rotation (°)</ToolLabel>
                      <ToolInput type="number" min={0} max={200} value={input.shoulderRotationDeg ?? ""}
                        onChange={(e) => patch("shoulderRotationDeg", e.target.value ? +e.target.value : null)} />
                    </div>
                    <div>
                      <ToolLabel>Hüftflex (°)</ToolLabel>
                      <ToolInput type="number" min={60} max={180} value={input.hipFlexDeg ?? ""}
                        onChange={(e) => patch("hipFlexDeg", e.target.value ? +e.target.value : null)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-signal">
                <Bike className="h-3.5 w-3.5" /> Schritt 2 · Einsatz
              </div>
              <h2 className="mt-2 font-display text-xl font-bold tracking-tight">Wozu brauchst du das Rad?</h2>
              <div className="mt-5 grid gap-4">
                <div>
                  <ToolLabel>Radtyp</ToolLabel>
                  <ToolSelect
                    value={input.bikeType}
                    onChange={(e) => patch("bikeType", e.target.value as BikeType)}
                  >
                    {BIKE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </ToolSelect>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <ToolLabel>Haupteinsatz</ToolLabel>
                    <ToolSelect
                      value={input.use}
                      onChange={(e) => patch("use", e.target.value as KaufberaterInput["use"])}
                    >
                      {USES.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </ToolSelect>
                  </div>
                  <div>
                    <ToolLabel>Gelände</ToolLabel>
                    <ToolSelect
                      value={input.terrain}
                      onChange={(e) => patch("terrain", e.target.value as KaufberaterInput["terrain"])}
                    >
                      {TERRAINS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </ToolSelect>
                  </div>
                </div>
                <div>
                  <ToolLabel>Kilometer / Woche: {input.weeklyKm} km</ToolLabel>
                  <input
                    type="range"
                    min={0}
                    max={500}
                    step={10}
                    value={input.weeklyKm}
                    onChange={(e) => patch("weeklyKm", +e.target.value)}
                    className="mt-3 w-full accent-signal"
                  />
                </div>
                <div>
                  <ToolLabel>Untergrund (Summe = 100 %)</ToolLabel>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      { k: "surfaceAsphaltPct" as const, l: "Asphalt" },
                      { k: "surfaceGravelPct" as const, l: "Schotter" },
                      { k: "surfaceTrailPct" as const, l: "Trail" },
                    ].map((s) => (
                      <div key={s.k}>
                        <div className="text-[11px] text-muted-foreground">
                          {s.l}: {input[s.k]} %
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={input[s.k]}
                          onChange={(e) => patch(s.k, +e.target.value)}
                          className="mt-1 w-full accent-signal"
                        />
                      </div>
                    ))}
                  </div>
                  {!surfaceOk && (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                      Summe: {totalSurface} % — muss genau 100 % ergeben.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && showEbike && (
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-signal">
                <Battery className="h-3.5 w-3.5" /> Schritt 3 · E-Bike
              </div>
              <h2 className="mt-2 font-display text-xl font-bold tracking-tight">Motor, Akku &amp; Rahmen</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <ToolLabel>Motor-Marke</ToolLabel>
                  <ToolSelect
                    value={input.motorPref ?? "any"}
                    onChange={(e) => patch("motorPref", e.target.value as KaufberaterInput["motorPref"])}
                  >
                    <option value="any">Egal — bester für Einsatz</option>
                    <option value="bosch">Bosch</option>
                    <option value="shimano">Shimano</option>
                    <option value="brose">Brose</option>
                    <option value="yamaha">Yamaha</option>
                  </ToolSelect>
                </div>
                <div>
                  <ToolLabel>Motor-Position</ToolLabel>
                  <ToolSelect
                    value={input.motorPosition ?? "any"}
                    onChange={(e) => patch("motorPosition", e.target.value as KaufberaterInput["motorPosition"])}
                  >
                    <option value="any">Automatisch wählen</option>
                    <option value="mid">Mittelmotor (Standard, beste Balance)</option>
                    <option value="rear">Hinterradnabe (leise, flach/S-Pedelec)</option>
                    <option value="front">Vorderradnabe (Einstieg, günstig)</option>
                  </ToolSelect>
                </div>
                <div>
                  <ToolLabel>Fahrprofil</ToolLabel>
                  <ToolSelect
                    value={input.assistProfile ?? "balanced"}
                    onChange={(e) => patch("assistProfile", e.target.value as KaufberaterInput["assistProfile"])}
                  >
                    <option value="economy">Sparsam — meist Eco, viel Muskelkraft</option>
                    <option value="balanced">Ausgewogen — Tour-Modus Standard</option>
                    <option value="power">Kraftvoll — häufig Sport/Turbo</option>
                  </ToolSelect>
                </div>
                <div>
                  <ToolLabel>Geschwindigkeitsklasse</ToolLabel>
                  <ToolSelect
                    value={input.speedClass ?? "pedelec25"}
                    onChange={(e) => patch("speedClass", e.target.value as KaufberaterInput["speedClass"])}
                  >
                    <option value="pedelec25">Pedelec 25 km/h (Standard, kein Kennzeichen)</option>
                    <option value="sPedelec45">S-Pedelec 45 km/h (Kennzeichen &amp; Helm)</option>
                  </ToolSelect>
                </div>
                <div>
                  <ToolLabel>Bevorzugter Modus</ToolLabel>
                  <ToolSelect
                    value={input.supportLevel ?? "tour"}
                    onChange={(e) => patch("supportLevel", e.target.value as KaufberaterInput["supportLevel"])}
                  >
                    <option value="eco">Eco (sparsam)</option>
                    <option value="tour">Tour (Standard)</option>
                    <option value="sport">Sport</option>
                    <option value="turbo">Turbo (max.)</option>
                  </ToolSelect>
                </div>
                <div>
                  <ToolLabel>Min. Drehmoment (Nm, optional)</ToolLabel>
                  <ToolInput
                    type="number"
                    min={30}
                    max={120}
                    value={input.minTorqueNm ?? ""}
                    placeholder="z. B. 85"
                    onChange={(e) => patch("minTorqueNm", e.target.value ? +e.target.value : null)}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Berge / hohe Zuladung: 85 Nm+ · Flach / City: 50–65 Nm reichen.
                  </p>
                </div>
                <div>
                  <ToolLabel>Rahmenstil</ToolLabel>
                  <ToolSelect
                    value={input.frameStyle ?? "any"}
                    onChange={(e) => patch("frameStyle", e.target.value as KaufberaterInput["frameStyle"])}
                  >
                    <option value="any">Automatisch empfehlen</option>
                    <option value="diamond">Diamant (sportlich, steif)</option>
                    <option value="trapeze">Trapez (leichter Einstieg)</option>
                    <option value="wave">Wave / Tiefeinsteiger</option>
                  </ToolSelect>
                </div>
                <div>
                  <ToolLabel>Zuladung Kinder / Cargo: {input.extraLoadKg ?? 0} kg</ToolLabel>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={input.extraLoadKg ?? 0}
                    onChange={(e) => patch("extraLoadKg", +e.target.value)}
                    className="mt-3 w-full accent-signal"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Kindersitz ~15 kg · 1 Kind ~25 kg · Cargo-Box mit Einkauf 30–60 kg.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <ToolLabel>Gewünschte Reichweite: {input.desiredRangeKm} km</ToolLabel>
                  <input
                    type="range"
                    min={20}
                    max={250}
                    step={10}
                    value={input.desiredRangeKm ?? 100}
                    onChange={(e) => patch("desiredRangeKm", +e.target.value)}
                    className="mt-3 w-full accent-signal"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Reichweite pro Ladung im Tour-Modus mit 20 % Puffer. Bei &gt; 750 Wh empfehlen wir automatisch
                    Dual-Battery.
                  </p>
                </div>
                <label className="sm:col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!!input.dualBattery}
                    onChange={(e) => patch("dualBattery", e.target.checked)}
                    className="accent-signal"
                  />
                  Dual-Battery / Range Extender explizit gewünscht
                </label>
              </div>
            </div>
          )}

          {step === maxStep && (
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-signal">
                <Wallet className="h-3.5 w-3.5" /> Schritt {maxStep} · Budget & Prioritäten
              </div>
              <h2 className="mt-2 font-display text-xl font-bold tracking-tight">Budget & was dir wichtig ist</h2>
              <div className="mt-5 grid gap-5">
                <div>
                  <ToolLabel>Budget: {input.budgetEur.toLocaleString("de-DE")} €</ToolLabel>
                  <input
                    type="range"
                    min={200}
                    max={12000}
                    step={100}
                    value={input.budgetEur}
                    onChange={(e) => patch("budgetEur", +e.target.value)}
                    className="mt-3 w-full accent-signal"
                  />
                </div>
                <div>
                  <ToolLabel>Prioritäten (1 = unwichtig · 5 = sehr wichtig)</ToolLabel>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["comfort", "Komfort"],
                        ["sport", "Sportlichkeit"],
                        ["durability", "Haltbarkeit"],
                        ["weight", "Geringes Gewicht"],
                        ["lowMaintenance", "Wartungsarm"],
                        ["style", "Optik"],
                      ] as [PriorityKey, string][]
                    ).map(([k, l]) => (
                      <div key={k}>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">{l}</span>
                          <span className="font-mono text-xs text-signal">{input.priorities[k]}/5</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={input.priorities[k]}
                          onChange={(e) => patchP(k, +e.target.value)}
                          className="mt-1 w-full accent-signal"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <ToolLabel>Muss-Features</ToolLabel>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {MUST_HAVES.map((m) => {
                      const on = input.mustHave.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleMust(m.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                            on
                              ? "border-signal bg-signal/10 text-signal"
                              : "border-border bg-background/40 text-muted-foreground hover:border-foreground/30"
                          }`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* nav */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Zurück
            </button>
            {step < maxStep ? (
              <button
                type="button"
                onClick={() => {
                  // skip step 3 wenn kein E-Bike
                  if (step === 2 && !showEbike) setStep(maxStep);
                  else setStep((s) => Math.min(maxStep, s + 1));
                }}
                className="inline-flex items-center gap-2 bg-signal px-5 py-2.5 text-sm font-semibold text-background hover:bg-signal/90"
              >
                Weiter <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={mut.isPending || !surfaceOk}
                className="inline-flex items-center gap-2 bg-signal px-6 py-2.5 text-sm font-semibold text-background hover:bg-signal/90 disabled:opacity-50"
              >
                {mut.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analysiere…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> KI-Analyse starten
                  </>
                )}
              </button>
            )}
          </div>
        </ToolCard>

        {/* RIGHT: live summary */}
        <div className="space-y-4">
          <ToolCard>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-signal">
              Deine Auswahl
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <SummaryRow label="Radtyp" v={BIKE_TYPES.find((t) => t.value === input.bikeType)?.label ?? "—"} />
              <SummaryRow label="Einsatz" v={USES.find((u) => u.value === input.use)?.label ?? "—"} />
              <SummaryRow label="Größe" v={`${input.bodyHeightCm} / ${input.inseamCm} cm`} />
              <SummaryRow label="Gewicht" v={`${input.weightKg} kg`} />
              <SummaryRow label="Gelände" v={TERRAINS.find((t) => t.value === input.terrain)?.label ?? "—"} />
              <SummaryRow label="Budget" v={`${input.budgetEur.toLocaleString("de-DE")} €`} />
              {showEbike && (
                <SummaryRow label="Reichweite" v={`${input.desiredRangeKm ?? 100} km`} />
              )}
            </dl>
          </ToolCard>
          <div className="rounded-2xl border border-signal/30 bg-signal/5 p-5 text-xs leading-relaxed text-muted-foreground">
            <strong className="block text-signal">Wie genau ist diese Beratung?</strong>
            Rahmengröße nach Hinault/LeMond &amp; Steve Hogg · Sattelhöhe nach Holmes-Methode ·
            Reifendruck nach Silca/Berto-Modell · E-Bike-Verbrauch kalibriert an
            Bosch/Shimano-Whitepapern 2024. Alle Zahlen sind reale Berechnungen — keine Schätzung.
          </div>
        </div>
      </div>

      {/* RESULT */}
      <div id="kb-result" className="mt-14 scroll-mt-8">
        {mut.data && <Result data={mut.data} onApplyProfile={applyToProfile} input={input} />}
        {mut.isError && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-300">
            Fehler bei der Analyse. Bitte in ein paar Sekunden erneut versuchen.
          </div>
        )}
      </div>

      <ToolDisclaimer>
        Kaufberatung auf Basis öffentlich dokumentierter Formeln (Hinault/LeMond, Steve Hogg, Holmes,
        Silca/Berto) und aktueller Marktpreise Deutschland 2025/26. KI-Empfehlungen greifen
        ausschließlich auf Räder aus der radmap-Datenbank zu. Probefahrt bleibt Pflicht.
      </ToolDisclaimer>
    </ToolShell>
  );
}

function SummaryRow({ label, v }: { label: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{v}</dd>
    </>
  );
}

function Result({
  data,
  onApplyProfile,
  input,
}: {
  data: {
    calc: CalculationResult;
    analysis: AiAnalysis | null;
    error?: string;
    scoredCandidates?: import("@/lib/kaufberater/types").BikeFitScore[];
  };
  onApplyProfile: () => void;
  input: KaufberaterInput;
}) {
  const { calc, analysis, error, scoredCandidates } = data;
  const ebike = calc.ebike;
  const bikefit = calc.bikefit;

  const printPage = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-signal/40 bg-signal/5 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-signal sm:h-6 sm:w-6" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-signal">Deine Analyse</div>
            <div className="truncate font-display text-sm font-bold sm:text-lg">
              Ergebnis fertig — {calc.frame.size}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onApplyProfile}
            title="In Radprofil übernehmen"
            aria-label="In Radprofil übernehmen"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-signal/50 px-3 text-xs font-medium text-signal hover:bg-signal/10"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline uppercase tracking-[0.12em]">Übernehmen</span>
          </button>
          <button
            type="button"
            onClick={printPage}
            title="Drucken"
            aria-label="Drucken"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline uppercase tracking-[0.12em]">Drucken</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Rahmengeometrie */}
      <ToolCard>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-signal">
          <Ruler className="h-3.5 w-3.5" /> Rahmengeometrie
        </div>
        <h3 className="mt-2 font-display text-lg font-bold tracking-tight">
          Deine Rahmengröße: {calc.frame.size}
        </h3>
        {calc.frame.borderline && (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
            Grenzfall — Empfehlung: {calc.frame.heightCm.recommended} cm ± 1,5 cm. Probefahrt beider Größen.
          </p>
        )}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ToolResultStat
            label="Rahmenhöhe"
            value={`${calc.frame.heightCm.min}–${calc.frame.heightCm.max}`}
            unit="cm"
            hint={`Ideal: ${calc.frame.heightCm.recommended} cm`}
          />
          <ToolResultStat
            label="Sattelhöhe (BB→Sattel)"
            value={`${calc.saddleHeightMm.min}–${calc.saddleHeightMm.max}`}
            unit="mm"
            hint={`Ideal: ${calc.saddleHeightMm.recommended} mm (Holmes)`}
          />
          <ToolResultStat
            label="Reach (Ziel)"
            value={`${calc.reachMm.min}–${calc.reachMm.max}`}
            unit="mm"
          />
          <ToolResultStat
            label="Stack (Ziel)"
            value={`${calc.stackMm.min}–${calc.stackMm.max}`}
            unit="mm"
          />
          <ToolResultStat
            label="Lenkerbreite"
            value={`${calc.handlebarWidthMm.min}–${calc.handlebarWidthMm.max}`}
            unit="mm"
            hint={`Empfohlen: ${calc.handlebarWidthMm.recommended} mm`}
          />
          <ToolResultStat
            label="Vorbaulänge"
            value={`${calc.stemLengthMm.min}–${calc.stemLengthMm.max}`}
            unit="mm"
            hint={`Start: ${calc.stemLengthMm.recommended} mm`}
          />
          <ToolResultStat label="Kurbellänge" value={calc.crankLengthMm} unit="mm" />
          <ToolResultStat
            label="Sattel-Setback"
            value={`${calc.saddleSetbackMm.min}–${calc.saddleSetbackMm.max}`}
            unit="mm"
          />
        </div>
        {calc.notes.length > 0 && (
          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {calc.notes.map((n, i) => (
              <li key={i}>· {n}</li>
            ))}
          </ul>
        )}

        {/* Interaktive Rahmengeometrie-Grafik */}
        <div className="mt-6 rounded-xl border border-border bg-background/40 p-4 text-foreground">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
            Zielgeometrie visualisiert
          </div>
          <BikeGeometryChart calc={calc} />
        </div>
      </ToolCard>

      {/* Bikefit-Report */}
      <ToolCard>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-signal">
          <Ruler className="h-3.5 w-3.5" /> Bikefit-Report
          <span className={`ml-2 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] ${
            bikefit.confidence === "high"
              ? "border-signal/50 text-signal"
              : bikefit.confidence === "medium"
              ? "border-amber-500/40 text-amber-700 dark:text-amber-300"
              : "border-border text-muted-foreground"
          }`}>
            Confidence: {bikefit.confidence}
          </span>
        </div>
        <h3 className="mt-2 font-display text-lg font-bold tracking-tight">
          Präzise Bikefit-Werte {bikefit.method === "precise" ? "(volle Vermessung)" : "(Schnell-Modus)"}
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ToolResultStat
            label="Sattelhöhe Konsens"
            value={bikefit.saddleHeight.consensusMm}
            unit="mm"
            hint={`Holmes ${bikefit.saddleHeight.holmesMm} · LeMond ${bikefit.saddleHeight.lemondMm} · Hamley ${bikefit.saddleHeight.hamleyMm}`}
          />
          <ToolResultStat
            label="Setback (KOPS)"
            value={`${bikefit.setbackMm.min}–${bikefit.setbackMm.max}`}
            unit="mm"
            hint={`Ideal: ${bikefit.setbackMm.recommended} mm`}
          />
          <ToolResultStat
            label="ETT (Oberrohr eff.)"
            value={`${bikefit.ettMm.min}–${bikefit.ettMm.max}`}
            unit="mm"
            hint={`Ideal: ${bikefit.ettMm.recommended} mm`}
          />
          <ToolResultStat
            label="Sattelbreite"
            value={`${bikefit.saddleWidthMm.min}–${bikefit.saddleWidthMm.max}`}
            unit="mm"
            hint={`Ideal: ${bikefit.saddleWidthMm.recommended} mm (Sitzknochen)`}
          />
          <ToolResultStat
            label="Short-Cranks"
            value={bikefit.crankShortMm}
            unit="mm"
            hint={`Standard: ${calc.crankLengthMm} mm`}
          />
          {bikefit.cleatSetbackMm !== undefined && (
            <ToolResultStat
              label="Cleat-Setback"
              value={bikefit.cleatSetbackMm}
              unit="mm"
              hint="hinter Großzehen-Grundgelenk"
            />
          )}
          <ToolResultStat
            label="Sitzwinkel Ziel"
            value={`${bikefit.seatTubeAngle.min}–${bikefit.seatTubeAngle.max}`}
            unit="°"
          />
          <ToolResultStat
            label="Steuerkopf Ziel"
            value={`${bikefit.headTubeAngle.min}–${bikefit.headTubeAngle.max}`}
            unit="°"
          />
        </div>

        {bikefit.notes.length > 0 && (
          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {bikefit.notes.map((n, i) => (
              <li key={i}>· {n}</li>
            ))}
          </ul>
        )}

        {bikefit.confidence !== "high" && (
          <div className="mt-4 rounded-lg border border-border bg-background/40 p-3 text-[11px] text-muted-foreground">
            <strong className="text-foreground">Präziser werden:</strong> Wechsel oben auf „Präzise" und gib
            Torso, Arm, Oberschenkel und Sitzknochen ein. Fehlende Werte schätzen wir per DIN 33402-2.
          </div>
        )}
      </ToolCard>


      {/* Reifen */}
      <ToolCard>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-signal">
          <Gauge className="h-3.5 w-3.5" /> Reifen &amp; Luftdruck
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ToolResultStat
            label="Reifenbreite"
            value={`${calc.tires.widthMm.min}–${calc.tires.widthMm.max}`}
            unit="mm"
            hint={`Empfohlen: ${calc.tires.widthMm.recommended} mm`}
          />
          <ToolResultStat
            label="Profil"
            value={calc.tires.tread === "slick" ? "Slick" : calc.tires.tread === "semi" ? "Semi-Slick" : "Stollen"}
          />
          <ToolResultStat
            label="Druck vorn"
            value={calc.tires.pressureBar.front}
            unit={`bar (${calc.tires.pressurePsi.front} psi)`}
          />
          <ToolResultStat
            label="Druck hinten"
            value={calc.tires.pressureBar.rear}
            unit={`bar (${calc.tires.pressurePsi.rear} psi)`}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {calc.tires.tubeless
            ? "Tubeless empfohlen — Pannenschutz und niedrigere Drücke möglich."
            : "Schlauch-Setup ausreichend."}{" "}
          Druck ist Startwert für dein Systemgewicht ({input.weightKg + 12} kg inkl. Rad-Schätzung),
          ± 0,3 bar nach Gefühl anpassen.
        </p>
      </ToolCard>

      {/* Bremsen/Schaltung */}
      <ToolCard>
        <div className="text-[10px] uppercase tracking-[0.16em] text-signal">Bremsen &amp; Schaltung</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Bremsen</div>
            <div className="mt-2 font-semibold">{calc.brakes}</div>
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Schaltung</div>
            <div className="mt-2 font-semibold">{calc.drivetrain}</div>
          </div>
        </div>
      </ToolCard>

      {/* E-Bike */}
      {ebike && (
        <ToolCard>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-signal">
            <Battery className="h-3.5 w-3.5" /> E-Bike Motor &amp; Akku
          </div>
          <h3 className="mt-2 font-display text-lg font-bold tracking-tight">
            {ebike.motorPick} · {ebike.torqueNm.min}
            {ebike.torqueNm.max > ebike.torqueNm.min ? `–${ebike.torqueNm.max}` : ""} Nm
          </h3>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
              Position: {ebike.motorPosition === "mid" ? "Mittelmotor" : ebike.motorPosition === "rear" ? "Hinterradnabe" : "Vorderradnabe"}
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
              Klasse: {ebike.speedClass === "sPedelec45" ? "S-Pedelec 45 km/h" : "Pedelec 25 km/h"}
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
              Profil: {ebike.assistProfile === "economy" ? "sparsam" : ebike.assistProfile === "power" ? "kraftvoll" : "ausgewogen"}
            </span>
            {ebike.dualBatteryRecommended && (
              <span className="rounded-full border border-signal/50 bg-signal/10 px-2 py-0.5 text-signal">
                Dual-Battery empfohlen
              </span>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ToolResultStat
              label="Empf. Akku"
              value={ebike.recommendedBatteryWh}
              unit="Wh"
              hint={`Verbrauch: ${ebike.consumptionWhPerKm} Wh/km`}
            />
            <ToolResultStat label="Eco" value={ebike.estRangeKm.eco} unit="km" />
            <ToolResultStat label="Tour" value={ebike.estRangeKm.tour} unit="km" />
            <ToolResultStat label="Sport" value={ebike.estRangeKm.sport} unit="km" />
          </div>
          {ebike.notes.length > 0 && (
            <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
              {ebike.notes.map((n, i) => (
                <li key={i}>· {n}</li>
              ))}
            </ul>
          )}
          {calc.frame.styleRecommendation && calc.frame.styleRecommendation !== "any" && (
            <div className="mt-4 rounded-xl border border-border bg-background/40 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Empfohlener Rahmenstil
              </div>
              <div className="mt-1 font-semibold capitalize">
                {calc.frame.styleRecommendation === "wave"
                  ? "Wave / Tiefeinsteiger"
                  : calc.frame.styleRecommendation === "trapeze"
                  ? "Trapez"
                  : "Diamant"}
              </div>
              {calc.frame.styleReason && (
                <p className="mt-1 text-xs text-muted-foreground">{calc.frame.styleReason}</p>
              )}
            </div>
          )}
        </ToolCard>
      )}

      {/* Budget */}
      <ToolCard>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-signal">
          <Wallet className="h-3.5 w-3.5" /> Budget-Segment
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-3">
          <span className="font-display text-2xl font-bold capitalize">{calc.budget.segment}</span>
          <span className="text-sm text-muted-foreground">
            typische Marktpreise: {calc.budget.marketRange.min.toLocaleString("de-DE")}–
            {calc.budget.marketRange.max.toLocaleString("de-DE")} €
          </span>
        </div>
        {calc.budget.warning && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {calc.budget.warning}
          </div>
        )}
      </ToolCard>

      {/* Räder aus DB — gescored nach Rahmengeometrie */}
      {scoredCandidates && scoredCandidates.length > 0 && (
        <ToolCard>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-signal">
            <CheckCircle2 className="h-3.5 w-3.5" /> Beste Rahmen-Matches aus unserer Datenbank
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Fit-Score = wie präzise Reach &amp; Stack des Rahmens zu deinen Zielwerten passen (100 = perfekt).
            Räder ohne Geometrie-Daten in der DB werden nicht bewertet.
          </p>
          <div className="mt-4 space-y-3">
            {scoredCandidates.slice(0, 5).map((c) => (
              <a
                key={c.slug}
                href={`/rad/${c.slug}`}
                className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3 transition-colors hover:border-signal/50"
              >
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={`${c.brand} ${c.model}`}
                    className="h-16 w-24 flex-shrink-0 rounded object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-16 w-24 flex-shrink-0 rounded bg-muted/30" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="truncate font-display text-sm font-semibold">
                      {c.brand} {c.model}
                      {c.year && <span className="ml-1 text-muted-foreground">{c.year}</span>}
                    </div>
                    <div className="whitespace-nowrap font-mono text-xs text-signal">
                      {c.price_eur ? `${c.price_eur.toLocaleString("de-DE")} €` : "—"}
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                    {c.fitScore !== null ? (
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono ${
                          c.fitScore >= 85
                            ? "bg-signal/20 text-signal"
                            : c.fitScore >= 70
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            : "bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        Fit {c.fitScore}/100
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted/20 px-2 py-0.5 text-muted-foreground">
                        Fit n/v
                      </span>
                    )}
                    {c.deltaReachMm !== null && (
                      <span className="font-mono text-muted-foreground">
                        ΔReach {c.deltaReachMm > 0 ? "+" : ""}
                        {c.deltaReachMm} mm
                      </span>
                    )}
                    {c.deltaStackMm !== null && (
                      <span className="font-mono text-muted-foreground">
                        ΔStack {c.deltaStackMm > 0 ? "+" : ""}
                        {c.deltaStackMm} mm
                      </span>
                    )}
                    {c.availability && (
                      <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {c.availability}
                      </span>
                    )}
                  </div>
                  {c.reasons.length > 0 && (
                    <p className="mt-1.5 line-clamp-2 text-[11px] text-muted-foreground">
                      {c.reasons[0]}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </ToolCard>
      )}

      {/* KI-Analyse */}

      {analysis && (
        <ToolCard className="border-signal/40 bg-signal/[0.03]">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-signal">
            <Sparkles className="h-3.5 w-3.5" /> KI-Analyse
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{analysis.summary}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Warum diese Rahmengröße
              </div>
              <p className="mt-2 text-sm">{analysis.frameRecommendation}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Wann anders wählen
              </div>
              <p className="mt-2 text-sm">{analysis.alternativeSizes}</p>
            </div>
          </div>

          {analysis.topPicks.length > 0 && (
            <div className="mt-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Konkrete Rad-Empfehlungen
              </div>
              <ul className="mt-3 space-y-2">
                {analysis.topPicks.map((p, i) => (
                  <li key={i} className="rounded-xl border border-border bg-background/40 p-3 text-sm">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="font-semibold text-foreground">
                        {p.slug ? (
                          <Link
                            to="/fahrraeder/$slug"
                            params={{ slug: p.slug }}
                            className="hover:text-signal"
                          >
                            {p.label} →
                          </Link>
                        ) : (
                          p.label
                        )}
                      </div>
                      {p.priceHint && (
                        <div className="text-xs text-muted-foreground">{p.priceHint}</div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.warnings.length > 0 && (
            <div className="mt-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Warnungen</div>
              <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200">
                {analysis.warnings.map((w, i) => (
                  <li key={i}>· {w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Checkliste vor dem Kauf
            </div>
            <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
              {analysis.checklistBeforeBuy.map((c, i) => (
                <li key={i} className="flex gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" /> {c}
                </li>
              ))}
            </ul>
          </div>

          {analysis.financing && (
            <div className="mt-5 rounded-xl border border-border bg-background/40 p-3 text-xs">
              <strong className="text-foreground">Finanzierung/Leasing:</strong> {analysis.financing}
            </div>
          )}
        </ToolCard>
      )}
    </div>
  );
}
