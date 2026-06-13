import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { requestUnsubscribe } from "@/lib/newsletter.functions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UnsubscribeDialog({ open, onOpenChange }: Props) {
  const submit = useServerFn(requestUnsubscribe);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const hpRef = useRef<HTMLInputElement>(null);

  function handleOpenChange(next: boolean) {
    if (!next) {
      // reset on close
      setTimeout(() => {
        setEmail("");
        setStatus("idle");
        setErrorMsg("");
        if (hpRef.current) hpRef.current.value = "";
      }, 150);
    }
    onOpenChange(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setErrorMsg("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await submit({
        data: { email: trimmed, hp_field: hpRef.current?.value ?? "" },
      });
      setStatus("success");
    } catch (err) {
      console.error("[newsletter] unsubscribe request failed", err);
      setStatus("error");
      setErrorMsg("Etwas ist schiefgegangen. Bitte versuchen Sie es später erneut.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Newsletter abbestellen</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Geben Sie die E-Mail-Adresse ein, mit der Sie den Newsletter abonniert haben.
            Wir senden Ihnen einen Bestätigungs-Link, mit dem Sie die Abmeldung in einem
            Klick abschließen können.
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="surface-strong rounded-sm p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-signal shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-foreground">E-Mail versendet</div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Falls diese Adresse bei uns hinterlegt ist, haben wir Ihnen soeben einen
                Bestätigungs-Link gesendet. Bitte prüfen Sie auch Ihren Spam-Ordner.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
                disabled={!email || status === "loading"}
                className="bg-foreground px-4 py-3 eyebrow-sm text-background hover:bg-signal hover:text-signal-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {status === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Senden
              </button>
            </div>

            {/* Honeypot */}
            <div
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", top: "-9999px", height: 0, width: 0, overflow: "hidden" }}
            >
              <label>
                Bitte dieses Feld leer lassen
                <input
                  ref={hpRef}
                  type="text"
                  name="hp_field_unsub"
                  tabIndex={-1}
                  autoComplete="new-password"
                  defaultValue=""
                />
              </label>
            </div>

            {status === "error" && (
              <p className="text-xs text-destructive">{errorMsg || "Bitte erneut versuchen."}</p>
            )}

            <p className="text-[11px] text-muted-foreground leading-snug">
              Aus Sicherheitsgründen verlangen wir eine Bestätigung per E-Mail — so kann
              niemand Ihre Adresse ohne Ihr Wissen abmelden.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
