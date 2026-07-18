import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listLexikonTermsAdmin } from "@/lib/lexikon-admin.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit3, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mnv/lexikon")({
  component: LexikonList,
});

function LexikonList() {
  const fetch = useServerFn(listLexikonTermsAdmin);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-lexikon", search, status],
    queryFn: () =>
      fetch({
        data: {
          search: search || undefined,
          status: status === "all" ? undefined : (status as any),
        },
      }),
  });

  const rows = data?.terms ?? [];

  return (
    <AdminShell
      title="Lexikon"
      breadcrumbs={[{ label: "Admin", to: "/mnv" }, { label: "Lexikon" }]}
      actions={
        <Link to="/mnv/lexikon/new">
          <Button
            size="sm"
            className="bg-[#FF6A1A] hover:bg-[#e85d10] text-zinc-950 font-medium"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Neuer Begriff
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nach Begriff suchen…"
              className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-40 bg-zinc-950 border-zinc-800 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="published">Veröffentlicht</SelectItem>
              <SelectItem value="draft">Entwurf</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                <th className="font-medium px-4 py-3">Begriff</th>
                <th className="font-medium px-4 py-3 hidden md:table-cell">Kategorie</th>
                <th className="font-medium px-4 py-3 hidden md:table-cell">Status</th>
                <th className="font-medium px-4 py-3 hidden lg:table-cell">Synonyme</th>
                <th className="font-medium px-4 py-3 hidden lg:table-cell">Aktualisiert</th>
                <th className="font-medium px-4 py-3 w-24 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-900">
                    <td className="px-4 py-3" colSpan={6}>
                      <Skeleton className="h-8 w-full bg-zinc-900" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-sm text-zinc-500"
                  >
                    Keine Begriffe gefunden.{" "}
                    <Link
                      to="/mnv/lexikon/new"
                      className="text-[#FF6A1A] hover:underline"
                    >
                      Ersten Begriff erstellen →
                    </Link>
                  </td>
                </tr>
              ) : (
                rows.map((t: any) => (
                  <tr
                    key={t.id}
                    className="border-b border-zinc-900 hover:bg-zinc-900/40 transition group cursor-pointer"
                    onClick={() =>
                      navigate({ to: "/mnv/lexikon/$id", params: { id: t.id } })
                    }
                  >
                    <td className="px-4 py-3 min-w-0">
                      <div className="font-medium text-zinc-100 truncate max-w-md">
                        {t.term}
                      </div>
                      <div className="text-xs text-zinc-500 font-mono truncate">
                        /lexikon/{t.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-zinc-400">{t.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={
                          t.status === "published"
                            ? "border-emerald-900 bg-emerald-950/40 text-emerald-400 text-[10px]"
                            : "border-amber-900 bg-amber-950/40 text-amber-400 text-[10px]"
                        }
                      >
                        {t.status === "published" ? "Live" : "Entwurf"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-zinc-500 text-xs">
                      {(t.synonyms ?? []).slice(0, 3).join(", ")}
                      {(t.synonyms ?? []).length > 3 && "…"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-zinc-500 text-xs">
                      {new Date(t.updated_at).toLocaleDateString("de-DE")}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                        {t.status === "published" && (
                          <a
                            href={`/lexikon/${t.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-8 w-8 grid place-items-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <Link
                          to="/mnv/lexikon/$id"
                          params={{ id: t.id }}
                          className="h-8 w-8 grid place-items-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Link>
                      </div>
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
