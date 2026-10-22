import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatDateTime, formatPrice, SIZE_LABELS, SPECIES_LABELS } from "@/lib/utils";
import { Card, CardTitle, PageHeader, SourceBadge, StatusBadge, btnSecondary } from "@/components/dashboard/ui";
import { ClientNotes } from "./ClientNotes";

export default async function ClienteDetallePage({ params }: PageProps<"/dashboard/clientes/[id]">) {
  await requireUser();
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      pets: true,
      conversation: { select: { id: true } },
      bookings: { include: { service: true, pet: true }, orderBy: { startsAt: "desc" } },
    },
  });
  if (!client) notFound();

  const completed = client.bookings.filter((b) => b.status === "COMPLETED");
  const spent = completed.reduce((s, b) => s + b.price, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/dashboard/clientes" className="text-sm font-semibold text-muted hover:text-navy">← Clientes</Link>
      <PageHeader
        title={client.name}
        subtitle={`+${client.phone}${client.email ? ` · ${client.email}` : ""}`}
        actions={
          client.conversation && (
            <Link href={`/dashboard/conversaciones?c=${client.conversation.id}`} className={btnSecondary}>
              <MessageCircle className="size-4" /> Ver chat
            </Link>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardTitle>Resumen</CardTitle>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted">Visitas</dt><dd className="font-display text-3xl text-navy">{completed.length}</dd></div>
              <div><dt className="text-muted">Total gastado</dt><dd className="font-display text-3xl text-navy">{formatPrice(spent)}</dd></div>
              <div><dt className="text-muted">Reservas</dt><dd className="font-display text-3xl text-navy">{client.bookings.length}</dd></div>
              <div><dt className="text-muted">Cliente desde</dt><dd className="mt-2 font-semibold text-navy">{formatDateTime(client.createdAt).split(" · ")[0]}</dd></div>
            </dl>
          </Card>
          <Card>
            <CardTitle>Mascotas</CardTitle>
            <ul className="space-y-3">
              {client.pets.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                  <span className="text-2xl">{p.species === "CAT" ? "🐱" : p.species === "DOG" ? "🐶" : "🐾"}</span>
                  <div className="text-sm">
                    <p className="font-bold text-navy">{p.name}</p>
                    <p className="text-xs text-muted">
                      {SPECIES_LABELS[p.species]}
                      {p.breed && ` · ${p.breed}`}
                      {p.size && ` · ${SIZE_LABELS[p.size]}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle>Notas internas</CardTitle>
            <ClientNotes id={client.id} initial={client.notes ?? ""} />
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardTitle hint={`${client.bookings.length} en total`}>Historial</CardTitle>
          <ul className="divide-y divide-line">
            {client.bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <div className="min-w-44 flex-1">
                  <p className="font-semibold text-navy">{b.service.name} · {b.pet?.name ?? "—"}</p>
                  <p className="text-xs text-muted">{formatDateTime(b.startsAt)} · <span className="font-mono">{b.code}</span></p>
                </div>
                <span className="font-semibold text-navy">{formatPrice(b.price)}</span>
                <SourceBadge source={b.source} />
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
