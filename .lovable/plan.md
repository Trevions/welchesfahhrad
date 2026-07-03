
# Kaufberater Pro — Deutschlands präzisester Rad-Kaufberater

Ziel: `/tools/kaufberater-ai` wird zum eindeutigen Marktführer in Deutschland — messbar präziser (Bikefitter-Niveau statt Faustformel), tiefer (Motoren-, Reichweiten-, Kostenrealität) und weiter (Ende-zu-Ende bis Probefahrt/Leasing) als alle bekannten Konkurrenten.

Umsetzung in vier Bauphasen, die einzeln lauffähig und sichtbar sind. Datenquellen-Frage (eigene DB vs. Feeds vs. Affiliate) bleibt offen — Phase 1–3 laufen auf der bestehenden `bikes`-Tabelle; Phase 4 legt die Skeleton-Infrastruktur, konkrete Quelle wird später entschieden.

---

## Phase 1 — Fit-Genauigkeit auf Bikefitter-Niveau

Statt einer Faktor-mal-Schrittlänge-Rechnung ein vollständiges Fit-Modell nach Retül/BikeFit-Standard.

**Neue Eingaben (Schritt 1 erweitert):**
- Schulterbreite, Torso (C7 → Sitzknochen), Arm (Schulter → Handgelenk), Oberschenkel, Unterschenkel, Sitzknochen-Abstand, Fußlänge
- Wahlweise „schnell" (nur Größe+Schrittlänge, wir schätzen den Rest per Anthropometrie-Regressionen aus DIN 33402-2) oder „präzise" (Vollmessung)
- „Beweglichkeit" wird durch drei konkrete Tests ersetzt: Sit-and-Reach, Schulter-Rotation, Hüftflex — jeweils cm/Grad

**Neue Berechnungen (`calculations.ts` erweitert um Bikefit-Modul):**
- Sattelhöhe: Holmes (Standard), LeMond (0.883 vs. 0.885 nach Kurbellänge), Hamley — als Bandbreite
- Sattel-Setback: KOPS-berechnet aus Oberschenkellänge + Sitzknochen
- Effektive Oberrohrlänge (ETT) aus Torso × 0.47 + Arm × 0.14, korrigiert um Beweglichkeit
- Reach/Stack: Kombinationsformel aus Torso, Arm, Flexibilität, Einsatz — mit Vertrauensintervall
- Sattelbreite aus Sitzknochen +20/+25/+30 mm je Sitzposition
- Cleat-Position bei Klickpedal-Nutzern
- Kurbellänge: Neuere „Short Cranks"-Empfehlung (2.1–2.2 % der Körpergröße + Hüftflex-Korrektur), nicht Faustformel

**Neue Ergebnis-Karte: Bikefit-Report**
- Interaktive **SVG-Rahmengeometrie-Grafik** (`BikeGeometryChart.tsx`) — zeichnet den empfohlenen Rahmen (Reach/Stack/STA/HTA/Kettenstrebe) und legt die User-Position drüber. Sitzposition, Cockpit, Sattelhöhe live.
- Vergleich mit Rahmengeometrie realer Modelle aus `bikes.geometry_json` — für jedes Kandidat-Rad wird ein „Fit-Score" berechnet (Δ Reach + Δ Stack + Δ STA gewichtet).

**Schema-Erweiterung (Migration):**
`bikes.geometry_json JSONB` mit `{ size, reach_mm, stack_mm, seat_tube_angle, head_tube_angle, top_tube_mm, chainstay_mm, wheelbase_mm, standover_mm }[]` — optional, nullable, für den Score fällt Rad ohne Geometrie automatisch zurück auf Größenlabel-Match.

---

## Phase 2 — E-Bike-Tiefe: Motor-DB, echte Routen-Reichweite, TCO, Förderung

**Motor-Datenbank (neue Tabelle `ebike_motors`):**
- Alle relevanten Modelle 2025/26: Bosch (Performance CX Gen5, CX Race, SX, Line, Active+, Cargo Line), Shimano (EP801/EP6/E7000), Brose (S Mag, Drive T), TQ HPR50, Mahle (X20, X35), Specialized (SL 1.2/2.2), DJI Avinox, Fazua Ride 60, Yamaha PW-X3/PWseries CD
- Kennwerte: Drehmoment (Nm), Nennleistung (W), Peak (W), Gewicht (kg), Verbrauch Wh/km bei Standardprofil (75 kg System, flach, Tour), Geräusch dB, Wartungsintervall km, Preisniveau, Anwendungs-Tags (mtb/trekking/road/cargo/city), Empfehlungsscore je Terrain
- Manuelle Pflege via `/mnv/motors` Admin-Editor (analog zu Bikes)
- Migration inkl. Seed mit ~20 Top-Motoren

