import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { FileUp, FileText, X, Image as ImageIcon, Loader2, Plus, Star } from "lucide-react";
import { articleImageUrl } from "@/lib/article-image-url";

export type ImportedBike = Record<string, any>;

/**
 * Robust YAML-ish frontmatter parser supporting nested objects, arrays of
 * scalars, arrays of objects (block `- key: value` form), block scalars `|`/`>`,
 * inline arrays/objects (JSON-style), and quoted strings.
 */
function parseFrontmatter(text: string): { data: Record<string, any>; body: string } {
  const cleaned = text.replace(/^\uFEFF/, "");
  const m = cleaned.match(/^\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: cleaned };
  const lines = m[1].split(/\r?\n/);
  const data = parseBlock(lines, 0, 0).value as Record<string, any>;
  return { data, body: (m[2] || "").trim() };
}

function indentOf(s: string): number {
  const m = s.match(/^(\s*)/);
  return m ? m[1].length : 0;
}

function parseScalar(raw: string): any {
  const v = raw.trim();
  if (v === "" || v === "~" || v === "null") return null;
  if (/^(true|ja|yes)$/i.test(v)) return true;
  if (/^(false|nein|no)$/i.test(v)) return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if ((v.startsWith("[") && v.endsWith("]")) || (v.startsWith("{") && v.endsWith("}"))) {
    try { return JSON.parse(v); } catch { /* fall through */ }
  }
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

/** Parse a YAML block starting at `start` with the given indent. Returns the parsed value and next line index. */
function parseBlock(lines: string[], start: number, indent: number): { value: any; next: number } {
  // Detect array vs map by first non-empty line at this indent
  let i = start;
  while (i < lines.length && (lines[i].trim() === "" || lines[i].trim().startsWith("#"))) i++;
  if (i >= lines.length) return { value: {}, next: i };
  const firstLine = lines[i];
  if (indentOf(firstLine) < indent) return { value: {}, next: i };
  const isArray = /^\s*-\s/.test(firstLine) || /^\s*-\s*$/.test(firstLine);

  if (isArray) {
    const arr: any[] = [];
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "" || line.trim().startsWith("#")) { i++; continue; }
      const ind = indentOf(line);
      if (ind < indent) break;
      if (ind > indent) break;
      const stripped = line.slice(ind);
      if (!stripped.startsWith("-")) break;
      const after = stripped.slice(1).replace(/^\s/, "");
      i++;
      if (after === "" || after === "|" || after === ">") {
        // nested block follows
        const { value, next } = parseBlock(lines, i, indent + 2);
        arr.push(value);
        i = next;
      } else if (/^[A-Za-z0-9_\-]+\s*:/.test(after)) {
        // object item: first key inline, rest indented
        const obj: Record<string, any> = {};
        const colon = after.indexOf(":");
        const k = after.slice(0, colon).trim();
        const rest = after.slice(colon + 1).trim();
        if (rest) obj[k] = parseScalar(rest);
        else {
          const { value, next } = parseBlock(lines, i, indent + 2);
          obj[k] = value;
          i = next;
        }
        // continue collecting properties that belong to this item (indent === indent+2)
        while (i < lines.length) {
          const l2 = lines[i];
          if (l2.trim() === "") { i++; continue; }
          const ind2 = indentOf(l2);
          if (ind2 !== indent + 2) break;
          const body = l2.slice(ind2);
          const c2 = body.indexOf(":");
          if (c2 === -1) break;
          const k2 = body.slice(0, c2).trim();
          const r2 = body.slice(c2 + 1).trim();
          i++;
          if (r2) obj[k2] = parseScalar(r2);
          else {
            const { value, next } = parseBlock(lines, i, indent + 4);
            obj[k2] = value;
            i = next;
          }
        }
        arr.push(obj);
      } else {
        arr.push(parseScalar(after));
      }
    }
    return { value: arr, next: i };
  }

  // Map
  const obj: Record<string, any> = {};
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) { i++; continue; }
    const ind = indentOf(line);
    if (ind < indent) break;
    if (ind > indent) { i++; continue; }
    const body = line.slice(ind);
    const c = body.indexOf(":");
    if (c === -1) { i++; continue; }
    const key = body.slice(0, c).trim();
    const rest = body.slice(c + 1).trim();
    i++;
    if (rest === "|" || rest === ">") {
      const buf: string[] = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === "") { buf.push(""); i++; continue; }
        if (indentOf(l) <= indent) break;
        buf.push(l.slice(indent + 2));
        i++;
      }
      obj[key] = rest === ">" ? buf.join(" ").trim() : buf.join("\n").replace(/\n+$/, "");
    } else if (rest === "") {
      const { value, next } = parseBlock(lines, i, indent + 2);
      obj[key] = value;
      i = next;
    } else {
      obj[key] = parseScalar(rest);
    }
  }
  return { value: obj, next: i };
}

