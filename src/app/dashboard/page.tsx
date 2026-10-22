import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { getDashboardMetrics } from "@/lib/metrics";
import { requireUser } from "@/lib/auth";
import { cn, formatPrice, formatTime, SOURCE_LABELS, STATUS_LABELS } from "@/lib/utils";
import { Card, CardTitle, PageHeader, SourceBadge, StatusBadge, EmptyState } from "@/components/dashboard/ui";
import { BookingsBySourceChart, PeakHoursHeatmap, RevenueChart, ServiceBars } from "@/components/dashboard/charts";

const RANGES = [7, 30, 90] as const;

function Delta({ value, unit = "%", invert = false }: { value: number | null; unit?: string; invert?: boolean }) {
  if (value === null) return <span className="text-xs font-semibold text-muted">nuevo</span>;
  const rounded = Math.round(value * 10) / 10;
  const up = rounded > 0;
  const good = invert ? !up : up;
  const Icon = rounded === 0 ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-bold",
        rounded === 0 ? "text-muted" : good ? "text-emerald-700" : "text-rose-700",
      )}
    >
      <Icon className="size-3.5" />
      {Math.abs(rounded)}
      {unit}
    </span>
  );
}

function Kpi({
  label,
  value,
  delta,
  accent,
  unit,
  invert,
}: {
  label: string;
  value: string;
  delta: number | null;
  accent: string;
  unit?: string;
  invert?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      <span className={cn("absolute right-0 top-0 h-full w-1.5", accent)} />
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="font-display mt-2 text-[clamp(1.75rem,2.3vw,2.25rem)] text-navy">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
        <Delta value={delta} unit={unit} invert={invert} /> vs periodo anterior
      </p>
    </Card>
  );
}

export default async function DashboardHome({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser();
  const sp = await searchParams;
  const range = RANGES.includes(Number(sp.rango) as 7) ? Number(sp.rango) : 30;
  const m = await getDashboardMetrics(range);
  const totalStatus = Object.values(m.statusCount).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-7xl">
      {sp.denied && (
        <p className="mb-6 rounded-2xl bg-tangerine/15 px-4 py-3 text-sm font-semibold text-[#b8410f]">
          Esa sección es solo para administradores.
        </p>
      )}
      <PageHeader
        title={`Hola, ${user.name.split(" ")[0]} 🐾`}
        subtitle="Así va Fido&Felix"
        actions={
          <div className="flex rounded-full border border-line bg-paper p-1 text-sm font-semibold">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/dashboard?rango=${r}`}
                className={cn("rounded-full px-4 py-1.5", r === range ? "bg-navy text-paper" : "text-muted hover:text-navy")}
              >
                {r} días
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Reservas" value={String(m.kpis.bookings.value)} delta={m.kpis.bookings.delta} accent="bg-chart-1" />
        <Kpi label="Ingresos (completadas)" value={formatPrice(m.kpis.revenue.value)} delta={m.kpis.revenue.delta} accent="bg-sun" />
        <Kpi label="Ticket promedio" value={formatPrice(m.kpis.avgTicket.value)} delta={m.kpis.avgTicket.delta} accent="bg-sky" />
        <Kpi label="Clientes nuevos" value={String(m.kpis.newClients.value)} delta={m.kpis.newClients.delta} accent="bg-mint" />
        <Kpi
          label="Vía WhatsApp"
          value={`${Math.round(m.kpis.whatsappShare.value)}%`}
          delta={m.kpis.whatsappShare.delta}
          unit=" pts"
          accent="bg-[#25D366]"
        />
        <Kpi
          label="Cancelación / no-show"
          value={`${Math.round(m.kpis.cancelRate.value)}%`}
          delta={m.kpis.cancelRate.delta}
          unit=" pts"
          invert
          accent="bg-bubble"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card className="bg-navy text-paper md:col-span-1">
          <p className="text-xs font-semibold text-paper/60">Próximas reservas activas</p>
          <p className="font-display mt-2 text-6xl text-sun">{m.pipeline.count}</p>
          <p className="mt-2 text-sm text-paper/80">
            Valor proyectado <b className="text-paper">{formatPrice(m.pipeline.value)}</b>
          </p>
          <Link href="/dashboard/reservas?estado=PENDING" className="mt-4 inline-flex rounded-full bg-sun px-4 py-1.5 text-xs font-bold text-navy">
            {m.pipeline.pending} por confirmar →
          </Link>
        </Card>
        <Card className="md:col-span-2">
          <CardTitle hint={`Últimos ${range} días`}>Ingresos por día</CardTitle>
          <RevenueChart data={m.daily} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardTitle hint="Reservas activas por canal de origen">Reservas por día</CardTitle>
          <BookingsBySourceChart data={m.daily} />
        </Card>
        <Card>
          <CardTitle hint="Ingresos · nº reservas">Servicios top</CardTitle>
          <ServiceBars data={m.services} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardTitle hint="Cuándo llegan más peludos">Horas pico</CardTitle>
          <PeakHoursHeatmap heat={m.heat} />
        </Card>
        <Card>
          <CardTitle hint={`${totalStatus} en el periodo`}>Estados</CardTitle>
          <ul className="space-y-2.5">
            {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((s) => {
              const n = m.statusCount[s] ?? 0;
              return (
                <li key={s} className="flex items-center justify-between gap-2">
                  <StatusBadge status={s} />
                  <span className="text-sm text-muted">
                    <b className="text-navy">{n}</b> · {totalStatus ? Math.round((n / totalStatus) * 100) : 0}%
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 rounded-2xl bg-cream p-3 text-sm">
            <p className="text-muted">Clientes que repiten</p>
            <p className="font-display text-3xl text-navy">{Math.round(m.returningRate)}%</p>
          </div>
          <ul className="mt-4 space-y-1 text-xs text-muted">
            {m.sourceTotals.map((s) => (
              <li key={s.source} className="flex justify-between">
                <span>{SOURCE_LABELS[s.source]}</span>
                <b className="text-navy">{s.count}</b>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <CardTitle hint={<Link href="/dashboard/agenda" className="font-semibold text-navy underline">Ver agenda</Link>}>
          Hoy
        </CardTitle>
        {m.today.length ? (
          <ul className="divide-y divide-line">
            {m.today.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="font-display w-16 text-2xl text-navy">{formatTime(b.startsAt)}</span>
                <div className="min-w-40 flex-1">
                  <p className="font-semibold text-navy">
                    {b.pet?.name ?? "—"} <span className="font-normal text-muted">· {b.client.name}</span>
                  </p>
                  <p className="text-xs text-muted">{b.service.name}</p>
                </div>
                <SourceBadge source={b.source} />
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Sin citas hoy" text="Cuando entren reservas para hoy aparecerán aquí." />
        )}
      </Card>
    </div>
  );
}
