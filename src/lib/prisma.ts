import "server-only";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { DEMO_MODE } from "./demo";
import { seedBase, seedDemo } from "./seed-data";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Renueva conexiones para no reutilizar sockets que la base (o el pooler) ya cerró.
    idleTimeoutMillis: 10_000,
    maxLifetimeSeconds: 300,
  });
  return new PrismaClient({ adapter });
}

/** Postgres en memoria (PGlite) con las migraciones aplicadas y datos de ejemplo. */
async function createDemoClient() {
  const { PGlite } = await import("@electric-sql/pglite");
  const { PrismaPGlite } = await import("pglite-prisma-adapter");
  const pg = new PGlite();

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const dirs = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  for (const dir of dirs) {
    await pg.exec(fs.readFileSync(path.join(migrationsDir, dir, "migration.sql"), "utf8"));
  }

  const client = new PrismaClient({ adapter: new PrismaPGlite(pg) });
  await seedBase(client, { fixedIds: true });
  await seedDemo(client);
  console.info("[demo] base en memoria lista (modo demo: sin DATABASE_URL)");
  return client;
}

// Reutiliza la instancia en desarrollo para no agotar conexiones con el hot reload.
export const prisma = globalForPrisma.prisma ?? (DEMO_MODE ? await createDemoClient() : createClient());

if (process.env.NODE_ENV !== "production" || DEMO_MODE) globalForPrisma.prisma = prisma;
