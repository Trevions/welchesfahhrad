import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listArticleReports,
  updateArticleReportStatus,
  deleteArticleReport,
  replyToArticleReport,
  listArticleReportMessages,
} from "@/lib/article-reports.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Flag,
  Mail,
  Archive,
  Trash2,
  CheckCheck,
  Search as SearchIcon,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/_authenticated/mnv/reports")({
  component: ReportsPage,
});

type Report = {
  id: string;
  article_slug: string;
  article_title: string | null;
  reporter_name: string;
  reporter_email: string;
  reason: string | null;
  description: string;
  status: "new" | "read" | "resolved" | "archived";
  created_at: string;
  updated_at: string;
  thread_token?: string;
  deleted_at?: string | null;
};

type ThreadMessage = {
  id: string;
  direction: "inbound" | "outbound" | "auto_reply";
  from_email: string;
  to_email: string;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  created_at: string;
  meta?: Record<string, unknown>;
};

function ReportsPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listArticleReports);
  const setStatus = useServerFn(updateArticleReportStatus);
  const removeRep = useServerFn(deleteArticleReport);
  const sendReply = useServerFn(replyToArticleReport);

  const [filter, setFilter] = useState<"all" | "new" | "read" | "resolved" | "archived">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replyResolve, setReplyResolve] = useState(true);


  const { data, isLoading } = useQuery({
    queryKey: ["article-reports", filter, search],
    queryFn: () =>
      fetchList({
        data: {
          status: filter === "all" ? undefined : filter,
          search: search || undefined,
        },
      }),
    refetchInterval: 30_000,
  });

  const reports: Report[] = (data?.reports ?? []) as Report[];
  const selected = useMemo(
    () => reports.find((m) => m.id === selectedId) ?? null,
    [reports, selectedId],
  );

  const statusMut = useMutation({
    mutationFn: (vars: { id: string; status: Report["status"] }) =>
      setStatus({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["article-reports"] });
      qc.invalidateQueries({ queryKey: ["reports-unread"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => removeRep({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["article-reports"] });
      qc.invalidateQueries({ queryKey: ["reports-unread"] });
      setSelectedId(null);
      toast.success("Meldung gelöscht");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const replyMut = useMutation({
    mutationFn: (vars: { id: string; subject: string; message: string; markResolved: boolean }) =>
      sendReply({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["article-reports"] });
      qc.invalidateQueries({ queryKey: ["reports-unread"] });
      setReplyOpen(false);
      setReplyMessage("");
      toast.success("Antwort gesendet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openReply = () => {
    if (!selected) return;
    setReplySubject(`Re: Deine Meldung zu „${selected.article_title ?? selected.article_slug}"`);
    setReplyMessage(
      `vielen Dank für deine Rückmeldung zu unserem Artikel. Wir haben deinen Hinweis geprüft und möchten dir Folgendes mitteilen:\n\n\n\nFalls du weitere Fragen hast, antworte einfach direkt auf diese E-Mail.`,
    );
    setReplyResolve(true);
    setReplyOpen(true);
  };

  const openReport = (m: Report) => {
    setSelectedId(m.id);
    if (m.status === "new") {
      statusMut.mutate({ id: m.id, status: "read" });
    }
  };

  const counts = {
    all: reports.length,
    new: reports.filter((m) => m.status === "new").length,
  };

  return (
    <AdminShell
      title="Artikel-Meldungen"
      breadcrumbs={[{ label: "Admin", to: "/mnv" }, { label: "Meldungen" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 min-h-[70vh]">
        <div
          className={cn(
            "bg-zinc-900/40 border border-zinc-800 rounded-lg flex flex-col",
            selected && "hidden lg:flex",
          )}
        >
          <div className="p-3 border-b border-zinc-800 space-y-2">
            <div className="relative">
              <SearchIcon className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Suchen…"
                className="w-full bg-zinc-950 border border-zinc-800 rounded pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {(["all", "new", "read", "resolved", "archived"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex-1 min-w-[60px] text-[10px] uppercase tracking-wider px-2 py-1.5 rounded transition",
                    filter === f
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  {f === "all"
                    ? "Alle"
                    : f === "new"
                    ? "Neu"
                    : f === "read"
                    ? "Gelesen"
                    : f === "resolved"
                    ? "Erledigt"
                    : "Archiv"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <Skeleton className="h-3 w-1/2 bg-zinc-800" />
                  <Skeleton className="h-3 w-3/4 bg-zinc-800" />
                </div>
              ))
            ) : reports.length === 0 ? (
              <div className="p-10 text-center text-xs text-zinc-500">
                <Flag className="h-6 w-6 mx-auto mb-2 text-zinc-700" />
                Keine Meldungen
              </div>
            ) : (
              reports.map((m) => {
                const isNew = m.status === "new";
                const isActive = m.id === selectedId;
                return (
                  <button
                    key={m.id}
                    onClick={() => openReport(m)}
                    className={cn(
                      "w-full text-left p-3.5 hover:bg-zinc-900/60 transition block",
                      isActive && "bg-zinc-900",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isNew && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A1A]" />
                      )}
                      <span
                        className={cn(
                          "text-xs truncate flex-1",
                          isNew ? "text-zinc-50 font-medium" : "text-zinc-400",
                        )}
                      >
                        {m.reporter_name}
                      </span>
                      <span className="text-[10px] text-zinc-600 tabular-nums shrink-0">
                        {new Date(m.created_at).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "text-xs truncate mb-0.5",
                        isNew ? "text-zinc-200" : "text-zinc-500",
                      )}
                    >
                      {m.article_title || m.article_slug}
                    </div>
                    <div className="flex items-center gap-2">
                      {m.reason && (
                        <Badge
                          variant="outline"
                          className="border-zinc-800 bg-zinc-950 text-zinc-500 text-[9px] uppercase tracking-wider px-1.5 py-0"
                        >
                          {m.reason}
                        </Badge>
                      )}
                      <span className="text-[10px] text-zinc-600 truncate">
                        {m.description.slice(0, 60)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-500 flex justify-between">
            <span>{counts.all} gesamt</span>
            <span className="text-[#FF6A1A]">{counts.new} neu</span>
          </div>
        </div>

        <div
          className={cn(
            "bg-zinc-900/40 border border-zinc-800 rounded-lg flex flex-col",
            !selected && "hidden lg:flex",
          )}
        >
          {!selected ? (
            <div className="flex-1 grid place-items-center text-center p-10">
              <div>
                <Flag className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
                <p className="text-sm text-zinc-400">Wähle eine Meldung aus</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-5 border-b border-zinc-800">
                <button
                  onClick={() => setSelectedId(null)}
                  className="lg:hidden text-xs text-zinc-400 mb-3 flex items-center gap-1 hover:text-zinc-100"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Zurück
                </button>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {selected.reason && (
                      <Badge
                        variant="outline"
                        className="border-zinc-800 bg-zinc-950 text-zinc-400 text-[10px] uppercase tracking-wider mb-2"
                      >
                        {selected.reason}
                      </Badge>
                    )}
                    <h2 className="text-lg font-semibold text-zinc-50 leading-snug break-words">
                      {selected.article_title || selected.article_slug}
                    </h2>
                    <Link
                      to="/artikel/$slug"
                      params={{ slug: selected.article_slug }}
                      target="_blank"
                      className="inline-flex items-center gap-1 mt-1 text-[11px] text-[#FF6A1A] hover:underline"
                    >
                      Artikel öffnen <ExternalLink className="h-3 w-3" />
                    </Link>
                    <div className="mt-3 text-xs text-zinc-400">
                      <span className="text-zinc-200">{selected.reporter_name}</span>{" "}
                      <span className="text-zinc-600">·</span>{" "}
                      <a
                        href={`mailto:${selected.reporter_email}?subject=${encodeURIComponent("Re: Deine Meldung zu " + (selected.article_title ?? selected.article_slug))}`}
                        className="text-[#FF6A1A] hover:underline"
                      >
                        {selected.reporter_email}
                      </a>
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-500 tabular-nums">
                      {new Date(selected.created_at).toLocaleString("de-DE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40"
                      onClick={() =>
                        statusMut.mutate({ id: selected.id, status: "resolved" })
                      }
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                      Erledigt
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      onClick={() =>
                        statusMut.mutate({
                          id: selected.id,
                          status: selected.status === "archived" ? "read" : "archived",
                        })
                      }
                    >
                      <Archive className="h-3.5 w-3.5 mr-1.5" />
                      {selected.status === "archived" ? "Wiederherstellen" : "Archivieren"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40"
                      onClick={() => {
                        if (confirm("Meldung wirklich löschen?")) {
                          deleteMut.mutate(selected.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-200 leading-relaxed">
                  {selected.description}
                </pre>
              </div>

              <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                  Status:{" "}
                  {selected.status === "new"
                    ? "Neu"
                    : selected.status === "read"
                    ? "Gelesen"
                    : selected.status === "resolved"
                    ? "Erledigt"
                    : "Archiviert"}
                </div>
                <button
                  onClick={openReply}
                  className="inline-flex items-center gap-2 bg-[#FF6A1A] hover:bg-[#e85d10] text-zinc-950 text-xs font-medium px-4 py-2 rounded transition"
                >
                  <Mail className="h-3.5 w-3.5" /> Antworten
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Antwort senden</DialogTitle>
            <DialogDescription>
              {selected && (
                <>
                  An <span className="text-foreground font-medium">{selected.reporter_name}</span>{" "}
                  &lt;{selected.reporter_email}&gt; · Absender:{" "}
                  <span className="text-foreground">hallo@radmap.de</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rep-subject">Betreff</Label>
              <Input
                id="rep-subject"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rep-message">Nachricht</Label>
              <Textarea
                id="rep-message"
                rows={12}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                maxLength={10000}
                placeholder="Hallo…"
                className="font-sans leading-relaxed"
              />
              <div className="text-[11px] text-muted-foreground text-right tabular-nums">
                {replyMessage.length}/10000
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={replyResolve}
                onCheckedChange={(v) => setReplyResolve(v === true)}
              />
              Meldung nach dem Senden als <span className="text-foreground font-medium">Erledigt</span> markieren
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => setReplyOpen(false)}
              disabled={replyMut.isPending}
            >
              Abbrechen
            </Button>
            <Button
              onClick={() =>
                selected &&
                replyMut.mutate({
                  id: selected.id,
                  subject: replySubject,
                  message: replyMessage,
                  markResolved: replyResolve,
                })
              }
              disabled={
                replyMut.isPending ||
                replySubject.trim().length < 3 ||
                replyMessage.trim().length < 5
              }
              className="bg-[#FF6A1A] hover:bg-[#e85d10] text-zinc-950"
            >
              {replyMut.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird gesendet…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Antwort senden
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

