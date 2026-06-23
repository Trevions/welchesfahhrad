# Fahrrad-Datenbank — Plan

## 1. Datenbank (Lovable Cloud)

Nieuwe tabel `bikes`:
- `id`, `slug` (uniek), `created_at`, `updated_at`, `published` (bool)
- Grunddaten: `brand`, `model`, `year`, `category` ('bike' | 'ebike'), `bike_type` (Trekking, MTB, Gravel, City, Cargo, Rennrad…), `price_eur`, `image_url`, `gallery` (jsonb), `manufacturer_url`
- SEO: `meta_title`, `meta_description`, `og_image_url`, `keywords` (text[])
- Inhalt: `excerpt`, `description` (Rich-Text / markdown), `highlights` (jsonb: pro/contra)
- Spezifikationen (jsonb `specs`): Rahmen (Material, Größe Optionen, Geometrie), Gabel, Schaltung, Bremsen, Laufräder, Reifen (Marke, Breite, Profil), Sattel, Lenker, Gewicht
- E-Bike-Spezifika (jsonb `ebike`, nullable): Motor (Marke, Nm, W), Akku (Wh, Zellen, abnehmbar), Reichweite (Eco/Tour/Turbo km), Ladezeit, Display, Sensor, Unterstützung bis km/h
- Bewertung (jsonb `ratings`): Komfort, Antrieb, Bremsen, Ausstattung, Preis-Leistung (0-10) — für Radar-/Bar-Charts
- Tags: `intended_use` (text[]), `terrain` (text[])

RLS: SELECT für anon/authenticated wenn `published=true`; alles für `service_role`; admin-Schreibzugriff via `has_role(auth.uid(),'admin')`.

## 2. Admin-Panel (`/mnv/bikes`)

- Liste mit Suche, Filter (Kategorie, Marke, Status), Sortierung
- Editor `/mnv/bikes/$id`:
  - Tabs: Grunddaten · Bilder · Spezifikationen · E-Bike · Bewertungen · SEO · Vorschau
  - Spezifikationen als strukturiertes Formular (kein Roh-JSON)
  - Bilder-Upload → Storage `bike-images` (bereits genutztes Muster wie Artikelbilder)
  - SEO-Helfer: Auto-Slug, Zeichen-Counter für Title/Description, OG-Preview
  - „Veröffentlichen“-Toggle
- Server functions in `src/lib/bikes.functions.ts` (mit `requireSupabaseAuth` + admin-Check für Mutationen, public read).

## 3. Startseite (`/`)

Hero-Block „Geprüft. Bewertet." wird ersetzt durch **„Fahrräder im Fokus"**:
- Eyebrow „RÄDER & E-BIKES"
- Grid: 2 Spalten mobil, 4 Spalten Desktop, 2-3 Reihen (max. 8 Karten)
- Karte: Bild (1:1), darunter **Marke** (klein, uppercase) + **Modell** (Serif Titel), kleines Badge „E-Bike" wenn zutreffend, optional Preis
- Hover: sanftes Heben + Akzentlinie
- CTA „Alle Fahrräder ansehen" → `/fahrraeder`
- Daten via server function `listFeaturedBikes({ limit: 8 })`

## 4. Neue Seite `/fahrraeder`

- Hero + Filterleiste oben mit Pill-Buttons **Alle · Fahrräder · E-Bikes**
- Sekundärfilter: Typ (Trekking, MTB, Gravel, City, Cargo, Rennrad), Marke, Preisrange
- Suche
- Responsive Grid (2 / 3 / 4 Spalten)
- Pagination / „Mehr laden"
- SEO `head()` pro Filter-State über URL-Query

## 5. Detailseite `/fahrraeder/$slug`

Magazin-Layout, Lesefluss:
1. **Hero**: Großes Bild + Marke/Modell, Badges (Kategorie, Typ, Modelljahr), Preis, Verfügbarkeit-Hinweis (Hinweis: kein Verkauf, Link zum Hersteller)
2. **Steckbrief** (Sticky-Side / Mobile-Block): Wichtigste Specs auf einen Blick
3. **Beschreibung** (Rich-Text)
4. **Spezifikationen** als gegliederte Tabellen (Rahmen, Antrieb, Bremsen, Räder, Komfort)
5. **E-Bike-Block** (nur bei E-Bikes):
   - Motor- & Akku-Karten mit Kennzahlen
   - **Reichweiten-Chart** (Bar, 3 Modi) via Recharts (bereits im Stack üblich)
   - **Bewertungs-Radar** (Recharts RadarChart)
6. **Pro & Contra**
7. **Galerie** (Lightbox)
8. **FAQ** (collapsible) — JSON-LD `FAQPage`
9. **Verwandte Fahrräder** (gleiche Kategorie/Typ)

SEO:
- `head()` mit `title`, `description`, `og:title/description/image`, `twitter:card=summary_large_image`
- JSON-LD `Product` (brand, model, image, offers? nein — `category`, aggregateRating wenn vorhanden) + `BreadcrumbList` + `FAQPage`
- Canonical, Alt-Text aus Marke/Modell, Lazy-Loading
- Sitemap-Eintrag in `sitemap.xml.ts` ergänzen

## 6. Navigation

- Mobile-Nav & Header-Link: „RÄDER" → `/fahrraeder` (E-BIKES bleibt als Unterfilter / oder wird zum Alias `?cat=ebike`)
- Footer-Link ergänzen

## 7. Technische Details

- Server functions: `src/lib/bikes.functions.ts` (list, listFeatured, getBySlug, admin: upsert, delete, togglePublish)
- Typen: `src/lib/bike-types.ts`
- Charts: Recharts (BarChart, RadarChart)
- Slug aus Marke+Modell+Jahr auto-generieren, eindeutig erzwingen
- Storage-Bucket `bike-images` (public read)
- Index in `src/routes/index.tsx`: alte „Geprüft. Bewertet."-Section durch `<BikeShowcase />` ersetzen, „Zur Test-Datenbank"-Link entfernen oder umlenken

## Dateien (geplant)

Neu:
- `supabase/migrations/<ts>_bikes.sql`
- `src/lib/bikes.functions.ts`, `src/lib/bike-types.ts`
- `src/components/bikes/BikeCard.tsx`, `BikeShowcase.tsx`, `BikeFilters.tsx`, `BikeSpecsTable.tsx`, `BikeRangeChart.tsx`, `BikeRatingRadar.tsx`, `BikeGallery.tsx`
- `src/routes/fahrraeder.tsx`, `src/routes/fahrraeder.$slug.tsx`
- `src/routes/_authenticated/mnv.bikes.tsx`, `mnv.bikes_.new.tsx`, `mnv.bikes_.$id.tsx`
- `src/components/admin/BikeEditor.tsx`

Geändert:
- `src/routes/index.tsx` (Showcase statt Tests-Hero)
- `src/components/MobileNav.tsx`, `Header.tsx`, `Footer.tsx`
- `src/routes/sitemap[.]xml.ts`
- `src/components/admin/AdminShell.tsx` (Menüpunkt „Fahrräder")
