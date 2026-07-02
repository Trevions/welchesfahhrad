
# Ultimativer Fahrrad-Kaufberater (AI)

Neuer Premium-Rechner unter `/tools/kaufberater-ai` — der genaueste Kaufberater für normale Räder und E-Bikes in Deutschland. Vollständige Geometrie-Berechnung + KI-Analyse in einem Flow.

## Was der Nutzer eingibt (Wizard, 4 Schritte)

**1. Körpermaße** (Pflicht für exakte Berechnung)
- Körpergröße (cm)
- Schrittlänge / Innenbein (cm) — mit Buch-an-Wand-Anleitung
- Armlänge (optional, für Reach)
- Torsolänge (optional)
- Körpergewicht (kg) — treibt Reifendruck & E-Bike-Reichweite
- Geschlecht (m/w/divers) — Frauen: kürzerer Oberkörper → kürzerer Reach
- Alter & Flexibilität (Slider) — beeinflusst Stack/Überhöhung

**2. Einsatz & Anspruch**
- Radtyp: Rennrad · Gravel · MTB Hardtail · MTB Fully · Trekking · City · E-Trekking · E-MTB · E-City · Lastenrad
- Haupteinsatz: Pendeln · Touren · Sport/Training · Offroad · Familie · Reise
- Wochenkilometer + typische Tourlänge
- Gelände: flach · hügelig · bergig · mixed
- Untergrund %: Asphalt / Schotter / Trail

**3. E-Bike-Spezifika** (nur wenn E-Bike gewählt)
- Motor-Präferenz (Bosch, Shimano, Brose, egal)
- Akku-Kapazität-Wunsch (Wh) oder gewünschte Reichweite (km)
- Unterstützungslevel (Eco/Tour/Sport/Turbo bevorzugt)

**4. Budget & Prioritäten**
- Budget (€) — Slider
- Prioritäten (Radar/Slider 1–5): Komfort · Sportlichkeit · Haltbarkeit · Gewicht · Wartungsarm · Optik
- Muss-Features (Multi-Select): Schutzbleche, Gepäckträger, Beleuchtung, Nabenschaltung, Riemen, Federgabel, Tubeless, Scheibenbremsen hydraulisch

## Was berechnet wird (deterministisch, vor der KI)

