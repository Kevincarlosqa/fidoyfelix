"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { cn, formatPrice, SOURCE_LABELS } from "@/lib/utils";
import type { DayPoint } from "@/lib/metrics";

// Paleta categórica validada (orden fijo; el color sigue al canal, nunca al rango).
const SOURCE_COLORS = {
  WHATSAPP: "#1f4fb4",
  WEB: "#e8590c",
  DASHBOARD: "#4fb3e8",
  PHONE: "#c2185b",
} as const;
const SOURCES = Object.keys(SOURCE_COLORS) as (keyof typeof SOURCE_COLORS)[];

const AXIS = { fontSize: 11, fill: "#5b6687" };
const SURFACE = "#fffdf8";

function TooltipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-bold text-navy">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-2 text-muted">
          {r.color && <span className="size-2.5 rounded-sm" style={{ background: r.color }} />}
          <span className="flex-1">{r.label}</span>
          <span className="font-bold text-navy">{r.value}</span>
        </p>
      ))}
    </div>
  );
}

export function BookingsBySourceChart({ data }: { data: DayPoint[] }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const totals = SOURCES.map((s) => ({ s, n: data.reduce((acc, d) => acc + d[s], 0) }));
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Leyenda">
          {totals.map(({ s, n }) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: SOURCE_COLORS[s] }} />
              {SOURCE_LABELS[s]} <b className="text-navy">{n}</b>
            </li>
          ))}
        </ul>
        <ViewToggle view={view} setView={setView} />
      </div>
      {view === "chart" ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="18%">
              <CartesianGrid vertical={false} stroke="#ece6da" />
              <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "rgba(19,33,74,0.06)" }}
                content={(p: TooltipContentProps<ValueType, NameType>) =>
                  p.active && p.payload?.length ? (
                    <TooltipBox
                      title={String(p.label)}
                      rows={SOURCES.map((s) => ({
                        label: SOURCE_LABELS[s],
                        value: String((p.payload[0].payload as DayPoint)[s]),
                        color: SOURCE_COLORS[s],
                      }))}
                    />
                  ) : null
                }
              />
              {SOURCES.map((s, i) => (
                <Bar
                  key={s}
                  dataKey={s}
                  stackId="a"
                  fill={SOURCE_COLORS[s]}
                  stroke={SURFACE}
                  strokeWidth={1}
                  radius={i === SOURCES.length - 1 ? [4, 4, 0, 0] : 0}
                  name={SOURCE_LABELS[s]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <DataTable
          head={["Día", ...SOURCES.map((s) => SOURCE_LABELS[s]), "Total"]}
          rows={data.map((d) => [d.label, ...SOURCES.map((s) => String(d[s])), String(d.total)])}
        />
      )}
    </div>
  );
}

export function RevenueChart({ data }: { data: DayPoint[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f4fb4" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#1f4fb4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#ece6da" />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
          <YAxis
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(v: number) => (v >= 1000 ? `S/${Math.round(v / 1000)}k` : `S/${v}`)}
          />
          <Tooltip
            cursor={{ stroke: "#13214a", strokeDasharray: "3 3" }}
            content={(p: TooltipContentProps<ValueType, NameType>) =>
              p.active && p.payload?.length ? (
                <TooltipBox
                  title={String(p.label)}
                  rows={[{ label: "Ingresos", value: formatPrice(Number(p.payload[0].value)), color: "#1f4fb4" }]}
                />
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#1f4fb4"
            strokeWidth={2}
            fill="url(#rev)"
            activeDot={{ r: 5, stroke: SURFACE, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Barras horizontales con etiqueta directa (un solo color: una sola serie). */
export function ServiceBars({ data }: { data: { name: string; revenue: number; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  if (!data.length) return <p className="text-sm text-muted">Sin datos en este periodo.</p>;
  return (
    <ul className="space-y-3">
      {data.slice(0, 8).map((d) => (
        <li key={d.name} className="group" title={`${d.name}: ${formatPrice(d.revenue)} · ${d.count} reservas`}>
          <div className="mb-1 flex justify-between gap-2 text-xs">
            <span className="truncate font-semibold text-navy">{d.name}</span>
            <span className="shrink-0 text-muted">
              <b className="text-navy">{formatPrice(d.revenue)}</b> · {d.count}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-cream">
            <div
              className="h-full rounded-full bg-chart-1 transition-all group-hover:bg-navy"
              style={{ width: `${Math.max(2, (d.revenue / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Mapa de calor día × hora (secuencial de un solo tono). */
export function PeakHoursHeatmap({ heat }: { heat: number[][] }) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00–19:00
  const max = Math.max(1, ...heat.flat());
  const [hover, setHover] = useState<string | null>(null);
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-[3px] text-[10px]">
          <thead>
            <tr>
              <th />
              {hours.map((h) => (
                <th key={h} className="font-medium text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.map((d) => (
              <tr key={d}>
                <th className="pr-1 text-left font-semibold text-muted">{DAY_SHORT[d]}</th>
                {hours.map((h) => {
                  const v = heat[d][h];
                  const t = v / max;
                  return (
                    <td
                      key={h}
                      onMouseEnter={() => setHover(`${DAY_SHORT[d]} ${h}:00 — ${v} reservas`)}
                      onMouseLeave={() => setHover(null)}
                      className="h-6 min-w-6 rounded-[4px]"
                      style={{ background: v ? `rgba(31, 79, 180, ${0.12 + t * 0.88})` : "#f3eee5" }}
                      aria-label={`${DAY_SHORT[d]} ${h}:00: ${v} reservas`}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{hover ?? "Pasa el cursor sobre una celda"}</span>
        <span className="flex items-center gap-1">
          Menos
          {[0.15, 0.4, 0.65, 0.9].map((o) => (
            <span key={o} className="size-3 rounded-sm" style={{ background: `rgba(31,79,180,${o})` }} />
          ))}
          Más
        </span>
      </div>
    </div>
  );
}

function ViewToggle({ view, setView }: { view: "chart" | "table"; setView: (v: "chart" | "table") => void }) {
  return (
    <div className="flex rounded-full border border-line p-0.5 text-xs font-semibold">
      {(["chart", "table"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setView(v)}
          className={cn("rounded-full px-3 py-1", view === v ? "bg-navy text-paper" : "text-muted")}
        >
          {v === "chart" ? "Gráfico" : "Tabla"}
        </button>
      ))}
    </div>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div data-lenis-prevent className="max-h-64 overflow-auto rounded-xl border border-line">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-cream">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-bold text-navy">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-1.5 text-muted">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
