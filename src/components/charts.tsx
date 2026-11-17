"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Single-series charts: one brand hue (validated ≥3:1 on white), recessive grid, hover tooltip, no legend.
const SERIES = "#7957E8";
const GRID = "#ECE8F7";
const AXIS = { fontSize: 12, fill: "#615A85" };

function TooltipBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-[var(--shadow-lift)]">
      <p className="font-semibold text-ink">{title}</p>
      <p className="text-muted">{value}</p>
    </div>
  );
}

export function ScoreTrendChart({ data }: { data: { label: string; title: string; score: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={AXIS} tickLine={false} axisLine={false} unit="%" />
          <Tooltip
            cursor={{ stroke: "#C9BEF2", strokeWidth: 1 }}
            content={({ active, payload }) =>
              active && payload?.[0] ? <TooltipBox title={payload[0].payload.title} value={`${payload[0].payload.label} · ${payload[0].value}%`} /> : null
            }
          />
          <Line type="monotone" dataKey="score" stroke={SERIES} strokeWidth={2} dot={{ r: 4, fill: SERIES, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Horizontal bars for accuracy (%) or counts per category. */
export function CategoryBarChart({ data, unit = "%", max }: { data: { name: string; value: number; detail?: string }[]; unit?: string; max?: number }) {
  return (
    <div className="w-full" style={{ height: Math.max(160, data.length * 44) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }} barCategoryGap={10}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" domain={[0, max ?? "auto"]} tick={AXIS} tickLine={false} axisLine={false} unit={unit} allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={130} tick={AXIS} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "#F5F2FF" }}
            content={({ active, payload }) =>
              active && payload?.[0] ? <TooltipBox title={payload[0].payload.name} value={payload[0].payload.detail ?? `${payload[0].value}${unit}`} /> : null
            }
          />
          <Bar dataKey="value" fill={SERIES} radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
