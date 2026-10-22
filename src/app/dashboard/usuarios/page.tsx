import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/ui";
import { UsersManager } from "./UsersManager";
import { formatDateTime } from "@/lib/utils";

export default async function UsuariosPage() {
  const me = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Usuarios" subtitle="Solo las personas registradas aquí pueden entrar al dashboard." />
      <UsersManager
        meId={me.id}
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          active: u.active,
          lastLogin: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Nunca",
        }))}
      />
    </div>
  );
}
