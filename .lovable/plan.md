## Ausgangslage

- Jedes Tool hat schon eine eigene Route (`src/routes/tools.reifendruck.tsx`, `tools.rahmengroesse.tsx`, `tools.uebersetzung.tsx`, `tools.ebike-reichweite.tsx`, `tools.kalorien.tsx`, `tools.jobrad-leasing.tsx` …) und `toolHead(...)` setzt Title, Meta-Description, Canonical, OG-Tags und ein SoftwareApplication-JSON-LD.
- Es fehlt: keyword-optimierte URLs (`…-rechner`), langer Erklärtext + FAQ + FAQPage-/HowTo-Schema, saubere Redaktions-/Disclaimer-Signale, „Zuletzt geprüft"-Feld, präzisere Reifendruck-Berechnung inkl. Laufradgröße & Gewichtsverteilung, Aufnahme aller Tools in `sitemap.xml`.
- TanStack Start läuft mit SSR — die neuen Seiten werden serverseitig gerendert, sofern wir keine Client-Only-Tricks einbauen. Wir stellen das explizit sicher.

## Ziel-URLs (Redirects einrichten)

Bestehende Routen umbenennen bzw. neue anlegen und alte per 301 weiterleiten (Server-Route mit `Response` 301). Nicht alle bekommen „-rechner" — nur da, wo es ein echtes Keyword ist.

| Alt | Neu |
|---|---|
| `/tools/reifendruck` | `/tools/reifendruck-rechner` |
| `/tools/rahmengroesse` | `/tools/rahmengroessen-rechner` |
| `/tools/uebersetzung` | `/tools/uebersetzung-rechner` |
| `/tools/ebike-reichweite` | `/tools/ebike-reichweite-rechner` |
| `/tools/kalorien` | `/tools/kalorien-rechner` |
| `/tools/jobrad-leasing` | `/tools/jobrad-leasing-rechner` |
| `/tools/foerderung` | `/tools/ebike-foerderung-rechner` |
| `/tools/vergleich` | `/tools/fahrrad-vergleich` |
| übrige (Wetter, Karte, STVO, Bußgeld, Diebstahlschutz, Pannenhilfe, Werkzeug-Liste, Wartungsintervalle, Sicherheits-Check, Sonnenzeiten, Luftqualität, Tourenplaner, Kaufberater) | URL unverändert, nur SEO-Content ergänzen |

## Umsetzung

### 1) Shared SEO-Bausteine (`src/components/tools/`)

- `ToolSeoSection.tsx` — semantisches `<article>` unter dem Rechner: H2 „So funktioniert der …-Rechner", Formel/Methodik, Beispieltabelle, „Für wen sinnvoll", interne Verlinkung auf 2–3 Ratgeber-Slugs.
- `ToolFaq.tsx` — Accordion + generiertes FAQPage-JSON-LD aus `{ question, answer }[]`.
- `ToolReviewedBy.tsx` — kleine Karte oben: „Geprüft von der radmap.de Redaktion · Zuletzt aktualisiert: {reviewedAt}" mit Link auf `/redaktion`.
- `ToolSafetyDisclaimer.tsx` — einheitlicher Hinweis „Herstellerangaben auf Reifenflanke/Rahmenaufkleber haben Vorrang" (nur für sicherheitsrelevante Tools).
- `src/lib/tools/reviewed.ts` — zentrale Map `{ [slug]: "2026-07-03" }`, damit „Zuletzt geprüft" wartbar ist, nicht im Fließtext hartkodiert.

### 2) SEO-Helfer erweitern (`src/lib/tools/seo.ts`)

`toolHead` bekommt optionale Felder `reviewedAt`, `faq`, `howTo`. Erzeugt zusätzlich zu SoftwareApplication auch FAQPage- und optional HowTo-JSON-LD. `dateModified` wird aus `reviewedAt` gesetzt.

### 3) Reifendruck-Rechner fachlich überarbeiten (`src/routes/tools.reifendruck-rechner.tsx`)

Zusätzlich zu den bestehenden Eingaben (Systemgewicht, Reifenbreite, Untergrund, Setup, Fahrstil, Hersteller-Max):

