import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { upsertBike } from "@/lib/bikes.functions";
import { articleImageUrl } from "@/lib/article-image-url";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
import { BIKE_TYPES, bikeSlugify, type Bike } from "@/lib/bike-types";

type Form = {
  id?: string;
  slug: string;
  brand: string;
  model: string;
  year: number | null;
  category: "bike" | "ebike";
  bike_type: string;
  price_eur: number | null;
  image_url: string;
  gallery: string[];
  manufacturer_url: string;
  excerpt: string;
  description: string;
  highlights: { pros: string[]; cons: string[] };
  specs: Record<string, string | number>;
  ebike: Record<string, any>;
  ratings: Record<string, number>;
  intended_use: string[];
  terrain: string[];
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  keywords: string[];
  featured: boolean;
  published: boolean;
};

const empty: Form = {
  slug: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  category: "bike",
  bike_type: "",
  price_eur: null,
  image_url: "",
  gallery: [],
  manufacturer_url: "",
  excerpt: "",
  description: "",
  highlights: { pros: [], cons: [] },
  specs: {},
  ebike: {},
  ratings: {},
  intended_use: [],
  terrain: [],
  meta_title: "",
  meta_description: "",
  og_image_url: "",
  keywords: [],
  featured: false,
  published: false,
};

function fromBike(b: Bike): Form {
  return {
    id: b.id,
    slug: b.slug,
    brand: b.brand,
    model: b.model,
    year: b.year,
    category: b.category,
    bike_type: b.bike_type ?? "",
    price_eur: b.price_eur,
    image_url: b.image_url ?? "",
    gallery: b.gallery,
    manufacturer_url: b.manufacturer_url ?? "",
    excerpt: b.excerpt ?? "",
    description: b.description ?? "",
    highlights: { pros: b.highlights?.pros ?? [], cons: b.highlights?.cons ?? [] },
    specs: (b.specs as any) ?? {},
    ebike: (b.ebike as any) ?? {},
    ratings: (b.ratings as any) ?? {},
    intended_use: b.intended_use ?? [],
    terrain: b.terrain ?? [],
    meta_title: b.meta_title ?? "",
    meta_description: b.meta_description ?? "",
    og_image_url: b.og_image_url ?? "",
    keywords: b.keywords ?? [],
    featured: b.featured,
    published: b.published,
  };
}

const SPEC_FIELDS: { key: string; label: string; type?: "number" | "text" }[] = [
  { key: "frame_material", label: "Rahmen Material" },
  { key: "frame_sizes", label: "Rahmengrößen (z.B. S, M, L, XL)" },
  { key: "fork", label: "Gabel" },
  { key: "weight_kg", label: "Gewicht (kg)", type: "number" },
  { key: "drivetrain", label: "Schaltgruppe" },
  { key: "gears", label: "Gänge" },
  { key: "brakes", label: "Bremsen" },
  { key: "wheels", label: "Laufräder" },
  { key: "tire_brand", label: "Reifenmarke" },
  { key: "tire_size", label: "Reifengröße (z.B. 700×40c)" },
  { key: "tire_tread", label: "Reifenprofil" },
  { key: "saddle", label: "Sattel" },
  { key: "handlebar", label: "Lenker" },
  { key: "stem", label: "Vorbau" },
  { key: "lights", label: "Beleuchtung" },
  { key: "rack", label: "Gepäckträger" },
  { key: "fenders", label: "Schutzbleche" },
];

const EBIKE_FIELDS: { key: string; label: string; type?: "number" | "text" | "bool" }[] = [
  { key: "motor_brand", label: "Motor Marke" },
  { key: "motor_model", label: "Motor Modell" },
  { key: "motor_nm", label: "Drehmoment (Nm)", type: "number" },
  { key: "motor_w", label: "Leistung (W)", type: "number" },
  { key: "assist_kmh", label: "Unterstützung bis (km/h)", type: "number" },
  { key: "battery_wh", label: "Akku (Wh)", type: "number" },
  { key: "battery_removable", label: "Akku abnehmbar", type: "bool" },
  { key: "charge_time_h", label: "Ladezeit (h)", type: "number" },
  { key: "range_eco_km", label: "Reichweite Eco (km)", type: "number" },
  { key: "range_tour_km", label: "Reichweite Tour (km)", type: "number" },
  { key: "range_turbo_km", label: "Reichweite Turbo (km)", type: "number" },
  { key: "display", label: "Display" },
  { key: "sensor", label: "Sensor" },
];

