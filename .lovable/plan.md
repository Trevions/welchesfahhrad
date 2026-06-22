## Ziel

Eine professionelle Personalisierungs-Engine. Der Nutzer hinterlegt einmal sein „RadProfil" (Fahrradtyp, Rahmen, Reifen, Körpermaße, Gewicht, Fahrstil, Region, Interessen). Danach erkennt die Seite automatisch, welche Artikel zu ihm passen, und blendet sie **direkt unter dem Live Ticker** als eigenen Streifen „Für dich relevant" ein. Dieselben Profildaten werden später benutzt, um Fahrräder vorzuschlagen.

## 1. Datenmodell (lokal, kein Login nötig)

Gespeichert in `localStorage` unter `radmap.bikeProfile.v1` über einen kleinen Helper `src/lib/bike-profile.ts` (analog zum bestehenden `geo-consent.ts`).

Felder:

```text
bikeTypes:        ["road" | "gravel" | "mtb" | "ebike" | "city" | "trekking" | "cargo" | "kids"]
ridingStyle:      "commute" | "touring" | "sport" | "offroad" | "family"
frameSizeCm:      number   (z. B. 54)
bodyHeightCm:     number
inseamCm:         number   (Schrittlänge, optional)
weightKg:         number
tire:             { widthMm: number, diameter: "700c"|"650b"|"29"|"27.5"|"26", type: "slick"|"semi"|"knobby" }
brakes:           "rim" | "disc-mech" | "disc-hydraulic"
drivetrain:       "1x" | "2x" | "3x" | "internal" | "belt"
interests:        ["touren","technik","sicherheit","recht","wartung","ernaehrung","wetter","navigation","kaufberatung","ebike-akku"]
budgetEur:        number | null   (für späteres Bike-Matching)
region:           string | null   (PLZ/Stadt, optional — sonst Geo-Consent)
updatedAt:        ISO string
```

Profil ist komplett client-seitig, exportierbar/löschbar. Wenn der Nutzer eingeloggt ist, **kann** das Profil zusätzlich in einer neuen Tabelle `public.bike_profiles` (1:1 zu `auth.users`) gespeichert werden — Phase 2, nicht jetzt nötig.

## 2. Zugang: prominenter Einstieg

Ein neuer auffälliger Block **„Mein RadProfil"** wird an zwei Stellen sichtbar:

