"use client";

import { useState, useTransition } from "react";
import { CalendarClock, Loader2, MoreHorizontal, StickyNote, Trash2 } from "lucide-react";
import {
  assignBooking,
  deleteBooking,
  rescheduleBooking,
  updateBookingNotes,
  updateBookingStatus,
  type ActionResult,
} from "../actions";
import { StatusBadge, inputCls, btnPrimary } from "@/components/dashboard/ui";
import { STATUS_LABELS } from "@/lib/utils";
import type { BookingStatus } from "@/generated/prisma/enums";

type Props = {
  booking: { id: string; status: BookingStatus; notes: string; assignedToId: string | null; dateKey: string; time: string };
  staff: { id: string; name: string }[];
  isAdmin: boolean;
};

// Transiciones rápidas sugeridas según el estado actual
const NEXT: Partial<Record<BookingStatus, { to: BookingStatus; label: string }>> = {
  PENDING: { to: "CONFIRMED", label: "Confirmar" },
  CONFIRMED: { to: "IN_PROGRESS", label: "Iniciar" },
  IN_PROGRESS: { to: "COMPLETED", label: "Completar" },
};

export function BookingActions({ booking, staff, isAdmin }: Props) {
  const [pending, start] = useTransition();
  const [panel, setPanel] = useState<null | "menu" | "reschedule" | "notes">(null);
  const [msg, setMsg] = useState<string | null>(null);

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const res = await fn();
      setMsg(res.ok ? res.message ?? null : res.error);
      if (res.ok) setPanel(null);
    });

  const next = NEXT[booking.status];

  return (
    <div className="flex items-start justify-between gap-3">
      <select
        aria-label="Asignar a"
        defaultValue={booking.assignedToId ?? ""}
        onChange={(e) => run(() => assignBooking(booking.id, e.target.value || null))}
        className="max-w-36 rounded-lg border border-line bg-white px-2 py-1 text-xs text-navy"
      >
        <option value="">Sin asignar</option>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <div className="flex flex-col items-start gap-1.5">
        <StatusBadge status={booking.status} />
        <select
          aria-label="Cambiar estado"
          value={booking.status}
          onChange={(e) => run(() => updateBookingStatus(booking.id, e.target.value as BookingStatus))}
          className="rounded-lg border border-line bg-white px-2 py-1 text-xs text-navy"
        >
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="relative flex items-center gap-1.5">
        {pending && <Loader2 className="size-4 animate-spin text-muted" />}
        {next && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => updateBookingStatus(booking.id, next.to))}
            className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-paper hover:bg-navy-soft"
          >
            {next.label}
          </button>
        )}
        <button
          type="button"
          onClick={() => setPanel(panel ? null : "menu")}
          className="grid size-8 place-items-center rounded-full border border-line hover:border-navy"
          aria-label="Más acciones"
        >
          <MoreHorizontal className="size-4" />
        </button>

        {panel && (
          <div className="absolute right-0 top-10 z-20 w-72 rounded-2xl border border-line bg-white p-3 shadow-xl">
            {panel === "menu" && (
              <ul className="text-sm">
                <li>
                  <button type="button" onClick={() => setPanel("reschedule")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 hover:bg-cream">
                    <CalendarClock className="size-4" /> Reprogramar
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setPanel("notes")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 hover:bg-cream">
                    <StickyNote className="size-4" /> Notas
                  </button>
                </li>
                {isAdmin && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("¿Eliminar esta reserva definitivamente?")) run(() => deleteBooking(booking.id));
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="size-4" /> Eliminar
                    </button>
                  </li>
                )}
              </ul>
            )}
            {panel === "reschedule" && (
              <form
                className="grid gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  run(() => rescheduleBooking(booking.id, String(fd.get("date")), String(fd.get("time"))));
                }}
              >
                <p className="text-xs font-bold text-navy">Nueva fecha y hora</p>
                <input type="date" name="date" defaultValue={booking.dateKey} required className={inputCls} />
                <input type="time" name="time" step={1800} defaultValue={booking.time} required className={inputCls} />
                <button className={btnPrimary} disabled={pending}>Guardar</button>
              </form>
            )}
            {panel === "notes" && (
              <form
                className="grid gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  run(() => updateBookingNotes(booking.id, String(fd.get("notes"))));
                }}
              >
                <textarea name="notes" defaultValue={booking.notes} rows={4} className={inputCls} />
                <button className={btnPrimary} disabled={pending}>Guardar notas</button>
              </form>
            )}
            {msg && <p className="mt-2 text-xs font-semibold text-tangerine">{msg}</p>}
          </div>
        )}
      </div>
      {!panel && msg && <p className="sr-only" role="status">{msg}</p>}
    </div>
  );
}