const RATING_FIELDS: { key: string; label: string }[] = [
  { key: "comfort", label: "Komfort" },
  { key: "drivetrain", label: "Antrieb" },
  { key: "brakes", label: "Bremsen" },
  { key: "equipment", label: "Ausstattung" },
  { key: "value", label: "Preis-Leistung" },
  { key: "overall", label: "Gesamt" },
];

export function BikeEditor({ initial }: { initial?: Bike }) {
  const [form, setForm] = useState<Form>(() => (initial ? fromBike(initial) : empty));
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const save = useServerFn(upsertBike);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!slugTouched && form.brand && form.model) {
      setForm((f) => ({ ...f, slug: bikeSlugify(f.brand, f.model, f.year) }));
    }
  }, [form.brand, form.model, form.year, slugTouched]);

  const handleUpload = async (file: File, target: "image_url" | "og_image_url" | "gallery") => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const name = `bikes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("article-images").upload(name, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const stored = `article-images/${name}`;
      if (target === "gallery") set("gallery", [...form.gallery, stored]);
      else set(target, stored);
      toast.success("Bild hochgeladen");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (publish: boolean) => {
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        id: form.id,
        bike_type: form.bike_type || null,
        published: publish ? true : form.published,
        ebike: form.category === "ebike" ? form.ebike : null,
        image_url: form.image_url || null,
        og_image_url: form.og_image_url || null,
        manufacturer_url: form.manufacturer_url || null,
        excerpt: form.excerpt || null,
        description: form.description || null,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      };
      const res = await save({ data: payload });
      toast.success(publish ? "Veröffentlicht" : "Gespeichert");
      qc.invalidateQueries({ queryKey: ["admin-bikes"] });
      qc.invalidateQueries({ queryKey: ["featured-bikes"] });
      qc.invalidateQueries({ queryKey: ["public-bikes"] });
      if (!form.id) navigate({ to: "/mnv/bikes/$id", params: { id: res.id }, replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    } finally {
      setSaving(false);
    }
  };

  const previewImg = useMemo(() => articleImageUrl(form.image_url) || form.image_url, [form.image_url]);

  return (
    <div className="space-y-4 text-zinc-200">
      <div className="flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20 bg-zinc-950/95 backdrop-blur py-3 -mx-4 lg:-mx-8 px-4 lg:px-8 border-b border-zinc-900">
        <div className="flex items-center gap-2 text-xs">
          <span className={`h-2 w-2 rounded-full ${form.published ? "bg-emerald-500" : "bg-amber-500"}`} />
          <span className="text-zinc-400">{form.published ? "Veröffentlicht" : "Entwurf"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onSubmit(false)} disabled={saving} className="border-zinc-800 text-zinc-100 hover:bg-zinc-900">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            Entwurf speichern
          </Button>
          <Button size="sm" onClick={() => onSubmit(true)} disabled={saving} className="bg-[#FF6A1A] hover:bg-[#e85d10] text-zinc-950 font-medium">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Veröffentlichen
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="bg-zinc-900 border border-zinc-800 flex-wrap h-auto">
          <TabsTrigger value="basic">Grunddaten</TabsTrigger>
          <TabsTrigger value="content">Inhalt</TabsTrigger>
          <TabsTrigger value="specs">Specs</TabsTrigger>
          <TabsTrigger value="ebike" disabled={form.category !== "ebike"}>E-Bike</TabsTrigger>
          <TabsTrigger value="ratings">Bewertung</TabsTrigger>
          <TabsTrigger value="media">Medien</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* BASIC */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <Section title="Grunddaten">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Marke *">
                <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputC} placeholder="Cube, Canyon, Riese & Müller…" />
              </Field>
              <Field label="Modell *">
                <Input value={form.model} onChange={(e) => set("model", e.target.value)} className={inputC} />
              </Field>
              <Field label="Modelljahr">
                <Input type="number" value={form.year ?? ""} onChange={(e) => set("year", e.target.value ? Number(e.target.value) : null)} className={inputC} />
              </Field>
              <Field label="Kategorie *">
                <Select value={form.category} onValueChange={(v: any) => set("category", v)}>
                  <SelectTrigger className={inputC}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bike">Fahrrad</SelectItem>
                    <SelectItem value="ebike">E-Bike</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Typ">
                <Select value={form.bike_type || "_"} onValueChange={(v) => set("bike_type", v === "_" ? "" : v)}>
                  <SelectTrigger className={inputC}><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_">—</SelectItem>
                    {BIKE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Preis (€)">
                <Input type="number" value={form.price_eur ?? ""} onChange={(e) => set("price_eur", e.target.value ? Number(e.target.value) : null)} className={inputC} />
              </Field>
              <Field label="Slug *">
                <Input value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} className={inputC} />
              </Field>
              <Field label="Hersteller-URL">
                <Input value={form.manufacturer_url} onChange={(e) => set("manufacturer_url", e.target.value)} className={inputC} placeholder="https://…" />
              </Field>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
                Auf Startseite hervorheben
              </label>
            </div>
          </Section>
        </TabsContent>

        {/* CONTENT */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <Section title="Beschreibung">
            <Field label="Kurzbeschreibung (Excerpt, max. 600)">
              <Textarea rows={3} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} className={inputC} maxLength={600} />
            </Field>
            <Field label="Ausführliche Beschreibung">
              <Textarea rows={12} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputC} />
            </Field>
          </Section>
          <Section title="Stärken & Schwächen">
            <div className="grid md:grid-cols-2 gap-6">
              <ChipList label="Pro" items={form.highlights.pros} onChange={(v) => set("highlights", { ...form.highlights, pros: v })} placeholder="z.B. Starker Motor" />
              <ChipList label="Contra" items={form.highlights.cons} onChange={(v) => set("highlights", { ...form.highlights, cons: v })} placeholder="z.B. Schweres Gewicht" />
            </div>
          </Section>
          <Section title="Einsatz">
            <div className="grid md:grid-cols-2 gap-6">
              <ChipList label="Einsatzbereiche" items={form.intended_use} onChange={(v) => set("intended_use", v)} placeholder="Pendeln, Tour, Sport…" />
              <ChipList label="Untergrund" items={form.terrain} onChange={(v) => set("terrain", v)} placeholder="Stadt, Schotter, Trails…" />
            </div>
          </Section>
        </TabsContent>

        {/* SPECS */}
        <TabsContent value="specs" className="space-y-4 mt-4">
          <Section title="Spezifikationen">
            <div className="grid md:grid-cols-2 gap-4">
              {SPEC_FIELDS.map((f) => (
                <Field key={f.key} label={f.label}>
                  <Input
                    type={f.type === "number" ? "number" : "text"}
                    step="0.1"
                    value={(form.specs[f.key] as any) ?? ""}
                    onChange={(e) =>
                      set("specs", {
                        ...form.specs,
                        [f.key]: e.target.value === "" ? "" : f.type === "number" ? Number(e.target.value) : e.target.value,
                      })
                    }
                    className={inputC}
                  />
                </Field>
              ))}
            </div>
          </Section>
        </TabsContent>

        {/* EBIKE */}
        <TabsContent value="ebike" className="space-y-4 mt-4">
          <Section title="E-Bike Motor & Akku">
            <div className="grid md:grid-cols-2 gap-4">
              {EBIKE_FIELDS.map((f) => (
                <Field key={f.key} label={f.label}>
                  {f.type === "bool" ? (
                    <div className="flex items-center h-10">
                      <Switch checked={!!form.ebike[f.key]} onCheckedChange={(v) => set("ebike", { ...form.ebike, [f.key]: v })} />
                    </div>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : "text"}
                      step="0.1"
                      value={form.ebike[f.key] ?? ""}
                      onChange={(e) =>
                        set("ebike", {
                          ...form.ebike,
                          [f.key]: e.target.value === "" ? "" : f.type === "number" ? Number(e.target.value) : e.target.value,
                        })
                      }
                      className={inputC}
                    />
                  )}
                </Field>
              ))}
            </div>
          </Section>
        </TabsContent>

        {/* RATINGS */}
        <TabsContent value="ratings" className="space-y-4 mt-4">
          <Section title="Bewertung (0–10)">
            <div className="grid md:grid-cols-2 gap-4">
              {RATING_FIELDS.map((r) => (
                <Field key={r.key} label={r.label}>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={(form.ratings[r.key] as any) ?? ""}
                    onChange={(e) => set("ratings", { ...form.ratings, [r.key]: Number(e.target.value) })}
                    className={inputC}
                  />
                </Field>
              ))}
            </div>
          </Section>
        </TabsContent>

        {/* MEDIA */}
        <TabsContent value="media" className="space-y-4 mt-4">
          <Section title="Hauptbild">
            <ImageUpload
              value={form.image_url}
              preview={previewImg}
              uploading={uploading}
              onUpload={(f) => handleUpload(f, "image_url")}
              onClear={() => set("image_url", "")}
            />
          </Section>
          <Section title="Galerie">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {form.gallery.map((g, i) => (
                <div key={i} className="relative aspect-square bg-zinc-900 group">
                  <img src={articleImageUrl(g) || g} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <button
                    onClick={() => set("gallery", form.gallery.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 h-6 w-6 bg-rose-600 grid place-items-center opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-zinc-800 hover:border-[#FF6A1A] grid place-items-center cursor-pointer text-zinc-500 hover:text-[#FF6A1A] transition">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file, "gallery");
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
          </Section>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-4 mt-4">
          <Section title="SEO">
            <Field label={`SEO Titel (${form.meta_title.length}/180)`}>
              <Input value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} className={inputC} maxLength={180} placeholder={`${form.brand} ${form.model} — Test, Specs & Preis`} />
            </Field>
            <Field label={`Meta-Beschreibung (${form.meta_description.length}/300)`}>
              <Textarea rows={3} value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} className={inputC} maxLength={300} />
            </Field>
            <ChipList label="Keywords" items={form.keywords} onChange={(v) => set("keywords", v)} placeholder="enter zum hinzufügen" />
            <Field label="OG Bild URL (optional, sonst Hauptbild)">
              <ImageUpload
                value={form.og_image_url}
                preview={articleImageUrl(form.og_image_url) || form.og_image_url}
                uploading={uploading}
                onUpload={(f) => handleUpload(f, "og_image_url")}
                onClear={() => set("og_image_url", "")}
              />
            </Field>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const inputC = "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 md:p-6">
      <h3 className="text-sm font-semibold text-zinc-100 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-zinc-400">{label}</Label>
      {children}
    </div>
  );
}

function ImageUpload({
  value, preview, uploading, onUpload, onClear,
}: {
  value: string;
  preview: string;
  uploading: boolean;
  onUpload: (f: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="relative h-32 w-48 bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
        {preview ? (
          <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-zinc-600 text-xs">Kein Bild</div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs cursor-pointer">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {value ? "Ersetzen" : "Hochladen"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
        {value && (
          <button onClick={onClear} className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300">
            <Trash2 className="h-3 w-3" /> Entfernen
          </button>
        )}
      </div>
    </div>
  );
}

function ChipList({
  label, items, onChange, placeholder,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <Label className="text-xs text-zinc-400">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-100 text-xs px-2 py-1 rounded">
            {it}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-zinc-500 hover:text-rose-400">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className={inputC}
        />
        <Button type="button" variant="outline" size="sm" onClick={add} className="border-zinc-800 text-zinc-100 hover:bg-zinc-800">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
