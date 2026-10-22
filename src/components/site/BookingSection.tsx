"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Loader2, PartyPopper } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Paw, WhatsAppIcon } from "@/components/brand/Paw";
import { whatsappLink } from "@/lib/config";
import type { PublicService } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/utils";

const field =
  "w-full rounded-2xl border-2 border-navy/20 bg-paper px-4 py-3 text-navy outline-none transition placeholder:text-navy/35 focus:border-navy";

function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
}

export function BookingSection({ services }: { services: PublicService[] }) {
  const bookable = useMemo(() => services.filter((s) => s.id), [services]);
  const abortRef = useRef<AbortController | null>(null);
  const dateRef = useRef("");
  const [serviceId, setServiceId] = useState(bookable[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsMsg, setSlotsMsg] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; summary: string } | null>(null);

  const loadSlots = useCallback((nextDate: string, nextService: string) => {
    setTime("");
    abortRef.current?.abort();
    if (!nextDate || !nextService) {
      setSlots(null);
      return;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoadingSlots(true);
    fetch(`/api/availability?date=${nextDate}&serviceId=${nextService}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots ?? []);
        setSlotsMsg(d.error ?? d.reason ?? null);
        setLoadingSlots(false);
      })
      .catch(() => {});
  }, []);

  const selectService = useCallback(
    (id: string) => {
      setServiceId(id);
      loadSlots(dateRef.current, id);
    },
    [loadSlots],
  );

  // Preselección desde las tarjetas de servicios
  useEffect(() => {
    const onSelect = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      const s = bookable.find((x) => x.slug === slug);
      if (s) selectService(s.id);
    };
    window.addEventListener("ff:select-service", onSelect);
    return () => window.removeEventListener("ff:select-service", onSelect);
  }, [bookable, selectService]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          date,
          time,
          clientName: fd.get("clientName"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          petName: fd.get("petName"),
          species: fd.get("species"),
          breed: fd.get("breed") || undefined,
          notes: fd.get("notes") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo reservar");
      setDone({ code: data.code, summary: data.summary });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  const selected = bookable.find((s) => s.id === serviceId);

  return (
    <section id="reservar" className="relative scroll-mt-20 bg-navy py-24 text-paper">
      <div className="bg-grid-light pointer-events-none absolute inset-0 opacity-25" />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <LogoMark size={88} className="rounded-2xl ring-2 ring-paper/20" />
          <h2 className="font-display mt-8 text-6xl md:text-8xl">
            Reserva su <span className="text-sun">próximo</span> consentido
          </h2>
          <p className="mt-5 max-w-md text-paper/70">
            Elige servicio, día y hora. Te confirmamos por WhatsApp. ¿Prefieres chatear? Nuestro asistente
            te agenda en segundos.
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-navy-deep transition hover:-translate-y-0.5"
          >
            <WhatsAppIcon className="size-5" /> Reservar por WhatsApp
          </a>
        </div>

        <div className="relative z-10 rounded-[36px] border-2 border-paper/10 bg-paper p-6 text-navy shadow-[12px_12px_0_0_var(--color-sun)] md:p-8">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-96 flex-col items-center justify-center text-center"
              >
                <span className="grid size-20 place-items-center rounded-full border-2 border-navy bg-sun">
                  <PartyPopper className="size-9" />
                </span>
                <h3 className="font-display mt-6 text-5xl">¡Reserva recibida!</h3>
                <p className="mt-3 max-w-sm text-muted">{done.summary}</p>
                <p className="mt-6 rounded-2xl border-2 border-dashed border-navy px-6 py-3 font-display text-4xl tracking-widest">
                  {done.code}
                </p>
                <p className="mt-4 text-sm text-muted">Te contactaremos por WhatsApp para confirmarla 🐾</p>
                <button type="button" onClick={() => { setDone(null); setDate(""); dateRef.current = ""; loadSlots("", serviceId); }} className="mt-6 text-sm font-bold underline">
                  Hacer otra reserva
                </button>
              </motion.div>
            ) : !bookable.length ? (
              <motion.div key="empty" className="flex min-h-96 flex-col items-center justify-center text-center">
                <Paw className="size-14 text-sun-deep" />
                <h3 className="font-display mt-4 text-4xl">Agenda por WhatsApp</h3>
                <p className="mt-2 max-w-sm text-muted">La reserva en línea estará disponible muy pronto.</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={onSubmit} className="grid gap-5">
                <div>
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-muted">1 · Servicio</p>
                  <div data-lenis-prevent className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    {bookable.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectService(s.id)}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border-2 px-3 py-2.5 text-left text-sm transition",
                          s.id === serviceId ? "border-navy bg-sun font-bold" : "border-navy/15 hover:border-navy/40",
                        )}
                      >
                        <span>{s.name}</span>
                        <span className="text-xs font-bold">{formatPrice(s.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-muted">2 · Día y hora</p>
                  <label className="relative block">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-navy/50" />
                    <input
                      type="date"
                      required
                      min={todayISO()}
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        dateRef.current = e.target.value;
                        loadSlots(e.target.value, serviceId);
                      }}
                      className={cn(field, "pl-12")}
                      aria-label="Fecha"
                    />
                  </label>
                  <div className="mt-3 min-h-12">
                    {loadingSlots ? (
                      <p className="flex items-center gap-2 text-sm text-muted">
                        <Loader2 className="size-4 animate-spin" /> Buscando horarios…
                      </p>
                    ) : slots && slots.length ? (
                      <div className="flex flex-wrap gap-2">
                        {slots.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTime(t)}
                            className={cn(
                              "rounded-full border-2 px-3 py-1.5 text-sm font-bold transition",
                              t === time ? "border-navy bg-navy text-paper" : "border-navy/20 hover:border-navy",
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    ) : slots ? (
                      <p className="text-sm font-semibold text-tangerine">{slotsMsg ?? "Sin horarios ese día"} — prueba otra fecha.</p>
                    ) : (
                      <p className="text-sm text-muted">Selecciona una fecha para ver horarios disponibles.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-muted">3 · Tus datos</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input name="clientName" required placeholder="Tu nombre" className={field} />
                    <input name="phone" required type="tel" placeholder="WhatsApp (9 dígitos)" className={field} />
                    <input name="petName" required placeholder="Nombre de tu mascota" className={field} />
                    <select name="species" className={field} defaultValue="DOG">
                      <option value="DOG">Perro</option>
                      <option value="CAT">Gato</option>
                      <option value="OTHER">Otro</option>
                    </select>
                    <input name="breed" placeholder="Raza (opcional)" className={field} />
                    <input name="email" type="email" placeholder="Correo (opcional)" className={field} />
                    <textarea name="notes" placeholder="Notas: alergias, carácter, peticiones…" rows={2} className={cn(field, "sm:col-span-2")} />
                  </div>
                </div>

                {error && <p className="rounded-2xl bg-tangerine/15 px-4 py-3 text-sm font-semibold text-tangerine">{error}</p>}

                <button
                  type="submit"
                  disabled={!time || submitting}
                  className="flex items-center justify-center gap-2 rounded-full border-2 border-navy bg-sun py-4 font-display text-2xl text-navy transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-sticker-sm disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="size-5 animate-spin" /> : <Paw className="size-6" />}
                  {time && selected ? `Reservar ${selected.name} · ${time}` : "Reservar"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
