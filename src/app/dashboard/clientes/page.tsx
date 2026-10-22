import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatDate, formatPrice, SPECIES_LABELS } from "@/lib/utils";
import { PageHeader, EmptyState, inputCls, btnPrimary } from "@/components/dashboard/ui";

export default async function ClientesPage({ searchParams }: PageProps<"/dashboard/clientes">) {
  await requireUser();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
            { pets: { some: { name: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : {},
    include: {
      pets: true,
      bookings: { select: { price: true, status: true, startsAt: true }, orderBy: { startsAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Clientes" subtitle={`${clients.length} familias peludas`} />
      <form className="mb-6 flex gap-2">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Buscar por nombre, teléfono, correo o mascota" className={`${inputCls} pl-9`} />
        </label>
        <button className={btnPrimary}>Buscar</button>
      </form>

      {clients.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((c) => {
            const completed = c.bookings.filter((b) => b.status === "COMPLETED");
            const spent = completed.reduce((s, b) => s + b.price, 0);
            const last = c.bookings[0]?.startsAt;
            return (
              <Link
                key={c.id}
                href={`/dashboard/clientes/${c.id}`}
                className="group rounded-3xl border border-line bg-paper p-5 transition hover:-translate-y-0.5 hover:border-navy"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-sun font-display text-2xl text-navy">
                    {c.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-navy">{c.name}</p>
                    <p className="text-xs text-muted">+{c.phone}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.pets.map((p) => (
                    <span key={p.id} className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-navy">
                      {p.species === "CAT" ? "🐱" : p.species === "DOG" ? "🐶" : "🐾"} {p.name}
                      <span className="sr-only"> ({SPECIES_LABELS[p.species]})</span>
                    </span>
                  ))}
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center text-xs">
                  <div>
                    <dt className="text-muted">Visitas</dt>
                    <dd className="font-display text-xl text-navy">{completed.length}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Gastado</dt>
                    <dd className="font-display text-xl text-navy">{formatPrice(spent)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Última</dt>
                    <dd className="mt-1 font-semibold text-navy">{last ? formatDate(last, { year: undefined }) : "—"}</dd>
                  </div>
                </dl>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Sin clientes todavía" text="Se crean automáticamente con cada reserva (web, WhatsApp o dashboard)." />
      )}
    </div>
  );
}
