"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";

const schema = z.object({
  email: z.email("Correo inválido").transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Escribe tu contraseña"),
  next: z.string().optional(),
});

const DUMMY_HASH = "$2b$12$QyCO8oLjk.AxMOmIZW5i1eU42h2u93sVNlD1FKd2DM/5ANZCD6iT.";

export type LoginState = { error?: string } | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { email, password, next } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  // Comparamos siempre para no revelar por tiempo si el correo existe.
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "Correo o contraseña incorrectos" };
  if (!user.active) return { error: "Tu usuario está desactivado. Contacta al administrador." };

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession({ id: user.id, role: user.role, name: user.name });

  redirect(next?.startsWith("/dashboard") ? next : "/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
