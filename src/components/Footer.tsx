import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { UnsubscribeDialog } from "@/components/UnsubscribeDialog";


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function NewsletterForm() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const hpRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [unsubOpen, setUnsubOpen] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    const trimmed = email.trim();
    if (!consent || !trimmed) return;

    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setErrorMsg("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      await subscribe({
        data: {
          email: trimmed,
          consent: true,
          source: "footer",
          hp_field: hpRef.current?.value ?? "",
        },
      });
      setStatus("success");
      setEmail("");
      setConsent(false);
      if (hpRef.current) hpRef.current.value = "";
    } catch (err) {
      console.error("[newsletter] subscribe failed", err);
      setStatus("error");
      setErrorMsg("Etwas ist schiefgegangen. Bitte versuchen Sie es später erneut.");
    }
  }

  const unsubLink = (
    <button
      type="button"
      onClick={() => setUnsubOpen(true)}
      className="text-[11px] text-muted-foreground hover:text-signal underline underline-offset-2 transition-colors bg-transparent border-none p-0 cursor-pointer"
    >
      Newsletter bereits abonniert? Hier abbestellen.
    </button>
  );

  if (status === "success") {
    return (
      <>
        <div className="mt-4 surface-strong rounded-sm p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-signal shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-foreground">Fast geschafft!</div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Bitte klicken Sie
              auf den Link darin, um Ihre Anmeldung abzuschließen (Double-Opt-In).
            </p>
          </div>
        </div>
        <div className="mt-3">{unsubLink}</div>
        <UnsubscribeDialog open={unsubOpen} onOpenChange={setUnsubOpen} />
      </>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-4 space-y-3" noValidate>
        <div className="flex border border-border bg-background">
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ihre@email.de"
            aria-label="E-Mail Adresse"
            className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!consent || !email || status === "loading"}
            className="bg-foreground px-4 py-3 eyebrow-sm text-background hover:bg-signal hover:text-signal-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {status === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Abonnieren
          </button>
        </div>

        {/* Honeypot — off-screen, ignored by autofill */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
          <label>
            Bitte dieses Feld leer lassen
            <input
              ref={hpRef}
              type="text"
              name="hp_field"
              id="hp_field"
              tabIndex={-1}
              autoComplete="new-password"
              defaultValue=""
            />
          </label>
        </div>

        <label className="flex items-start gap-2 text-[11px] text-muted-foreground leading-snug cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 accent-signal shrink-0"
          />
          <span>
            Ich willige ein, den Newsletter zu erhalten. Eine Abmeldung ist
            jederzeit möglich. Hinweise:{" "}
            <Link to="/datenschutz" className="text-signal hover:underline">
              Datenschutz
            </Link>
            .
          </span>
        </label>

        {status === "error" && (
          <p className="text-xs text-destructive">{errorMsg || "Bitte erneut versuchen."}</p>
        )}
      </form>

      <div className="mt-3 pt-3 border-t border-border/50">{unsubLink}</div>
      <UnsubscribeDialog open={unsubOpen} onOpenChange={setUnsubOpen} />
    </>
  );
}


export function Footer() {
  const { openBanner } = useCookieConsent();
  return (
    <footer className="mt-24 border-t border-border bg-card pb-28 md:pb-12 pt-16">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-baseline">
              <span className="font-display text-3xl font-black italic">
                Radmap<span className="text-signal">.</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm text-muted-foreground font-light leading-relaxed">
              Das führende deutsche Magazin für Fahrräder, E-Bikes und alles rund
              um den Radsport. Tagesaktuell. Unabhängig. Mit Leidenschaft für jeden Kilometer.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-8 bg-signal" />
              <span className="eyebrow-sm text-muted-foreground">Issue No. 24 / 2026</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="eyebrow text-foreground">Rubriken</h4>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li><Link to="/nachrichten" className="text-muted-foreground hover:text-signal transition-colors">Nachrichten</Link></li>
              <li><Link to="/ratgeber" className="text-muted-foreground hover:text-signal transition-colors">Ratgeber</Link></li>
              <li><Link to="/e-bikes" className="text-muted-foreground hover:text-signal transition-colors">E-Bikes</Link></li>
              <li><Link to="/tests" className="text-muted-foreground hover:text-signal transition-colors">Tests</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="eyebrow text-foreground">Verlag</h4>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li><Link to="/ueber-uns" className="text-muted-foreground hover:text-signal transition-colors">Über uns</Link></li>
              <li><Link to="/redaktion" className="text-muted-foreground hover:text-signal transition-colors">Redaktion</Link></li>
              <li><Link to="/mediadaten" className="text-muted-foreground hover:text-signal transition-colors">Mediadaten</Link></li>
              <li><Link to="/kontakt" className="text-muted-foreground hover:text-signal transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="eyebrow text-foreground">Newsletter</h4>
            <p className="mt-5 text-sm text-muted-foreground font-light">
              Die wichtigsten Geschichten der Woche — jeden Freitag in Ihrem Postfach.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} radmap.de — Alle Rechte vorbehalten.</div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
            <Link to="/nutzungsbedingungen" className="hover:text-foreground transition-colors">Nutzungsbedingungen</Link>
            <Link to="/agb" className="hover:text-foreground transition-colors">AGB</Link>
            <Link to="/barrierefreiheit" className="hover:text-foreground transition-colors">Barrierefreiheit</Link>
            <Link to="/bildnachweise" className="hover:text-foreground transition-colors">Bildnachweise</Link>
            <button onClick={openBanner} className="hover:text-foreground transition-colors bg-transparent border-none p-0 m-0 cursor-pointer text-inherit">Datenschutzeinstellungen</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
