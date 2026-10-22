"use client";

import { useActionState } from "react";
import { changeOwnPassword } from "../actions";
import { inputCls, btnPrimary } from "@/components/dashboard/ui";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changeOwnPassword, undefined);
  return (
    <form action={action} className="grid gap-3">
      <input name="current" type="password" required placeholder="Contraseña actual" autoComplete="current-password" className={inputCls} />
      <input name="next" type="password" required minLength={8} placeholder="Nueva contraseña (mín. 8)" autoComplete="new-password" className={inputCls} />
      {state && (
        <p className={`text-sm font-semibold ${state.ok ? "text-emerald-800" : "text-rose-700"}`}>
          {state.ok ? state.message : state.error}
        </p>
      )}
      <button className={btnPrimary} disabled={pending}>Actualizar</button>
    </form>
  );
}
