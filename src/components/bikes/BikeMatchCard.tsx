import { Link } from "@tanstack/react-router";
import { Check, X, Sparkles, Settings2, ArrowRight } from "lucide-react";
import { useBikeProfile } from "@/lib/bike-profile";
import { matchBikeToProfile } from "@/lib/bike-match";
import type { Bike } from "@/lib/bike-types";

export function BikeMatchCard({ bike }: { bike: Bike }) {
  const profile = useBikeProfile();

  if (!profile || profile.bikeTypes.length === 0) {
    return (
      <div className="mt-6 border border-dashed border-border bg-card/60 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-background">
            <Sparkles className="h-4 w-4 text-signal" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="eyebrow-sm text-signal">Passt dieses Rad zu dir?</div>
            <div className="mt-1 text-sm text-muted-foreground">
              In 60&nbsp;Sekunden dein RadProfil anlegen — dann bekommst du für jedes Rad einen
              persönlichen Match-Score mit Begründung.
            </div>
            <Link
              to="/mein-rad"
              className="mt-3 inline-flex items-center gap-1.5 bg-signal text-signal-foreground px-4 py-2 eyebrow-sm hover:opacity-90 transition-opacity"
            >
              RadProfil anlegen <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const m = matchBikeToProfile(bike, profile);
  const tone =
    m.percent >= 80
      ? { ring: "border-emerald-500/50 text-emerald-500", chip: "bg-emerald-500/10 text-emerald-500", head: "Sehr gutes Match für dein Profil." }
      : m.percent >= 60
        ? { ring: "border-signal/50 text-signal", chip: "bg-signal/10 text-signal", head: "Solide Passform für dein Profil." }
        : { ring: "border-amber-500/50 text-amber-500", chip: "bg-amber-500/10 text-amber-500", head: "Nur teilweise passend." };

  return (
    <div className="mt-6 border border-border bg-card p-4 md:p-5">
      <div className="flex items-start gap-4">
        <div className={`shrink-0 flex flex-col items-center justify-center border-2 ${tone.ring} w-20 h-20 md:w-24 md:h-24`}>
          <span className="font-display text-2xl md:text-3xl font-black tabular-nums leading-none">
            {m.percent}
            <span className="text-xs align-top ml-0.5">%</span>
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-widest">Match</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 ${tone.chip} px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold`}>
              <Sparkles className="h-3 w-3" /> Für dich
            </span>
            <span className="eyebrow-sm text-muted-foreground truncate">{m.summary}</span>
          </div>
          <div className="text-sm md:text-base font-display font-bold mt-1.5">{tone.head}</div>
          {m.reasons.length > 0 && (
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5">
              {m.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs md:text-[13px] leading-snug">
                  {r.ok ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-muted-foreground/70 mt-0.5 shrink-0" />
                  )}
                  <span className="min-w-0">
                    <span className="font-bold">{r.label}:</span>{" "}
                    <span className={r.ok ? "text-foreground" : "text-muted-foreground"}>{r.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/mein-rad"
            className="mt-3 inline-flex items-center gap-1 eyebrow-sm text-muted-foreground hover:text-signal transition-colors"
          >
            <Settings2 className="h-3 w-3" /> Profil anpassen
          </Link>
        </div>
      </div>
    </div>
  );
}
