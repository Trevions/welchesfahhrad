import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { FileUp, FileText, X } from "lucide-react";

export type ImportedArticle = Partial<{
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: "Nachrichten" | "Ratgeber" | "E-Bikes" | "Tests";
  source: string;
  status: "draft" | "published";
  read_time: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_image: string;
  cover_image: string;
  cover_image_caption: string;
  cover_image_credit: string;
  cover_image_is_ai: boolean;
}>;

const ALLOWED_CATEGORIES = ["Nachrichten", "Ratgeber", "E-Bikes", "Tests"] as const;

function stripQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function parseScalar(raw: string): string | number | boolean | string[] {
  const v = raw.trim();
  if (v === "") return "";
  if (/^(true|ja|yes|1)$/i.test(v)) return true;
  if (/^(false|nein|no|0)$/i.test(v)) return false;
  if (/^\[.*\]$/.test(v)) {
    return v
      .slice(1, -1)
      .split(",")
      .map((s) => stripQuotes(s))
      .filter(Boolean);
  }
  return stripQuotes(v);
}

/**
 * Robust YAML-ish frontmatter parser supporting:
 *  - simple key: value pairs
 *  - quoted strings
 *  - inline arrays [a, b, c]
 *  - block arrays (next lines starting with "- ")
 *  - block scalars `|` and `>` (multi-line text)
 */
function parseFrontmatter(text: string): { data: Record<string, unknown>; body: string } {
  const normalizedText = text.replace(/^\uFEFF/, "");
  const m = normalizedText.match(/^\s*---\s*\r?\n([\s\S]*?)\r?\n\s*---\s*\r?\n?([\s\S]*)$/);
  if (!m) return { data: parseLooseFields(normalizedText), body: stripLooseFieldHeader(normalizedText) };
  const lines = m[1].split(/\r?\n/);
  const data: Record<string, unknown> = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }
    const idx = line.indexOf(":");
    if (idx === -1) {
      i++;
      continue;
    }
    const key = line.slice(0, idx).trim();
    const rest = line.slice(idx + 1).trim();
    i++;
    // block scalar
    if (rest === "|" || rest === ">") {
      const buf: string[] = [];
      while (i < lines.length && (lines[i].startsWith("  ") || lines[i].startsWith("\t") || lines[i] === "")) {
        buf.push(lines[i].replace(/^\s{0,4}/, ""));
        i++;
      }
      data[key] = rest === ">" ? buf.join(" ").trim() : buf.join("\n").trim();
      continue;
    }
    // block array (no inline value, following "- " lines)
    if (rest === "") {
      const arr: string[] = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        arr.push(stripQuotes(lines[i].replace(/^\s*-\s+/, "")));
        i++;
      }
      if (arr.length) {
        data[key] = arr;
        continue;
      }
      data[key] = "";
      continue;
    }
    data[key] = parseScalar(rest);
  }
  return { data, body: m[2].trim() };
}

function parseLooseFields(text: string): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const lines = text.split(/\r?\n/);
  const known = /^(title|titel|headline|ueberschrift|überschrift|slug|permalink|url|excerpt|description|beschreibung|summary|zusammenfassung|teaser|subtitle|untertitel|category|kategorie|rubrik|source|quelle|publisher|publikation|status|state|read_time|readtime|reading_time|readingtime|lesezeit|lesedauer|seo_title|seo-title|seotitle|seo_titel|seo-titel|meta_title|meta-title|metatitle|meta_titel|seo_description|seo-description|seodescription|meta_description|meta-description|metadescription|meta_beschreibung|meta-beschreibung|keywords|seo_keywords|seo-keywords|tags|schlagwoerter|schlagwörter|og_image|og-image|ogimage|og:image|og_bild|og-bild|og_bild_url|og-bild-url|cover_image|cover-image|coverimage|image|bild|bild_url|bild-url|titelbild|cover|thumbnail|caption|bildunterschrift|bildbeschreibung|credit|bildquelle|photo_credit|photographer|fotograf|ai|ki|ki_bild|ki-bild)$/i;

  for (const line of lines) {
    const match = line.match(/^\s*([^:]{2,60})\s*:\s*(.*?)\s*$/);
    if (!match) continue;
    const key = match[1].trim();
    if (!known.test(key)) continue;
    data[key] = parseScalar(match[2]);
  }

  return data;
}

