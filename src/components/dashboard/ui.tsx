import type { ReactNode } from "react";
import { cn, SOURCE_LABELS, STATUS_LABELS } from "@/lib/utils";
import type { BookingSource, BookingStatus } from "@/generated/prisma/enums";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-5xl text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-3xl border border-line bg-paper p-5", className)}>{children}</div>;
}

export function CardTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-2">
      <h2 className="text-sm font-bold text-navy">{children}</h2>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}

// Los estados usan icono + etiqueta (nunca solo color).
const STATUS_STYLES: Record<BookingStatus, { cls: string; icon: string }> = {
  PENDING: { cls: "bg-amber-100 text-amber-900 ring-amber-300", icon: "⏳" },
  CONFIRMED: { cls: "bg-sky-100 text-sky-900 ring-sky-300", icon: "✔" },
  IN_PROGRESS: { cls: "bg-violet-100 text-violet-900 ring-violet-300", icon: "✂" },
  COMPLETED: { cls: "bg-emerald-100 text-emerald-900 ring-emerald-300", icon: "★" },
  CANCELLED: { cls: "bg-rose-100 text-rose-900 ring-rose-300", icon: "✕" },
  NO_SHOW: { cls: "bg-zinc-200 text-zinc-800 ring-zinc-300", icon: "∅" },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ring-1", s.cls)}>
      <span aria-hidden>{s.icon}</span>
      {STATUS_LABELS[status]}
    </span>
  );
}

const SOURCE_ICONS: Record<BookingSource, string> = { WHATSAPP: "💬", WEB: "🌐", DASHBOARD: "🖥️", PHONE: "📞" };

export function SourceBadge({ source }: { source: BookingSource }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-cream px-2 py-0.5 text-xs font-semibold text-navy">
      <span aria-hidden>{SOURCE_ICONS[source]}</span>
      {SOURCE_LABELS[source]}
    </span>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-line bg-paper px-6 py-16 text-center">
      <p className="text-4xl">🐾</p>
      <p className="mt-3 font-bold text-navy">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
    </div>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-bold text-paper transition hover:bg-navy-soft disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-bold text-navy transition hover:border-navy disabled:opacity-50";

export const btnSun =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-navy bg-sun px-4 py-2 text-sm font-bold text-navy transition hover:shadow-sticker-sm disabled:opacity-50";
