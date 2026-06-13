import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listMedia, deleteMedia } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Upload, Copy, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mnv/media")({
  component: MediaLibrary,
});

function MediaLibrary() {
  const fetch = useServerFn(listMedia);
  const del = useServerFn(deleteMedia);
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: () => fetch(),
  });

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("article-images").upload(name, file);
        if (error) throw error;
      }
      toast.success(`${files.length} Datei(en) hochgeladen`);
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload-Fehler");
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (name: string) => {
    if (!confirm(`"${name}" wirklich löschen?`)) return;
    try {
      await del({ data: { name } });
      toast.success("Gelöscht");
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    }
  };

  const files = data?.files ?? [];

  return (
    <AdminShell
      title="Medienbibliothek"
      breadcrumbs={[{ label: "Admin", to: "/mnv" }, { label: "Medien" }]}
      actions={
        <label>
          <div className="inline-flex items-center gap-2 h-9 px-3 rounded bg-[#FF6A1A] hover:bg-[#e85d10] text-zinc-950 text-sm font-medium cursor-pointer transition">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Hochladen
          </div>
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files)} />
        </label>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => <Skeleton key={i} className="aspect-square bg-zinc-900" />)}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-800 rounded-lg">
          <ImageIcon className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-400">Noch keine Bilder. Laden Sie das erste hoch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {files.map((f: any) => (
            <div key={f.name} className="group relative aspect-square bg-zinc-900 rounded overflow-hidden border border-zinc-800">
              <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2">
                <div className="text-[10px] text-zinc-300 truncate">{f.name}</div>
                <div className="flex items-center justify-between gap-1">
                  <button
                    onClick={() => { navigator.clipboard.writeText(f.url); toast.success("URL kopiert"); }}
                    className="flex-1 h-7 grid place-items-center rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-100"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onDelete(f.name)}
                    className="flex-1 h-7 grid place-items-center rounded bg-zinc-800/80 hover:bg-rose-700 text-zinc-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
