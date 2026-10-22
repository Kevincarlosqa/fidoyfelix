import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/services — catálogo público de servicios activos
export async function GET() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true, description: true, category: true, durationMin: true, price: true },
  });
  return NextResponse.json({ services });
}