- **Laufradgröße** (28"/700C, 27.5"/650B, 26", 20") → Korrekturfaktor auf Basisdruck (kleineres Laufrad = mehr Druck bei gleicher Breite).
- **Einsatzbereich** (Straße / Gravel / MTB / Trekking / E-Bike / Cargo) als eigene Eingabe, mit E-Bike/Cargo = +0,2–0,4 bar wegen Mehrgewicht.
- **Gewichtsverteilung vorne/hinten** als Slider, Default 40/60; ersetzt den festen 10 %-Front-Delta. Ergebnis wird aus tatsächlichem Achslast-Anteil abgeleitet.
- Ausgabe getrennt vorne/hinten in **bar und psi** (schon vorhanden, klarer beschriften).
- **Plausibilitätswarnungen**: unter Min-Bereich → „unter empfohlenem Minimum — Snakebite-Gefahr"; über Reifen-Max oder Hersteller-Max → „über sicherem Maximum — Reifenflanken-Angabe hat Vorrang".
- **Methodik-Box** unter dem Rechner (klapp­bar): Kurzbeschreibung „angelehnt an Frank Berto (15 %-Reifendurchbiegung) und aktuelle SRAM/Silca-Tabellen, mit Systemgewicht-Skalierung und Achslast-Korrektur". Formel als Pseudocode. Feld „Zuletzt geprüft: {reviewedAt}" aus `reviewed.ts`.
- **Redaktionshinweis + Safety-Disclaimer** oben und unten.
- **Content-Sektion** (≥ 600 Wörter): So funktioniert Reifendruck, Einfluss von Tubeless/Latex/Butyl, Nass vs. trocken, typische Fehler, Beispieltabelle (Systemgewicht × Reifenbreite → Druck), FAQ (5 Fragen, u. a. „Warum vorne weniger Druck?", „Was ist der max. Reifendruck?", „Muss ich vor jeder Fahrt prüfen?").

### 4) Weitere Rechner-Seiten (Rahmengröße, Übersetzung, E-Bike-Reichweite, Kalorien, JobRad-Leasing, Förderung, Vergleich)

Pro Seite:
- Neue URL wie oben, Route-Datei kopieren und alte Datei durch Redirect-Handler ersetzen (Server-Handler + Client-Redirect via `<Navigate>` als Fallback).
- `toolHead` mit **eigenem** Title („Rahmengrößen-Rechner: passende Größe berechnen · radmap.de"), Meta-Description mit Ziel-Keyword, Canonical auf neue URL, SoftwareApplication + FAQPage-Schema.
- Über dem Fold: nur der Rechner (unverändert übernommen).
- Darunter: `ToolReviewedBy` → `ToolSeoSection` (600–1000 Wörter, Methodik, Formel, Beispieltabelle) → `ToolFaq` (3–5 Fragen) → `ToolSafetyDisclaimer` (nur Reifendruck, Rahmengröße) → interne Verlinkung zu 2–3 passenden Artikeln aus `articles`-Tabelle (Slugs redaktionell festgelegt, in `src/lib/tools/related.ts`).
- Bei Rahmengröße zusätzlich Hinweis „Herstellergeometrie weicht ab — im Zweifel Probefahrt".

### 5) Nur-SEO-Ergänzung für bestehende Tools ohne URL-Wechsel

Für die übrigen Tool-Seiten (Wetter, STVO, Bußgeld, Diebstahlschutz, Pannenhilfe, Werkzeug-Liste, Wartungsintervalle, Sicherheits-Check, Sonnenzeiten, Luftqualität, Tourenplaner, Kaufberater, Karte) nur `ToolReviewedBy`, `ToolSeoSection` und `ToolFaq` mit thematisch passendem Text + FAQPage-Schema ergänzen; URL bleibt.

### 6) Sitemap & Redirects (`src/routes/sitemap[.]xml.ts`)

Alle Tool-Seiten (neu und bestehend) in die `staticEntries` aufnehmen, `changefreq: monthly`, `priority: 0.6–0.7`. Alte URLs NICHT aufnehmen — sie leiten per 301 weiter.

Für jede umbenannte Route: alte Route-Datei liefert im Server-Handler `Response.redirect(newUrl, 301)` und rendert clientseitig eine `<Navigate>`-Komponente als Fallback. Das erhält bestehende Backlinks.

### 7) `tools.index.tsx` — Links aktualisieren

Card-Links auf neue URLs zeigen lassen, Text/Beschreibungen unangetastet lassen (Designsystem bleibt).

### 8) SSR verifizieren

Für jede neue Route: keine `ssr: false`-Flags, keine Browser-APIs im Modul-Scope, `useBikeProfile` bleibt im Client-Teil (`useMemo`/`useState`). Nach dem Bauen mit `curl -s http://localhost:8080/tools/reifendruck-rechner | grep -c '<h1'` prüfen, dass H1, FAQ und JSON-LD im initialen HTML stehen.

### 9) Design bleibt

Nur `ToolShell`, `ToolCard`, bestehende Typo/Palette verwenden. Keine neuen Farben, keine neuen Font-Familien. LIVE-Badge unverändert.

## Technische Details

- Route-Rename in TanStack Start = neue Datei anlegen, alte Datei mit Redirect-Handler behalten (nicht löschen, damit Google die 301 abholt).
- FAQPage-JSON-LD via `scripts`-Array in `head()` (`type: "application/ld+json"`, `children: JSON.stringify(...)`).
- `reviewed.ts` als reine TS-Konstante, kein DB-Roundtrip nötig (wartbar per Commit).
- Related Articles: statische Slug-Liste je Tool in `src/lib/tools/related.ts`; Titel/URL werden client-seitig aus vorhandenem Artikel-Layer geladen oder als statische Links gerendert.
- Reifendruck-Formel bleibt in `src/routes/tools.reifendruck-rechner.tsx`, aber extrahiert nach `src/lib/tools/reifendruck.ts`, damit sie testbar/wartbar ist.

## Nicht Teil dieser Änderung

- Keine Änderung an Auth, Datenbankschemata, Newsletter, Admin-Bereich.
- Keine neuen Rechner erfinden — nur bestehende SEO-fest machen.
- Kaufberater-KI-Logik bleibt unangetastet (nur SEO-Content darunter).
