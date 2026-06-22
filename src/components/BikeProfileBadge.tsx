import { Link } from "@tanstack/react-router";
import { Bike } from "lucide-react";
import { useBikeProfile } from "@/lib/bike-profile";

/** Small header badge that opens the bike-profile wizard.
 *  Pulses while no profile exists, becomes a quiet pill once configured. */
export function BikeProfileBadge() {
  const profile = useBikeProfile();
  const configured = !!profile && profile.bikeTypes.length > 0;

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
