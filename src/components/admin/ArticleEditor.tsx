import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { upsertArticle } from "@/lib/admin.functions";
import { articleImageUrl } from "@/lib/article-image-url";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Bold,
  Italic,
  Heading2,
  List,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  ChevronDown,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { ArticleFileImport, type ImportedArticle } from "./ArticleFileImport";

const ALLOWED_CATEGORIES = ["Nachrichten", "Ratgeber", "E-Bikes", "Tests"] as const;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type FieldError = { field: string; label: string; message: string };

function validateArticle(f: ArticleFormState, publish: boolean): FieldError[] {
  const errs: FieldError[] = [];
  const t = f.title.trim();
  if (!t) errs.push({ field: "title", label: "Titel", message: "Pflichtfeld" });
  else if (t.length < 5) errs.push({ field: "title", label: "Titel", message: "min. 5 Zeichen" });
  else if (t.length > 140) errs.push({ field: "title", label: "Titel", message: "max. 140 Zeichen" });

  const s = f.slug.trim();
  if (!s) errs.push({ field: "slug", label: "Slug", message: "Pflichtfeld" });
  else if (!SLUG_RE.test(s)) errs.push({ field: "slug", label: "Slug", message: "nur a-z, 0-9 und Bindestriche" });
  else if (s.length > 100) errs.push({ field: "slug", label: "Slug", message: "max. 100 Zeichen" });

  if (!(ALLOWED_CATEGORIES as readonly string[]).includes(f.category)) {
    errs.push({ field: "category", label: "Kategorie", message: "ungültig" });
  }

  if (publish) {
    const ex = f.excerpt.trim();
    if (!ex) errs.push({ field: "excerpt", label: "Teaser", message: "Pflichtfeld zum Veröffentlichen" });
    else if (ex.length < 20) errs.push({ field: "excerpt", label: "Teaser", message: "min. 20 Zeichen" });
    else if (ex.length > 320) errs.push({ field: "excerpt", label: "Teaser", message: "max. 320 Zeichen" });

    const body = f.body.trim();
    if (!body) errs.push({ field: "body", label: "Inhalt", message: "Pflichtfeld zum Veröffentlichen" });
    else if (body.length < 100) errs.push({ field: "body", label: "Inhalt", message: "min. 100 Zeichen" });

    if (!f.cover_image.trim()) errs.push({ field: "cover_image", label: "Cover-Bild", message: "Pflicht zum Veröffentlichen" });

    if (f.seo_title && f.seo_title.length > 60) errs.push({ field: "seo_title", label: "SEO-Titel", message: "max. 60 Zeichen" });
    if (f.seo_description && f.seo_description.length > 160) errs.push({ field: "seo_description", label: "Meta-Beschreibung", message: "max. 160 Zeichen" });
    if (f.og_image && !/^https?:\/\//i.test(f.og_image) && !f.og_image.startsWith("article-images/")) {
      errs.push({ field: "og_image", label: "OG-Bild", message: "muss eine URL sein (https://…)" });
    }
  }
  return errs;
}

type ArticleFormState = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string;
  cover_image_caption: string;
  cover_image_credit: string;
  cover_image_is_ai: boolean;
  category: "Nachrichten" | "Ratgeber" | "E-Bikes" | "Tests";
  source: string;
  status: "draft" | "published";
  read_time: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_image: string;
};

const empty: ArticleFormState = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  cover_image: "",
  cover_image_caption: "",
  cover_image_credit: "",
  cover_image_is_ai: false,
  category: "Nachrichten",
  source: "",
  status: "draft",
  read_time: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  og_image: "",
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[äöü]/g, (m) => ({ ä: "ae", ö: "oe", ü: "ue" })[m] ?? m)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