const KEY_ALIASES: Record<string, string> = {
  marke: "brand",
  modell: "model",
  jahr: "year",
  modelljahr: "year",
  kategorie: "category",
  typ: "bike_type",
  preis: "price_eur",
  preis_eur: "price_eur",
  bild: "image_url",
  bild_url: "image_url",
  titelbild: "image_url",
  hersteller_url: "manufacturer_url",
  herstellerseite: "manufacturer_url",
  kurzbeschreibung: "excerpt",
  beschreibung: "description",
  staerken: "pros",
  schwaechen: "cons",
  einsatz: "intended_use",
  untergrund: "terrain",
  galerie: "gallery",
  bewertung: "ratings",
  eignung: "suitability",
  zubehoer: "accessories",
  auszeichnungen: "awards",
  wartung: "maintenance",
  kosten: "costs",
  umwelt: "environmental",
  sicherheit: "safety_features",
  geometrie: "geometry",
  reichweite: "range_matrix",
  reichweite_matrix: "range_matrix",
  historie: "model_history",
  ebike_system: "ebike_detail",
};

function remapKeys(input: any): any {
  if (Array.isArray(input)) return input.map(remapKeys);
  if (input && typeof input === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      const lower = k.toLowerCase().replace(/[\s-]+/g, "_");
      const mapped = KEY_ALIASES[lower] ?? lower;
      out[mapped] = remapKeys(v);
    }
    return out;
  }
  return input;
}

function normalizeCategory(v: any): "bike" | "ebike" | undefined {
  if (!v) return undefined;
  const s = String(v).toLowerCase();
  if (["ebike", "e-bike", "elektro", "elektrisch", "pedelec"].includes(s)) return "ebike";
  if (["bike", "fahrrad", "rad", "bicycle"].includes(s)) return "bike";
  return undefined;
}

function normalize(raw: Record<string, any>, body?: string): ImportedBike {
  const r = remapKeys(raw);
  // highlights from top-level pros/cons
  if ((r.pros || r.cons) && !r.highlights) {
    r.highlights = { pros: r.pros ?? [], cons: r.cons ?? [] };
    delete r.pros; delete r.cons;
  }
  if (r.category) r.category = normalizeCategory(r.category) ?? r.category;
  if (body && !r.description) r.description = body.trim();
  return r;
}

async function parseFile(file: File): Promise<ImportedBike> {
  const text = await file.text();
  const name = file.name.toLowerCase();
  if (name.endsWith(".json")) {
    try { return normalize(JSON.parse(text)); }
    catch { throw new Error("Невалиден JSON файл"); }
  }
  if (name.endsWith(".md") || name.endsWith(".markdown") || name.endsWith(".txt") || name.endsWith(".yaml") || name.endsWith(".yml")) {
    const { data, body } = parseFrontmatter(text);
    return normalize(data, body);
  }
  throw new Error("Поддържат се .md, .json, .yaml, .txt");
}

