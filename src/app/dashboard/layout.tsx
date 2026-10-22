import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/Sidebar";

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
      <main className="px-4 py-8 md:px-8 lg:ml-64 lg:px-10">{children}</main>
    </div>
  );
}
