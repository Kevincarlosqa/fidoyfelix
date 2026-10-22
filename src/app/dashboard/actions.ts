"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { BookingError, createBooking, getAvailableSlots } from "@/lib/booking";
import { handleIncomingMessage, saveAndSendOutgoing } from "@/lib/conversations";
import { businessDateTime, normalizePhone } from "@/lib/utils";
import type { BookingStatus } from "@/generated/prisma/enums";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

function refresh() {
  revalidatePath("/dashboard", "layout");
}

function fail(err: unknown): ActionResult {
  if (err instanceof BookingError) return { ok: false, error: err.message };
  if (err instanceof z.ZodError) return { ok: false, error: err.issues[0]?.message ?? "Datos inválidos" };
  console.error("[dashboard action]", err);
  return { ok: false, error: "Ocurrió un error inesperado" };
}

// ── Reservas ───────────────────────────────────────────────

const STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<ActionResult> {
  await requireUser();
  if (!STATUSES.includes(status)) return { ok: false, error: "Estado inválido" };
  await prisma.booking.update({
    where: { id },
    data: { status, cancelledAt: status === "CANCELLED" ? new Date() : null },
  });
  refresh();
  return { ok: true };
}

export async function assignBooking(id: string, userId: string | null): Promise<ActionResult> {
  await requireUser();
  await prisma.booking.update({ where: { id }, data: { assignedToId: userId || null } });
  refresh();
  return { ok: true };
}

export async function updateBookingNotes(id: string, notes: string): Promise<ActionResult> {
  await requireUser();
  await prisma.booking.update({ where: { id }, data: { notes: notes.slice(0, 1000) } });
  refresh();
  return { ok: true };
}

export async function rescheduleBooking(id: string, date: string, time: string): Promise<ActionResult> {
  await requireUser();
  try {
    const booking = await prisma.booking.findUniqueOrThrow({ where: { id }, include: { service: true } });
    // Excluimos la propia reserva para que su hueco actual no cuente contra sí misma.
    const { slots } = await getAvailableSlots(date, booking.serviceId, booking.id);
    const startsAt = businessDateTime(date, time);
    if (!slots.includes(time)) {
      return { ok: false, error: `Horario no disponible. Libres: ${slots.slice(0, 10).join(", ") || "ninguno"}` };
    }
    await prisma.booking.update({
      where: { id },
      data: { startsAt, endsAt: new Date(startsAt.getTime() + booking.service.durationMin * 60_000) },
    });
    refresh();
    return { ok: true, message: "Reserva reprogramada" };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteBooking(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.booking.delete({ where: { id } });
  refresh();
  return { ok: true };
}

export async function createManualBooking(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const get = (k: string) => (formData.get(k) as string | null) || undefined;
  try {
    const booking = await createBooking(
      {
        clientName: get("clientName") ?? "",
        phone: get("phone") ?? "",
        email: get("email"),
        petName: get("petName") ?? "",
        species: (get("species") as "DOG" | "CAT" | "OTHER") ?? "DOG",
        breed: get("breed"),
        size: get("size") as "SMALL" | "MEDIUM" | "LARGE" | "XLARGE" | undefined,
        serviceId: get("serviceId") ?? "",
        date: get("date") ?? "",
        time: get("time") ?? "",
        notes: get("notes"),
      },
      {
        source: get("source") === "PHONE" ? "PHONE" : "DASHBOARD",
        status: "CONFIRMED",
        skipAvailability: formData.get("force") === "on",
      },
    );
    refresh();
    return { ok: true, message: `Reserva ${booking.code} creada` };
  } catch (err) {
    return fail(err);
  }
}

export async function fetchSlots(date: string, serviceId: string) {
  await requireUser();
  try {
    const { slots, reason } = await getAvailableSlots(date, serviceId);
    return { slots, reason };
  } catch (err) {
    return { slots: [] as string[], reason: err instanceof Error ? err.message : "Error" };
  }
}

// ── Clientes ───────────────────────────────────────────────

export async function updateClientNotes(id: string, notes: string): Promise<ActionResult> {
  await requireUser();
  await prisma.client.update({ where: { id }, data: { notes: notes.slice(0, 2000) } });
  refresh();
  return { ok: true };
}

// ── Conversaciones de WhatsApp ─────────────────────────────

export async function toggleConversationAI(id: string, enabled: boolean): Promise<ActionResult> {
  await requireUser();
  await prisma.conversation.update({ where: { id }, data: { aiEnabled: enabled } });
  refresh();
  return { ok: true };
}

export async function markConversationRead(id: string) {
  await requireUser();
  await prisma.conversation.update({ where: { id }, data: { unread: 0 } });
}

export async function sendStaffReply(conversationId: string, text: string): Promise<ActionResult> {
  await requireUser();
  const body = text.trim();
  if (!body) return { ok: false, error: "Mensaje vacío" };
  const conv = await prisma.conversation.findUniqueOrThrow({ where: { id: conversationId } });
  // Al responder un humano, pausamos la IA para no pisarnos.
  await prisma.conversation.update({ where: { id: conversationId }, data: { aiEnabled: false, unread: 0 } });
  await saveAndSendOutgoing(conversationId, conv.phone, body, "STAFF");
  refresh();
  return { ok: true };
}

// ── Simulador del chatbot ──────────────────────────────────

const SIM_PREFIX = "000"; // los teléfonos del simulador empiezan con 000 para distinguirlos

export async function simulateMessage(phone: string, text: string) {
  await requireUser();
  const simPhone = SIM_PREFIX + normalizePhone(phone).slice(-10);
  const reply = await handleIncomingMessage({ phone: simPhone, text, deliver: false, profileName: "Simulador" });
  return { reply };
}

export async function resetSimulation(phone: string): Promise<ActionResult> {
  await requireUser();
  const simPhone = SIM_PREFIX + normalizePhone(phone).slice(-10);
  await prisma.conversation.deleteMany({ where: { phone: simPhone } });
  refresh();
  return { ok: true };
}

// ── Servicios (solo admin) ─────────────────────────────────

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Nombre requerido"),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Slug: minúsculas, números y guiones"),
  description: z.string().trim().min(5, "Descripción requerida"),
  category: z.enum(["GROOMING", "HEALTH", "TRAINING", "DAYCARE", "WALKING", "SPA"]),
  durationMin: z.coerce.number().int().min(15).max(600),
  price: z.coerce.number().int().min(0),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveService(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { id, ...data } = serviceSchema.parse(Object.fromEntries(formData));
    if (id) await prisma.service.update({ where: { id }, data });
    else await prisma.service.create({ data });
    refresh();
    revalidatePath("/");
    return { ok: true, message: id ? "Servicio actualizado" : "Servicio creado" };
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { ok: false, error: "Ya existe un servicio con ese slug" };
    }
    return fail(err);
  }
}

