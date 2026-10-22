import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { BUSINESS } from "@/lib/config";
import { isValidDateKey } from "@/lib/booking";
import { addDaysKey, businessDateTime, cn, formatTime, toBusinessDateKey, todayKey, weekdayOf, SPECIES_LABELS } from "@/lib/utils";
import { PageHeader, StatusBadge, btnSecondary } from "@/components/dashboard/ui";

const PX_PER_MIN = 1.6;
const SERVICE_COLORS: Record<string, string> = {
  GROOMING: "bg-sun/70 border-sun-deep",
  SPA: "bg-bubble/30 border-bubble",
  HEALTH: "bg-sky/30 border-sky",
  TRAINING: "bg-mint/40 border-mint",
  DAYCARE: "bg-tangerine/25 border-tangerine",
  WALKING: "bg-lilac/40 border-lilac",
};

function minutesOf(d: Date) {
  const [h, m] = formatTime(d).split(":").map(Number);
  return h * 60 + m;
}

export default async function AgendaPage({ searchParams }: PageProps<"/dashboard/agenda">) {
  await requireUser();
  const sp = await searchParams;
  const date = typeof sp.fecha === "string" && isValidDateKey(sp.fecha) ? sp.fecha : todayKey();

  // Semana (lunes a domingo) que contiene la fecha
  const wd = weekdayOf(date);
  const monday = addDaysKey(date, wd === 0 ? -6 : 1 - wd);
  const week = Array.from({ length: 7 }, (_, i) => addDaysKey(monday, i));

  const [dayBookings, weekBookings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        startsAt: { gte: businessDateTime(date), lt: businessDateTime(addDaysKey(date, 1)) },
        status: { notIn: ["CANCELLED"] },
      },
      include: { client: true, pet: true, service: true, assignedTo: { select: { name: true } } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        startsAt: { gte: businessDateTime(monday), lt: businessDateTime(addDaysKey(monday, 7)) },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
      select: { startsAt: true },
    }),
  ]);

  const countByDay = new Map<string, number>();
  for (const b of weekBookings) {
    const k = toBusinessDateKey(b.startsAt);
    countByDay.set(k, (countByDay.get(k) ?? 0) + 1);
  }

  const hours = BUSINESS.hours[wd] ?? { open: "09:00", close: "19:00" };
  const openMin = Number(hours.open.slice(0, 2)) * 60;
  const closeMin = Number(hours.close.slice(0, 2)) * 60 + Number(hours.close.slice(3));
  const firstStart = dayBookings.length ? Math.min(openMin, ...dayBookings.map((b) => minutesOf(b.startsAt))) : openMin;
  const dayStart = Math.floor(firstStart / 60) * 60;
  const dayEnd = Math.max(closeMin, ...dayBookings.map((b) => minutesOf(b.endsAt)));

  // Asignación de carriles (greedy) para reservas que se traslapan
  const lanesEnd: number[] = [];
  const placed = dayBookings.map((b) => {
    const s = minutesOf(b.startsAt);
    const e = minutesOf(b.endsAt);
    let lane = lanesEnd.findIndex((end) => end <= s);
    if (lane === -1) {
      lane = lanesEnd.length;
      lanesEnd.push(e);
    } else lanesEnd[lane] = e;
    return { b, s, e, lane };
  });
  const laneCount = Math.max(BUSINESS.capacity, lanesEnd.length);

  const longDate = new Intl.DateTimeFormat("es-PE", {
    timeZone: BUSINESS.timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(businessDateTime(date, "12:00"));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Agenda"
        subtitle={`${longDate} · ${dayBookings.length} citas`}
        actions={
          <>
            <Link href={`/dashboard/agenda?fecha=${addDaysKey(date, -7)}`} className={btnSecondary} aria-label="Semana anterior">
              <ChevronLeft className="size-4" />
            </Link>
            <Link href="/dashboard/agenda" className={btnSecondary}>Hoy</Link>
            <Link href={`/dashboard/agenda?fecha=${addDaysKey(date, 7)}`} className={btnSecondary} aria-label="Semana siguiente">
              <ChevronRight className="size-4" />
            </Link>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-7 gap-2">
        {week.map((d) => {
          const dt = businessDateTime(d, "12:00");
          const active = d === date;
          const closed = !BUSINESS.hours[weekdayOf(d)];
          return (
            <Link
              key={d}
              href={`/dashboard/agenda?fecha=${d}`}
              className={cn(
                "rounded-2xl border p-2 text-center transition sm:p-3",
                active ? "border-navy bg-navy text-paper" : "border-line bg-paper text-navy hover:border-navy",
                closed && !active && "opacity-50",
              )}
            >
              <p className="text-[11px] font-semibold uppercase opacity-70">
                {new Intl.DateTimeFormat("es-PE", { timeZone: BUSINESS.timeZone, weekday: "short" }).format(dt)}
              </p>
              <p className="font-display text-3xl">{d.slice(8)}</p>
              <p className={cn("text-[11px] font-bold", active ? "text-sun" : "text-muted")}>
                {closed ? "Cerrado" : `${countByDay.get(d) ?? 0} citas`}
              </p>
            </Link>
          );
        })}
      </div>

      <div data-lenis-prevent className="overflow-x-auto rounded-3xl border border-line bg-paper p-4">
        <div className="relative flex min-w-[640px]" style={{ height: (dayEnd - dayStart) * PX_PER_MIN + 8 }}>
          <div className="relative w-14 shrink-0">
            {Array.from({ length: Math.ceil((dayEnd - dayStart) / 60) + 1 }, (_, i) => (
              <span
                key={i}
                className="absolute -translate-y-1/2 text-xs font-semibold text-muted"
                style={{ top: i * 60 * PX_PER_MIN }}
              >
                {String(dayStart / 60 + i).padStart(2, "0")}:00
              </span>
            ))}
          </div>
          <div className="relative flex-1">
            {Array.from({ length: Math.ceil((dayEnd - dayStart) / 30) + 1 }, (_, i) => (
              <div
                key={i}
                className={cn("absolute inset-x-0 border-t", i % 2 ? "border-dashed border-line/60" : "border-line")}
                style={{ top: i * 30 * PX_PER_MIN }}
              />
            ))}
            {date === todayKey() && (() => {
              const now = minutesOf(new Date());
              if (now < dayStart || now > dayEnd) return null;
              return (
                <div className="absolute inset-x-0 z-10 flex items-center" style={{ top: (now - dayStart) * PX_PER_MIN }}>
                  <span className="size-2.5 -translate-x-1 rounded-full bg-tangerine" />
                  <span className="h-0.5 flex-1 bg-tangerine" />
                </div>
              );
            })()}
            {placed.map(({ b, s, e, lane }) => (
              <div
                key={b.id}
                className={cn(
                  "absolute overflow-hidden rounded-xl border-l-4 p-2 text-xs text-navy shadow-sm",
                  SERVICE_COLORS[b.service.category] ?? "bg-cream border-navy",
                  b.status === "NO_SHOW" && "opacity-50",
                )}
                style={{
                  top: (s - dayStart) * PX_PER_MIN + 1,
                  height: Math.max(28, (e - s) * PX_PER_MIN - 3),
                  left: `calc(${(lane / laneCount) * 100}% + 4px)`,
                  width: `calc(${100 / laneCount}% - 8px)`,
                }}
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="font-bold">
                    {formatTime(b.startsAt)} · {b.pet?.name ?? "—"}
                    {b.pet && <span className="font-normal opacity-70"> ({SPECIES_LABELS[b.pet.species]})</span>}
                  </p>
                  <StatusBadge status={b.status} />
                </div>
                <p className="truncate">{b.service.name} — {b.client.name}</p>
                {b.assignedTo && <p className="truncate opacity-70">👤 {b.assignedTo.name}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
