import type { WeatherCurrent, WeatherHour } from "@/hooks/use-bike-weather";

export type TipSeverity = "info" | "warn" | "danger" | "good";

export type BikeTip = {
  id: string;
  severity: TipSeverity;
  icon: string;
  title: string;
  body: string;
};

export function buildBikeTips(c: WeatherCurrent, hourly: WeatherHour[]): BikeTip[] {
  const tips: BikeTip[] = [];

  // --- Temperature: heat ---
  if (c.temperature >= 30 || c.apparent >= 32) {
    tips.push({
      id: "heat-extreme",
      severity: "danger",
      icon: "🥵",
      title: "Sehr heiß — Hitzeschutz wichtig",
      body:
        "Trinke alle 15–20 Minuten 150–250 ml Wasser, besser mit Elektrolyten. Fahre früh morgens oder nach 18 Uhr, meide Mittagshitze. Helle, atmungsaktive Kleidung, Sonnenbrille, Helm mit Belüftung. Bei Schwindel, Übelkeit oder Kopfschmerzen sofort in den Schatten und Tempo raus.",
    });
  } else if (c.temperature >= 26) {
    tips.push({
      id: "heat-warm",
      severity: "warn",
      icon: "🌡️",
      title: "Warm — genug trinken",
      body:
        "Mindestens 500–750 ml Wasser pro Stunde mitnehmen. Helle Kleidung, regelmäßige Pausen im Schatten, langsamer anfahren und Puls beobachten.",
    });
  }

  // --- Temperature: cold ---
  if (c.temperature <= 0 || c.apparent <= -2) {
    tips.push({
      id: "cold-frost",
      severity: "danger",
      icon: "🥶",
      title: "Frost — Eis- und Sturzgefahr",
      body:
        "Mit überfrierender Nässe rechnen, besonders auf Brücken, Schatten und Laub. Reifendruck etwas senken (ca. 0,3–0,5 bar) für mehr Grip. Winterhandschuhe, Mütze unter dem Helm, Buff für die Atemwege. Akku-Reichweite beim E-Bike sinkt um bis zu 40 %.",
    });
  } else if (c.temperature <= 8) {
    tips.push({
      id: "cold-cool",
      severity: "warn",
      icon: "🧥",
      title: "Kühl — Zwiebellook",
      body:
        "Drei Schichten: atmungsaktiv, isolierend, winddicht. Lange Handschuhe, Überschuhe und Stirnband sind Gold wert. Erst 5 Minuten ruhig einfahren, damit die Muskeln auf Temperatur kommen.",
    });
  }

  // --- Rain ---
  const rainSoon = hourly.slice(0, 3).some((h) => h.precip > 0.3 || h.precipProb >= 60);
  if (c.precip > 0.5 || c.precipProb >= 70) {
    tips.push({
      id: "rain-now",
      severity: "danger",
      icon: "🌧️",
      title: "Regen — Bremsweg verdoppelt sich",
      body:
        "Frühzeitiger bremsen, in Kurven aufrechter fahren, weiß markierte Linien und Schienen meiden — sie werden spiegelglatt. Regenjacke mit reflektierenden Elementen, Schutzbleche, klare Brille. Licht an, auch tagsüber.",
    });
  } else if (rainSoon) {
    tips.push({
      id: "rain-soon",
      severity: "warn",
      icon: "🌦️",
      title: "Regen in den nächsten 3 Stunden",
      body:
        "Pack eine kompakte Regenjacke und Überzieher für die Schuhe ein. Plane eine Route mit Unterstellmöglichkeiten und vermeide ungesicherte Schotterpassagen.",
    });
  }

  // --- Wind ---
  if (c.windGust >= 60 || c.windSpeed >= 40) {
    tips.push({
      id: "wind-storm",
      severity: "danger",
      icon: "🌬️",
      title: "Sturmböen — Tour besser verschieben",
      body:
        "Querböen können dich seitlich versetzen, besonders auf Brücken, an Feldwegen und neben LKW. Hohe Laufräder und Anhänger meiden. Im Wald herrscht Astbruchgefahr — lieber bebaute Strecken wählen oder Tour absagen.",
    });
  } else if (c.windSpeed >= 25) {
    tips.push({
      id: "wind-strong",
      severity: "warn",
      icon: "💨",
      title: "Starker Wind — Gegenwind einplanen",
      body:
        "Plane den Hinweg gegen den Wind und den Rückweg mit Rückenwind. Tiefere Position einnehmen, kleinerer Gang, gleichmäßig treten. Bei Querwind beide Hände am Lenker.",
    });
  }

  // --- UV ---
  if (c.uv >= 7) {
    tips.push({
      id: "uv-high",
      severity: "warn",
      icon: "🧴",
      title: "Hoher UV-Index — Sonnenschutz",
      body:
        "LSF 30+ auf Nacken, Ohren, Arme und Waden auftragen, alle 2 Stunden nachlegen. UV-Sportbrille und Trikot mit langen Ärmeln schützen besser als Sonnencreme allein.",
    });
  }

  // --- Visibility / fog ---
  if (c.visibility < 1000) {
    tips.push({
      id: "fog",
      severity: "danger",
      icon: "🌫️",
      title: "Schlechte Sicht — gesehen werden",
      body:
        "Front- und Rücklicht im Blinkmodus, reflektierende Weste, helle Kleidung. Tempo reduzieren, defensiv fahren, Hauptstraßen mit Radweg bevorzugen.",
    });
  }

  // --- Thunderstorm codes 95/96/99 ---
  if ([95, 96, 99].includes(c.weatherCode)) {
    tips.push({
      id: "thunder",
      severity: "danger",
      icon: "⛈️",
      title: "Gewitter — nicht auf das Rad",
      body:
        "Offene Felder, Hügelkuppen und einzelne Bäume meiden. Tiefster Punkt im Gelände, hocken statt liegen, Metall ablegen. In Gebäuden oder Autos abwarten, mindestens 30 Minuten nach dem letzten Donner.",
    });
  }

  // --- Humidity comfort note when hot ---
  if (c.temperature >= 22 && c.humidity >= 75) {
    tips.push({
      id: "humid",
      severity: "info",
      icon: "💦",
      title: "Schwül — Kreislauf schonen",
      body:
        "Hohe Luftfeuchte erschwert das Schwitzen. Niedrigere Intensität wählen, mehr Pausen, isotonische Getränke. Achte auf erste Anzeichen von Überhitzung.",
    });
  }

  // --- Night / low light ---
  if (!c.isDay) {
    tips.push({
      id: "night",
      severity: "warn",
      icon: "🌙",
      title: "Dunkelheit — sichtbar bleiben",
      body:
        "StVZO-konformes Front- (mind. 10 Lux) und Rücklicht, Reflektoren an Pedalen und Speichen prüfen. Reflektorweste oder helle Jacke trägt 140 m Sichtbarkeit gegenüber 25 m bei dunkler Kleidung. Tempo um 20 % reduzieren, mit Wild und Fußgängern rechnen.",
    });
  }

  // --- Post-rain hazards ---
  const recentRain = hourly.slice(0, 1).some((h) => h.precip > 0.2) || c.precip > 0.2;
  if (!recentRain && c.humidity >= 85 && c.temperature < 20) {
    tips.push({
      id: "wet-roads",
      severity: "info",
      icon: "🍃",
      title: "Feuchte Fahrbahn — Vorsicht in Kurven",
      body:
        "Nasses Laub, Gullideckel, Zebrastreifen und Holzbrücken sind rutschig wie Eis. Aufrecht durch Kurven, früh und sanft bremsen, Hinterrad-Anteil erhöhen. Splitt und Rollsplitt auf Radwegen aktiv ausweichen.",
    });
  }

  // --- Group / safety baseline ---
  tips.push({
    id: "share",
    severity: "info",
    icon: "📍",
    title: "Tour teilen — Sicherheit zuerst",
    body:
      "Teile Route und geplante Ankunftszeit mit einer Vertrauensperson (Live-Standort via Messenger). Helm, Handy geladen, Notfallkontakt auf dem Sperrbildschirm, kleines Erste-Hilfe-Set und Flickzeug dabei. Bei Solo-Touren defensive Linie wählen.",
  });

  // --- Good day ---
  if (tips.length === 0) {
    tips.push({
      id: "perfect",
      severity: "good",
      icon: "✅",
      title: "Top Bedingungen — los geht's",
      body:
        "Wenig Wind, angenehme Temperatur, niedriges Regenrisiko. Helm auf, Reifendruck prüfen (Rennrad 6–8 bar, MTB 1,8–2,5 bar, Trekking 3,5–4,5 bar) und genießen.",
    });
  }

  // Always include a hydration baseline reminder when warm-ish
  if (c.temperature >= 18 && !tips.some((t) => t.id.startsWith("heat"))) {
    tips.push({
      id: "hydrate",
      severity: "info",
      icon: "💧",
      title: "Trinken nicht vergessen",
      body:
        "Faustregel: 500 ml pro Stunde, auch wenn du keinen Durst hast. Kleine Schlucke alle 15 Minuten halten den Kreislauf stabil.",
    });
  }

  return tips;
}

export const severityClasses: Record<TipSeverity, string> = {
  good: "border-emerald-400/40 bg-emerald-400/5 text-emerald-300",
  info: "border-border bg-card text-foreground",
  warn: "border-amber-400/40 bg-amber-400/5 text-amber-200",
  danger: "border-red-500/40 bg-red-500/5 text-red-200",
};