**Echte Routen-Reichweite (`RouteRangeSimulator.tsx`):**
- Leaflet-Karte (bereits im Projekt) — Nutzer setzt Start + Ziel
- Höhenprofil via **Open-Elevation API** (kostenlos, keine Keys) mit Fallback auf **OpenTopoData**
- Windprognose via **Open-Meteo** (schon integriert für `tools.fahrrad-wetter`)
- Physik-Modell: Rollwiderstand (Crr aus Reifentyp), Luftwiderstand (CdA aus Sitzposition), Steigungsleistung (mgh), Motor-Wirkungsgrad je Modus
- Simuliert Verbrauch Wh/km segmentweise → präzise Reichweite und „schafft dein Akku diese Route?"-Anzeige
- Output: km pro Modus + Wh-Bedarf pro Segment + Warnung „letzten 12 km auf Eco fahren"

**TCO-Rechner (`TCOCalculator.tsx`):**
- 5-Jahres-Kostenmodell: Anschaffung − Wiederverkauf + Strom (Wh × 0.35 €/kWh × jährliche km) + Wartung (350–600 €/Jahr je Kategorie) + Akku-Ersatz Jahr 5 (Bosch/Shimano-Preise 2025) + Versicherung (aus `tools.versicherung`-Logik)
- Vergleich E-Bike vs. Auto (0.30 €/km ADAC) und E-Bike vs. Muskelrad
- Sichtbar als Balkendiagramm (Recharts, bereits im Projekt)

**Förderung & Leasing (`FinancingAnalysis.tsx`):**
- Alle aktuellen DE-Förderprogramme in einer JSON-Tabelle (`src/lib/kaufberater/subsidies.ts`): NRW Zuschuss Lastenrad, Baden-Württemberg Kaufprämie, München/Berlin/Hamburg Kommunalzuschüsse, KfW-Kredite, gewerbliche AfA
- Automatischer Check per PLZ (Nutzer gibt PLZ ein) → passende Förderungen mit Höhe, Frist, Antragslink
- Leasing-Vergleich: JobRad vs. Eurorad vs. Bikeleasing vs. Kauf mit echter Steuerberechnung (Bruttolohn-Eingabe, geldwerter Vorteil 0.25 %, Ersparnis Steuer+SV)
- Empfehlung: „Bei deinem Brutto 55 000 € spart JobRad 42 % vs. Direktkauf — 1 630 € über 36 Monate"

---

## Phase 3 — Ergebnis-Auslieferung: Score-Ranking, PDF, Händler, Share

**Top-5-Räder mit Score-Breakdown (`BikeRankingCard.tsx`):**
Kandidaten aus `bikes` werden mit einem 6-Kriterien-Score bewertet (statt reiner KI-Ausgabe):
- Fit-Score (0–100): Δ Reach/Stack/STA vs. User-Ziel
- Motor-Score (0–100): Nm-Match, Verbrauch, Terrain-Eignung (nur E-Bike)
- Reichweiten-Score (0–100): Ist-Akku vs. Bedarf aus Routen-Simulation
- Ausstattungs-Score: Muss-Features abgedeckt (Schutzblech, StVZO, Bremsen, Schaltung, Tubeless)
- Preis-Leistungs-Score: Preis vs. Segment-Median
- Verfügbarkeits-Score: `bikes.availability` (falls gepflegt)

Gewichte kommen aus den Prioritäts-Slidern des Nutzers. Ausgabe: horizontaler Balken je Kriterium plus Gesamtscore, sortierte Top-5.

Die KI-Analyse (Gemini 3 Flash) schreibt Prosa zur Erklärung, aber der Score ist deterministisch und reproduzierbar.

**PDF-Export & Share-Link:**
- Server-Route `POST /api/kaufberater/pdf`: rendert Report mit `@react-pdf/renderer` (Worker-kompatibel) — vollständiger Report inkl. Fit-Werte, Geometrie-Grafik als SVG, Motor-Empfehlung, Top-5, TCO, Förderung
- Share-Link: `POST /api/public/kaufberater/report` speichert den Report unter Slug in neuer Tabelle `kaufberater_reports` (RLS: public read per Slug, delete nach 90 Tagen via pg_cron). URL: `/beratung/{slug}` — server-rendered mit OG-Bild.

**Probefahrt & Händler-Finder (`DealerFinder.tsx`):**
- Nutzer-PLZ + Radius → Karte mit Händlern (Overpass-API auf OSM `shop=bicycle`)
- Filter nach empfohlenen Marken aus Top-5
- Direktlink „Termin anfragen" per `mailto:` oder Telefon
- Für Direktvertriebs-Marken (Canyon, Rose, Cube): Link zu deren Test-Center-Netzen

