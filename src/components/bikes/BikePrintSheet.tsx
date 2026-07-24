import { marked } from "marked";
import type { Bike } from "@/lib/bike-types";
import { articleImageUrl } from "@/lib/article-image-url";

/**
 * BikePrintSheet — A dedicated, print-only datasheet for a bike.
 *
 * Automatically renders every populated field of the bike record,
 * including nested/dynamic data (configuration, by_size geometry,
 * wheelset, cockpit, ranges, costs, environmental, safety …).
 */
export function BikePrintSheet({ bike }: { bike: Bike }) {
  const b = bike;
  const title = `${b.brand} ${b.model}${b.year ? ` (${b.year})` : ""}`;
  const url = `https://welchesfahrrad.de/fahrraeder/${b.slug}`;
  const heroSrc = articleImageUrl(b.image_url ?? "") || b.image_url || "";
  const today = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="print-sheet hidden print:block" aria-hidden>
      <header className="print-header">
        <div className="print-brand">
          Welches Fahrrad<span>.DE</span>
        </div>
        <div className="print-header-meta">
          <div>Fahrrad-Datenblatt</div>
          <div>{today}</div>
        </div>
      </header>

      <section className="print-title-block">
        <div className="print-eyebrow">
          {b.brand}
          {b.category === "ebike" ? " · E-Bike" : " · Fahrrad"}
          {b.bike_type ? ` · ${b.bike_type}` : ""}
        </div>
        <h1 className="print-h1">{b.model}</h1>
        {b.year && <div className="print-year">Modelljahr {b.year}</div>}
        {b.excerpt && <p className="print-excerpt">{b.excerpt}</p>}
      </section>

      <section className="print-hero-row">
        {heroSrc && (
          <div className="print-hero-img">
            <img src={heroSrc} alt={title} />
          </div>
        )}
        <div className="print-hero-facts">
          <PrintKV label="Marke" value={b.brand} />
          <PrintKV label="Modell" value={b.model} />
          <PrintKV label="Modelljahr" value={b.year ?? "—"} />
          <PrintKV label="Kategorie" value={b.category === "ebike" ? "E-Bike" : "Fahrrad"} />
          <PrintKV label="Typ" value={b.bike_type ?? "—"} />
          <PrintKV
            label="UVP"
            value={b.price_eur != null ? `${b.price_eur.toLocaleString("de-DE")} €` : "—"}
          />
          <PrintKV
            label="Experten-Note"
            value={b.expert_rating != null ? `${b.expert_rating.toFixed(1)} / 10` : "—"}
          />
          <PrintKV
            label="Gesamt-Bewertung"
            value={b.ratings?.overall != null ? `${b.ratings.overall.toFixed(1)} / 10` : "—"}
          />
          <PrintKV label="Verfügbarkeit" value={b.availability ?? "—"} />
          <PrintKV label="Gewicht" value={fmtNum(b.specs?.weight_kg, "kg")} />
        </div>
      </section>

      {hasAnyRating(b) && (
        <PrintSection title="Bewertungen">
          <div className="print-grid-4">
            {ratingEntries(b).map(([label, val]) => (
              <div key={label} className="print-rating-cell">
                <div className="print-rating-label">{label}</div>
                <div className="print-rating-value">{val.toFixed(1)}</div>
                <div className="print-rating-bar">
                  <div style={{ width: `${(val / 10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </PrintSection>
      )}

      {b.description && (
        <PrintSection title="Beschreibung">
          <div
            className="print-prose"
            dangerouslySetInnerHTML={{
              __html: marked.parse(b.description, { async: false, breaks: false }) as string,
            }}
          />
        </PrintSection>
      )}

      {hasAnySpec(b) && (
        <PrintSection title="Ausstattung">
          <PrintTable
            rows={[
              ["Rahmen", b.specs?.frame_material],
              ["Rahmengrößen", b.specs?.frame_sizes],
              ["Gabel", b.specs?.fork],
              ["Gewicht", fmtNum(b.specs?.weight_kg, "kg")],
              ["Antrieb", b.specs?.drivetrain],
              ["Gänge", b.specs?.gears],
              ["Bremsen", b.specs?.brakes],
              ["Laufräder", b.specs?.wheels],
              ["Reifen", joinDash(b.specs?.tire_brand, b.specs?.tire_size)],
              ["Reifenprofil", b.specs?.tire_tread],
              ["Sattel", b.specs?.saddle],
              ["Lenker", b.specs?.handlebar],
              ["Vorbau", b.specs?.stem],
              ["Beleuchtung", b.specs?.lights],
              ["Gepäckträger", b.specs?.rack],
              ["Schutzbleche", b.specs?.fenders],
            ]}
          />
        </PrintSection>
      )}

      {hasAnyGeo(b) && (
        <PrintSection title="Geometrie">
          <PrintTable
            rows={[
              ["Radstand", fmtNum(b.geometry?.wheelbase_mm, "mm")],
              ["Stack", fmtNum(b.geometry?.stack_mm, "mm")],
              ["Reach", fmtNum(b.geometry?.reach_mm, "mm")],
              ["Sitzrohr", fmtNum(b.geometry?.seat_tube_mm, "mm")],
              ["Steuerrohr", fmtNum(b.geometry?.head_tube_mm, "mm")],
              ["Tretlager", fmtNum(b.geometry?.bottom_bracket_mm, "mm")],
              ["Rahmengewicht", fmtNum(b.geometry?.frame_weight_kg, "kg")],
              ["Max. Fahrergewicht", fmtNum(b.geometry?.max_rider_weight_kg, "kg")],
            ]}
          />
          {b.geometry && "by_size" in (b.geometry as any) && (
            <BySizeTable data={(b.geometry as any).by_size} />
          )}
          {b.geometry &&
            Object.entries(b.geometry as any)
              .filter(
                ([k, v]) =>
                  ![
                    "wheelbase_mm",
                    "stack_mm",
                    "reach_mm",
                    "seat_tube_mm",
                    "head_tube_mm",
                    "bottom_bracket_mm",
                    "frame_weight_kg",
                    "max_rider_weight_kg",
                    "by_size",
                  ].includes(k) &&
                  isNonEmpty(v),
              )
              .map(([k, v]) => (
                <SmartField key={k} label={humanize(k)} value={v} />
              ))}
        </PrintSection>
      )}

      {b.category === "ebike" && b.ebike && (
        <PrintSection title="E-Bike-System">
          <PrintTable
            rows={[
              ["Motor-Marke", b.ebike.motor_brand],
              ["Motor-Modell", b.ebike.motor_model],
              ["Drehmoment", fmtNum(b.ebike.motor_nm, "Nm")],
              ["Nennleistung", fmtNum(b.ebike.motor_w, "W")],
              ["Akku-Kapazität", fmtNum(b.ebike.battery_wh, "Wh")],
              ["Akku entnehmbar", boolLabel(b.ebike.battery_removable)],
              ["Reichweite Eco", fmtNum(b.ebike.range_eco_km, "km")],
              ["Reichweite Tour", fmtNum(b.ebike.range_tour_km, "km")],
              ["Reichweite Turbo", fmtNum(b.ebike.range_turbo_km, "km")],
              ["Ladezeit", fmtNum(b.ebike.charge_time_h, "h")],
              ["Unterstützung bis", fmtNum(b.ebike.assist_kmh, "km/h")],
              ["Display", b.ebike.display],
              ["Sensorik", b.ebike.sensor],
            ]}
          />
        </PrintSection>
      )}

      {/* Auto-rendered extended sections */}
      <DynamicSection title="Cockpit" data={b.cockpit} />
      <DynamicSection title="Laufradsatz" data={b.wheelset} />
      <DynamicSection title="Antrieb — Details" data={b.drivetrain_detail} />
      <DynamicSection title="Bremsen — Details" data={b.brakes_detail} />
      <DynamicSection title="E-Bike — Details" data={b.ebike_detail} />
      <DynamicSection title="Konfiguration & Optionen" data={pickConfig(b)} />
      <DynamicSection title="Reichweiten-Matrix" data={b.range_matrix} />
      <DynamicSection title="Performance-Profil" data={b.performance} />
      <DynamicSection title="Eignung" data={b.suitability} />
      <DynamicSection title="Wartung" data={b.maintenance} />
      <DynamicSection title="Betriebskosten" data={b.costs} />
      <DynamicSection title="Umwelt & Nachhaltigkeit" data={b.environmental} />
      <DynamicSection title="Sicherheitsmerkmale" data={b.safety_features} />

      {b.accessories && b.accessories.length > 0 && (
        <PrintSection title="Zubehör">
          <ChipList items={b.accessories} />
        </PrintSection>
      )}

      {b.intended_use && b.intended_use.length > 0 && (
        <PrintSection title="Einsatzbereich">
          <ChipList items={b.intended_use} />
        </PrintSection>
      )}

      {b.terrain && b.terrain.length > 0 && (
        <PrintSection title="Terrain">
          <ChipList items={b.terrain} />
        </PrintSection>
      )}

      {(b.highlights?.pros?.length || b.highlights?.cons?.length) && (
        <PrintSection title="Stärken & Schwächen">
          <div className="print-two-col">
            <div>
              <div className="print-subhead">Stärken</div>
              <ul className="print-list print-list-pos">
                {(b.highlights?.pros ?? []).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
                {!b.highlights?.pros?.length && <li className="print-muted">—</li>}
              </ul>
            </div>
            <div>
              <div className="print-subhead">Schwächen</div>
              <ul className="print-list print-list-neg">
                {(b.highlights?.cons ?? []).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
                {!b.highlights?.cons?.length && <li className="print-muted">—</li>}
              </ul>
            </div>
          </div>
        </PrintSection>
      )}

      {b.ai_summary && (b.ai_summary.best_for || b.ai_summary.avoid_if) && (
        <PrintSection title="Für wen ist dieses Rad geeignet?">
          {b.ai_summary.best_for && (
            <p className="print-body-text">
              <strong>Ideal für: </strong>
              {b.ai_summary.best_for}
            </p>
          )}
          {b.ai_summary.avoid_if && (
            <p className="print-body-text">
              <strong>Weniger geeignet, wenn: </strong>
              {b.ai_summary.avoid_if}
            </p>
          )}
          {b.ai_summary.alternatives && b.ai_summary.alternatives.length > 0 && (
            <p className="print-body-text">
              <strong>Alternativen: </strong>
              {b.ai_summary.alternatives.join(", ")}
            </p>
          )}
        </PrintSection>
      )}

      {b.awards && b.awards.length > 0 && (
        <PrintSection title="Auszeichnungen">
          <ul className="print-list">
            {b.awards.map((a, i) => (
              <li key={i}>
                {a.name}
                {a.year ? ` (${a.year})` : ""}
                {a.source ? ` — ${a.source}` : ""}
              </li>
            ))}
          </ul>
        </PrintSection>
      )}

      <DynamicSection title="Modell-Historie" data={b.model_history} />

      {b.videos && b.videos.length > 0 && (
        <PrintSection title="Videos">
          <ul className="print-list">
            {b.videos.map((v, i) => (
              <li key={i}>
                {v.title ? `${v.title} — ` : ""}
                {v.url}
              </li>
            ))}
          </ul>
        </PrintSection>
      )}

      {b.faq && b.faq.length > 0 && (
        <PrintSection title="Häufige Fragen">
          <dl className="print-faq">
            {b.faq.map((f, i) => (
              <div key={i} className="print-faq-item">
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </PrintSection>
      )}

      <footer className="print-footer-block">
        <div>
          Quelle: <strong>{url}</strong>
        </div>
        <div>
          Hinweis: welchesfahrrad.de verkauft keine Räder — alle Angaben ohne Gewähr.
          Preise, Ausstattung und Verfügbarkeit können abweichen. Stand: {today}.
        </div>
      </footer>
    </div>
  );
}

// ---------- generic renderers ----------

function DynamicSection({ title, data }: { title: string; data: unknown }) {
  if (!isNonEmpty(data)) return null;
  return (
    <PrintSection title={title}>
      <SmartValue value={data} />
    </PrintSection>
  );
}

function SmartField({ label, value }: { label: string; value: unknown }) {
  if (!isNonEmpty(value)) return null;
  if (isPrimitive(value)) {
    return (
      <table className="print-table">
        <tbody>
          <tr>
            <th>{label}</th>
            <td>{formatPrimitive(value)}</td>
          </tr>
        </tbody>
      </table>
    );
  }
  return (
    <div className="print-subsection">
      <div className="print-subhead">{label}</div>
      <SmartValue value={value} />
    </div>
  );
}

function SmartValue({ value }: { value: unknown }) {
  if (!isNonEmpty(value)) return <span className="print-muted">—</span>;
  if (isPrimitive(value)) return <span>{formatPrimitive(value)}</span>;

  if (Array.isArray(value)) {
    if (value.every(isPrimitive)) {
      return <ChipList items={value.map(formatPrimitive)} />;
    }
    return (
      <div className="print-array">
        {value.map((item, i) => (
          <div key={i} className="print-array-item">
            {isPrimitive(item) ? (
              <span>{formatPrimitive(item)}</span>
            ) : (
              <ObjectTable obj={item as Record<string, unknown>} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return <ObjectTable obj={value as Record<string, unknown>} />;
}

function ObjectTable({ obj }: { obj: Record<string, unknown> }) {
  const entries = Object.entries(obj).filter(([, v]) => isNonEmpty(v));
  if (entries.length === 0) return <span className="print-muted">—</span>;

  const primEntries = entries.filter(([, v]) => isPrimitive(v));
  const complexEntries = entries.filter(([, v]) => !isPrimitive(v));

  return (
    <>
      {primEntries.length > 0 && (
        <table className="print-table">
          <tbody>
            {primEntries.map(([k, v]) => (
              <tr key={k}>
                <th>{humanize(k)}</th>
                <td>{formatPrimitive(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {complexEntries.map(([k, v]) => (
        <SmartField key={k} label={humanize(k)} value={v} />
      ))}
    </>
  );
}

function BySizeTable({ data }: { data: unknown }) {
  if (!isNonEmpty(data) || typeof data !== "object") return null;
  const entries = Object.entries(data as Record<string, any>).filter(([, v]) => isNonEmpty(v));
  if (entries.length === 0) return null;
  const cols = new Set<string>();
  entries.forEach(([, row]) => {
    if (row && typeof row === "object") Object.keys(row).forEach((k) => cols.add(k));
  });
  const colList = Array.from(cols);
  if (colList.length === 0) return null;
  return (
    <div className="print-subsection">
      <div className="print-subhead">Geometrie nach Rahmengröße</div>
      <table className="print-table print-table-wide">
        <thead>
          <tr>
            <th>Größe</th>
            {colList.map((c) => (
              <th key={c}>{humanize(c)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(([size, row]) => (
            <tr key={size}>
              <th>{size}</th>
              {colList.map((c) => (
                <td key={c}>{formatPrimitive((row as any)?.[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChipList({ items }: { items: Array<string | number> }) {
  return (
    <ul className="print-chip-list">
      {items.map((it, i) => (
        <li key={i}>{String(it)}</li>
      ))}
    </ul>
  );
}

// ---------- helpers ----------

function pickConfig(b: Bike): Record<string, unknown> | null {
  const raw = b as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of ["configuration", "options", "config", "variants"]) {
    if (isNonEmpty(raw[key])) out[key] = raw[key];
  }
  return Object.keys(out).length ? out : null;
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="print-section">
      <h2 className="print-h2">{title}</h2>
      {children}
    </section>
  );
}

function PrintKV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="print-kv">
      <div className="print-kv-label">{label}</div>
      <div className="print-kv-value">{value ?? "—"}</div>
    </div>
  );
}

function PrintTable({ rows }: { rows: Array<[string, any]> }) {
  const filled = rows.filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (filled.length === 0) return <p className="print-muted">Keine Angaben.</p>;
  return (
    <table className="print-table">
      <tbody>
        {filled.map(([k, v]) => (
          <tr key={k}>
            <th>{k}</th>
            <td>{String(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function isPrimitive(v: unknown): v is string | number | boolean {
  return v === null || ["string", "number", "boolean"].includes(typeof v);
}

function isNonEmpty(v: unknown): boolean {
  if (v === undefined || v === null || v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return true;
}

function formatPrimitive(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Ja" : "Nein";
  if (typeof v === "number") return v.toLocaleString("de-DE");
  return String(v);
}

function humanize(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\bmm\b/gi, "mm")
    .replace(/\bwh\b/gi, "Wh")
    .replace(/\bkm\b/gi, "km")
    .replace(/\bkg\b/gi, "kg")
    .replace(/\bnm\b/gi, "Nm")
    .replace(/^./, (c) => c.toUpperCase());
}

function fmtNum(n: number | null | undefined, unit: string) {
  if (n == null) return undefined;
  return `${n.toLocaleString("de-DE")} ${unit}`;
}

function boolLabel(v: boolean | undefined) {
  if (v === undefined) return undefined;
  return v ? "Ja" : "Nein";
}

function joinDash(...parts: Array<string | undefined>) {
  const p = parts.filter(Boolean);
  return p.length ? p.join(" · ") : undefined;
}

function hasAnyRating(b: Bike) {
  const r = b.ratings ?? {};
  return Object.values(r).some((v) => typeof v === "number");
}

function ratingEntries(b: Bike): Array<[string, number]> {
  const r = b.ratings ?? {};
  const map: Record<string, string> = {
    overall: "Gesamt",
    comfort: "Komfort",
    drivetrain: "Antrieb",
    brakes: "Bremsen",
    equipment: "Ausstattung",
    value: "Preis-Leistung",
  };
  return Object.entries(map)
    .map(([k, label]) => [label, (r as any)[k]] as [string, number | undefined])
    .filter((e): e is [string, number] => typeof e[1] === "number");
}

function hasAnySpec(b: Bike) {
  return b.specs && Object.values(b.specs).some((v) => v !== undefined && v !== null && v !== "");
}

function hasAnyGeo(b: Bike) {
  return b.geometry && Object.values(b.geometry).some((v) => v !== undefined && v !== null);
}
