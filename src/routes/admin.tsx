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
    <div className="mx-auto max-w-[1100px] px-6 md:px-8 py-16 md:py-24 border-x border-border">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 bg-signal" />
        <span className="eyebrow text-signal">Redaktion</span>
      </div>
      <h1 className="mt-6 font-display text-5xl md:text-7xl font-black leading-[0.95]">
        Admin <span className="italic text-muted-foreground">Cockpit.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground font-light">
        Hier werden Sie Artikel verwalten, neue Beiträge veröffentlichen
        und die AI-Pipeline (Perplexity + Lovable AI) steuern.
        In Etappe 2 wird ein sicherer Login mit Lovable Cloud aktiviert.
      </p>

      <div className="mt-12 inline-flex items-center gap-3 border border-border bg-card px-5 py-3">
        <Lock className="h-4 w-4 text-signal" />
        <span className="eyebrow text-muted-foreground">Login folgt in Etappe 2</span>
      </div>

      <div className="mt-14 grid gap-px bg-border md:grid-cols-3 border border-border">
        {[
          { Icon: Plus, t: "Artikel erstellen", d: "Eigene Ratgeber & Beiträge mit SEO-Optimierung." },
          { Icon: FileText, t: "AI-News verwalten", d: "Perplexity-Quellen und Lovable AI Rewrites freigeben." },
          { Icon: BarChart3, t: "Statistiken", d: "Reichweite, Ranking und beliebte Artikel auf einen Blick." },
        ].map((f) => (
          <div key={f.t} className="bg-background p-8">
            <f.Icon className="h-6 w-6 text-signal" />
            <h3 className="mt-4 font-display text-xl font-bold">{f.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed">{f.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
