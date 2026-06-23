import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import type { BikeRatings } from "@/lib/bike-types";

export function BikeRatingRadar({ ratings }: { ratings: BikeRatings }) {
  const data = [
    { key: "Komfort", v: ratings.comfort ?? 0 },
    { key: "Antrieb", v: ratings.drivetrain ?? 0 },
    { key: "Bremsen", v: ratings.brakes ?? 0 },
    { key: "Ausstattung", v: ratings.equipment ?? 0 },
    { key: "Preis-Leistung", v: ratings.value ?? 0 },
  ];
  if (data.every((d) => d.v === 0)) return null;
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="color-mix(in oklab, currentColor 18%, transparent)" />
          <PolarAngleAxis dataKey="key" tick={{ fontSize: 11, fill: "currentColor" }} />
          <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "currentColor" }} angle={90} />
          <Radar
            dataKey="v"
            stroke="var(--signal)"
            fill="var(--signal)"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
