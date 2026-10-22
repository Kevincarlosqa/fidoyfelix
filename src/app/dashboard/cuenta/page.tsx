import { requireUser } from "@/lib/auth";
import { Card, CardTitle, PageHeader } from "@/components/dashboard/ui";
import { PasswordForm } from "./PasswordForm";

export default async function CuentaPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Mi cuenta" />
      <Card className="mb-4">
        <CardTitle>Perfil</CardTitle>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted">Nombre</dt><dd className="font-semibold text-navy">{user.name}</dd></div>
          <div><dt className="text-muted">Rol</dt><dd className="font-semibold text-navy">{user.role === "ADMIN" ? "Administrador" : "Staff"}</dd></div>
          <div className="col-span-2"><dt className="text-muted">Correo</dt><dd className="font-semibold text-navy">{user.email}</dd></div>
        </dl>
      </Card>
      <Card>
        <CardTitle>Cambiar contraseña</CardTitle>
        <PasswordForm />
      </Card>
    </div>
  );
}
