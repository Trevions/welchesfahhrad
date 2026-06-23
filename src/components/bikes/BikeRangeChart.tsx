import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import type { BikeEbike } from "@/lib/bike-types";

export function BikeRangeChart({ ebike }: { ebike: BikeEbike }) {
  const data = [
    { mode: "Turbo", km: ebike.range_turbo_km ?? 0, color: "#ef4444" },
    { mode: "Tour", km: ebike.range_tour_km ?? 0, color: "var(--signal)" },
    { mode: "Eco", km: ebike.range_eco_km ?? 0, color: "#10b981" },
  ];
  if (data.every((d) => d.km === 0)) return null;
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
          <XAxis type="number" stroke="currentColor" tick={{ fontSize: 11 }} />
          <YAxis dataKey="mode" type="category" stroke="currentColor" tick={{ fontSize: 12 }} width={70} />
          <Tooltip
            cursor={{ fill: "color-mix(in oklab, currentColor 8%, transparent)" }}
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }}
            formatter={(v: number) => [`${v} km`, "Reichweite"]}
          />
          <Bar dataKey="km" radius={[0, 2, 2, 0]} label={{ position: "right", fontSize: 11, fill: "currentColor", formatter: (v: number) => `${v} km` }}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