---

## Phase 4 — UX-Politur & Vertrauens-Signale

- **Wizard-Redesign**: 5 Schritte statt 4, Fortschrittsleiste mit Zeit-Schätzung, „Schnell-Modus" (2 Min) vs. „Präzise" (8 Min) direkt auf Schritt 1
- **Live-Vorschau rechts**: aktualisiert bereits während Eingabe (Rahmengröße, geschätzte Kandidatenzahl aus `bikes` Live-Count)
- **Vertrauens-Sektion** unter dem Report: Quellen-Belege für jede Formel (Hinault/LeMond/Retül/DIN 33402-2/Bosch-Whitepaper), Update-Datum der Motor-DB, Datenschutz-Hinweis („keine Eingabe verlässt deinen Browser außer für die KI-Zusammenfassung"), Disclaimer „Probefahrt bleibt Pflicht"
- **SEO**: strukturierte Daten `SoftwareApplication` + FAQPage-JSON-LD, Ziel-Keywords: „Fahrrad Kaufberater", „E-Bike Rahmengröße Rechner", „E-Bike Reichweite Rechner", „Motor Vergleich E-Bike"
- **Redaktioneller Anker**: `/ratgeber`-Artikel „Wie wählt man das richtige E-Bike 2026" mit Deep-Link zum Berater

---

## Technische Details

**Neue Dateien:**
```
src/lib/kaufberater/
  bikefit.ts              # Bikefitter-Modell (Retül/DIN-Regressionen)
  geometry.ts             # Rahmen-Fit-Score vs. bikes.geometry_json
  route-range.ts          # Physik-Modell für Routen-Reichweite
  tco.ts                  # 5-Jahres-Kostenrechner
  subsidies.ts            # Deutsche Förderprogramme (statische Tabelle)
  leasing.ts              # JobRad/Eurorad/Bikeleasing-Rechner
  scoring.ts              # 6-Kriterien-Score
  motors.functions.ts     # Server-Fn: Motor-Kandidaten laden
  report.functions.ts     # Server-Fn: Report speichern
  pdf.server.ts           # @react-pdf/renderer Setup

src/components/tools/kaufberater/
  BikeGeometryChart.tsx   # SVG-Rahmengeometrie-Visualisierung
  RouteRangeSimulator.tsx # Leaflet + Höhenprofil
  TCOChart.tsx            # Kostenbalken
  FinancingCompare.tsx    # Leasing vs. Kauf
  BikeRankingCard.tsx     # Score-Breakdown-Karte
  DealerFinder.tsx        # OSM-Händlerkarte

src/routes/
  api/public/kaufberater.pdf.ts        # PDF-Endpoint
  api/public/kaufberater.report.ts     # Report-Persistierung
  beratung.$slug.tsx                   # Public Share-Seite

src/routes/_authenticated/
  mnv.motors.tsx           # Motor-DB Admin-Übersicht
  mnv.motors_.$id.tsx      # Motor-Editor
  mnv.motors_.new.tsx      # Neuer Motor
```

**Datenbank-Migrationen:**
1. `bikes.geometry_json JSONB` (nullable) + `bikes.availability TEXT` (in_stock/limited/preorder/eol)
2. Neue Tabelle `ebike_motors` — vollständige Motor-Spezifikationen, RLS: public read, admin write, Seed mit ~20 Motoren
3. Neue Tabelle `kaufberater_reports` — id, slug, input_json, result_json, created_at, expires_at (90 Tage), RLS: public read per Slug, insert von jedem, delete nur admin/service_role. GRANT-Block nach Regel.
4. pg_cron: täglicher Cleanup abgelaufener Reports

**Externe APIs (alle keinesfrei / bereits verbunden):**
- Open-Elevation (Höhenprofil)
- Open-Meteo (Wind, schon integriert)
- Overpass API (OSM-Händler)
- Nominatim (PLZ → Koordinaten)
- Lovable AI Gateway mit `google/gemini-3-flash-preview` (Prosa) — keine Änderung am Modell

**Reihenfolge & Sichtbarkeit:**
Jede Phase liefert eigenständig sichtbaren Mehrwert und geht sofort live. Ich baue Phase 1 komplett fertig, danach Phase 2, dann 3, dann 4 — mit Freigabe-Checkpoint nach jeder Phase, damit du früh siehst, was der Berater kann, und Kurskorrekturen leicht sind.

Startklar. Freigabe → Phase 1 beginnt mit Fit-Modell, Geometrie-Grafik und Fit-Score über die vorhandene `bikes`-Tabelle.