const REQUIRED = ["brand", "model"];
const RECOMMENDED = ["category", "bike_type", "year", "price_eur", "excerpt", "description", "specs", "highlights"];

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
  const [filled, setFilled] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const mainImgRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const data = await parseFile(file);
      const missingReq = REQUIRED.filter((k) => !data[k]);
      if (missingReq.length) throw new Error(`Липсват задължителни полета: ${missingReq.join(", ")}`);
      onImport(data);
      const got = Object.keys(data).filter((k) => {
        const v = data[k];
        if (v == null || v === "") return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "object") return Object.keys(v).length > 0;
        return true;
      });
      setImported(file.name);
      setFilled(got);
      setMissing(RECOMMENDED.filter((k) => !data[k]));
      toast.success(`Импортирани ${got.length} полета`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Грешка при импортиране");
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
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

  const mainPreview = mainImage ? (articleImageUrl(mainImage) || mainImage) : "";
  const showImages = !!(onUploadMain || onUploadGallery);

  return (
    <div className="bg-gradient-to-br from-[#FF6A1A]/10 to-zinc-900/40 border border-[#FF6A1A]/30 rounded-lg p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-100">1. Импортирай велосипед от файл</div>
          <div className="text-xs text-zinc-400">Markdown (.md), YAML или JSON — попълва всички полета на редактора</div>
        </div>
        {imported && (
          <button type="button" onClick={() => { setImported(null); setFilled([]); setMissing([]); }} className="text-zinc-500 hover:text-zinc-200 text-xs flex items-center gap-1">
            <X className="h-3 w-3" /> изчисти
          </button>
        )}
      </div>

      {imported ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3 bg-zinc-950/60 border border-emerald-500/30 rounded-md px-4 py-3">
            <FileText className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-zinc-100 truncate">{imported}</div>
              <div className="text-[11px] text-emerald-400">Попълнени: {filled.join(" · ")}</div>
            </div>
          </div>
          {missing.length > 0 && (
            <div className="text-[11px] text-amber-400">Препоръчително липсват: {missing.join(", ")}.</div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-md border-2 border-dashed px-6 py-8 text-center transition ${
            dragOver ? "border-[#FF6A1A] bg-[#FF6A1A]/5" : "border-zinc-700 hover:border-zinc-600 bg-zinc-950/40"
          }`}
        >
          <FileUp className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
          <div className="text-sm text-zinc-200">Пусни файл тук или кликни за избор</div>
          <div className="text-[11px] text-zinc-500 mt-1">.md · .yaml · .json</div>
          <input
            ref={inputRef}
            type="file"
            accept=".md,.markdown,.txt,.json,.yaml,.yml"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
        </div>
      )}

      {showImages && (
        <div className="space-y-3 pt-1">
          <div>
            <div className="text-sm font-semibold text-zinc-100">2. Качи снимки</div>
            <div className="text-xs text-zinc-400">Главна снимка + галерия. Поддържа drag &amp; drop, няколко файла наведнъж.</div>
          </div>

          <div className="grid md:grid-cols-[200px_1fr] gap-3">
            {/* Main image */}
            <div
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => handleImageDrop(e, "main")}
              onClick={() => mainImgRef.current?.click()}
              className="relative aspect-[4/3] bg-zinc-950 border-2 border-dashed border-zinc-700 hover:border-[#FF6A1A] rounded-md overflow-hidden cursor-pointer transition group"
            >
              {mainPreview ? (
                <>
                  <img src={mainPreview} alt="Hauptbild" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition grid place-items-center text-white text-xs opacity-0 group-hover:opacity-100">
                    Смени главна
                  </div>
                  <div className="absolute top-1 left-1 bg-[#FF6A1A] text-zinc-950 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Star className="h-2.5 w-2.5" /> Главна
                  </div>
                </>
              ) : (
                <div className="h-full grid place-items-center text-zinc-500 p-3 text-center">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                    <ImageIcon className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs">Главна снимка</div>
                    <div className="text-[10px] text-zinc-600">пусни или кликни</div>
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

            {/* Gallery */}
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
                        <button type="button" onClick={() => onPromoteToMain(g)} title="Направи главна"
                          className="bg-[#FF6A1A] text-zinc-950 p-1 rounded">
                          <Star className="h-3 w-3" />
                        </button>
                      )}
                      {onRemoveGalleryImage && (
                        <button type="button" onClick={() => onRemoveGalleryImage(i)} title="Премахни"
                          className="bg-rose-600 text-white p-1 rounded ml-auto">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="aspect-square border border-dashed border-zinc-700 hover:border-[#FF6A1A] rounded grid place-items-center text-zinc-500 hover:text-[#FF6A1A] transition"
              >
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
          <div className="text-[11px] text-zinc-500">Съвет: пусни няколко снимки наведнъж в галерията. Натисни ⭐ върху снимка от галерията, за да я направиш главна.</div>
        </div>
      )}
    </div>
  );
}
