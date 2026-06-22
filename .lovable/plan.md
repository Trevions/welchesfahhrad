## Ziel

Alle „BALD"-Tools auf der `/tools` Seite zu vollwertigen, funktionierenden Premium-Tools ausbauen. Jedes Tool bekommt eine eigene Route, präzise Berechnungslogik mit anerkannten Formeln, sauberes UI im bestehenden Design-System (signal-Akzent, font-display, Card-Stil) und SEO-Metadaten.

## Neue Routen

Alle unter `/tools/<slug>` mit jeweils eigener `head()`-Meta, JSON-LD `SoftwareApplication`, Breadcrumb zurück zu `/tools` und konsistentem Hero im Stil von `tools.fahrrad-wetter.tsx`.

### Rechner & Tools
1. **`/tools/reifendruck`** — Reifendruck-Rechner  
   Eingaben: Systemgewicht (Fahrer+Rad+Gepäck), Reifenbreite mm, Felgen-Innenmaulweite, Untergrund (Straße/Schotter/MTB), Schlauchtyp (TPU/Butyl/Tubeless). Formel: Berthoud/SRAM-basierte Tabelle + Gewichtsverteilung 40/60 vorn/hinten, Tubeless −0,3 bar, Off-road −10–15 %. Ausgabe: bar/psi vorn & hinten + Erklärung.

2. **`/tools/rahmengroesse`** — Rahmengrößen-Rechner  
   Eingaben: Körpergröße, Schrittlänge, Radtyp (Rennrad/MTB/Trekking/Gravel/City). Formel: Schrittlänge × Faktor (Rennrad 0,665, MTB 0,226, Trekking 0,66, Gravel 0,67). Ausgabe: cm + Inch + S/M/L/XL-Mapping pro Typ.

3. **`/tools/uebersetzung`** — Übersetzungs-Rechner  
   Eingaben: Kettenblatt(er), Ritzel(pakete), Reifengröße (ETRTO oder Standard 700×25C / 29×2.4 …), Trittfrequenz. Berechnet Entfaltung (m) und Geschwindigkeit (km/h) je Gang als Tabelle + Linien-Visualisierung.

4. **`/tools/ebike-reichweite`** — E-Bike Reichweite  
   Eingaben: Akku Wh, Unterstützungsmodus (Eco/Tour/Sport/Turbo → Wh/km Faktor), Profil (flach/wellig/bergig), Fahrergewicht, Gegenwind, Temperatur. Liefert km-Reichweite ± Bereich + Energie-Aufschlüsselung.

5. **`/tools/kalorien`** — Kalorien-Rechner  
   MET-basiert (Compendium of Physical Activities): kcal = MET × kg × Stunden. Eingaben: Gewicht, Dauer, Tempo/Intensität, Höhenmeter (Zuschlag), Untergrund. Ausgabe: kcal, kJ, Kohlenhydrat-/Wasserempfehlung.

6. **`/tools/jobrad-leasing`** — JobRad / Leasing-Rechner  
   Eingaben: Brutto-Listenpreis, Bruttogehalt, Steuerklasse (vereinfacht: 1/3/5), Laufzeit (36 Monate), Versicherung inkl. (ja/nein), Übernahmewert (10–18 %). Vergleicht Bar-Kauf vs. Gehaltsumwandlung, zeigt monatliche Netto-Belastung und Gesamtersparnis (transparente Annahmen mit Disclaimer).

### Wetter & Planung
7. **`/tools/luftqualitaet`** — Pollen & Luftqualität  
   Open-Meteo Air-Quality API (kein Key). Geolocation wie `useBikeWeather`. Zeigt European AQI, PM2.5/PM10, Ozon, NO₂, Birken-/Gräser-/Ambrosia-Pollen mit Empfehlung fürs Radfahren.

