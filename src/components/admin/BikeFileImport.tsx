import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { CheckCircle2, ClipboardList, FileText, FileUp, Image as ImageIcon, Info, Loader2, Plus, Star, X } from "lucide-react";
import { articleImageUrl } from "@/lib/article-image-url";
import { parseBikeFile, type BikeImportReport, type ImportedBike } from "@/lib/bike-import";

export type { ImportedBike } from "@/lib/bike-import";

export function BikeFileImport({
  onImport,
  mainImage,
  gallery,
  uploading,
  onUploadMain,
  onUploadGallery,
  onRemoveGalleryImage,
  onPromoteToMain,
}: {
  onImport: (data: ImportedBike) => void;
  mainImage?: string;
  gallery?: string[];
  uploading?: boolean;
  onUploadMain?: (file: File) => void | Promise<void>;
  onUploadGallery?: (file: File) => void | Promise<void>;
  onRemoveGalleryImage?: (index: number) => void;
  onPromoteToMain?: (url: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [imported, setImported] = useState<string | null>(null);
  const [report, setReport] = useState<BikeImportReport | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mainImgRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const parsed = await parseBikeFile(file);
      onImport(parsed.data);
      setImported(file.name);
      setReport(parsed.report);
      toast.success(`Import bereit: ${parsed.report.score}% Vollständigkeit`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Importieren");
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleImageDrop = (e: DragEvent<HTMLDivElement>, target: "main" | "gallery") => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    if (target === "main" && onUploadMain) {
      onUploadMain(files[0]);
    } else if (target === "gallery" && onUploadGallery) {
      files.forEach((f) => onUploadGallery(f));
    }
  };

  const mainPreview = mainImage ? articleImageUrl(mainImage) || mainImage : "";
  const showImages = !!(onUploadMain || onUploadGallery);
  const scoreTone = !report ? "border-zinc-700 text-zinc-400" : report.score >= 80 ? "border-emerald-500/40 text-emerald-400" : report.score >= 55 ? "border-amber-500/40 text-amber-400" : "border-rose-500/40 text-rose-400";

  return (
    <div className="border border-zinc-800 bg-zinc-900/50 rounded-lg overflow-hidden">
      <div className="border-b border-zinc-800 p-4 md:p-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <FileUp className="h-4 w-4 text-[#FF6A1A]" /> Fahrrad-Daten importieren
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Ein JSON-, YAML- oder Markdown-Frontmatter-Datei füllt genau diesen Fahrrad-Editor. Felder werden normalisiert: Preis, Gewicht, Motor, Akku, SEO, FAQ, Bilder und technische Daten.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowTemplate((v) => !v)}
          className="inline-flex items-center gap-2 self-start border border-zinc-700 px-3 py-2 text-xs text-zinc-200 hover:border-[#FF6A1A] hover:text-[#FF6A1A] transition-colors"
        >
          <ClipboardList className="h-3.5 w-3.5" /> Beispiel anzeigen
        </button>
      </div>

      <div className="p-4 md:p-5 space-y-5">
        {showTemplate && (
          <div className="border border-zinc-800 bg-zinc-950 rounded-md p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Info className="h-3.5 w-3.5 text-[#FF6A1A]" /> Minimaler professioneller JSON-Aufbau
            </div>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-400">
{`{
  "brand": "Cube",
  "model": "Reaction Hybrid Pro 750",
  "year": 2026,
  "category": "E-Bike",
  "bike_type": "Mountainbike",
  "price": "3.499 €",
  "image_url": "https://.../hauptbild.jpg",
  "gallery": ["https://.../detail.jpg"],
  "description": "Ausführliche Beschreibung...",
  "pros": ["Starker Bosch CX Motor", "Großer 750 Wh Akku"],
  "cons": ["Relativ schwer"],
  "specs": { "gewicht": "23,5 kg", "bremsen": "Shimano 4-Kolben", "reifen": "29 x 2.35" },
  "ebike": { "motor": "Bosch Performance CX", "drehmoment": "85 Nm", "akku": "750 Wh", "reichweite_tour": "95 km" },
  "seo": { "meta_title": "...", "meta_description": "..." },
  "faq": [{ "q": "Für wen passt das Rad?", "a": "..." }]
}`}
            </pre>
          </div>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-md border-2 border-dashed px-6 py-8 text-center transition ${
              dragOver ? "border-[#FF6A1A] bg-[#FF6A1A]/5" : "border-zinc-700 hover:border-zinc-600 bg-zinc-950/40"
            }`}
          >
            <FileUp className="h-7 w-7 mx-auto mb-3 text-zinc-400" />
            <div className="text-sm font-medium text-zinc-100">Datei hier ablegen oder auswählen</div>
            <div className="text-[11px] text-zinc-500 mt-1">.json · .yaml · .yml · .md · .txt</div>
            <input
              ref={inputRef}
              type="file"
              accept=".md,.markdown,.txt,.json,.yaml,.yml"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
            />
          </div>

          <div className={`border ${scoreTone} bg-zinc-950/60 rounded-md p-4 min-h-[150px]`}>
            {imported && report ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-100">{imported}</div>
                    <div className="text-xs">{report.score}% Vollständigkeit</div>
                  </div>
                  <button type="button" onClick={() => { setImported(null); setReport(null); }} className="ml-auto text-zinc-500 hover:text-zinc-200">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="h-1.5 bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-current" style={{ width: `${report.score}%` }} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {report.filledSections.map((s) => (
                    <span key={s.key} className="border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-300">
                      {s.label} · {s.count}
                    </span>
                  ))}
                </div>
                {report.missingImportant.length > 0 && (
                  <p className="text-[11px] text-amber-400">Wichtig fehlt noch: {report.missingImportant.join(", ")}.</p>
                )}
                {report.warnings.map((w, i) => <p key={i} className="text-[11px] text-zinc-500">{w}</p>)}
              </div>
            ) : (
              <div className="h-full min-h-[130px] grid place-items-center text-center text-xs text-zinc-500">
                <div>
                  <FileText className="h-5 w-5 mx-auto mb-2" />
                  Nach dem Import siehst du hier Qualität, gefüllte Sektionen und fehlende Pflichtinfos.
                </div>
              </div>
            )}
          </div>
        </div>

        {showImages && (
          <div className="space-y-3 pt-1">
            <div>
              <div className="text-sm font-semibold text-zinc-100">Bilder hochladen</div>
              <div className="text-xs text-zinc-400">Hauptbild + Galerie. Drag & Drop unterstützt mehrere Bilder.</div>
            </div>

            <div className="grid md:grid-cols-[200px_1fr] gap-3">
              <div
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => handleImageDrop(e, "main")}
                onClick={() => mainImgRef.current?.click()}
                className="relative aspect-[4/3] bg-zinc-950 border-2 border-dashed border-zinc-700 hover:border-[#FF6A1A] rounded-md overflow-hidden cursor-pointer transition group"
              >
                {mainPreview ? (
                  <>
                    <img src={mainPreview} alt="Hauptbild" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition grid place-items-center text-white text-xs opacity-0 group-hover:opacity-100">Ersetzen</div>
                    <div className="absolute top-1 left-1 bg-[#FF6A1A] text-zinc-950 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Star className="h-2.5 w-2.5" /> Hauptbild
                    </div>
                  </>
                ) : (
                  <div className="h-full grid place-items-center text-zinc-500 p-3 text-center">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                      <ImageIcon className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs">Hauptbild</div>
                      <div className="text-[10px] text-zinc-600">ablegen oder klicken</div>
                    </>}
                  </div>
                )}
                <input
                  ref={mainImgRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f && onUploadMain) onUploadMain(f); e.currentTarget.value = ""; }}
                />
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => handleImageDrop(e, "gallery")}
                className="grid grid-cols-3 sm:grid-cols-4 gap-2 content-start min-h-[150px] bg-zinc-950/40 border-2 border-dashed border-zinc-800 rounded-md p-2"
              >
                {(gallery ?? []).map((g, i) => {
                  const src = articleImageUrl(g) || g;
                  return (
                    <div key={i} className="relative aspect-square bg-zinc-900 rounded overflow-hidden group">
                      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-1 gap-1">
                        {onPromoteToMain && (
                          <button type="button" onClick={() => onPromoteToMain(g)} title="Als Hauptbild setzen" className="bg-[#FF6A1A] text-zinc-950 p-1 rounded">
                            <Star className="h-3 w-3" />
                          </button>
                        )}
                        {onRemoveGalleryImage && (
                          <button type="button" onClick={() => onRemoveGalleryImage(i)} title="Entfernen" className="bg-rose-600 text-white p-1 rounded ml-auto">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <button type="button" onClick={() => galleryRef.current?.click()} className="aspect-square border border-dashed border-zinc-700 hover:border-[#FF6A1A] rounded grid place-items-center text-zinc-500 hover:text-[#FF6A1A] transition">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </button>
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (onUploadGallery) for (const f of files) onUploadGallery(f);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}