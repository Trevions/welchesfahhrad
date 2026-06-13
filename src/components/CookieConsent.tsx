import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, ChevronDown, ChevronUp, X, ShieldCheck } from "lucide-react";
import { useCookieConsent, type ConsentChoice } from "@/hooks/use-cookie-consent";

function ConsentButton({
  children,
  variant = "primary",
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-sm cursor-pointer";

  const styles = {
    primary:
      "bg-signal text-signal-foreground hover:brightness-110 hover:shadow-[0_8px_30px_-8px_var(--signal)]",
    secondary:
      "border border-border bg-background/80 text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
    ghost:
      "text-muted-foreground hover:text-foreground underline-offset-4 hover:underline",
  };

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/50 last:border-b-0">
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{description}</div>
      </div>
      <div
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ${
          checked ? "bg-signal" : "bg-muted"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform duration-300 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </div>
  );
}

export function CookieConsentBanner() {
  const { visible, setConsent } = useCookieConsent();
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);

  if (!visible) return null;

  const handleClose = (choice: ConsentChoice) => {
    setClosing(true);
    setTimeout(() => setConsent(choice), 400);
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 md:pb-6 md:px-6 flex justify-center transition-all duration-500 ${
        closing ? "translate-y-[120%] opacity-0" : "translate-y-0 opacity-100"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
    >
      <div className="w-full max-w-3xl surface-strong rounded-lg shadow-elevated overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3 md:px-6 md:py-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-signal/10">
            <Cookie className="h-4 w-4 text-signal" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Datenschutzeinstellungen
            </h3>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Wir respektieren Ihre Privatsphäre gemäß DSGVO & TDDDG
            </p>
          </div>
          <button
            onClick={() => handleClose("essential")}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 md:px-6 md:py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Diese Website verwendet technisch notwendige Cookies und lokale Speicherung, um die
            Kernfunktionalität zu gewährleisten (z. B. Theme-Präferenz, Lesezeichen). Wir setzen
            <strong className="text-foreground"> keine Tracking- oder Marketing-Cookies</strong>{" "}
            ein. Details finden Sie in unserer{" "}
            <Link
              to="/cookies"
              className="text-signal hover:underline underline-offset-2"
              onClick={() => handleClose("essential")}
            >
              Cookie-Richtlinie
            </Link>{" "}
            und{" "}
            <Link
              to="/datenschutz"
              className="text-signal hover:underline underline-offset-2"
              onClick={() => handleClose("essential")}
            >
              Datenschutzerklärung
            </Link>
            .
          </p>

          {/* Expanded details */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-border/50 animate-fade-in">
              <ToggleRow
                label="Technisch notwendig"
                description="Erforderlich für Basis-Funktionen: Theme-Speicherung, Authentifizierung, Lesezeichen, Sitzungsmanagement. Kann nicht abgeschaltet werden (Art. 6 Abs. 1 lit. f DSGVO, § 25 Abs. 2 Nr. 2 TDDDG)."
                checked
                disabled
              />
              <ToggleRow
                label="Analyse & Statistik"
                description="Wir nutzen keine Analyse-Tools wie Google Analytics, Matomo oder ähnliche Tracking-Dienste."
                checked={false}
                disabled
              />
              <ToggleRow
                label="Marketing & Werbung"
                description="Wir setzen keine Werbe-Cookies, Retargeting-Pixel oder Social-Media-Einbettungen ein."
                checked={false}
                disabled
              />
              <ToggleRow
                label="Drittanbieter-Einbettungen"
                description="Wir zeigen keine externen Inhalte (YouTube, Social Feeds) an, die zusätzliche Cookies setzen könnten."
                checked={false}
                disabled
              />
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-5 flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Left: expand + legal links */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" /> Weniger anzeigen
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" /> Details anzeigen
                  </>
                )}
              </button>
              <span className="hidden sm:inline h-3 w-px bg-border" />
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                <Link
                  to="/datenschutz"
                  className="text-muted-foreground hover:text-signal transition-colors"
                  onClick={() => handleClose("essential")}
                >
                  Datenschutz
                </Link>
                <Link
                  to="/cookies"
                  className="text-muted-foreground hover:text-signal transition-colors"
                  onClick={() => handleClose("essential")}
                >
                  Cookies
                </Link>
                <Link
                  to="/nutzungsbedingungen"
                  className="text-muted-foreground hover:text-signal transition-colors"
                  onClick={() => handleClose("essential")}
                >
                  Nutzungsbedingungen
                </Link>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2.5">
              <ConsentButton variant="secondary" onClick={() => handleClose("essential")}>
                Nur Essenzielle
              </ConsentButton>
              <ConsentButton variant="primary" onClick={() => handleClose("all")}>
                <ShieldCheck className="h-3.5 w-3.5" />
                Alle Akzeptieren
              </ConsentButton>
            </div>
          </div>
        </div>

        {/* Bottom legal ribbon */}
        <div className="flex items-center justify-between gap-3 border-t border-border/40 bg-muted/30 px-5 py-2 md:px-6">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO / § 25 Abs. 2 TDDDG
          </span>
          <span className="text-[10px] text-muted-foreground hidden sm:block">
            Verantwortlich: DigiMarket Bulgaria, 6400 Dimitrovgrad
          </span>
        </div>
      </div>
    </div>
  );
}