function stripLooseFieldHeader(text: string): string {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  let lastField = -1;
  const known = /^(title|titel|headline|ueberschrift|überschrift|slug|permalink|url|excerpt|description|beschreibung|summary|zusammenfassung|teaser|category|kategorie|rubrik|source|quelle|read_time|lesezeit|seo_title|seo_titel|meta_title|meta_titel|seo_description|meta_description|meta_beschreibung|keywords|seo_keywords|tags|schlagwoerter|schlagwörter|og_image|og_bild|og_bild_url|cover_image|image|bild|titelbild|caption|credit|bildquelle|ai|ki|ki_bild)$/i;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^\s*([^:]{2,60})\s*:/);
    if (match && known.test(match[1].trim())) lastField = i;
    if (lastField >= 0 && lines[i].trim() === "---") lastField = i;
    if (lastField >= 0 && /^(teaser|excerpt|inhalt|body|content|artikel)$/i.test(lines[i].trim())) {
      return lines.slice(i).join("\n").trim();
    }
  }
  return lastField >= 0 ? lines.slice(lastField + 1).join("\n").trim() : text.trim();
}

function pick(raw: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = raw[k] ?? raw[k.replace(/-/g, "_")] ?? raw[k.replace(/_/g, "-")];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return undefined;
}

function normalizeCategory(value?: string): ImportedArticle["category"] | undefined {
  if (!value) return undefined;
  const cleaned = value.trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (["nachrichten", "news", "neuheiten", "meldung", "meldungen"].includes(cleaned)) return "Nachrichten";
  if (["ratgeber", "guide", "beratung", "tipps", "wissen"].includes(cleaned)) return "Ratgeber";
  if (["e-bikes", "e-bike", "ebikes", "ebike", "elektrische-velos", "elektrische-velosipedi"].includes(cleaned)) return "E-Bikes";
  if (["tests", "test", "review", "reviews", "vergleich"].includes(cleaned)) return "Tests";
  return undefined;
}

function normalize(rawIn: Record<string, unknown>, body?: string): ImportedArticle {
  // case-insensitive key access
  const raw: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rawIn)) raw[k.toLowerCase()] = v;

  const out: ImportedArticle = {};
  const title = pick(raw, "title", "titel", "headline", "ueberschrift", "überschrift", "name");
  if (title) out.title = title;
  const slug = pick(raw, "slug", "permalink", "url");
  if (slug) out.slug = slug;
  const excerpt = pick(raw, "excerpt", "description", "beschreibung", "summary", "zusammenfassung", "teaser", "subtitle", "untertitel");
  if (excerpt) out.excerpt = excerpt;
  const cat = pick(raw, "category", "kategorie", "rubrik");
  const normalizedCategory = normalizeCategory(cat);
  if (normalizedCategory) out.category = normalizedCategory;
  const source = pick(raw, "source", "quelle", "publisher", "publikation");
  if (source) out.source = source;
  const status = pick(raw, "status", "state");
  if (status === "draft" || status === "published") out.status = status;
  const readTime = pick(raw, "read_time", "readtime", "reading_time", "readingtime", "lesezeit", "lesedauer");
  if (readTime) out.read_time = readTime;
  const seoTitle = pick(raw, "seo_title", "seo-title", "seotitle", "seo_titel", "seo-titel", "meta_title", "meta-title", "metatitle", "meta_titel", "meta-titel");
  if (seoTitle) out.seo_title = seoTitle;
  const seoDesc = pick(raw, "seo_description", "seo-description", "seodescription", "meta_description", "meta-description", "metadescription", "meta_beschreibung", "meta-beschreibung", "beschreibung_seo", "meta");
  if (seoDesc) out.seo_description = seoDesc;
  const kw = raw["seo_keywords"] ?? raw["seo-keywords"] ?? raw["seokeywords"] ?? raw["keywords"] ?? raw["tags"] ?? raw["schlagwoerter"] ?? raw["schlagwörter"] ?? raw["tags_de"];
  if (Array.isArray(kw)) out.seo_keywords = kw.join(", ");
  else if (kw) out.seo_keywords = String(kw);
  const og = pick(raw, "og_image", "og-image", "ogimage", "og:image", "og_bild", "og-bild", "og_bild_url", "og-bild-url", "social_image", "social-image");
  if (og) out.og_image = og;
  const cover = pick(raw, "cover_image", "cover-image", "coverimage", "image", "bild", "bild_url", "bild-url", "titelbild", "cover", "thumbnail");
  if (cover) out.cover_image = cover;
  const caption = pick(raw, "cover_image_caption", "caption", "bildunterschrift", "bildbeschreibung");
  if (caption) out.cover_image_caption = caption;
  const credit = pick(raw, "cover_image_credit", "credit", "bildquelle", "photo_credit", "photographer", "fotograf");
  if (credit) out.cover_image_credit = credit;
  if (raw["cover_image_is_ai"] === true || raw["ai"] === true || raw["ki"] === true || raw["ki_bild"] === true) {
    out.cover_image_is_ai = true;
  }

  const bodyValue = body ?? (typeof raw["body"] === "string" ? (raw["body"] as string) : undefined) ?? (typeof raw["content"] === "string" ? (raw["content"] as string) : undefined) ?? (typeof raw["text"] === "string" ? (raw["text"] as string) : undefined) ?? (typeof raw["inhalt"] === "string" ? (raw["inhalt"] as string) : undefined);
  if (bodyValue) out.body = bodyValue;
  return out;
}