8. **`/tools/sonnenzeiten`** — Sonnenauf-/untergang  
   `sunrise-sunset.org` API (frei, kein Key) oder eigene Berechnung via NOAA-Algorithmus (clientseitig, keine externen Calls). Eingaben: Datum + Standort. Ausgabe: Sonnenaufgang, -untergang, bürgerliche/nautische Dämmerung, „Goldene Stunde", optimale Fahrzeit (Licht-Empfehlung).

9. **`/tools/tourenplaner`** — Tourenplaner  
   Verlinkt extern auf bestehende Karte `/karte` mit Hinweis-Sektion (Routenplanung erfolgt dort). Hier nur Info-Stub mit Features-Liste — oder vollwertig: BRouter-Web-Embed via iframe (kostenlos, openrouteservice-frei). Empfehlung: BRouter-Embed mit Vor-/Nachteilen erklärt.

### Wartung & Sicherheit
10. **`/tools/sicherheits-check`** — Sicherheits-Check  
    Interaktive Checkliste (StVZO §67 + ABS-Bremsen-Check): Beleuchtung, Reflektoren, Klingel, Bremsen vorn/hinten, Reifenprofil, Luftdruck, Schnellspanner, Lenker, Sattel, Kette. Mit Speichern in `localStorage`, Fortschrittsbalken, Druck-Button.

11. **`/tools/pannenhilfe`** — Pannenhilfe-Guide  
    Geführte Diagnose (Akkordion): Platten, Kette gerissen, Schaltung dejustiert, Bremse schleift, Speiche gebrochen, E-Bike-Fehler. Jeder Punkt mit Schritt-für-Schritt-Anleitung + Werkzeug-Hinweis.

12. **`/tools/werkzeug-liste`** — Werkzeug-Liste  
    Zwei Tabs: „Satteltasche" und „Werkstatt zuhause". Jeweils Checkliste mit Erklärung und optionaler Amazon-/Affil.-Lücke (vorerst rein redaktionell ohne Links).

13. **`/tools/wartungsintervalle`** — Wartungs-Intervalle  
    Eingaben: Radtyp (Stadt/Trekking/MTB/Rennrad/E-Bike), km/Jahr, Hauptsaison. Generiert Service-Plan: Kette messen alle X km, Bremsbeläge, Schaltzüge, Lager, große Inspektion. Tabellen-Ansicht + ICS-Export (optional Phase 2 — vorerst nur Tabelle).

### Ratgeber & Recht
14. **`/tools/stvo`** — StVO für Radfahrer  
    Strukturierter Artikel mit Sprung-Navigation: Radwegpflicht (§2 StVO), Ampeln, Einbahnstraßen, Gehweg, Kinder, Beleuchtung (StVZO §67), Promille (1,6 ‰ absolute Fahruntüchtigkeit / 0,3 ‰ relative), Handy. Quellen-Links zu gesetze-im-internet.de.

15. **`/tools/bussgeld`** — Bußgeld-Tabelle  
    Durchsuchbare Tabelle der aktuellen Bußgelder (Stand 2024 Bußgeldkatalog): Rote Ampel, Gehweg, Handy, Alkohol, Beleuchtung, falsche Fahrtrichtung etc. Spalten: Verstoß, €, Punkte, Fahrverbot. Filter + Suche.

16. **`/tools/diebstahlschutz`** — Diebstahlschutz  
    Ratgeber-Stil: Schlossarten (Bügel-, Falt-, Ketten-, Rahmenschloss) mit Sicherheitsstufen (ART/Sold Secure/VdS), richtige Abstell-Technik (Bilder/Diagramme aus reinen CSS-Illustrationen), Codierung, Versicherungspflicht. Checkliste am Ende.

17. **`/tools/versicherung`** — Versicherungs-Vergleich  
    Statische Vergleichstabelle (redaktionell gepflegt) der wichtigsten Fahrrad-/E-Bike-Versicherer (Wertgarantie, Ammerländer, Hepster, Coya, Bikmo): Prämie ab, Diebstahl-Deckung, Akkudefekt, Selbstbeteiligung, Vor-/Nachteile. Sortierbar. Disclaimer „Stand:" Datum.

