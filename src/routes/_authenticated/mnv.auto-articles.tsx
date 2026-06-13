import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  listGenerationRuns, listArticleSources, triggerAutoGenerate,
  getAutoGenSettings, setAutoGenEnabled, researchNews,
} from "@/lib/auto-article.functions";
import { Loader2, Play, RefreshCw, ExternalLink, Search, Power } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mnv/auto-articles")({
  component: AutoArticlesPage,
});

const CATEGORIES = ["Nachrichten", "Ratgeber", "E-Bikes", "Tests"] as const;

function AutoArticlesPage() {
  const fetchRuns = useServerFn(listGenerationRuns);
  const fetchSources = useServerFn(listArticleSources);
  const trigger = useServerFn(triggerAutoGenerate);
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const fetchSettings = useServerFn(getAutoGenSettings);
  const saveEnabled = useServerFn(setAutoGenEnabled);
  const research = useServerFn(researchNews);

  const settings = useQuery({
    queryKey: ["autogen-settings"],
    queryFn: () => fetchSettings(),
  });

  const [scope, setScope] = useState<"de" | "world" | "all">("de");
  const [researching, setResearching] = useState(false);
  const [clusters, setClusters] = useState<Array<{ topic_title: string; summary: string; sources: Array<{ title: string; url: string; domain: string; published_date?: string }> }>>([]);

  const onToggle = async (next: boolean) => {
    try {
      await saveEnabled({ data: { enabled: next } });
      toast.success(next ? "Auto-Generierung aktiviert" : "Auto-Generierung pausiert");
      qc.invalidateQueries({ queryKey: ["autogen-settings"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    }
  };

  const onResearch = async () => {
    setResearching(true);
    setClusters([]);
    try {
      const res = await research({ data: { scope } });
      setClusters(res.clusters ?? []);
      if (!res.clusters?.length) toast.info("Keine Treffer gefunden");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    } finally {
      setResearching(false);
    }
  };


  const runs = useQuery({
    queryKey: ["autogen-runs"],
    queryFn: () => fetchRuns(),
    refetchInterval: 15_000,
  });

  const sources = useQuery({
    queryKey: ["autogen-sources", sourceFilter],
    queryFn: () => fetchSources({ data: sourceFilter === "all" ? {} : { status: sourceFilter as any } }),
    refetchInterval: 15_000,
  });

  const runTrigger = async (category?: typeof CATEGORIES[number]) => {
    const label = category ?? "Alle Kategorien";
    setBusy(label);
    try {
      const res = await trigger({ data: category ? { category } : {} });
      toast.success(`Lauf abgeschlossen: ${label}`);
      qc.invalidateQueries({ queryKey: ["autogen-runs"] });
      qc.invalidateQueries({ queryKey: ["autogen-sources"] });
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      console.log("[autogen]", res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell
      title="Auto-Artikel"
      breadcrumbs={[{ label: "Admin", to: "/mnv" }, { label: "Auto-Artikel" }]}
      actions={
        <Button
          onClick={() => runTrigger()}
          disabled={busy !== null}
          size="sm"
          className="bg-[#FF6A1A] hover:bg-[#e85d10] text-zinc-950 font-medium"
        >
          {busy === "Alle Kategorien" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Play className="h-4 w-4 mr-1.5" />}
          Jetzt auslösen
        </Button>
      }
    >
      {/* Manual triggers per category */}
      <div className="mb-6 bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
        <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Manuelle Tests pro Kategorie</div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => runTrigger(c)}
              className="border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-200"
            >
              {busy === c ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
              {c}
            </Button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          Cron läuft automatisch alle 3 Stunden. Bis zu 1 Artikel pro Kategorie & Lauf, sofern eine neue, passende Story gefunden wird.
        </p>
      </div>

      {/* Runs */}
      <div className="mb-8 bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Letzte Läufe</h2>
          <button onClick={() => runs.refetch()} className="text-zinc-500 hover:text-zinc-300">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                <th className="px-4 py-2 font-medium">Start</th>
                <th className="px-4 py-2 font-medium">Trigger</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Gefunden</th>
                <th className="px-4 py-2 font-medium text-right">Erstellt</th>
                <th className="px-4 py-2 font-medium text-right">Fehler</th>
                <th className="px-4 py-2 font-medium">Fehler-Details</th>
              </tr>
            </thead>
            <tbody>
              {runs.isLoading ? (
                <tr><td colSpan={7} className="px-4 py-4"><Skeleton className="h-8 w-full bg-zinc-900" /></td></tr>
              ) : (runs.data?.runs ?? []).length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Noch keine Läufe.</td></tr>
              ) : (
                (runs.data?.runs ?? []).map((r: any) => (
                  <tr key={r.id} className="border-b border-zinc-900">
                    <td className="px-4 py-2 text-zinc-300 whitespace-nowrap">
                      {new Date(r.started_at).toLocaleString("de-DE")}
                    </td>
                    <td className="px-4 py-2 text-zinc-400">{r.trigger}</td>
                    <td className="px-4 py-2">
                      <Badge
                        variant="outline"
                        className={
                          r.status === "success" ? "border-emerald-900 bg-emerald-950/40 text-emerald-400 text-[10px]"
                          : r.status === "partial" ? "border-amber-900 bg-amber-950/40 text-amber-400 text-[10px]"
                          : r.status === "running" ? "border-blue-900 bg-blue-950/40 text-blue-400 text-[10px]"
                          : "border-rose-900 bg-rose-950/40 text-rose-400 text-[10px]"
                        }
                      >{r.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-300 tabular-nums">{r.sources_found}</td>
                    <td className="px-4 py-2 text-right text-zinc-100 tabular-nums font-medium">{r.articles_created}</td>
                    <td className="px-4 py-2 text-right text-zinc-300 tabular-nums">{r.errors_count}</td>
                    <td className="px-4 py-2 text-xs text-zinc-500 max-w-md truncate" title={r.error_summary ?? ""}>
                      {r.error_summary ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sources */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-100">Verarbeitete Quellen</h2>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-56 h-8 bg-zinc-950 border-zinc-800 text-zinc-200 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="processed">Verarbeitet</SelectItem>
              <SelectItem value="skipped_brand_mention">Übersprungen (Marke)</SelectItem>
              <SelectItem value="skipped_duplicate">Duplikat</SelectItem>
              <SelectItem value="failed">Fehlgeschlagen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                <th className="px-4 py-2 font-medium">Datum</th>
                <th className="px-4 py-2 font-medium">Kategorie</th>
                <th className="px-4 py-2 font-medium">Quelle</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Grund</th>
              </tr>
            </thead>
            <tbody>
              {sources.isLoading ? (
                <tr><td colSpan={5} className="px-4 py-4"><Skeleton className="h-8 w-full bg-zinc-900" /></td></tr>
              ) : (sources.data?.sources ?? []).length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Keine Einträge.</td></tr>
              ) : (
                (sources.data?.sources ?? []).map((s: any) => (
                  <tr key={s.id} className="border-b border-zinc-900">
                    <td className="px-4 py-2 text-zinc-400 whitespace-nowrap text-xs">
                      {new Date(s.discovered_at).toLocaleString("de-DE")}
                    </td>
                    <td className="px-4 py-2 text-zinc-300 text-xs">{s.category}</td>
                    <td className="px-4 py-2 min-w-0">
                      <div className="text-zinc-200 truncate max-w-md">{s.source_title ?? "—"}</div>
                      <a
                        href={s.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1"
                      >
                        {s.source_domain}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        variant="outline"
                        className={
                          s.status === "processed" ? "border-emerald-900 bg-emerald-950/40 text-emerald-400 text-[10px]"
                          : s.status === "failed" ? "border-rose-900 bg-rose-950/40 text-rose-400 text-[10px]"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400 text-[10px]"
                        }
                      >{s.status.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-4 py-2 text-xs text-zinc-500 max-w-sm truncate" title={s.skip_reason ?? ""}>
                      {s.skip_reason ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
