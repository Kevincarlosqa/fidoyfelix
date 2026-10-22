import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { businessDateTime, addDaysKey, todayKey, formatDate, formatPrice, formatTime, SOURCE_LABELS, STATUS_LABELS, SPECIES_LABELS } from "@/lib/utils";
import { PageHeader, SourceBadge, EmptyState, inputCls, btnPrimary, btnSun } from "@/components/dashboard/ui";
import { BookingActions } from "./BookingActions";
import type { Prisma } from "@/generated/prisma/client";
import type { BookingSource, BookingStatus } from "@/generated/prisma/enums";

const PAGE_SIZE = 25;

export default async function ReservasPage({ searchParams }: PageProps<"/dashboard/reservas">) {
  const me = await requireUser();
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const estado = str("estado") as BookingStatus | "";
  const canal = str("canal") as BookingSource | "";
  const q = str("q").trim();
  const desde = str("desde");
  const hasta = str("hasta");
  const vista = str("vista") || "proximas";
  const page = Math.max(1, Number(str("p")) || 1);

  const where: Prisma.BookingWhereInput = {
    ...(estado ? { status: estado } : {}),
    ...(canal ? { source: canal } : {}),
    ...(q
      ? {
          OR: [
            { code: { contains: q, mode: "insensitive" } },
            { client: { name: { contains: q, mode: "insensitive" } } },
            { client: { phone: { contains: q } } },
            { pet: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    startsAt: {
      ...(desde ? { gte: businessDateTime(desde) } : vista === "proximas" && !hasta ? { gte: businessDateTime(todayKey()) } : {}),
      ...(hasta ? { lt: businessDateTime(addDaysKey(hasta, 1)) } : {}),
    },
  };

  const [bookings, total, staff] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { client: true, pet: true, service: true, assignedTo: { select: { id: true, name: true } } },
      orderBy: { startsAt: vista === "proximas" ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.booking.count({ where }),
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (patch: Record<string, string | number>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ estado, canal, q, desde, hasta, vista, p: page, ...patch })) {
      if (v !== "" && v !== undefined) params.set(k, String(v));
    }
    return `/dashboard/reservas?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Reservas"
        subtitle={`${total} resultado${total === 1 ? "" : "s"}`}
        actions={
          <Link href="/dashboard/reservas/nueva" className={btnSun}>
            <Plus className="size-4" /> Nueva reserva
          </Link>
        }
      />

      <div className="mb-4 flex gap-1 rounded-full border border-line bg-paper p-1 text-sm font-semibold sm:w-fit">
        {[
          ["proximas", "Próximas"],
          ["todas", "Historial"],
        ].map(([v, l]) => (
          <Link key={v} href={qs({ vista: v, p: 1 })} className={`flex-1 rounded-full px-4 py-1.5 text-center ${vista === v ? "bg-navy text-paper" : "text-muted"}`}>
            {l}
          </Link>
        ))}
      </div>

      <form className="mb-6 grid gap-2 rounded-3xl border border-line bg-paper p-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
        <input type="hidden" name="vista" value={vista} />
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Código, cliente, teléfono o mascota" className={`${inputCls} pl-9`} />
        </label>
        <select name="estado" defaultValue={estado} className={inputCls} aria-label="Estado">
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select name="canal" defaultValue={canal} className={inputCls} aria-label="Canal">
          <option value="">Todos los canales</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input type="date" name="desde" defaultValue={desde} className={inputCls} aria-label="Desde" />
        <input type="date" name="hasta" defaultValue={hasta} className={inputCls} aria-label="Hasta" />
        <button className={btnPrimary}>Filtrar</button>
      </form>

      {bookings.length ? (
        <div className="overflow-x-auto rounded-3xl border border-line bg-paper">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente / Mascota</th>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Asignada</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-line/70 last:border-0 hover:bg-cream/50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">{formatDate(b.startsAt, { weekday: "short" })}</p>
                    <p className="text-xs text-muted">{formatTime(b.startsAt)} – {formatTime(b.endsAt)}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted">{b.code}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/clientes/${b.clientId}`} className="font-semibold text-navy hover:underline">
                      {b.client.name}
                    </Link>
                    <p className="text-xs text-muted">
                      {b.pet ? `${b.pet.name} · ${SPECIES_LABELS[b.pet.species]}${b.pet.breed ? ` · ${b.pet.breed}` : ""}` : "—"}
                    </p>
                    <p className="text-xs text-muted">+{b.client.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">{b.service.name}</p>
                    <p className="text-xs text-muted">{formatPrice(b.price)}</p>
                    {b.notes && <p className="mt-1 max-w-56 truncate text-xs italic text-muted" title={b.notes}>“{b.notes}”</p>}
                  </td>
                  <td className="px-4 py-3"><SourceBadge source={b.source} /></td>
                  <td colSpan={3} className="px-4 py-3">
                    <BookingActions
                      booking={{
                        id: b.id,
                        status: b.status,
                        notes: b.notes ?? "",
                        assignedToId: b.assignedToId,
                        dateKey: new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(b.startsAt),
                        time: formatTime(b.startsAt),
                      }}
                      staff={staff}
                      isAdmin={me.role === "ADMIN"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No hay reservas con estos filtros" text="Prueba cambiando el estado, el canal o el rango de fechas." />
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          {page > 1 && <Link href={qs({ p: page - 1 })} className="rounded-full border border-line bg-paper px-4 py-2 font-semibold">← Anterior</Link>}
          <span className="text-muted">Página {page} de {pages}</span>
          {page < pages && <Link href={qs({ p: page + 1 })} className="rounded-full border border-line bg-paper px-4 py-2 font-semibold">Siguiente →</Link>}
        </div>
      )}
    </div>
  );
}