export function ArticleEditor({ initial }: { initial?: Partial<ArticleFormState> & { id?: string } }) {
  const [form, setForm] = useState<ArticleFormState>(() => ({ ...empty, ...(initial ?? {}) }));
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const save = useServerFn(upsertArticle);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const setField = <K extends keyof ArticleFormState>(k: K, v: ArticleFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!slugTouched) setForm((f) => ({ ...f, slug: slugify(f.title) }));
  }, [form.title, slugTouched]);

  const insertMd = (before: string, after = "") => {
    const ta = document.getElementById("body-textarea") as HTMLTextAreaElement | null;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = form.body.slice(s, e);
    const next = form.body.slice(0, s) + before + sel + after + form.body.slice(e);
    setField("body", next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, e + before.length);
    });
  };

  const handleUpload = async (file: File, target: "cover_image" | "og_image" | "inline") => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("article-images").upload(name, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const storedUrl = `article-images/${name}`;
      const displayUrl = articleImageUrl(storedUrl);
      if (target === "inline") {
        insertMd(`\n\n![Bild](${displayUrl})\n\n`);
      } else {
        setField(target, storedUrl);
      }
      toast.success("Bild hochgeladen");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  const publishErrors = useMemo(() => validateArticle(form, true), [form]);
  const draftErrors = useMemo(() => validateArticle(form, false), [form]);

  const onSubmit = async (publish: boolean) => {
    const errs = publish ? publishErrors : draftErrors;
    if (errs.length > 0) {
      toast.error(
        publish
          ? `Veröffentlichen blockiert — ${errs.length} Feld${errs.length === 1 ? "" : "er"} prüfen`
          : `Speichern blockiert — ${errs[0].label}: ${errs[0].message}`,
      );
      const el = document.getElementById(`field-${errs[0].field}`) ?? document.getElementById(errs[0].field);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        id: form.id ?? initial?.id,
        status: publish ? ("published" as const) : form.status,
      };
      const res = await save({ data: payload as any });
      toast.success(publish ? "Veröffentlicht" : "Gespeichert");
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      if (!form.id && !initial?.id) {
        navigate({ to: "/mnv/articles/$id", params: { id: res.id }, replace: true });
      } else {
        setField("status", payload.status);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const previewHtml = useMemo(() => {
    const raw = marked.parse(form.body || "", { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [form.body]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Main */}
      <div className="space-y-5 min-w-0">
        {!initial?.id && (
          <ArticleFileImport
            onImport={(data: ImportedArticle) => {
              setForm((f) => ({ ...f, ...data }));
              if (data.slug) setSlugTouched(true);
            }}
          />
        )}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Schlagzeile, die klickbar ist"
              className="bg-zinc-950 border-zinc-800 text-zinc-100 text-lg font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL-Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">radmap.de/artikel/</span>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => { setSlugTouched(true); setField("slug", e.target.value); }}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Teaser / Excerpt</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => setField("excerpt", e.target.value)}
              placeholder="Kurze Zusammenfassung, die in Listen und Vorschauen erscheint."
              rows={3}
              className="bg-zinc-950 border-zinc-800 text-zinc-100 resize-none"
            />
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between p-3 border-b border-zinc-800 flex-wrap gap-2">
            <div className="flex items-center gap-0.5 text-zinc-400">
              <ToolBtn onClick={() => insertMd("## ", "")} title="Überschrift"><Heading2 className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => insertMd("**", "**")} title="Fett"><Bold className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => insertMd("*", "*")} title="Kursiv"><Italic className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => insertMd("\n- ", "")} title="Liste"><List className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => insertMd("\n> ", "")} title="Zitat"><Quote className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => insertMd("[", "](https://)")} title="Link"><LinkIcon className="h-3.5 w-3.5" /></ToolBtn>
              <label className="h-7 w-7 grid place-items-center rounded hover:bg-zinc-800 cursor-pointer" title="Bild einfügen">
                <ImageIcon className="h-3.5 w-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f, "inline");
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-600">Markdown</span>
          </div>
          <Textarea
            id="body-textarea"
            value={form.body}
            onChange={(e) => setField("body", e.target.value)}
            placeholder="Schreibe den Artikel hier. Markdown wird unterstützt.

## Untertitel

Ein **fetter** Satz oder ein *kursiver*.

> Ein Zitat.

