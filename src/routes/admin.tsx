import { createFileRoute } from "@tanstack/react-router";
import { Lock, Plus, FileText, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | radmap.de" },
      { name: "description", content: "Admin-Bereich für radmap.de" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="pt-32 px-6 pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="glass-strong rounded-3xl p-8 md:p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-signal/10 text-signal">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="mt-6 font-display text-3xl md:text-4xl font-bold tracking-tight text-gradient">
            Admin-Bereich
          </h1>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Hier werden Sie Artikel verwalten, neue Beiträge veröffentlichen
            und die AI-Pipeline (Perplexity + Claude) steuern.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            In Etappe 2 wird ein sicherer Login mit Lovable Cloud aktiviert.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3 text-left">
            {[
              { Icon: Plus, t: "Artikel erstellen", d: "Eigene Ratgeber & Beiträge mit SEO-Optimierung" },
              { Icon: FileText, t: "AI-News verwalten", d: "Perplexity-Quellen + Claude-Rewrites freigeben" },
              { Icon: BarChart3, t: "Statistiken", d: "Reichweite, Ranking & beliebte Artikel" },
            ].map((f) => (
              <div key={f.t} className="glass rounded-2xl p-5">
                <f.Icon className="h-5 w-5 text-signal" />
                <h3 className="mt-3 font-semibold">{f.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
