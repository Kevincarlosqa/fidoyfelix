// Datos iniciales compartidos por `prisma/seed.ts` y por el modo demo (base en memoria).
// Sin "server-only" para poder ejecutarlo también con tsx.
import bcrypt from "bcryptjs";
import type { PrismaClient } from "@/generated/prisma/client";
import type { BookingSource, BookingStatus, PetSize, Species } from "@/generated/prisma/enums";
import { BUSINESS } from "./config";

export const DEMO_ADMIN = {
  id: "demo-admin",
  email: "admin@fidofelix.mx",
  password: "FidoFelix2026!",
};

export const SERVICES = [
  { slug: "bano-cepillado", name: "Baño & Cepillado", category: "GROOMING", durationMin: 60, price: 60, description: "Baño con shampoo hipoalergénico, secado, cepillado profundo y perfume." },
  { slug: "grooming-completo", name: "Grooming Completo", category: "GROOMING", durationMin: 120, price: 110, description: "Baño, corte de raza o estilo a elección, uñas, oídos y glándulas." },
  { slug: "spa-felino", name: "Spa Felino", category: "SPA", durationMin: 90, price: 90, description: "Baño libre de estrés para gatos, deslanado y corte de uñas con manejo cat-friendly." },
  { slug: "spa-deluxe", name: "Spa Deluxe", category: "SPA", durationMin: 150, price: 160, description: "Grooming completo + mascarilla hidratante, aromaterapia y masaje relajante." },
  { slug: "unas-oidos", name: "Uñas & Oídos", category: "GROOMING", durationMin: 30, price: 25, description: "Corte y limado de uñas más limpieza de oídos." },
  { slug: "consulta-veterinaria", name: "Consulta Veterinaria", category: "HEALTH", durationMin: 30, price: 80, description: "Revisión general con médico veterinario, plan preventivo y receta si se requiere." },
  { slug: "vacunacion", name: "Vacunación", category: "HEALTH", durationMin: 30, price: 60, description: "Aplicación de vacunas con cartilla incluida (precio por vacuna)." },
  { slug: "entrenamiento", name: "Entrenamiento 1:1", category: "TRAINING", durationMin: 60, price: 90, description: "Sesión personalizada de obediencia básica, paseo con correa y socialización." },
  { slug: "guarderia", name: "Guardería de Día", category: "DAYCARE", durationMin: 30, price: 55, description: "Día de juego supervisado. La hora elegida es el check-in; recoge antes de las 19:00." },
  { slug: "paseo-grupal", name: "Paseo Grupal", category: "WALKING", durationMin: 60, price: 30, description: "Paseo de una hora en grupo pequeño por el Parque Kennedy." },
] as const;

/**
 * Servicios + admin inicial. Con `fixedIds` (modo demo) los ids son deterministas para que
 * sesiones y formularios sigan siendo válidos entre instancias del servidor.
 */
export async function seedBase(
  prisma: PrismaClient,
  opts: { email?: string; password?: string; fixedIds?: boolean } = {},
) {
  for (const [i, s] of SERVICES.entries()) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: { ...s, sortOrder: i, ...(opts.fixedIds ? { id: `svc-${s.slug}` } : {}) },
    });
  }
  const email = (opts.email ?? DEMO_ADMIN.email).toLowerCase();
  const password = opts.password ?? DEMO_ADMIN.password;
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      ...(opts.fixedIds ? { id: DEMO_ADMIN.id } : {}),
      email,
      name: "Administrador",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  return { services: SERVICES.length, email };
}

// ── Datos demo ──────────────────────────────────────────────

const OWNERS = ["Mariana López", "Diego Hernández", "Sofía Ramírez", "Andrés Torres", "Valeria Castillo", "Jorge Méndez", "Camila Ruiz", "Emilio Vargas", "Regina Flores", "Santiago Ortiz", "Fernanda Gil", "Pablo Aguilar", "Lucía Navarro", "Mateo Rojas", "Daniela Peña", "Ximena Cruz", "Rodrigo Silva", "Paola Medina"];
const PETS: { name: string; species: Species; breed: string }[] = [
  { name: "Fido", species: "DOG", breed: "Golden Retriever" },
  { name: "Felix", species: "CAT", breed: "Atigrado" },
  { name: "Luna", species: "DOG", breed: "Poodle" },
  { name: "Milo", species: "DOG", breed: "Bulldog Francés" },
  { name: "Nala", species: "CAT", breed: "Siamés" },
  { name: "Rocky", species: "DOG", breed: "Schnauzer" },
  { name: "Coco", species: "DOG", breed: "Pug" },
  { name: "Simba", species: "CAT", breed: "Persa" },
  { name: "Toby", species: "DOG", breed: "Beagle" },
  { name: "Lola", species: "DOG", breed: "Shih Tzu" },
  { name: "Max", species: "DOG", breed: "Corgi" },
  { name: "Kira", species: "DOG", breed: "Samoyedo" },
];

