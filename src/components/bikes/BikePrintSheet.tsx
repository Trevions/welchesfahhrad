import { marked } from "marked";
import type { Bike } from "@/lib/bike-types";
import { articleImageUrl } from "@/lib/article-image-url";


/**
 * BikePrintSheet — A dedicated, print-only datasheet for a bike.
 *
 * Rendered hidden on screen and only visible when the user prints the page.
 * The rest of the page is hidden via `print:hidden`.
 *
 * Design goals:
 *  - Clean, readable, black-on-white A4 datasheet.
 *  - All key facts (identity, price, ratings, specs, geometry, e-bike,
 *    ranges, performance, maintenance, costs, safety, pros/cons, FAQ)
 *    grouped into scannable sections.
 *  - Header on first page, compact footer with source URL on every page
 *    (via @page rules in styles.css).
 */
export function BikePrintSheet({ bike }: { bike: Bike }) {
  const b = bike;
  const title = `${b.brand} ${b.model}${b.year ? ` (${b.year})` : ""}`;
  const url = `https://radmap.de/fahrraeder/${b.slug}`;
  const heroSrc = articleImageUrl(b.image_url ?? "") || b.image_url || "";
  const today = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="print-sheet hidden print:block" aria-hidden>
      {/* Page header */}
      <header className="print-header">
        <div className="print-brand">
          Radmap<span>.DE</span>
        </div>
        <div className="print-header-meta">
          <div>Fahrrad-Datenblatt</div>
          <div>{today}</div>
        </div>
      </header>

      {/* Title block */}
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

      {/* Hero row: image + key facts */}
      <section className="print-hero-row">
        {heroSrc && (
          <div className="print-hero-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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

      {/* Ratings */}
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

      {/* Description */}
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


      {/* Ausstattung / Specs */}
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

      {/* Geometrie */}
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
        </PrintSection>
      )}

      {/* E-Bike Antrieb */}
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

      {/* Pros / Cons */}
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

      {/* AI Summary */}
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

      {/* Awards */}
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

      {/* FAQ */}
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

      {/* Footer */}
      <footer className="print-footer-block">
        <div>
          Quelle: <strong>{url}</strong>
        </div>
        <div>
          Hinweis: radmap.de verkauft keine Räder — alle Angaben ohne Gewähr.
          Preise, Ausstattung und Verfügbarkeit können abweichen. Stand: {today}.
        </div>
      </footer>
    </div>
  );
}

// ---------- helpers ----------

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
