import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/ui";
import { ServicesManager } from "./ServicesManager";

export default async function ServiciosPage() {
  await requireAdmin();
  const services = await prisma.service.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { bookings: true } } },
  });
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Servicios" subtitle="Catálogo que ven la web y el asistente de WhatsApp." />
      <ServicesManager
        services={services.map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          description: s.description,
          category: s.category,
          durationMin: s.durationMin,
          price: s.price,
          sortOrder: s.sortOrder,
          active: s.active,
          bookings: s._count.bookings,
        }))}
      />
    </div>
  );
}
