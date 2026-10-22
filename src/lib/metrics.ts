import "server-only";
import { prisma } from "./prisma";
import { BUSINESS } from "./config";
import { addDaysKey, businessDateTime, toBusinessDateKey, todayKey } from "./utils";
import type { BookingSource } from "@/generated/prisma/enums";

export type DayPoint = { key: string; label: string; revenue: number; total: number } & Record<BookingSource, number>;

const SOURCES: BookingSource[] = ["WHATSAPP", "WEB", "DASHBOARD", "PHONE"];
const ACTIVE = new Set(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"]);

function hourOf(d: Date) {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: BUSINESS.timeZone, hour: "numeric", hour12: false }).format(d),
  );
}

function weekdayOfDate(d: Date) {
  return businessDateTime(toBusinessDateKey(d), "12:00").getUTCDay();
}

function pctChange(curr: number, prev: number) {
  if (!prev) return curr ? null : 0;
  return ((curr - prev) / prev) * 100;
}

export async function getDashboardMetrics(rangeDays: number) {
  const today = todayKey();
  const startKey = addDaysKey(today, -(rangeDays - 1));
  const start = businessDateTime(startKey);
  const end = businessDateTime(addDaysKey(today, 1));
  const prevStart = businessDateTime(addDaysKey(startKey, -rangeDays));

  const [current, previous, newClients, prevNewClients, upcoming, todayList] = await Promise.all([
    prisma.booking.findMany({
      where: { startsAt: { gte: start, lt: end } },
      select: { startsAt: true, status: true, source: true, price: true, clientId: true, service: { select: { name: true } } },
    }),
    prisma.booking.findMany({
      where: { startsAt: { gte: prevStart, lt: start } },
      select: { status: true, price: true, source: true },
    }),
    prisma.client.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.client.count({ where: { createdAt: { gte: prevStart, lt: start } } }),
    prisma.booking.findMany({
      where: { startsAt: { gte: new Date() }, status: { in: ["PENDING", "CONFIRMED"] } },
      select: { price: true, status: true },
    }),
    prisma.booking.findMany({
      where: { startsAt: { gte: businessDateTime(today), lt: end } },
      include: { client: true, pet: true, service: true },
      orderBy: { startsAt: "asc" },
    }),
  ]);

  const summarize = (list: { status: string; price: number; source: BookingSource }[]) => {
    const active = list.filter((b) => ACTIVE.has(b.status));
    const lost = list.filter((b) => b.status === "CANCELLED" || b.status === "NO_SHOW").length;
    const revenue = list.filter((b) => b.status === "COMPLETED").reduce((s, b) => s + b.price, 0);
    const completed = list.filter((b) => b.status === "COMPLETED").length;
    return {
      bookings: active.length,
      revenue,
      avgTicket: completed ? Math.round(revenue / completed) : 0,
      cancelRate: list.length ? (lost / list.length) * 100 : 0,
      whatsappShare: list.length ? (list.filter((b) => b.source === "WHATSAPP").length / list.length) * 100 : 0,
    };
  };

  const curr = summarize(current);
  const prev = summarize(previous);

  // Serie diaria (reservas por canal + ingresos)
  const daily: DayPoint[] = [];
  const dayIndex = new Map<string, number>();
  for (let i = 0; i < rangeDays; i++) {
    const key = addDaysKey(startKey, i);
    dayIndex.set(key, i);
    const label = new Intl.DateTimeFormat("es-PE", { timeZone: BUSINESS.timeZone, day: "numeric", month: "short" }).format(
      businessDateTime(key, "12:00"),
    );
    daily.push({ key, label, revenue: 0, total: 0, WHATSAPP: 0, WEB: 0, DASHBOARD: 0, PHONE: 0 });
  }

  const byService = new Map<string, { name: string; revenue: number; count: number }>();
  const heat: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const statusCount: Record<string, number> = {};
  const clientCount = new Map<string, number>();

  for (const b of current) {
    statusCount[b.status] = (statusCount[b.status] ?? 0) + 1;
    const idx = dayIndex.get(toBusinessDateKey(b.startsAt));
    if (!ACTIVE.has(b.status)) continue;
    if (idx !== undefined) {
      daily[idx][b.source] += 1;
      daily[idx].total += 1;
      if (b.status === "COMPLETED") daily[idx].revenue += b.price;
    }
    const svc = byService.get(b.service.name) ?? { name: b.service.name, revenue: 0, count: 0 };
    svc.count += 1;
    if (b.status === "COMPLETED") svc.revenue += b.price;
    byService.set(b.service.name, svc);
    heat[weekdayOfDate(b.startsAt)][hourOf(b.startsAt)] += 1;
    clientCount.set(b.clientId, (clientCount.get(b.clientId) ?? 0) + 1);
  }

  const returning = [...clientCount.values()].filter((n) => n > 1).length;

  const sourceTotals = SOURCES.map((s) => ({
    source: s,
    count: current.filter((b) => b.source === s && ACTIVE.has(b.status)).length,
  }));

  return {
    rangeDays,
    kpis: {
      bookings: { value: curr.bookings, delta: pctChange(curr.bookings, prev.bookings) },
      revenue: { value: curr.revenue, delta: pctChange(curr.revenue, prev.revenue) },
      avgTicket: { value: curr.avgTicket, delta: pctChange(curr.avgTicket, prev.avgTicket) },
      cancelRate: { value: curr.cancelRate, delta: curr.cancelRate - prev.cancelRate },
      newClients: { value: newClients, delta: pctChange(newClients, prevNewClients) },
      whatsappShare: { value: curr.whatsappShare, delta: curr.whatsappShare - prev.whatsappShare },
    },
    pipeline: {
      count: upcoming.length,
      pending: upcoming.filter((b) => b.status === "PENDING").length,
      value: upcoming.reduce((s, b) => s + b.price, 0),
    },
    returningRate: clientCount.size ? (returning / clientCount.size) * 100 : 0,
    daily,
    services: [...byService.values()].sort((a, b) => b.revenue - a.revenue),
    statusCount,
    sourceTotals,
    heat,
    today: todayList,
  };
}

export type DashboardMetrics = Awaited<ReturnType<typeof getDashboardMetrics>>;