/**
 * Detect free-form section markers like TEASER / INHALT / EXCERPT / BODY
 * (case-insensitive, on their own line, optionally surrounded by --- separators)
 * and split the body into { excerpt, body }.
 * Also promotes short non-punctuated lines followed by a blank line into "## heading".
 */
function splitSections(raw: string): { excerpt?: string; body?: string } {
  const lines = raw.split(/\r?\n/);
  const sections: { name: string; from: number }[] = [];
  const isMarker = (l: string) =>
    /^(teaser|excerpt|zusammenfassung|kurzfassung|intro|einleitung|inhalt|body|content|text|artikel)$/i.test(l.trim());
  for (let i = 0; i < lines.length; i++) {
    if (isMarker(lines[i])) sections.push({ name: lines[i].trim().toLowerCase(), from: i + 1 });
  }
  if (sections.length === 0) return { body: raw.trim() || undefined };
  const result: { excerpt?: string; body?: string } = {};
  for (let s = 0; s < sections.length; s++) {
    const start = sections[s].from;
    const end = s + 1 < sections.length ? sections[s + 1].from - 1 : lines.length;
    const chunk = lines.slice(start, end).join("\n")
      .replace(/^\s*---+\s*$/gm, "")
      .trim();
    if (!chunk) continue;
    const name = sections[s].name;
    if (/^(teaser|excerpt|zusammenfassung|kurzfassung|intro|einleitung)$/.test(name)) {
      result.excerpt = (result.excerpt ? result.excerpt + "\n\n" : "") + chunk;
    } else {
      result.body = (result.body ? result.body + "\n\n" : "") + chunk;
    }
  }
  return result;
}

function promoteHeadings(body: string): string {
  const lines = body.split(/\r?\n/);
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const prev = (out[out.length - 1] ?? "").trim();
    const next = (lines[i + 1] ?? "").trim();
    // already a markdown heading or list/quote → keep
    if (/^(#{1,6}\s|[-*+]\s|>\s|\d+\.\s)/.test(trimmed)) {
      out.push(line);
      continue;
    }
    const isHeadingCandidate =
      trimmed.length > 0 &&
      trimmed.length <= 90 &&
      !/[.!?…]$/.test(trimmed) &&
      prev === "" &&
      next === "";
    if (isHeadingCandidate) {
      out.push(`## ${trimmed}`);
    } else {
      out.push(line);
    }
  }
  return out.join("\n");
}