function rand<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function code() {
  const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return "FF-" + Array.from({ length: 6 }, () => a[Math.floor(Math.random() * a.length)]).join("");
}

/** Clientes, mascotas, ~2 meses de reservas y una conversación de ejemplo. */
export async function seedDemo(prisma: PrismaClient) {
  const services = await prisma.service.findMany();
  const clients: { clientId: string; petId: string; species: Species; phone: string; name: string }[] = [];

  for (const [i, name] of OWNERS.entries()) {
    const phone = `519${String(10000000 + i * 7919).slice(0, 8)}`;
    const client = await prisma.client.upsert({
      where: { phone },
      update: {},
      create: { name, phone, email: `${name.split(" ")[0].toLowerCase()}@correo.pe` },
    });
    const petData = PETS[i % PETS.length];
    const size: PetSize | undefined = petData.species === "DOG" ? rand(["SMALL", "MEDIUM", "LARGE"] as const) : undefined;
    const pet = await prisma.pet.upsert({
      where: { clientId_name: { clientId: client.id, name: petData.name } },
      update: {},
      create: { ...petData, clientId: client.id, size },
    });
    clients.push({ clientId: client.id, petId: pet.id, species: pet.species, phone, name });
  }

  const now = new Date();
  const sources: BookingSource[] = ["WHATSAPP", "WHATSAPP", "WHATSAPP", "WEB", "WEB", "DASHBOARD", "PHONE"];
  const bookings = [];
  for (let dayOffset = -60; dayOffset <= 14; dayOffset++) {
    const perDay = 2 + Math.floor(Math.random() * 5);
    for (let k = 0; k < perDay; k++) {
      const day = new Date(now);
      day.setUTCDate(day.getUTCDate() + dayOffset);
      if (day.getUTCDay() === 0) continue;
      const hour = 9 + Math.floor(Math.random() * 8);
      const startsAt = new Date(
        `${day.toISOString().slice(0, 10)}T${String(hour).padStart(2, "0")}:${rand(["00", "30"])}:00${BUSINESS.utcOffset}`,
      );
      const c = rand(clients);
      const service =
        c.species === "CAT"
          ? rand(services.filter((s) => s.slug !== "paseo-grupal" && s.slug !== "entrenamiento"))
          : rand(services.filter((s) => s.slug !== "spa-felino"));
      const past = startsAt < now;
      const roll = Math.random();
      const status: BookingStatus = past
        ? roll < 0.78 ? "COMPLETED" : roll < 0.92 ? "CANCELLED" : "NO_SHOW"
        : roll < 0.6 ? "CONFIRMED" : roll < 0.9 ? "PENDING" : "CANCELLED";
      bookings.push({
        code: code(),
        startsAt,
        endsAt: new Date(startsAt.getTime() + service.durationMin * 60_000),
        status,
        source: rand(sources),
        price: service.price,
        clientId: c.clientId,
        petId: c.petId,
        serviceId: service.id,
        cancelledAt: status === "CANCELLED" ? startsAt : null,
        createdAt: new Date(startsAt.getTime() - (1 + Math.random() * 6) * 86_400_000),
      });
    }
  }
  await prisma.booking.createMany({ data: bookings, skipDuplicates: true });

  const first = clients[0];
  const conv = await prisma.conversation.upsert({
    where: { phone: first.phone },
    update: {},
    create: { phone: first.phone, profileName: first.name, clientId: first.clientId },
  });
  const script: ["USER" | "ASSISTANT", string][] = [
    ["USER", "Hola! Quiero agendar baño para mi golden 🐶"],
    ["ASSISTANT", "¡Hola Mariana! 🐾 Qué gusto saludarte. ¿Es para Fido? ¿Qué día te acomoda?"],
    ["USER", "Sí, para Fido. ¿El sábado en la mañana?"],
    ["ASSISTANT", "El sábado tengo libre a las *10:00*, *10:30* y *11:30*. ¿Cuál prefieres?"],
  ];
  await prisma.message.createMany({
    data: script.map(([role, content], i) => ({
      conversationId: conv.id,
      role,
      content,
      createdAt: new Date(now.getTime() - (script.length - i) * 60_000),
    })),
  });

  return { clients: clients.length, bookings: bookings.length };
}
