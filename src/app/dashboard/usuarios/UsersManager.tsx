"use client";

import { useActionState, useState, useTransition } from "react";
import { KeyRound, UserPlus } from "lucide-react";
import { createUser, resetUserPassword, setUserActive, setUserRole, type ActionResult } from "../actions";
import { Card, CardTitle, inputCls, btnPrimary } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

type User = { id: string; name: string; email: string; role: "ADMIN" | "STAFF"; active: boolean; lastLogin: string };

export function UsersManager({ users, meId }: { users: User[]; meId: string }) {
  const [state, action, creating] = useActionState(createUser, undefined);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<ActionResult | null>(null);

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      setMsg(await fn());
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="p-0">
        <ul className="divide-y divide-line">
          {users.map((u) => (
            <li key={u.id} className={cn("flex flex-wrap items-center gap-3 p-4", !u.active && "opacity-60")}>
              <span className="grid size-11 place-items-center rounded-full bg-sky font-display text-xl text-navy">{u.name.charAt(0)}</span>
              <div className="min-w-40 flex-1">
                <p className="font-bold text-navy">
                  {u.name} {u.id === meId && <span className="text-xs font-semibold text-muted">(tú)</span>}
                </p>
                <p className="text-xs text-muted">{u.email} · último acceso: {u.lastLogin}</p>
              </div>
              <select
                value={u.role}
                disabled={pending || u.id === meId}
                onChange={(e) => run(() => setUserRole(u.id, e.target.value as "ADMIN" | "STAFF"))}
                className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-navy"
                aria-label="Rol"
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  const pwd = prompt(`Nueva contraseña para ${u.name} (mín. 8 caracteres)`);
                  if (pwd) run(() => resetUserPassword(u.id, pwd));
                }}
                className="grid size-8 place-items-center rounded-full border border-line hover:border-navy"
                title="Restablecer contraseña"
              >
                <KeyRound className="size-3.5" />
              </button>
              <button
                type="button"
                disabled={pending || u.id === meId}
                onClick={() => run(() => setUserActive(u.id, !u.active))}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold",
                  u.active ? "bg-emerald-100 text-emerald-900" : "bg-zinc-200 text-zinc-700",
                )}
              >
                {u.active ? "Activo" : "Inactivo"}
              </button>
            </li>
          ))}
        </ul>
        {msg && (
          <p className={cn("border-t border-line px-4 py-3 text-sm font-semibold", msg.ok ? "text-emerald-800" : "text-rose-700")}>
            {msg.ok ? msg.message ?? "Listo" : msg.error}
          </p>
        )}
      </Card>

      <Card>
        <CardTitle>
          <span className="flex items-center gap-2"><UserPlus className="size-4" /> Nuevo usuario</span>
        </CardTitle>
        <form action={action} className="grid gap-3">
          <input name="name" required placeholder="Nombre" className={inputCls} />
          <input name="email" type="email" required placeholder="correo@fidofelix.mx" className={inputCls} />
          <input name="password" type="password" required minLength={8} placeholder="Contraseña temporal" className={inputCls} />
          <select name="role" defaultValue="STAFF" className={inputCls}>
            <option value="STAFF">Staff (gestiona reservas y chats)</option>
            <option value="ADMIN">Admin (además servicios y usuarios)</option>
          </select>
          {state && (
            <p className={cn("text-sm font-semibold", state.ok ? "text-emerald-800" : "text-rose-700")}>
              {state.ok ? state.message : state.error}
            </p>
          )}
          <button className={btnPrimary} disabled={creating}>Crear usuario</button>
        </form>
      </Card>
    </div>
  );
}