- **Header-CTA (Desktop + Mobile)**: kleines Icon + Label „Mein Rad" neben Theme-Toggle. Pulsierender Dot, solange noch kein Profil existiert.
- **Homepage-Hero-Strip** zwischen „Magazin"-Block und Live Ticker: voller, redaktioneller Banner mit Headline, Subline und Button. Ändert sich, sobald Profil ausgefüllt ist, zu „Profil aktualisieren" + Mini-Zusammenfassung („54 cm · Gravel · 40 mm · 78 kg").

Route: `/mein-rad` (neues `src/routes/mein-rad.tsx`) — mehrstufiger, ruhiger Wizard (5 Schritte: Typ → Maße → Reifen/Antrieb → Fahrstil → Interessen). Speichert nach jedem Schritt lokal, kein Pflichtfeld außer Bike-Typ. Komplett tastatur- und mobilfreundlich.

## 3. Matching-Engine

Neues Modul `src/lib/recommendations.ts` mit einer reinen Funktion `scoreArticle(article, profile) → number`.

Score-Quellen pro Artikel:

- `category` (Nachrichten/Ratgeber/E-Bikes/Tests) ↔ `bikeTypes`, `interests`
- `seo_keywords` (kommagetrennt) → tokenisieren, gegen kuratierte Synonymliste matchen (z. B. „Reifendruck", „bar", „Tubeless" → Interesse „technik" + Tire-Match)
- Titel + Excerpt → leichte Keyword-Suche (lowercase, Diakritik-frei) mit gewichteten Begriffen je Profil-Feld (z. B. `frameSizeCm 54` boostet Artikel mit „Rahmengröße", „Geometrie")
- E-Bike-Profil → boost auf Kategorie „E-Bikes" + Keywords „Akku", „Reichweite", „Motor"
- MTB/Gravel → boost auf „Tubeless", „Federgabel", „Geometrie", „Schotter"
- Commute → boost auf „StVO", „Diebstahl", „Licht", „Wetter"
- Frische: leichter Recency-Bonus (max +1 für < 7 Tage)

Schwelle: nur Artikel ab Score ≥ X erscheinen. Reihenfolge nach Score, dann `published_at` desc. Max 8.

Alles deterministisch und testbar — keine LLM-Calls nötig, Performance kostenlos.

## 4. UI: „Für dich" unter dem Live Ticker

Neue Komponente `src/components/ForYouStrip.tsx`, eingebunden in `src/routes/index.tsx` **direkt nach dem Live-Ticker-Block** (Zeile ~232) und nur sichtbar, wenn:

- Profil existiert **und** mindestens 2 Match-Artikel vorhanden sind.

Design (im bestehenden redaktionellen Stil — Signal-Akzent, Eyebrow, Border):

```text
┌─ FÜR DICH RELEVANT  •  basierend auf deinem RadProfil  [Profil bearbeiten →]
├─────────────────────────────────────────────────────────────────────────────
│  ◆ Kachel 1     ◆ Kachel 2     ◆ Kachel 3     ◆ Kachel 4   (horiz. Scroll auf Mobile)
│  klein, dicht, mit Match-Reason-Chip: „Gravel · 40 mm"
```

Wenn kein Profil: stattdessen kompakter Call-to-Action-Streifen „Hol dir deine persönlichen Empfehlungen — RadProfil in 60 Sek. anlegen".

Artikel-Quelle: der bestehende Loader auf `index.tsx` lädt bereits News — `ForYouStrip` macht clientseitig einen erweiterten Fetch (z. B. letzte 60 Artikel) und filtert/sortiert über `scoreArticle`. Realtime-Subscription nicht nötig.

## 5. Wiederverwendung in Tools & Artikeln

- `tools.reifendruck.tsx`: Wenn Profil vorhanden, Reifenbreite und Gewicht vorausfüllen (mit Hinweis „aus deinem RadProfil — ändern").
- `tools.rahmengroesse.tsx`: Körpergröße/Schrittlänge vorausfüllen.
- `tools.kaufberater.tsx`: Profil als Startpunkt nutzen.
- Artikelseite (`artikel.$slug.tsx`): unter dem Artikel ein Mini-Block „Weitere Beiträge für dich" mit `scoreArticle`.

## 6. Phase 2 (später, hier nur erwähnt, nicht gebaut)

- Tabelle `public.bikes` (Modell, Geometrie, Reifenfreiheit, Preis, Bildlink). Funktion `scoreBike(bike, profile)`. Neue Sektion „Passende Räder" auf Homepage + eigene Route `/passende-raeder`.
- Optionaler Cloud-Sync des Profils für eingeloggte Nutzer.

## Technische Details

Neue Dateien:
- `src/lib/bike-profile.ts` — get/set/clear/subscribe-Hook (`useBikeProfile()`) auf Basis von `localStorage` + `storage`-Event, SSR-safe.
- `src/lib/recommendations.ts` — `scoreArticle`, `getTopMatches`, Synonym-Map.
- `src/components/ForYouStrip.tsx`
- `src/components/BikeProfileCTA.tsx` (Homepage-Banner)
- `src/components/BikeProfileBadge.tsx` (Header-Icon)
- `src/routes/mein-rad.tsx` (Wizard + Übersicht + Reset/Export)

Bestehende Dateien (kleine Edits):
- `src/routes/index.tsx` — `ForYouStrip` direkt nach Live Ticker, `BikeProfileCTA` oberhalb.
- `src/components/Header.tsx` + `src/components/MobileNav.tsx` — Profil-Badge.
- `src/routes/tools.reifendruck.tsx`, `tools.rahmengroesse.tsx`, `tools.kaufberater.tsx` — Profil-Vorfüllung.
- `src/routes/artikel.$slug.tsx` — „Weitere Beiträge für dich".

Keine Datenbankänderung in Phase 1. Keine zusätzlichen Secrets. Alles SSR-sicher, ohne LLM-Kosten.

## Ergebnis für den Nutzer

Ein einziger, ruhiger Profil-Wizard. Danach erscheinen oben auf der Startseite — sichtbar direkt unter dem Live Ticker — genau die Artikel, die zu seinem Rad und seinen Interessen passen, mit Begründung. Die Tools füllen sich selbst aus. Die Basis für „passende Räder" ist gelegt.
