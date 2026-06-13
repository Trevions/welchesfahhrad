import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle, Loader2, MailMinus } from "lucide-react";
import { unsubscribeNewsletter } from "@/lib/newsletter.functions";

type Search = { token?: string };

export const Route = createFileRoute("/newsletter/abmelden")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Newsletter abmelden — radmap.de" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const unsub = useServerFn(unsubscribeNewsletter);
  const [state, setState] = useState<"confirm" | "loading" | "ok" | "invalid" | "error">(
    token ? "confirm" : "invalid",
  );

  const handleUnsubscribe = async () => {
    if (!token) return;
    setState("loading");
    try {
      const r = await unsub({ data: { token } });
      setState(r.ok ? "ok" : "invalid");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="mx-auto max-w-[700px] px-6 pt-20 pb-24 text-center">
      <Link to="/" className="eyebrow-sm text-muted-foreground hover:text-foreground">
        ← Zurück zur Startseite
      </Link>

      <div className="mt-12 surface-strong rounded-lg p-10 md:p-14">
        {state === "confirm" && (
          <>
            <MailMinus className="mx-auto h-14 w-14 text-signal" />
            <h1 className="mt-6 font-display text-2xl md:text-4xl font-black">
              Newsletter abbestellen?
            </h1>
            <p className="mt-4 text-muted-foreground font-light leading-relaxed">
              Klicken Sie auf den Button unten, um Ihre Anmeldung endgültig zu beenden.
              Sie erhalten danach keine weiteren E-Mails von uns.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleUnsubscribe}
                className="inline-flex items-center justify-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
              >
                Jetzt abmelden
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-muted transition-colors"
              >
                Angemeldet bleiben
              </Link>
            </div>
          </>
        )}

        {state === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-signal animate-spin" />
            <h1 className="mt-6 font-display text-2xl md:text-3xl font-black">
              Abmeldung wird verarbeitet …
            </h1>
          </>
        )}

        {state === "ok" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-signal" />
            <h1 className="mt-6 font-display text-2xl md:text-4xl font-black">
              Sie wurden abgemeldet
            </h1>
            <p className="mt-4 text-muted-foreground font-light leading-relaxed">
              Sie erhalten ab sofort keine Newsletter-Ausgaben mehr von uns. Schade,
              dass Sie gehen — Sie können sich jederzeit erneut anmelden.
            </p>
            <div className="mt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-signal hover:text-signal-foreground transition-colors"
              >
                Zur Startseite
              </Link>
            </div>
          </>
        )}

        {state === "invalid" && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-destructive" />
            <h1 className="mt-6 font-display text-2xl md:text-3xl font-black">
              Link ungültig
            </h1>
            <p className="mt-4 text-muted-foreground font-light">
              Dieser Abmeldelink ist nicht (mehr) gültig. Möglicherweise wurden Sie bereits
              abgemeldet.
            </p>
            <div className="mt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-signal hover:text-signal-foreground transition-colors"
              >
                Zur Startseite
              </Link>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-destructive" />
            <h1 className="mt-6 font-display text-2xl md:text-3xl font-black">
              Ein Fehler ist aufgetreten
            </h1>
            <p className="mt-4 text-muted-foreground font-light">
              Bitte versuchen Sie es später erneut.
            </p>
            <div className="mt-8">
              <button
                onClick={handleUnsubscribe}
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-signal hover:text-signal-foreground transition-colors"
              >
                Erneut versuchen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
