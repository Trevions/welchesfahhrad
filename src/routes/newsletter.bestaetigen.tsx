import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { confirmNewsletter } from "@/lib/newsletter.functions";
import { Link } from "@tanstack/react-router";

type Search = { token?: string };

export const Route = createFileRoute("/newsletter/bestaetigen")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Newsletter-Anmeldung bestätigen — radmap.de" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const { token } = Route.useSearch();
  const confirm = useServerFn(confirmNewsletter);
  const [state, setState] = useState<"loading" | "ok" | "already" | "invalid" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    confirm({ data: { token } })
      .then((r) => {
        if (!r.ok) setState("invalid");
        else if (r.alreadyConfirmed) setState("already");
        else setState("ok");
      })
      .catch(() => setState("error"));
  }, [token, confirm]);

  return (
    <div className="mx-auto max-w-[700px] px-6 pt-20 pb-24 text-center">
      <Link to="/" className="eyebrow-sm text-muted-foreground hover:text-foreground">
        ← Zurück zur Startseite
      </Link>

      <div className="mt-12 surface-strong rounded-lg p-10 md:p-14">
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-signal animate-spin" />
            <h1 className="mt-6 font-display text-2xl md:text-3xl font-black">
              Anmeldung wird bestätigt …
            </h1>
          </>
        )}

        {state === "ok" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-signal" />
            <h1 className="mt-6 font-display text-2xl md:text-4xl font-black">
              Vielen Dank — Sie sind angemeldet!
            </h1>
            <p className="mt-4 text-muted-foreground font-light leading-relaxed">
              Ihre Newsletter-Anmeldung ist erfolgreich bestätigt. Die erste Ausgabe
              erreicht Sie pünktlich am kommenden Freitag.
            </p>
          </>
        )}

        {state === "already" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-muted-foreground" />
            <h1 className="mt-6 font-display text-2xl md:text-3xl font-black">
              Bereits bestätigt
            </h1>
            <p className="mt-4 text-muted-foreground font-light">
              Diese E-Mail-Adresse ist bereits für unseren Newsletter angemeldet.
            </p>
          </>
        )}

        {state === "invalid" && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-destructive" />
            <h1 className="mt-6 font-display text-2xl md:text-3xl font-black">
              Link ungültig oder abgelaufen
            </h1>
            <p className="mt-4 text-muted-foreground font-light">
              Bitte fordern Sie unten im Footer einen neuen Bestätigungslink an.
            </p>
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
          </>
        )}

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-signal hover:text-signal-foreground transition-colors"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
