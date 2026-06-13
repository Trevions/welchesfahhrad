import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Search as SearchIcon, Mail, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  listNewsletterSubscribers,
  deleteNewsletterSubscriber,
} from "@/lib/newsletter.functions";

export const Route = createFileRoute("/_authenticated/mnv/newsletter")({
  head: () => ({ meta: [{ title: "Newsletter — Admin" }, { name: "robots", content: "noindex" }] }),
  component: NewsletterAdminPage,
});

type Status = "all" | "pending" | "confirmed" | "unsubscribed";

function NewsletterAdminPage() {
  const list = useServerFn(listNewsletterSubscribers);
  const remove = useServerFn(deleteNewsletterSubscriber);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Status>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["newsletter-subs", filter, search],
    queryFn: () =>
      list({
        data: {
          status: filter === "all" ? undefined : filter,
          search: search || undefined,
        },
      }),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Eintrag gelöscht");
      qc.invalidateQueries({ queryKey: ["newsletter-subs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  const subs = data?.subscribers ?? [];
  const counts = subs.reduce(
    (acc, s) => {
      acc[s.status as Status] = (acc[s.status as Status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const statusIcon = (s: string) =>
    s === "confirmed" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> :
    s === "pending" ? <Clock className="h-3.5 w-3.5 text-amber-400" /> :
    <XCircle className="h-3.5 w-3.5 text-zinc-500" />;

  return (
    <AdminShell title="Newsletter" breadcrumbs={[{ label: "Admin", to: "/mnv" }, { label: "Newsletter" }]}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Gesamt" value={subs.length} />
          <StatCard label="Bestätigt" value={data?.confirmed ?? 0} accent="emerald" />
          <StatCard label="Ausstehend" value={counts.pending ?? 0} accent="amber" />
          <StatCard label="Abgemeldet" value={counts.unsubscribed ?? 0} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {(["all", "pending", "confirmed", "unsubscribed"] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={
                "px-3 py-1.5 text-xs rounded border transition " +
                (filter === s
                  ? "bg-zinc-100 text-zinc-950 border-zinc-100"
                  : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700")
              }
            >
              {s === "all" ? "Alle" : s === "pending" ? "Ausstehend" : s === "confirmed" ? "Bestätigt" : "Abgemeldet"}
            </button>
          ))}
          <div className="relative ml-auto">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="search"
              placeholder="E-Mail suchen…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border border-zinc-900 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">E-Mail</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Quelle</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Anmeldung</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Bestätigt</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Abgemeldet</th>
                <th className="text-right px-4 py-3 font-medium">Aktion</th>
              </tr>

            </thead>
            <tbody className="divide-y divide-zinc-900">
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Wird geladen…</td></tr>
              )}
              {!isLoading && subs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Keine Abonnenten gefunden.</td></tr>
              )}

              {subs.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
                      {statusIcon(s.status)} {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-100">
                    <a href={`mailto:${s.email}`} className="hover:text-[#FF6A1A] inline-flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-zinc-500" /> {s.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-zinc-400 text-xs">{s.source}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-zinc-400 text-xs">
                    {new Date(s.subscribed_at).toLocaleString("de-DE")}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-zinc-400 text-xs">
                    {s.confirmed_at ? new Date(s.confirmed_at).toLocaleString("de-DE") : "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-zinc-400 text-xs">
                    {s.unsubscribed_at ? new Date(s.unsubscribed_at).toLocaleString("de-DE") : "—"}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Eintrag „${s.email}" wirklich löschen?`)) del.mutate(s.id);
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1"
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-zinc-500">
          Hinweis: Newsletter werden im Double-Opt-In-Verfahren versandt (§ 7 UWG). Nur Einträge mit Status „bestätigt" haben einer Verarbeitung wirksam zugestimmt.
        </p>
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: "emerald" | "amber" }) {
  const color =
    accent === "emerald" ? "text-emerald-400" : accent === "amber" ? "text-amber-400" : "text-zinc-100";
  return (
    <div className="border border-zinc-900 bg-zinc-950 rounded p-4">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
