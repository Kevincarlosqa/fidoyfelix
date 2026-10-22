"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createManualBooking, fetchSlots } from "../../actions";
import { Card, inputCls, btnSun } from "@/components/dashboard/ui";
import { formatPrice } from "@/lib/utils";

type Service = { id: string; name: string; price: number; durationMin: number };

export function NewBookingForm({ services }: { services: Service[] }) {
  const [state, action, pending] = useActionState(createManualBooking, undefined);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [force, setForce] = useState(false);

  useEffect(() => {
    if (!date || !serviceId) return;
    let alive = true;
    fetchSlots(date, serviceId).then((r) => {
      if (!alive) return;
      setSlots(r.slots);
      setReason(r.reason ?? null);
    });
    return () => {
      alive = false;
    };
  }, [date, serviceId]);

  return (
    <form action={action} className="grid gap-4">
      <Card className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-navy sm:col-span-2">
          Servicio
          <select name="serviceId" value={serviceId} onChange={(e) => { setServiceId(e.target.value); setTime(""); }} className={inputCls}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name} · {formatPrice(s.price)} · {s.durationMin} min</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-navy">
          Fecha
          <input type="date" name="date" required value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-navy">
          Hora
          {force ? (
            <input type="time" name="time" required step={900} value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
          ) : (
            <select name="time" required value={time} onChange={(e) => setTime(e.target.value)} className={inputCls}>
              <option value="">{date ? (slots?.length ? "Elige hora" : reason ?? "Sin horarios") : "Elige fecha primero"}</option>
              {slots?.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </label>
        <label className="flex items-center gap-2 text-xs text-muted sm:col-span-2">
          <input type="checkbox" name="force" checked={force} onChange={(e) => setForce(e.target.checked)} />
          Ignorar disponibilidad (sobrecupo autorizado)
        </label>
      </Card>

      <Card className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-navy">
          Nombre del cliente
          <input name="clientName" required className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-navy">
          Teléfono (WhatsApp)
          <input name="phone" required type="tel" placeholder="987654321" className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-navy">
          Correo
          <input name="email" type="email" className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-navy">
          Canal
          <select name="source" className={inputCls} defaultValue="PHONE">
            <option value="PHONE">Teléfono</option>
            <option value="DASHBOARD">Mostrador / Dashboard</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-navy">
          Mascota
          <input name="petName" required className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-navy">
          Especie
          <select name="species" className={inputCls}>
            <option value="DOG">Perro</option>
            <option value="CAT">Gato</option>
            <option value="OTHER">Otro</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-navy">
          Raza
          <input name="breed" className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-navy">
          Tamaño
          <select name="size" className={inputCls} defaultValue="">
            <option value="">—</option>
            <option value="SMALL">Chico</option>
            <option value="MEDIUM">Mediano</option>
            <option value="LARGE">Grande</option>
            <option value="XLARGE">Gigante</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-navy sm:col-span-2">
          Notas
          <textarea name="notes" rows={3} className={inputCls} />
        </label>
      </Card>

      {state && (
        <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${state.ok ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>
          {state.ok ? state.message : state.error}
        </p>
      )}

      <button className={`${btnSun} py-3 text-base`} disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Crear reserva
      </button>
    </form>
  );
}
