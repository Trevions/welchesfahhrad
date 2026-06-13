import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listArticles, deleteArticle } from "@/lib/admin.functions";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Edit3, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mnv/articles")({
  component: ArticlesList,
});

function ArticlesList() {
  const fetch = useServerFn(listArticles);
  const del = useServerFn(deleteArticle);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-articles", search, category, status],
    queryFn: () =>
      fetch({
        data: {
          search: search || undefined,
          category: category === "all" ? undefined : (category as any),
          status: status === "all" ? undefined : (status as any),
        },
      }),
  });

  const onDelete = async (id: string) => {
    try {
      await del({ data: { id } });
      toast.success("Artikel gelöscht");
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    }
  };

  const rows = data?.articles ?? [];

  return (
    <AdminShell
      title="Artikel"
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Artikel" }]}
      actions={
        <Link to="/admin/articles/new">
          <Button size="sm" className="bg-[#FF6A1A] hover:bg-[#e85d10] text-zinc-950 font-medium">
            <Plus className="h-4 w-4 mr-1.5" /> Neuer Artikel
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
              placeholder="Nach Titel suchen…"
              className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48 bg-zinc-950 border-zinc-800 text-zinc-100"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              <SelectItem value="Nachrichten">Nachrichten</SelectItem>
              <SelectItem value="Ratgeber">Ratgeber</SelectItem>
              <SelectItem value="E-Bikes">E-Bikes</SelectItem>
              <SelectItem value="Tests">Tests</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-40 bg-zinc-950 border-zinc-800 text-zinc-100"><SelectValue /></SelectTrigger>
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
                <th className="font-medium px-4 py-3 w-16"></th>
                <th className="font-medium px-4 py-3">Titel</th>
                <th className="font-medium px-4 py-3 hidden md:table-cell">Kategorie</th>
                <th className="font-medium px-4 py-3 hidden md:table-cell">Status</th>
                <th className="font-medium px-4 py-3 hidden lg:table-cell">Aufrufe</th>
                <th className="font-medium px-4 py-3 hidden lg:table-cell">Aktualisiert</th>
                <th className="font-medium px-4 py-3 w-32 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-zinc-900">
                      <td className="px-4 py-3" colSpan={7}><Skeleton className="h-10 w-full bg-zinc-900" /></td>
                    </tr>
                  ))
                : rows.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-zinc-500">
                      Keine Artikel gefunden.{" "}
                      <Link to="/admin/articles/new" className="text-[#FF6A1A] hover:underline">
                        Ersten Artikel erstellen →
                      </Link>
                    </td>
                  </tr>
                )
                : rows.map((a: any) => (
                  <tr
                    key={a.id}
                    className="border-b border-zinc-900 hover:bg-zinc-900/40 transition group cursor-pointer"
                    onClick={() => navigate({ to: "/admin/articles/$id", params: { id: a.id } })}
                  >
                    <td className="px-4 py-3">
                      <div className="h-10 w-14 bg-zinc-900 rounded overflow-hidden">
                        {a.cover_image && (
                          <img src={a.cover_image} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-0">
                      <div className="font-medium text-zinc-100 truncate max-w-md">{a.title}</div>
                      <div className="text-xs text-zinc-500 truncate">/{a.slug}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-zinc-400">{a.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={
                          a.status === "published"
                            ? "border-emerald-900 bg-emerald-950/40 text-emerald-400 text-[10px]"
                            : "border-amber-900 bg-amber-950/40 text-amber-400 text-[10px]"
                        }
                      >
                        {a.status === "published" ? "Live" : "Entwurf"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-zinc-400 tabular-nums">{a.view_count ?? 0}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-zinc-500 text-xs">
                      {new Date(a.updated_at).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                        {a.status === "published" && (
                          <a
                            href={`/artikel/${a.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-8 w-8 grid place-items-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <Link
                          to="/admin/articles/$id"
                          params={{ id: a.id }}
                          className="h-8 w-8 grid place-items-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="h-8 w-8 grid place-items-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Artikel löschen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{a.title}" wird endgültig gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(a.id)} className="bg-rose-600 hover:bg-rose-700">
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
