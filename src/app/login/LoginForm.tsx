"use client";

import { useActionState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { login } from "./actions";

const input =
  "w-full rounded-2xl border-2 border-navy/15 bg-paper py-3 pl-11 pr-4 text-navy outline-none transition focus:border-navy";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="mt-8 grid gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="relative block">
        <span className="sr-only">Correo</span>
        <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-navy/40" />
        <input name="email" type="email" required autoComplete="email" placeholder="correo@fidofelix.mx" className={input} />
      </label>
      <label className="relative block">
        <span className="sr-only">Contraseña</span>
        <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-navy/40" />
        <input name="password" type="password" required autoComplete="current-password" placeholder="Contraseña" className={input} />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-tangerine/15 px-4 py-2.5 text-sm font-semibold text-[#b8410f]">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex items-center justify-center gap-2 rounded-full border-2 border-navy bg-sun py-3.5 font-bold text-navy transition hover:shadow-sticker-sm disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Entrar
      </button>
    </form>
  );
}
