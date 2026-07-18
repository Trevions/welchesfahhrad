import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Search, X, Save, Trash2, Loader2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  upsertLexikonTerm,
  deleteLexikonTerm,
  getLexikonFormOptions,
} from "@/lib/lexikon-admin.functions";

const CATEGORIES = [
  "Allgemein",
  "E-Bike",
  "Antrieb",
  "Bremsen",
  "Fahrwerk",
  "Rahmen",
  "Ausstattung",
  "Sicherheit",
  "Bikefit",
  "Recht",
  "Zubehör",
];

export type LexikonFormValues = {
  id?: string;
  slug: string;
  term: string;
  short_definition: string;
  body: string;
  category: string;
  status: "draft" | "published";
  synonyms: string[];
  related_article_slugs: string[];
  related_term_slugs: string[];
  seo_title: string;
  seo_description: string;
};

const empty: LexikonFormValues = {
  slug: "",
  term: "",
  short_definition: "",
  body: "",
  category: "Allgemein",
  status: "draft",
  synonyms: [],
  related_article_slugs: [],
  related_term_slugs: [],
  seo_title: "",
  seo_description: "",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function LexikonForm({ initial }: { initial?: Partial<LexikonFormValues> }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const upsert = useServerFn(upsertLexikonTerm);
  const del = useServerFn(deleteLexikonTerm);
  const fetchOptions = useServerFn(getLexikonFormOptions);
  const { data: options } = useQuery({
    queryKey: ["lexikon-form-options"],
    queryFn: () => fetchOptions(),
    staleTime: 60_000,
  });

  const [values, setValues] = useState<LexikonFormValues>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [synInput, setSynInput] = useState("");

  const patch = (p: Partial<LexikonFormValues>) => setValues((v) => ({ ...v, ...p }));

  const addSynonyms = () => {
    const parts = synInput
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    patch({
      synonyms: Array.from(new Set([...values.synonyms, ...parts])).slice(0, 50),
    });
    setSynInput("");
  };

  const onSubmit = async (nextStatus?: "draft" | "published") => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        status: nextStatus ?? values.status,
        seo_title: values.seo_title || undefined,
        seo_description: values.seo_description || undefined,
      };
      const res = await upsert({ data: payload });
      toast.success(
        values.id
          ? "Begriff gespeichert"
          : `Begriff angelegt (${nextStatus === "published" ? "veröffentlicht" : "Entwurf"})`,
      );
      qc.invalidateQueries({ queryKey: ["admin-lexikon"] });
      if (!values.id) {
        navigate({ to: "/mnv/lexikon/$id", params: { id: res.id } });
      } else {
        patch({ status: payload.status });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!values.id) return;
    if (!confirm(`"${values.term}" wirklich löschen?`)) return;
    setDeleting(true);
    try {
      await del({ data: { id: values.id } });
      toast.success("Begriff gelöscht");
      qc.invalidateQueries({ queryKey: ["admin-lexikon"] });
      navigate({ to: "/mnv/lexikon" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Begriff *</Label>
                <Input
                  value={values.term}
                  onChange={(e) => {
                    const term = e.target.value;
                    patch({
                      term,
                      slug: values.id || values.slug ? values.slug : slugify(term),
                    });
                  }}
                  placeholder="z. B. Pedelec"
                  className={inputCls}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Slug *</Label>
                <Input
                  value={values.slug}
                  onChange={(e) => patch({ slug: e.target.value })}
                  placeholder="pedelec"
                  className={inputCls + " font-mono text-xs"}
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  URL: /lexikon/<span className="text-zinc-300">{values.slug || "…"}</span>
                </p>
              </div>
              <div className="md:col-span-2">
                <Label>Kurzdefinition * (max. 600 Zeichen)</Label>
                <Textarea
                  value={values.short_definition}
                  onChange={(e) => patch({ short_definition: e.target.value })}
                  rows={2}
                  maxLength={600}
                  className={inputCls}
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  {values.short_definition.length}/600
                </p>
              </div>
              <div className="md:col-span-2">
                <Label>Ausführliche Erklärung * (Markdown/Text)</Label>
                <Textarea
                  value={values.body}
                  onChange={(e) => patch({ body: e.target.value })}
                  rows={14}
                  className={inputCls + " font-mono text-xs leading-relaxed"}
                />
              </div>
            </div>
          </Card>

          <Card title="Ключови думи / Synonyme">
            <p className="text-xs text-zinc-500 mb-2">
              Aliase, Schreibvarianten und Ключови думи für Suche & Autocomplete. Enter oder
              Komma zum Hinzufügen.
            </p>
            <div className="flex gap-2">
              <Input
                value={synInput}
                onChange={(e) => setSynInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addSynonyms();
                  }
                }}
                placeholder="z. B. E-Bike, Elektrofahrrad"
                className={inputCls}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSynonyms}
                className="border-zinc-800 text-zinc-200 hover:bg-zinc-900"
              >
                Add
              </Button>
            </div>
            {values.synonyms.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {values.synonyms.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-xs bg-zinc-900 border border-zinc-800 rounded px-2 py-1"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() =>
                        patch({ synonyms: values.synonyms.filter((x) => x !== s) })
                      }
                      className="text-zinc-500 hover:text-rose-400"
                      aria-label={`${s} entfernen`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Card>

          <Card title="Verwandte Artikel">
            <RefPicker
              items={(options?.articles ?? []).map((a) => ({
                value: a.slug,
                label: a.title,
                sub: a.category,
              }))}
              value={values.related_article_slugs}
              onChange={(v) => patch({ related_article_slugs: v })}
              placeholder="Artikel suchen…"
              linkPrefix="/artikel/"
            />
          </Card>

          <Card title="Verwandte Lexikon-Begriffe">
            <RefPicker
              items={(options?.terms ?? [])
                .filter((t) => t.slug !== values.slug)
                .map((t) => ({ value: t.slug, label: t.term, sub: t.category }))}
              value={values.related_term_slugs}
              onChange={(v) => patch({ related_term_slugs: v })}
              placeholder="Begriff suchen…"
              linkPrefix="/lexikon/"
            />
          </Card>

          <Card title="SEO">
            <div className="space-y-3">
              <div>
                <Label>SEO Title (optional, max. 160)</Label>
                <Input
                  value={values.seo_title}
                  onChange={(e) => patch({ seo_title: e.target.value })}
                  maxLength={160}
                  className={inputCls}
                />
              </div>
              <div>
                <Label>Meta Description (optional, max. 320)</Label>
                <Textarea
                  value={values.seo_description}
                  onChange={(e) => patch({ seo_description: e.target.value })}
                  rows={3}
                  maxLength={320}
                  className={inputCls}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Status">
            <div className="space-y-3">
              <Select
                value={values.status}
                onValueChange={(v) => patch({ status: v as "draft" | "published" })}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="published">Veröffentlicht</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  onClick={() => onSubmit()}
                  disabled={saving}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                  Speichern
                </Button>
                {values.status !== "published" && (
                  <Button
                    type="button"
                    onClick={() => onSubmit("published")}
                    disabled={saving}
                    className="bg-[#FF6A1A] hover:bg-[#e85d10] text-zinc-950 font-medium"
                  >
                    Speichern & veröffentlichen
                  </Button>
                )}
                {values.id && values.status === "published" && (
                  <a
                    href={`/lexikon/${values.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-400 hover:text-zinc-100 inline-flex items-center gap-1 justify-center py-1"
                  >
                    Live ansehen <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </Card>

          <Card title="Kategorie">
            <Select value={values.category} onValueChange={(v) => patch({ category: v })}>
              <SelectTrigger className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {values.id && (
            <Card title="Gefahrenzone">
              <Button
                type="button"
                variant="outline"
                onClick={onDelete}
                disabled={deleting}
                className="w-full border-rose-900/60 text-rose-400 hover:bg-rose-950/40"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1.5" />
                )}
                Löschen
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700";

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg">
      {title && (
        <div className="px-5 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function RefPicker({
  items,
  value,
  onChange,
  placeholder,
  linkPrefix,
}: {
  items: Array<{ value: string; label: string; sub?: string }>;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  linkPrefix: string;
}) {
  const [q, setQ] = useState("");
  const selected = useMemo(() => {
    const map = new Map(items.map((i) => [i.value, i]));
    return value.map((v) => map.get(v) ?? { value: v, label: v });
  }, [items, value]);

  const filtered = useMemo(() => {
    if (!q) return items.slice(0, 20);
    const n = q.toLowerCase();
    return items
      .filter(
        (i) =>
          !value.includes(i.value) &&
          (i.label.toLowerCase().includes(n) || i.value.toLowerCase().includes(n)),
      )
      .slice(0, 20);
  }, [items, q, value]);

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <ul className="space-y-1.5">
          {selected.map((s) => (
            <li
              key={s.value}
              className="flex items-center justify-between gap-2 bg-zinc-950 border border-zinc-800 rounded px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-sm text-zinc-100 truncate">{s.label}</div>
                <div className="text-[11px] text-zinc-500 font-mono truncate">
                  {linkPrefix}
                  {s.value}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`${linkPrefix}${s.value}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-7 w-7 grid place-items-center rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((v) => v !== s.value))}
                  className="h-7 w-7 grid place-items-center rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-900"
                  aria-label="Entfernen"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className={inputCls + " pl-9"}
        />
      </div>
      {(q || filtered.length > 0) && (
        <ul className="max-h-64 overflow-y-auto border border-zinc-800 rounded divide-y divide-zinc-900">
          {filtered.length === 0 && (
            <li className="px-3 py-3 text-xs text-zinc-500">Kein Treffer.</li>
          )}
          {filtered.map((i) => (
            <li key={i.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(Array.from(new Set([...value, i.value])));
                  setQ("");
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-900/70 flex items-baseline justify-between gap-2"
              >
                <span className="text-sm text-zinc-100 truncate">{i.label}</span>
                {i.sub && (
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 shrink-0">
                    {i.sub}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
