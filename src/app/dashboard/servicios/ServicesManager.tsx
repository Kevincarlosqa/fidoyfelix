"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { saveService, toggleServiceActive } from "../actions";
import { Card, inputCls, btnPrimary, btnSun } from "@/components/dashboard/ui";
import { CATEGORY_LABELS, cn, formatPrice } from "@/lib/utils";

type Service = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: keyof typeof CATEGORY_LABELS;
  durationMin: number;
  price: number;
  sortOrder: number;
  active: boolean;
  bookings: number;
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ServiceForm({ service, onDone }: { service?: Service; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveService, undefined);
  const [name, setName] = useState(service?.name ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {service && <input type="hidden" name="id" value={service.id} />}
      <label className="grid gap-1 text-xs font-semibold text-navy">
        Nombre
        <input
          name="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!service) setSlug(slugify(e.target.value));
          }}
          className={inputCls}
        />
      </label>
      <label className="grid gap-1 text-xs font-semibold text-navy">
        Slug
        <input name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls} />
      </label>
      <label className="grid gap-1 text-xs font-semibold text-navy sm:col-span-2">
        Descripción (la usa también la IA)
        <textarea name="description" required defaultValue={service?.description} rows={2} className={inputCls} />
      </label>
      <label className="grid gap-1 text-xs font-semibold text-navy">
        Categoría
        <select name="category" defaultValue={service?.category ?? "GROOMING"} className={inputCls}>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-3 gap-2">
        <label className="grid gap-1 text-xs font-semibold text-navy">
          Precio $
          <input name="price" type="number" min={0} required defaultValue={service?.price} className={inputCls} />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-navy">
          Minutos
          <input name="durationMin" type="number" min={15} step={15} required defaultValue={service?.durationMin ?? 60} className={inputCls} />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-navy">
          Orden
          <input name="sortOrder" type="number" defaultValue={service?.sortOrder ?? 0} className={inputCls} />
        </label>
      </div>
      {state && !state.ok && <p className="text-sm font-semibold text-rose-700 sm:col-span-2">{state.error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button className={btnPrimary} disabled={pending}>{service ? "Guardar cambios" : "Crear servicio"}</button>
        <button type="button" onClick={onDone} className="text-sm font-semibold text-muted">Cancelar</button>
      </div>
    </form>
  );
}

export function ServicesManager({ services }: { services: Service[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      {editing === "new" ? (
        <Card>
          <ServiceForm onDone={() => setEditing(null)} />
        </Card>
      ) : (
        <button type="button" onClick={() => setEditing("new")} className={btnSun}>
          <Plus className="size-4" /> Nuevo servicio
        </button>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <Card key={s.id} className={cn(!s.active && "opacity-60")}>
            {editing === s.id ? (
              <ServiceForm service={s} onDone={() => setEditing(null)} />
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">{CATEGORY_LABELS[s.category]}</p>
                    <p className="font-display text-3xl text-navy">{s.name}</p>
                  </div>
                  <p className="font-display text-3xl text-navy">{formatPrice(s.price)}</p>
                </div>
                <p className="mt-2 text-sm text-muted">{s.description}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
                  <span>{s.durationMin} min · {s.bookings} reservas · /{s.slug}</span>
                  <div className="flex items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-2 font-semibold text-navy">
                      <input
                        type="checkbox"
                        checked={s.active}
                        disabled={pending}
                        onChange={(e) => start(async () => { await toggleServiceActive(s.id, e.target.checked); })}
                      />
                      Activo
                    </label>
                    <button type="button" onClick={() => setEditing(s.id)} className="grid size-8 place-items-center rounded-full border border-line hover:border-navy" aria-label="Editar">
                      {editing === s.id ? <X className="size-4" /> : <Pencil className="size-3.5" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
