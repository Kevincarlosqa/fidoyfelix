// Semilla: servicios + admin inicial. Con `--demo` agrega clientes, reservas y chats de ejemplo.
//   npm run db:seed        → servicios y admin
//   npm run db:seed:demo   → además datos de demostración para el dashboard
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedBase, seedDemo } from "../src/lib/seed-data";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
});

async function main() {
  const base = await seedBase(prisma, {
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
  });
  console.log(`✔ ${base.services} servicios`);
  console.log(`✔ admin: ${base.email}`);

  if (process.argv.includes("--demo")) {
    const demo = await seedDemo(prisma);
    console.log(`✔ ${demo.clients} clientes y ${demo.bookings} reservas demo`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
