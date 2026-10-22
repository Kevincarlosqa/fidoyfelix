import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { BookingError, createBooking } from "@/lib/booking";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { describeBooking } from "@/lib/booking";
import type { BookingStatus } from "@/generated/prisma/enums";

/** POST /api/bookings — reserva pública desde la web. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  try {
    const booking = await createBooking(body as Parameters<typeof createBooking>[0], { source: "WEB" });
    return NextResponse.json(
      { code: booking.code, summary: describeBooking(booking), status: booking.status },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof BookingError) return NextResponse.json({ error: err.message }, { status: 409 });
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", issues: err.issues }, { status: 422 });
    }
    console.error("[api/bookings] error", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/** GET /api/bookings?from=&to=&status= — solo usuarios autenticados. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const sp = request.nextUrl.searchParams;
  const from = sp.get("from");
  const to = sp.get("to");
  const status = sp.get("status") as BookingStatus | null;

  const bookings = await prisma.booking.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(from || to
        ? { startsAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } }
        : {}),
    },
    include: { client: true, pet: true, service: true },
    orderBy: { startsAt: "asc" },
    take: 500,
  });
  return NextResponse.json({ bookings });
}
