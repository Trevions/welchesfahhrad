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

function parseScalar(raw: string): string | number | boolean | string[] {
  const v = raw.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^\[.*\]$/.test(v)) {
    return v
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return v.replace(/^["']|["']$/g, "");
}

function parseFrontmatter(text: string): { data: Record<string, unknown>; body: string } {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data: Record<string, unknown> = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1);
    data[key] = parseScalar(val);
  }
  return { data, body: m[2].trim() };
}

function normalize(raw: Record<string, unknown>, body?: string): ImportedArticle {
  const out: ImportedArticle = {};
  const get = (k: string) => (raw[k] !== undefined && raw[k] !== null ? String(raw[k]) : undefined);

  if (get("title")) out.title = get("title");
  if (get("slug")) out.slug = get("slug");
  if (get("excerpt") ?? get("description")) out.excerpt = get("excerpt") ?? get("description");
  const cat = get("category");
  if (cat && (ALLOWED_CATEGORIES as readonly string[]).includes(cat)) {
    out.category = cat as ImportedArticle["category"];
  }
  if (get("source")) out.source = get("source");
  const status = get("status");
  if (status === "draft" || status === "published") out.status = status;
  if (get("read_time") ?? get("readTime")) out.read_time = get("read_time") ?? get("readTime");
  if (get("seo_title") ?? get("seoTitle")) out.seo_title = get("seo_title") ?? get("seoTitle");
  if (get("seo_description") ?? get("seoDescription"))
    out.seo_description = get("seo_description") ?? get("seoDescription");
  const kw = raw["seo_keywords"] ?? raw["keywords"] ?? raw["tags"];
  if (Array.isArray(kw)) out.seo_keywords = kw.join(", ");
  else if (kw) out.seo_keywords = String(kw);
  if (get("og_image") ?? get("ogImage")) out.og_image = get("og_image") ?? get("ogImage");
  if (get("cover_image") ?? get("coverImage") ?? get("image"))
    out.cover_image = get("cover_image") ?? get("coverImage") ?? get("image");
  if (get("cover_image_caption") ?? get("caption"))
    out.cover_image_caption = get("cover_image_caption") ?? get("caption");
  if (get("cover_image_credit") ?? get("credit"))
    out.cover_image_credit = get("cover_image_credit") ?? get("credit");
  if (raw["cover_image_is_ai"] === true || raw["ai"] === true) out.cover_image_is_ai = true;

  const bodyValue = body ?? (typeof raw["body"] === "string" ? (raw["body"] as string) : undefined);
  if (bodyValue) out.body = bodyValue;
  return out;
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
  if (name.endsWith(".md") || name.endsWith(".markdown")) {
    const { data, body } = parseFrontmatter(text);
    return normalize(data, body);
  }
  throw new Error("Поддържат се само .md и .json файлове");
}

export function ArticleFileImport({ onImport }: { onImport: (data: ImportedArticle) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [imported, setImported] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const data = await parseFile(file);
      if (!data.title && !data.body) {
        throw new Error("Файлът трябва да съдържа поне title и body");
      }
      onImport(data);
      setImported(file.name);
      toast.success("Файлът е импортиран — провери полетата по-долу");
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
          <div className="text-xs text-zinc-400">Markdown (.md) с frontmatter или JSON (.json) — полетата ще се попълнят автоматично</div>
        </div>
        {imported && (
          <button
            type="button"
            onClick={() => setImported(null)}
            className="text-zinc-500 hover:text-zinc-200 text-xs flex items-center gap-1"
          >
            <X className="h-3 w-3" /> изчисти
          </button>
        )}
      </div>

      {imported ? (
        <div className="flex items-center gap-3 bg-zinc-950/60 border border-emerald-500/30 rounded-md px-4 py-3">
          <FileText className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm text-zinc-100 truncate">{imported}</div>
            <div className="text-[11px] text-emerald-400">Импортиран — добави cover снимка и публикувай</div>
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
          <div className="text-[11px] text-zinc-500 mt-1">.md · .json — максимум 1 файл</div>
          <input
            ref={inputRef}
            type="file"
            accept=".md,.markdown,.json,application/json,text/markdown"
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
        <summary className="cursor-pointer hover:text-zinc-300">Пример за формат</summary>
        <pre className="mt-2 bg-zinc-950 border border-zinc-800 rounded p-3 overflow-x-auto text-zinc-400">{`---
title: Заглавие на статията
excerpt: Кратко описание
category: Nachrichten
tags: [e-bike, test]
seo_title: SEO заглавие
seo_description: SEO мета описание
---

# Първи параграф
Markdown тяло на статията...`}</pre>
      </details>
    </div>
  );
}