### Kaufberatung
18. **`/tools/kaufberater`** — Kaufberater-Quiz  
    7-Fragen-Quiz (Mehrstufiges Formular, Fortschrittsbalken): Einsatzzweck, Strecke/Tag, Untergrund, Budget, E-Bike ja/nein, Gepäck, Sportlichkeit. Ergebnis: Empfohlene Kategorie (City/Trekking/Gravel/Rennrad/MTB/E-Trekking…) + Begründung + Link zu passenden Artikeln im `/ratgeber`.

19. **`/tools/vergleich`** — Vergleichstool  
    Side-by-Side-Vergleich von bis zu 3 Fahrrad-Modellen: Eingabefelder oder Auswahl aus kuratierter Liste (10–15 Beispielmodelle hartcodiert). Spalten: Preis, Gewicht, Schaltung, Bremsen, Reifen, Gewicht, Garantie. Differenzen werden hervorgehoben.

20. **`/tools/foerderung`** — Förderungs-Finder  
    Filter nach Bundesland → zeigt verfügbare Zuschüsse (Lastenrad, E-Bike, JobRad-Boni). Datenquelle: kuratiertes JSON in `src/lib/foerderung.ts` (manuell gepflegt, redaktionell — keine externe API). Karten-Layout pro Förderung mit Höchstbetrag, Voraussetzungen, Link.

## Implementierung — Phasen

**Phase 1 (dieser Plan, eine Implementierung):** Alle 20 Tools als funktionsfähige Routen.
- Tool-spezifische Logik als reine TypeScript-Funktionen in `src/lib/tools/<slug>.ts` (testbar, deterministisch).
- UI-Komponenten in den Routen-Dateien selbst (jede Route ≤ 400 Zeilen, sonst Sub-Komponente in `src/components/tools/`).
- Gemeinsame Bausteine: `<ToolShell>` (Hero + Breadcrumb + Container) in `src/components/tools/ToolShell.tsx`.
- Open-Meteo Air Quality + Sonnenzeiten direkt im Browser (kein Backend nötig).
- `tools.index.tsx`: alle `soon: true` entfernen, jedes Tool bekommt sein `to: "/tools/<slug>"`.

## Technisches

- Keine neuen Dependencies. Alle Formeln/Daten lokal.
- Keine Backend-Änderungen, keine Datenbank, keine Edge Functions.
- Geolocation-Tools (Luftqualität, Sonnenzeiten) folgen dem Muster aus `useBikeWeather` mit `PermissionCard`/`LoadingCard`/`ErrorCard`.
- Datentabellen (Bußgeld, Versicherung, Förderung) als typisierte Konstanten in `src/lib/tools/data/`.
- Alle Berechnungen mit klaren Quell-Hinweisen im UI („Formel basiert auf …") und Stand-Datum bei kuratierten Daten.
- Disclaimer auf JobRad/Versicherung/Bußgeld: „Keine Rechts-/Steuerberatung, Stand …".
- SEO: jede Route eigene `head()` mit Titel `<Tool> | radmap.de`, Beschreibung, JSON-LD `SoftwareApplication` bzw. `Article`.

## Out of Scope

- Echte Vergleichs-API für Fahrräder/Versicherungen (zu pflege-intensiv).
- ICS-Export für Wartungs-Intervalle (Phase 2).
- Tourenplaner als eigenständige Karte (Verweis auf `/karte` reicht; alternativ BRouter-iframe als minimale Lösung).
- Speichern von Eingaben in der Datenbank — alles `localStorage` wo nötig.

## Frage vor Implementierung

Der Plan ist groß (20 neue Routen + Datenmodule). Soll ich:
**(A)** alles in einer Implementierung bauen (großer Pull, viele Dateien), oder  
**(B)** in 4 Blöcken nach Kategorie (Rechner → Wetter → Wartung → Recht+Kauf), damit du Zwischenstände prüfen kannst?
