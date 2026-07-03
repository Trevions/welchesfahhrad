// Zentrale Verwaltung des „Zuletzt geprüft"-Datums pro Tool.
// Wird von toolHead() für schema.org dateModified UND von ToolReviewedBy
// als sichtbarer Redaktions-Stempel gelesen. Datum bei jeder inhaltlichen
// Prüfung anpassen (ISO 8601, YYYY-MM-DD).

export const REVIEWED: Record<string, string> = {
  "reifendruck-rechner": "2026-07-03",
  "rahmengroessen-rechner": "2026-07-03",
  "uebersetzung-rechner": "2026-07-03",
  "ebike-reichweite-rechner": "2026-07-03",
  "kalorien-rechner": "2026-07-03",
  "jobrad-leasing-rechner": "2026-07-03",
  "ebike-foerderung-rechner": "2026-07-03",
  "fahrrad-vergleich": "2026-07-03",
};

export function reviewedAt(slug: string): string {
  return REVIEWED[slug] ?? "2026-07-03";
}

export function formatReviewedDe(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];
  const mi = Math.max(1, Math.min(12, parseInt(m ?? "1", 10))) - 1;
  return `${parseInt(d ?? "1", 10)}. ${months[mi]} ${y}`;
}
