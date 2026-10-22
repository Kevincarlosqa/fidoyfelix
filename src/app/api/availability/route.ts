import { NextResponse, type NextRequest } from "next/server";
import { BookingError, getAvailableSlots } from "@/lib/booking";

// GET /api/availability?date=2026-11-03&serviceId=xxx
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const serviceId = request.nextUrl.searchParams.get("serviceId") ?? "";
  try {
    const { slots, closed, reason } = await getAvailableSlots(date, serviceId);
    return NextResponse.json({ date, slots, closed, reason });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
