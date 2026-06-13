import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardStats } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Eye, FilePlus, Archive, Plus, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchStats = useServerFn(getDashboardStats);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchStats(),
  });

  const stats = [
    { label: "Artikel gesamt", value: data?.total ?? 0, icon: FileText, accent: "text-[#FF6A1A]" },
    { label: "Veröffentlicht", value: data?.published ?? 0, icon: Archive, accent: "text-emerald-400" },
    { label: "Entwürfe", value: data?.drafts ?? 0, icon: FilePlus, accent: "text-amber-400" },
    { label: "Aufrufe (gesamt)", value: data?.totalViews ?? 0, icon: Eye, accent: "text-sky-400" },
  ];

  return (
    <AdminShell
      title="Übersicht"
      breadcrumbs={[{ label: "Admin" }]}
      actions={
        <Link to="/admin/articles/new">
          <Button size="sm" className="bg-[#FF6A1A] hover:bg-[#e85d10] text-zinc-950 font-medium">
            <Plus className="h-4 w-4 mr-1.5" /> Neuer Artikel
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-zinc-500">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.accent}`} />
            </div>
            <div className="text-3xl font-display font-black text-zinc-50 tabular-nums">
              {isLoading ? <Skeleton className="h-8 w-16 bg-zinc-800" /> : s.value.toLocaleString("de-DE")}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between p-5 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-200">Letzte Aktivität</h2>
            <Link to="/admin/articles" className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1">
              Alle anzeigen <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-900">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-4 w-3/4 bg-zinc-800 mb-2" />
                    <Skeleton className="h-3 w-1/3 bg-zinc-800" />
                  </div>
                ))
              : (data?.recent ?? []).length === 0
              ? (
                <div className="p-10 text-center text-sm text-zinc-500">
                  Noch keine Artikel. <Link to="/admin/articles/new" className="text-[#FF6A1A] hover:underline">Jetzt erstellen →</Link>
                </div>
              )
              : (data?.recent ?? []).map((r: any) => (
                  <Link
                    key={r.id}
                    to="/admin/articles/$id"
                    params={{ id: r.id }}
                    className="flex items-center gap-4 p-4 hover:bg-zinc-900/60 transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-100 truncate group-hover:text-[#FF6A1A]">{r.title}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {r.category} · {new Date(r.updated_at).toLocaleDateString("de-DE")}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        r.status === "published"
                          ? "border-emerald-900 bg-emerald-950/40 text-emerald-400 text-[10px]"
                          : "border-amber-900 bg-amber-950/40 text-amber-400 text-[10px]"
                      }
                    >
                      {r.status === "published" ? "Live" : "Entwurf"}
                    </Badge>
                  </Link>
                ))}
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg">
          <div className="p-5 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-200">Nach Kategorie</h2>
          </div>
          <div className="p-5 space-y-3">
            {(["Nachrichten", "Ratgeber", "E-Bikes", "Tests"] as const).map((cat) => {
              const count = data?.byCategory?.[cat] ?? 0;
              const max = Math.max(1, ...Object.values(data?.byCategory ?? { x: 1 }));
              const pct = (count / max) * 100;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-300">{cat}</span>
                    <span className="text-zinc-500 tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF6A1A] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