export async function toggleServiceActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.service.update({ where: { id }, data: { active } });
  refresh();
  revalidatePath("/");
  return { ok: true };
}

// ── Usuarios (solo admin) ──────────────────────────────────

const userSchema = z.object({
  name: z.string().trim().min(2, "Nombre requerido"),
  email: z.email("Correo inválido").transform((v) => v.toLowerCase()),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["ADMIN", "STAFF"]),
});

export async function createUser(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { password, ...data } = userSchema.parse(Object.fromEntries(formData));
    await prisma.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 12) } });
    refresh();
    return { ok: true, message: "Usuario creado" };
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { ok: false, error: "Ese correo ya está registrado" };
    }
    return fail(err);
  }
}

export async function setUserActive(id: string, active: boolean): Promise<ActionResult> {
  const me = await requireAdmin();
  if (me.id === id) return { ok: false, error: "No puedes desactivarte a ti mismo" };
  await prisma.user.update({ where: { id }, data: { active } });
  refresh();
  return { ok: true };
}

export async function setUserRole(id: string, role: "ADMIN" | "STAFF"): Promise<ActionResult> {
  const me = await requireAdmin();
  if (me.id === id) return { ok: false, error: "No puedes cambiar tu propio rol" };
  await prisma.user.update({ where: { id }, data: { role } });
  refresh();
  return { ok: true };
}

export async function resetUserPassword(id: string, password: string): Promise<ActionResult> {
  await requireAdmin();
  if (password.length < 8) return { ok: false, error: "Mínimo 8 caracteres" };
  await prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 12) } });
  return { ok: true, message: "Contraseña actualizada" };
}

export async function changeOwnPassword(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const me = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 8) return { ok: false, error: "La nueva contraseña debe tener al menos 8 caracteres" };
  const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await bcrypt.compare(current, user.passwordHash))) return { ok: false, error: "Contraseña actual incorrecta" };
  await prisma.user.update({ where: { id: me.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { ok: true, message: "Contraseña actualizada" };
}
