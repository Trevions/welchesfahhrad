import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowRight, ArrowLeft, Check, Trash2, Bike } from "lucide-react";
import {
  type BikeProfile,
  type BikeType,
  type Interest,
  type RidingStyle,
  type TireDiameter,
  type TireTread,
  type BrakeType,
  type Drivetrain,
  BIKE_TYPE_LABELS,
  RIDING_STYLE_LABELS,
  INTEREST_LABELS,
  getBikeProfile,
  saveBikeProfile,
  clearBikeProfile,
  summarizeProfile,
} from "@/lib/bike-profile";

export const Route = createFileRoute("/mein-rad")({
  head: () => ({
    meta: [
      { title: "Mein RadProfil — radmap.de" },
      {
        name: "description",
        content:
          "Hinterlege Maße, Fahrradtyp und Interessen. Wir empfehlen dir genau die Artikel, Tools und später Räder, die zu dir passen.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MeinRad,
});

const STEPS = ["Bike-Typ", "Maße", "Reifen & Antrieb", "Fahrstil", "Themen"] as const;
type StepIndex = 0 | 1 | 2 | 3 | 4;

const BIKE_TYPES: BikeType[] = [
  "road",
  "gravel",
  "mtb",
  "ebike",
  "city",
  "trekking",
  "cargo",
  "kids",
];

const STYLES: RidingStyle[] = ["commute", "touring", "sport", "offroad", "family"];
const INTERESTS: Interest[] = [
  "touren",
  "technik",
  "sicherheit",
  "recht",
  "wartung",
  "ernaehrung",
  "wetter",
  "navigation",
  "kaufberatung",
  "ebike-akku",
];
const DIAMETERS: TireDiameter[] = ["700c", "650b", "29", "27.5", "26"];
const TREADS: TireTread[] = ["slick", "semi", "knobby"];
const BRAKES: BrakeType[] = ["rim", "disc-mech", "disc-hydraulic"];
const DRIVETRAINS: Drivetrain[] = ["1x", "2x", "3x", "internal", "belt"];

const TREAD_LABELS: Record<TireTread, string> = {
  slick: "Slick (Straße)",
  semi: "Semi-Slick",
  knobby: "Stollen",
};
const BRAKE_LABELS: Record<BrakeType, string> = {
  rim: "Felgenbremse",
  "disc-mech": "Scheibe (mech.)",
  "disc-hydraulic": "Scheibe (hydr.)",
};
const DRIVETRAIN_LABELS: Record<Drivetrain, string> = {
  "1x": "1-fach",
  "2x": "2-fach",
  "3x": "3-fach",
  internal: "Nabe (intern)",
  belt: "Riemen",
};

function MeinRad() {
  const navigate = useNavigate();
  const existing = useMemo(() => getBikeProfile(), []);
  const [step, setStep] = useState<StepIndex>(0);
  const [draft, setDraft] = useState<Partial<BikeProfile>>(() => existing ?? {
    bikeTypes: [],
    interests: [],
    tire: {},
  });
  const [saved, setSaved] = useState(false);

  const canNext = step !== 0 || (draft.bikeTypes && draft.bikeTypes.length > 0);

  function toggle<T>(arr: T[] | undefined, val: T): T[] {
    const a = arr ?? [];
    return a.includes(val) ? a.filter((x) => x !== val) : [...a, val];
  }

  function next() {
    if (step < 4) setStep(((step as number) + 1) as StepIndex);
    else commit();
  }

  function commit() {
    saveBikeProfile(draft);
    setSaved(true);
    setTimeout(() => navigate({ to: "/" }), 900);
  }

  function reset() {
    if (!confirm("RadProfil wirklich löschen?")) return;
    clearBikeProfile();
    setDraft({ bikeTypes: [], interests: [], tire: {} });
    setStep(0);
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-signal" />
          <span className="eyebrow text-signal">Personalisierung</span>
        </div>
        <h1 className="mt-5 font-display text-4xl md:text-6xl font-black tracking-tight leading-[0.95]">
          Mein <span className="italic text-muted-foreground">RadProfil</span>.
        </h1>
        <p className="mt-5 text-muted-foreground font-light leading-relaxed max-w-xl">
          Einmal ausfüllen — danach zeigen wir dir auf der Startseite genau die
          Artikel, Tests und Tools, die zu deinem Rad und deinen Interessen
          passen. Alle Angaben bleiben lokal in deinem Browser.
        </p>

        {existing && (
          <div className="mt-8 flex items-center justify-between gap-4 border border-border bg-card p-4">
            <div className="flex items-center gap-3 min-w-0">
              <Bike className="h-4 w-4 text-signal shrink-0" />
              <div className="min-w-0">
                <div className="eyebrow-sm text-muted-foreground">Aktuelles Profil</div>
                <div className="text-sm truncate">{summarizeProfile(existing) || "—"}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 eyebrow-sm text-muted-foreground hover:text-signal transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Löschen
            </button>
          </div>
        )}

        {/* Stepper */}
        <div className="mt-12 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex items-center gap-2">
              <div
                className={`h-1 flex-1 transition-colors ${
                  i <= step ? "bg-signal" : "bg-border"
                }`}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="eyebrow-sm text-muted-foreground">
            Schritt {step + 1} / {STEPS.length}
          </span>
          <span className="eyebrow text-foreground">{STEPS[step]}</span>
        </div>

        {/* Step content */}
        <div className="mt-10 min-h-[280px]">
          {step === 0 && (
            <div>
              <h2 className="font-display text-2xl font-bold">
                Was fährst du? <span className="text-muted-foreground font-light">(Mehrfachauswahl)</span>
              </h2>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BIKE_TYPES.map((t) => {
                  const active = draft.bikeTypes?.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setDraft({ ...draft, bikeTypes: toggle(draft.bikeTypes, t) })
                      }
                      className={`group relative border p-4 text-left transition-all ${
                        active
                          ? "border-signal bg-signal/5"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      <span className="block eyebrow-sm">{BIKE_TYPE_LABELS[t]}</span>
                      {active && (
                        <Check className="absolute top-2 right-2 h-3.5 w-3.5 text-signal" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Deine Maße</h2>
              <p className="text-sm text-muted-foreground">
                Wir nutzen sie für Reifendruck, Rahmengröße und passende Empfehlungen. Alles optional.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <NumberField label="Körpergröße (cm)" value={draft.bodyHeightCm} onChange={(v) => setDraft({ ...draft, bodyHeightCm: v })} placeholder="180" />
                <NumberField label="Schrittlänge (cm)" value={draft.inseamCm} onChange={(v) => setDraft({ ...draft, inseamCm: v })} placeholder="84" />
                <NumberField label="Rahmenhöhe (cm)" value={draft.frameSizeCm} onChange={(v) => setDraft({ ...draft, frameSizeCm: v })} placeholder="54" />
                <NumberField label="Gewicht inkl. Ausrüstung (kg)" value={draft.weightKg} onChange={(v) => setDraft({ ...draft, weightKg: v })} placeholder="78" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Reifen & Antrieb</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <NumberField label="Reifenbreite (mm)" value={draft.tire?.widthMm} onChange={(v) => setDraft({ ...draft, tire: { ...(draft.tire ?? {}), widthMm: v } })} placeholder="40" />
                <SelectField label="Laufradgröße" value={draft.tire?.diameter ?? ""} onChange={(v) => setDraft({ ...draft, tire: { ...(draft.tire ?? {}), diameter: (v || null) as TireDiameter | null } })} options={[{ value: "", label: "—" }, ...DIAMETERS.map((d) => ({ value: d, label: d }))]} />
                <SelectField label="Profil" value={draft.tire?.type ?? ""} onChange={(v) => setDraft({ ...draft, tire: { ...(draft.tire ?? {}), type: (v || null) as TireTread | null } })} options={[{ value: "", label: "—" }, ...TREADS.map((d) => ({ value: d, label: TREAD_LABELS[d] }))]} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SelectField label="Bremsen" value={draft.brakes ?? ""} onChange={(v) => setDraft({ ...draft, brakes: (v || null) as BrakeType | null })} options={[{ value: "", label: "—" }, ...BRAKES.map((d) => ({ value: d, label: BRAKE_LABELS[d] }))]} />
                <SelectField label="Antrieb" value={draft.drivetrain ?? ""} onChange={(v) => setDraft({ ...draft, drivetrain: (v || null) as Drivetrain | null })} options={[{ value: "", label: "—" }, ...DRIVETRAINS.map((d) => ({ value: d, label: DRIVETRAIN_LABELS[d] }))]} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-2xl font-bold">Wie fährst du am häufigsten?</h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STYLES.map((s) => {
                  const active = draft.ridingStyle === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDraft({ ...draft, ridingStyle: active ? null : s })}
                      className={`border p-4 text-left transition-all ${
                        active ? "border-signal bg-signal/5" : "border-border hover:border-foreground"
                      }`}
                    >
                      <span className="eyebrow-sm">{RIDING_STYLE_LABELS[s]}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <NumberField label="Budget (€, optional)" value={draft.budgetEur} onChange={(v) => setDraft({ ...draft, budgetEur: v })} placeholder="2500" />
                <TextField label="Region / PLZ (optional)" value={draft.region ?? ""} onChange={(v) => setDraft({ ...draft, region: v || null })} placeholder="10115" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-2xl font-bold">
                Welche Themen interessieren dich? <span className="text-muted-foreground font-light">(Mehrfachauswahl)</span>
              </h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {INTERESTS.map((i) => {
                  const active = draft.interests?.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setDraft({ ...draft, interests: toggle(draft.interests, i) })
                      }
                      className={`border px-3 py-2 eyebrow-sm transition-all ${
                        active
                          ? "border-signal bg-signal text-signal-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {INTEREST_LABELS[i]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="mt-12 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => (step > 0 ? setStep(((step as number) - 1) as StepIndex) : navigate({ to: "/" }))}
            className="inline-flex items-center gap-2 eyebrow text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {step > 0 ? "Zurück" : "Abbrechen"}
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            className="inline-flex items-center gap-2 bg-signal text-signal-foreground px-6 py-3 eyebrow disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {step === 4 ? (saved ? "Gespeichert ✓" : "Profil speichern") : "Weiter"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Alle Angaben werden ausschließlich lokal in deinem Browser gespeichert.
          Du kannst dein Profil jederzeit ändern oder löschen.
          <Link to="/datenschutz" className="ml-1 underline hover:text-foreground">
            Datenschutz
          </Link>
        </p>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow-sm text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Number(v));
        }}
        placeholder={placeholder}
        className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm focus:border-signal outline-none transition-colors"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow-sm text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm focus:border-signal outline-none transition-colors"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="eyebrow-sm text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm focus:border-signal outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
