import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/ui";
import { NewBookingForm } from "./NewBookingForm";

export default async function NuevaReservaPage() {
  await requireUser();
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, price: true, durationMin: true },
  });
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/reservas" className="text-sm font-semibold text-muted hover:text-navy">← Reservas</Link>
      <PageHeader title="Nueva reserva" subtitle="Para reservas por teléfono o en mostrador. Se crea confirmada." />
      <NewBookingForm services={services} />
    </div>
  );
}
