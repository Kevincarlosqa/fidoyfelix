import "server-only";
import { z } from "zod";
import { prisma } from "./prisma";
import { BUSINESS } from "./config";
import {
  addDaysKey,
  bookingCode,
  businessDateTime,
  formatTime,
  normalizePhone,
  todayKey,
  weekdayOf,
} from "./utils";
import type { BookingSource, BookingStatus } from "@/generated/prisma/enums";

const BLOCKING_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "IN_PROGRESS"];

export class BookingError extends Error {}

function minutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function hhmm(totalMin: number) {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function isValidDateKey(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(businessDateTime(date).getTime());
}

/** Horas de inicio libres para un servicio en una fecha (YYYY-MM-DD, hora local del negocio). */
export async function getAvailableSlots(date: string, serviceId: string, excludeBookingId?: string) {
  if (!isValidDateKey(date)) throw new BookingError("Fecha inválida, usa el formato AAAA-MM-DD");

  const service = await prisma.service.findFirst({ where: { id: serviceId, active: true } });
  if (!service) throw new BookingError("Servicio no encontrado");

  const today = todayKey();
  if (date < today) return { service, slots: [] as string[], closed: false, reason: "Fecha pasada" };
  if (date > addDaysKey(today, BUSINESS.maxDaysAhead)) {
    return { service, slots: [], closed: false, reason: `Solo agendamos con ${BUSINESS.maxDaysAhead} días de anticipación` };
  }

  const hours = BUSINESS.hours[weekdayOf(date)];
  if (!hours) return { service, slots: [], closed: true, reason: "Cerrado ese día" };

  const dayStart = businessDateTime(date, "00:00");
  const dayEnd = businessDateTime(addDaysKey(date, 1), "00:00");
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: BLOCKING_STATUSES },
      startsAt: { lt: dayEnd },
      endsAt: { gt: dayStart },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { startsAt: true, endsAt: true },
  });

  const earliest = Date.now() + BUSINESS.minLeadMin * 60_000;
  const slots: string[] = [];
  for (let t = minutes(hours.open); t + service.durationMin <= minutes(hours.close); t += BUSINESS.slotStepMin) {
    const start = businessDateTime(date, hhmm(t));
    const end = new Date(start.getTime() + service.durationMin * 60_000);
    if (start.getTime() < earliest) continue;
    const overlapping = bookings.filter((b) => b.startsAt < end && b.endsAt > start).length;
    if (overlapping < BUSINESS.capacity) slots.push(hhmm(t));
  }
  return { service, slots, closed: false, reason: slots.length ? null : "Sin horarios libres" };
}

export const createBookingSchema = z.object({
  clientName: z.string().trim().min(2, "Nombre muy corto").max(80),
  phone: z.string().trim().min(8, "Teléfono inválido").max(20),
  email: z.email().optional().or(z.literal("")).transform((v) => v || undefined),
  petName: z.string().trim().min(1).max(40),
  species: z.enum(["DOG", "CAT", "OTHER"]).default("DOG"),
  breed: z.string().trim().max(60).optional(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"]).optional(),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha AAAA-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Hora HH:MM"),
  notes: z.string().trim().max(500).optional(),
});

export type CreateBookingInput = z.input<typeof createBookingSchema>;

export async function createBooking(
  rawInput: CreateBookingInput,
  opts: { source: BookingSource; status?: BookingStatus; skipAvailability?: boolean },
) {
  const input = createBookingSchema.parse(rawInput);
  const phone = normalizePhone(input.phone);

  if (!opts.skipAvailability) {
    const { slots, reason } = await getAvailableSlots(input.date, input.serviceId);
    if (!slots.includes(input.time)) {
      throw new BookingError(
        reason && !slots.length
          ? `No hay disponibilidad ese día (${reason}).`
          : `El horario ${input.time} ya no está disponible. Opciones: ${slots.slice(0, 8).join(", ")}`,
      );
    }
  }

  const service = await prisma.service.findUniqueOrThrow({ where: { id: input.serviceId } });
  const startsAt = businessDateTime(input.date, input.time);
  const endsAt = new Date(startsAt.getTime() + service.durationMin * 60_000);

  return prisma.$transaction(async (tx) => {
    const client = await tx.client.upsert({
      where: { phone },
      update: { name: input.clientName, ...(input.email ? { email: input.email } : {}) },
      create: { name: input.clientName, phone, email: input.email },
    });
    const pet = await tx.pet.upsert({
      where: { clientId_name: { clientId: client.id, name: input.petName } },
      update: {
        species: input.species,
        ...(input.breed ? { breed: input.breed } : {}),
        ...(input.size ? { size: input.size } : {}),
      },
      create: {
        clientId: client.id,
        name: input.petName,
        species: input.species,
        breed: input.breed,
        size: input.size,
      },
    });

    // Re-verifica la capacidad dentro de la transacción para evitar dobles reservas.
    if (!opts.skipAvailability) {
      const overlapping = await tx.booking.count({
        where: { status: { in: BLOCKING_STATUSES }, startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
      });
      if (overlapping >= BUSINESS.capacity) {
        throw new BookingError("Ese horario se acaba de ocupar. Elige otro, por favor.");
      }
    }

    return tx.booking.create({
      data: {
        code: bookingCode(),
        startsAt,
        endsAt,
        price: service.price,
        status: opts.status ?? "PENDING",
        source: opts.source,
        notes: input.notes,
        clientId: client.id,
        petId: pet.id,
        serviceId: service.id,
      },
      include: { service: true, pet: true, client: true },
    });
  });
}

/** Reservas próximas activas de un teléfono (usado por el bot). */
export async function upcomingBookingsForPhone(phone: string) {
  return prisma.booking.findMany({
    where: {
      client: { phone: normalizePhone(phone) },
      status: { in: BLOCKING_STATUSES },
      startsAt: { gte: new Date() },
    },
    include: { service: true, pet: true },
    orderBy: { startsAt: "asc" },
  });
}

export async function cancelBookingByCode(code: string, phone?: string) {
  const booking = await prisma.booking.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { client: true, service: true },
  });
  if (!booking || (phone && booking.client.phone !== normalizePhone(phone))) {
    throw new BookingError("No encontré una reserva con ese código para este número.");
  }
  if (!BLOCKING_STATUSES.includes(booking.status)) {
    throw new BookingError("Esa reserva ya no está activa.");
  }
  return prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
    include: { service: true },
  });
}

export function describeBooking(b: { code: string; startsAt: Date; service: { name: string }; pet?: { name: string } | null }) {
  const date = new Intl.DateTimeFormat("es-PE", {
    timeZone: BUSINESS.timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(b.startsAt);
  return `${b.code}: ${b.service.name}${b.pet ? ` para ${b.pet.name}` : ""}, ${date} a las ${formatTime(b.startsAt)}`;
}
