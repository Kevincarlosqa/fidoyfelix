import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DEMO_MODE } from "@/lib/demo";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser();
  const [unread, pending] = await Promise.all([
    prisma.conversation.aggregate({ _sum: { unread: true } }),
    prisma.booking.count({ where: { status: "PENDING", startsAt: { gte: new Date() } } }),
  ]);

  return (
    <div className="min-h-dvh bg-cream">
      <Sidebar user={user} unread={unread._sum.unread ?? 0} pending={pending} />
      <main className="px-4 py-8 md:px-8 lg:ml-64 lg:px-10">
        {DEMO_MODE && (
          <p className="mx-auto mb-6 max-w-7xl rounded-2xl bg-sun/40 px-4 py-2.5 text-sm font-semibold text-navy">
            🧪 Modo demo: datos de ejemplo en memoria. Los cambios no se guardan de forma permanente. Configura
            DATABASE_URL y AUTH_SECRET para usar tu base real.
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