- Punkt eins
- Punkt zwei"
            rows={20}
            className="bg-zinc-950 border-0 rounded-none rounded-b-lg text-zinc-100 font-mono text-sm leading-relaxed resize-y min-h-[400px]"
          />
        </div>

        {form.body.trim() && (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between p-3 border-b border-zinc-800">
              <h3 className="text-xs uppercase tracking-wider text-zinc-500">Vorschau</h3>
            </div>
            <div
              className="prose prose-invert prose-sm max-w-none p-6 prose-headings:font-display prose-headings:font-bold prose-a:text-[#FF6A1A]"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        )}

        <Collapsible className="bg-zinc-900/40 border border-zinc-800 rounded-lg">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-5 group">
            <div className="text-left">
              <div className="text-sm font-semibold text-zinc-200">SEO & Social</div>
              <div className="text-xs text-zinc-500">Meta-Tags und Open-Graph-Bild</div>
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-400 group-data-[state=open]:rotate-180 transition" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-5 pb-5 space-y-4 border-t border-zinc-800 pt-4">
            <div className="space-y-2">
              <Label>SEO-Titel <span className="text-zinc-600 text-[10px]">({form.seo_title.length}/60)</span></Label>
              <Input
                value={form.seo_title}
                onChange={(e) => setField("seo_title", e.target.value)}
                placeholder={form.title || "Standard: Artikeltitel"}
                maxLength={120}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta-Beschreibung <span className="text-zinc-600 text-[10px]">({form.seo_description.length}/160)</span></Label>
              <Textarea
                value={form.seo_description}
                onChange={(e) => setField("seo_description", e.target.value)}
                rows={2}
                maxLength={300}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                value={form.seo_keywords}
                onChange={(e) => setField("seo_keywords", e.target.value)}
                placeholder="fahrrad, e-bike, test"
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label>OG-Bild URL (optional, überschreibt Cover)</Label>
              <Input
                value={form.og_image}
                onChange={(e) => setField("og_image", e.target.value)}
                placeholder="https://…"
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Sidebar */}
      <aside className="space-y-5">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 space-y-4 lg:sticky lg:top-20">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-zinc-500">Status</Label>
            <div className="flex items-center gap-2">
              <span className={form.status === "published" ? "text-emerald-400 text-xs" : "text-amber-400 text-xs"}>
                {form.status === "published" ? "Live" : "Entwurf"}
              </span>
              <Switch
                checked={form.status === "published"}
                onCheckedChange={(c) => setField("status", c ? "published" : "draft")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kategorie</Label>
            <Select value={form.category} onValueChange={(v) => setField("category", v as any)}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Nachrichten">Nachrichten</SelectItem>
                <SelectItem value="Ratgeber">Ratgeber</SelectItem>
                <SelectItem value="E-Bikes">E-Bikes</SelectItem>
                <SelectItem value="Tests">Tests</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cover-Bild</Label>
            <div className="aspect-video bg-zinc-950 border border-zinc-800 rounded overflow-hidden grid place-items-center">
              {form.cover_image ? (
                <img src={articleImageUrl(form.cover_image)} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-zinc-700" />
              )}
            </div>
            <label className="block">
              <div className="cursor-pointer text-xs flex items-center justify-center gap-2 py-2 border border-dashed border-zinc-800 rounded text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition">
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Lädt…" : form.cover_image ? "Ersetzen" : "Hochladen"}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f, "cover_image");
                  e.target.value = "";
                }}
              />
            </label>
            <Input
              value={form.cover_image}
              onChange={(e) => setField("cover_image", e.target.value)}
              placeholder="…oder URL einfügen"
              className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label>Bildunterschrift (optional)</Label>
            <Textarea
              value={form.cover_image_caption}
              onChange={(e) => setField("cover_image_caption", e.target.value)}
              placeholder="z.B. Ein Pedelec auf dem Radweg in Berlin-Mitte."
              rows={2}
              className="bg-zinc-950 border-zinc-800 text-zinc-100 resize-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Bildquelle / Credit (optional)</Label>
            <Input
              value={form.cover_image_credit}
              onChange={(e) => setField("cover_image_credit", e.target.value)}
              placeholder="z.B. Foto: ADFC / Max Mustermann"
              className="bg-zinc-950 border-zinc-800 text-zinc-100 text-sm"
            />
          </div>

          <div className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-950 px-3 py-2">
            <div>
              <div className="text-sm text-zinc-200">KI-generiertes Bild</div>
              <div className="text-[11px] text-zinc-500">Zeigt einen Hinweis unter dem Bild an</div>
            </div>
            <Switch
              checked={form.cover_image_is_ai}
              onCheckedChange={(c) => setField("cover_image_is_ai", c)}
            />
          </div>

          <div className="space-y-2">
            <Label>Quelle (optional)</Label>
            <Input
              value={form.source}
              onChange={(e) => setField("source", e.target.value)}
              placeholder="z.B. ADFC, Tagesspiegel"
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            />
          </div>

          <div className="space-y-2">
            <Label>Lesezeit</Label>
            <Input
              value={form.read_time}
              onChange={(e) => setField("read_time", e.target.value)}
              placeholder="z.B. 5 Min."
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            />
          </div>

          <div className="pt-3 space-y-2 border-t border-zinc-800">
            <Button
              onClick={() => onSubmit(true)}
              disabled={saving || !form.title || !form.slug}
              className="w-full bg-[#FF6A1A] hover:bg-[#e85d10] text-zinc-950 font-medium"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>{form.status === "published" ? "Aktualisieren" : "Veröffentlichen"}</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onSubmit(false)}
              disabled={saving || !form.title || !form.slug}
              className="w-full border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300"
            >
              <Save className="h-4 w-4 mr-2" /> Als Entwurf speichern
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ToolBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="h-7 w-7 grid place-items-center rounded hover:bg-zinc-800 hover:text-zinc-100 transition"
    >
      {children}
    </button>
  );
}
