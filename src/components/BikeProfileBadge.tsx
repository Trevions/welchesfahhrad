import { Link } from "@tanstack/react-router";
import { Bike } from "lucide-react";
import { useBikeProfile } from "@/lib/bike-profile";
import { useMatchingArticles } from "@/lib/use-matches";

/** Small header badge that opens the bike-profile wizard.
 *  Pulses while no profile exists, becomes a quiet pill once configured.
 *  When the user has a profile AND there are strong matches (>= 80%),
 *  the badge turns into a signal-coloured chip with a live count and
 *  links to the personalised feed at /passt-zu-dir instead. */
export function BikeProfileBadge() {
  const profile = useBikeProfile();
  const configured = !!profile && profile.bikeTypes.length > 0;
  const { count } = useMatchingArticles(80);
  const hasMatches = configured && count > 0;

  if (hasMatches) {
    return (
      <Link
        to="/passt-zu-dir"
        aria-label={`${count} passende Artikel für dein RadProfil`}
        title={`${count} passende Artikel`}
        className="relative flex h-9 items-center gap-2 border border-signal bg-signal text-signal-foreground px-3 transition-opacity hover:opacity-90 animate-pulse-soft"
      >
        <Bike className="h-3.5 w-3.5" />
        <span className="eyebrow-sm hidden lg:inline">Für dich</span>
        <span className="inline-flex min-w-[18px] h-[18px] px-1 items-center justify-center bg-signal-foreground text-signal text-[10px] font-black tabular-nums leading-none">
          {count > 99 ? "99+" : count}
        </span>
      </Link>
    );
  }

  return (
    <Link
      to="/mein-rad"
      aria-label="Mein RadProfil"
      title="Mein RadProfil"
      className={`relative flex h-9 items-center gap-2 border px-3 transition-colors ${
        configured
          ? "border-border text-foreground hover:border-foreground"
          : "border-signal text-signal hover:bg-signal hover:text-signal-foreground"
      }`}
    >
      <Bike className="h-3.5 w-3.5" />
      <span className="eyebrow-sm hidden lg:inline">
        {configured ? "Mein Rad" : "RadProfil"}
      </span>
      {!configured && (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-signal animate-pulse"
        />
      )}
    </Link>
  );
}