async function parseFile(file: File): Promise<ImportedArticle> {
  const text = await file.text();
  const name = file.name.toLowerCase();
  if (name.endsWith(".json")) {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Невалиден JSON файл");
    }
    return normalize(data);
  }
  if (name.endsWith(".md") || name.endsWith(".markdown") || name.endsWith(".txt")) {
    const { data, body } = parseFrontmatter(text);
    // Fallback: if no frontmatter and first line is "# Title"
    if (Object.keys(data).length === 0) {
      const firstHeading = body.match(/^#\s+(.+)$/m);
      if (firstHeading) data["title"] = firstHeading[1].trim();
    }
    const normalized = normalize(data, body);
    // Detect TEASER / INHALT style sections in the body
    const sections = splitSections(normalized.body ?? body);
    if (sections.excerpt && !normalized.excerpt) normalized.excerpt = sections.excerpt;
    if (sections.body) normalized.body = promoteHeadings(sections.body);
    else if (normalized.body) normalized.body = promoteHeadings(normalized.body);
    return normalized;
  }
  throw new Error("Поддържат се .md, .json и .txt файлове");
}

export function ArticleFileImport({ onImport }: { onImport: (data: ImportedArticle) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [imported, setImported] = useState<string | null>(null);
  const [summary, setSummary] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const data = await parseFile(file);
      if (!data.title && !data.body) {
        throw new Error("Файлът трябва да съдържа поне title и body");
      }
      onImport(data);
      setImported(file.name);
      const filled: string[] = [];
      if (data.title) filled.push("Titel");
      if (data.excerpt) filled.push("Teaser");
      if (data.body) filled.push("Inhalt");
      if (data.category) filled.push("Kategorie");
      if (data.seo_title) filled.push("SEO-Titel");
      if (data.seo_description) filled.push("Meta");
      if (data.seo_keywords) filled.push("Keywords");
      if (data.cover_image) filled.push("Cover");
      if (data.cover_image_caption) filled.push("Bildunterschrift");
      if (data.cover_image_credit) filled.push("Credit");
      if (data.source) filled.push("Quelle");
      if (data.read_time) filled.push("Lesezeit");
      setSummary(filled);
      toast.success(`Импортирани ${filled.length} полета: ${filled.join(", ")}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Грешка при импортиране");
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="bg-gradient-to-br from-[#FF6A1A]/10 to-zinc-900/40 border border-[#FF6A1A]/30 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-zinc-100">Импортирай статия от файл</div>
          <div className="text-xs text-zinc-400">Markdown (.md), TXT или JSON — поддържа DE/EN ключове и блокови YAML списъци</div>
        </div>
        {imported && (
          <button
            type="button"
            onClick={() => { setImported(null); setSummary([]); }}
            className="text-zinc-500 hover:text-zinc-200 text-xs flex items-center gap-1"
          >
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
              <div className="text-[11px] text-emerald-400">
                {summary.length > 0 ? `Попълнени: ${summary.join(" · ")}` : "Импортиран"}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-zinc-500">
            Полета без съответствие във файла остават празни — добави ги ръчно или провери имената на ключовете.
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-md border-2 border-dashed px-6 py-8 text-center transition ${
            dragOver
              ? "border-[#FF6A1A] bg-[#FF6A1A]/5"
              : "border-zinc-700 hover:border-zinc-600 bg-zinc-950/40"
          }`}
        >
          <FileUp className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
          <div className="text-sm text-zinc-200">Пусни файл тук или кликни за избор</div>
          <div className="text-[11px] text-zinc-500 mt-1">.md · .txt · .json — максимум 1 файл</div>
          <input
            ref={inputRef}
            type="file"
            accept=".md,.markdown,.txt,.json,application/json,text/markdown,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>
      )}

      <details className="mt-3 text-[11px] text-zinc-500">
        <summary className="cursor-pointer hover:text-zinc-300">Пример за формат (DE/EN ключове)</summary>
        <pre className="mt-2 bg-zinc-950 border border-zinc-800 rounded p-3 overflow-x-auto text-zinc-400">{`---
title: Заглавие на статията
excerpt: Кратко описание (или: beschreibung, teaser, summary)
category: Nachrichten           # или: kategorie
source: ADFC                    # или: quelle
read_time: 5 Min.               # или: lesezeit
seo_title: SEO заглавие         # или: meta_title
seo_description: Мета описание  # или: meta_description, meta-beschreibung
keywords: [bosch, ebike, 2026]  # или: tags, schlagwoerter
cover_image: https://...        # или: bild, titelbild
caption: Снимка на пътя         # или: bildunterschrift
credit: Foto: ADFC              # или: bildquelle
ai: true                        # или: ki_bild
---

# Първи параграф
Markdown тяло...`}</pre>
      </details>
    </div>
  );
}
