import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from "@/lib/contact.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Inbox,
  Mail,
  Archive,
  Trash2,
  CheckCheck,
  Search as SearchIcon,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/mnv/messages")({
  component: MessagesPage,
});

type Msg = {
  id: string;
  topic: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
  updated_at: string;
};

const TOPIC_LABEL: Record<string, string> = {
  redaktion: "Redaktion",
  presse: "Presse",
  werbung: "Werbung",
  sonstiges: "Sonstiges",
};

function MessagesPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listContactMessages);
  const setStatus = useServerFn(updateContactMessageStatus);
  const removeMsg = useServerFn(deleteContactMessage);

  const [filter, setFilter] = useState<"all" | "new" | "read" | "archived">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["contact-messages", filter, search],
    queryFn: () =>
      fetchList({
        data: {
          status: filter === "all" ? undefined : filter,
          search: search || undefined,
        },
      }),
    refetchInterval: 30_000,
  });

  const messages: Msg[] = (data?.messages ?? []) as Msg[];
  const selected = useMemo(
    () => messages.find((m) => m.id === selectedId) ?? null,
    [messages, selectedId],
  );

  const statusMut = useMutation({
    mutationFn: (vars: { id: string; status: "new" | "read" | "archived" }) =>
      setStatus({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-messages"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => removeMsg({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-messages"] });
      setSelectedId(null);
      toast.success("Nachricht gelöscht");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openMessage = (m: Msg) => {
    setSelectedId(m.id);
    if (m.status === "new") {
      statusMut.mutate({ id: m.id, status: "read" });
    }
  };

  const counts = {
    all: messages.length,
    new: messages.filter((m) => m.status === "new").length,
  };

  return (
    <AdminShell
      title="Nachrichten"
      breadcrumbs={[{ label: "Admin", to: "/mnv" }, { label: "Nachrichten" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 min-h-[70vh]">
        {/* List */}
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
            <div className="flex gap-1">
              {(["all", "new", "read", "archived"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex-1 text-[10px] uppercase tracking-wider px-2 py-1.5 rounded transition",
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
            ) : messages.length === 0 ? (
              <div className="p-10 text-center text-xs text-zinc-500">
                <Inbox className="h-6 w-6 mx-auto mb-2 text-zinc-700" />
                Keine Nachrichten
              </div>
            ) : (
              messages.map((m) => {
                const isNew = m.status === "new";
                const isActive = m.id === selectedId;
                return (
                  <button
                    key={m.id}
                    onClick={() => openMessage(m)}
                    className={cn(
                      "w-full text-left p-3.5 hover:bg-zinc-900/60 transition group block",
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
                        {m.name}
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
                      {m.subject}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-zinc-800 bg-zinc-950 text-zinc-500 text-[9px] uppercase tracking-wider px-1.5 py-0"
                      >
                        {TOPIC_LABEL[m.topic] ?? m.topic}
                      </Badge>
                      <span className="text-[10px] text-zinc-600 truncate">
                        {m.message.slice(0, 60)}
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

        {/* Detail */}
        <div
          className={cn(
            "bg-zinc-900/40 border border-zinc-800 rounded-lg flex flex-col",
            !selected && "hidden lg:flex",
          )}
        >
          {!selected ? (
            <div className="flex-1 grid place-items-center text-center p-10">
              <div>
                <Mail className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
                <p className="text-sm text-zinc-400">Wähle eine Nachricht aus</p>
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
                    <Badge
                      variant="outline"
                      className="border-zinc-800 bg-zinc-950 text-zinc-400 text-[10px] uppercase tracking-wider mb-2"
                    >
                      {TOPIC_LABEL[selected.topic] ?? selected.topic}
                    </Badge>
                    <h2 className="text-lg font-semibold text-zinc-50 leading-snug break-words">
                      {selected.subject}
                    </h2>
                    <div className="mt-2 text-xs text-zinc-400">
                      <span className="text-zinc-200">{selected.name}</span>{" "}
                      <span className="text-zinc-600">·</span>{" "}
                      <a
                        href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + selected.subject)}`}
                        className="text-[#FF6A1A] hover:underline"
                      >
                        {selected.email}
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
                        if (confirm("Nachricht wirklich löschen?")) {
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
                  {selected.message}
                </pre>
              </div>

              <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Status: {selected.status === "new" ? "Neu" : selected.status === "read" ? "Gelesen" : "Archiviert"}
                </div>
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + selected.subject)}`}
                  className="inline-flex items-center gap-2 bg-[#FF6A1A] hover:bg-[#e85d10] text-zinc-950 text-xs font-medium px-4 py-2 rounded transition"
                >
                  <Mail className="h-3.5 w-3.5" /> Antworten
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