**Rahmengeometrie** (pro Radtyp eigene Faktoren, Quellen: Hinault/LeMond, Steve Hogg, Cyclefit, Trek/Giant Size-Charts):
- **Rahmenhöhe** = Schrittlänge × Faktor (Rennrad 0.665, MTB 0.226″, Gravel 0.67, Trekking 0.66, City 0.685)
- **Konfektionsgröße** (XS–XXL) mit Bereich (z.B. „54–56 cm / M")
- **Stack & Reach Zielwerte** aus Körpergröße + Torso + Flexibilität + Einsatz (sport → tiefer/länger, komfort → höher/kürzer)
- **Sattelhöhe** = Schrittlänge × 0.883 (Holmes-Methode) + Range ±5 mm
- **Sattel-Setback** aus Torso
- **Lenkerbreite** aus Schulterbreite-Schätzung (Rennrad 38/40/42/44, MTB 700–780 mm nach Fahrstil)
- **Vorbaulänge** & Spacer-Empfehlung
- **Kurbellänge** aus Schrittlänge (Formel Kirby, 165–175 mm)

**Reifen-Empfehlung**:
- **Breite** je Radtyp × Einsatz × Gewicht (Rennrad 25–32, Gravel 38–50, MTB 2.25–2.6″, Trekking 40–50, City 37–47)
- **Profil**: Slick / Semi-Slick / Stollen (basiert auf Untergrund-Prozenten)
- **Tubeless ja/nein** (Empfehlung ab Gravel/MTB oder ≥5000 km/Jahr)
- **Reifendruck** je Rad (V/H) mit Silca/Berto-Modell: Systemgewicht + Reifenbreite + Untergrund → Bar/PSI (bereits vorhanden in `/tools/reifendruck` — Formel wird geteilt)

**Bremsen & Schaltung**:
- Scheibe hydraulisch bei Gewicht > 85 kg, bergig, E-Bike, viel Regen, >3.000 € Rad
- Nabenschaltung + Riemen bei Pendel/Wartungsarm/City
- 1× vs 2× vs 3× nach Einsatz und Geländeprofil

**E-Bike-Berechnungen** (nur bei E-Bike):
- **Reichweite** = Akku Wh / (Verbrauch Wh/km) — Verbrauch aus Gewicht+Gelände+Unterstützung (10–25 Wh/km-Modell, kalibriert an Bosch/Shimano-Daten)
- **Empfohlene Akku-Kapazität** aus gewünschter Reichweite + Sicherheitspuffer 20 %
- **Motor-Empfehlung**: Bosch CX (MTB/steil), Bosch Performance Line (Trekking), Shimano EP6/EP8 (leicht/sportlich), Brose S Mag (leise), Bosch Active Line (City) — Regelwerk aus Einsatz + Gelände
- **Drehmoment-Bedarf** (Nm): flach 40–50, hügelig 65–75, bergig 85+

**Budget-Ranges** pro Segment (aktuelle DE-Marktpreise 2025/26):
- Einstieg / Mittelklasse / Premium / High-End Grenzen je Radtyp
- Warnung bei zu niedrigem Budget für gewünschte Ausstattung
- Wo-liegt-mein-Budget-Balken

## KI-Analyse (Lovable AI Gateway)

Nach dem Absenden — Server-Function `analyzeBikePurchase.functions.ts` mit `requireSupabaseAuth` NICHT nötig (öffentlich, kein DB-Write), stattdessen **öffentliche Server-Function ohne Auth**, rate-limited pro IP.

- Modell: `google/gemini-3-flash-preview` (schnell, günstig, gutes Deutsch)
- Input: Alle berechneten Zahlen + Nutzer-Prioritäten
- Output (structured via `Output.object` mit Zod):
  - `summary` (2–3 Sätze — für wen ist welches Segment ideal)
  - `frameRecommendation` — warum genau diese Größe, was bei Grenzfall zu wählen (S/M-Konflikt)
  - `alternativeSizes` — wann kleiner / größer sinnvoll ist
  - `topPicks[]` — 3 konkrete Rad-Empfehlungen aus der eigenen `bikes`-DB (via Server-Query gefiltert nach Typ+Budget+Größe) mit Begründung
  - `warnings[]` — z.B. „Budget zu niedrig für hydraulische Scheibenbremsen bei E-Bike"
  - `checklistBeforeBuy[]` — Probefahrt-Punkte, Passform-Check
  - `financing` — JobRad/Leasing-Hinweis wenn zutreffend

Fehlerfälle: 429/402 sauber als Toast, deterministische Werte bleiben sichtbar.

## Integration

**Profil-Verzahnung** — Zieht bestehende Werte aus `bike-profile.ts` (Körpergröße, Schrittlänge, Gewicht, Radtyp, Interessen) und vorfüllt. Ergebnis „In mein Radprofil übernehmen"-Button aktualisiert `saveBikeProfile()`.

**Bike-DB-Verzahnung** — `topPicks` verlinken zu `/fahrraeder/<slug>`. Falls DB leer für ein Segment: KI empfiehlt Marken/Modelle textuell.

**Favoriten** — Empfohlene Räder direkt via `useBikeFavorites` speicherbar.

**Sharing/Print** — Ergebnis-Seite hat „PDF drucken"-Button (nur CSS `@media print`).

## Platzierung

- **`src/routes/tools.kaufberater-ai.tsx`** — neuer Wizard + Ergebnis-Seite
- **`src/routes/tools.index.tsx`** — als „Featured" **an Position 2** direkt nach Eco Route Planner mit auffälliger Karte („🚴 KI-Kaufberater — der genaueste in Deutschland")
- **`src/routes/index.tsx`** — kleiner Promo-Button neben Eco Route Planner
- **`src/routes/tools.kaufberater.tsx`** (bestehend, einfach): Banner oben „Neu: KI-Kaufberater mit Geometrie-Analyse →"

## Technische Details

- **Files neu**:
  - `src/routes/tools.kaufberater-ai.tsx` (Wizard UI + Ergebnis)
  - `src/lib/kaufberater/calculations.ts` (alle deterministischen Formeln, mit Unit-Kommentaren + Quellen)
  - `src/lib/kaufberater/analysis.functions.ts` (Server-Function für KI-Analyse via Lovable AI Gateway)
  - `src/lib/kaufberater/types.ts` (Zod-Schemas Input/Output)
  - `src/lib/ai-gateway.server.ts` (falls noch nicht vorhanden — Provider-Helper)
- **Files edit**:
  - `src/routes/tools.index.tsx` (neue Featured-Karte)
  - `src/routes/index.tsx` (Promo-Button)
  - `src/routes/tools.kaufberater.tsx` (Cross-Link-Banner)
  - `src/lib/bike-profile.ts` (evtl. neue Felder: torsoLengthCm, flexibility)
- **Keine DB-Migration nötig** (rein Client + AI + read-only Zugriff auf `bikes`).
- **SEO**: `toolHead()` mit „KI-Kaufberater Fahrrad & E-Bike | radmap.de", JSON-LD `SoftwareApplication`.

## Qualität / „100 % korrekt"

- Jede Formel mit Quelle als Kommentar (Hinault/LeMond, Silca-Reifendruck, Bosch-Reichweiten-Whitepaper).
- Alle Berechnungen mit Ranges (Min–Max), nicht nur Einzelwerten — bildet Realität ab.
- Grenzfall-Warnungen wenn Nutzer zwischen zwei Größen liegt (< 2 cm Abstand).
- Disclaimer: Probefahrt bleibt Pflicht, Berechnung ist Startpunkt.
- Keine Fake-Modelle — nur Räder aus eigener DB oder generische Marken-Hinweise.
