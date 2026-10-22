import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { whatsappConfigured } from "@/lib/whatsapp";
import { cn, formatDateTime, formatTime } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { ChatPanel } from "./ChatPanel";

export default async function ConversacionesPage({ searchParams }: PageProps<"/dashboard/conversaciones">) {
  await requireUser();
  const sp = await searchParams;
  const selectedId = typeof sp.c === "string" ? sp.c : undefined;

  const conversations = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: {
      client: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const selected = selectedId ?? conversations[0]?.id;
  const active = selected
    ? await prisma.conversation.findUnique({
        where: { id: selected },
        include: {
          client: { select: { id: true, name: true } },
          messages: { orderBy: { createdAt: "asc" }, take: 200 },
        },
      })
    : null;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="WhatsApp"
        subtitle={
          whatsappConfigured()
            ? "Conversaciones atendidas por el asistente IA. Puedes tomar el control en cualquier momento."
            : "⚠️ WhatsApp no está configurado: define WHATSAPP_TOKEN y WHATSAPP_PHONE_NUMBER_ID. Mientras tanto usa el Simulador IA."
        }
      />
      {conversations.length ? (
        <div className="grid h-[calc(100dvh-220px)] min-h-[520px] overflow-hidden rounded-3xl border border-line bg-paper md:grid-cols-[320px_1fr]">
          <ul data-lenis-prevent className={cn("overflow-y-auto border-r border-line", active && "hidden md:block")}>
            {conversations.map((c) => {
              const last = c.messages[0];
              const isSim = c.phone.startsWith("000");
              return (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/conversaciones?c=${c.id}`}
                    className={cn(
                      "flex gap-3 border-b border-line/70 px-4 py-3 transition hover:bg-cream",
                      c.id === selected && "bg-cream",
                    )}
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sky font-display text-xl text-navy">
                      {(c.client?.name ?? c.profileName ?? "?").charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-bold text-navy">
                          {c.client?.name ?? c.profileName ?? `+${c.phone}`}
                          {isSim && <span className="ml-1 text-[10px] font-semibold text-muted">(simulador)</span>}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted">{formatTime(c.lastMessageAt)}</span>
                      </div>
                      <p className="truncate text-xs text-muted">
                        {last?.role === "ASSISTANT" ? "🤖 " : last?.role === "STAFF" ? "👤 " : ""}
                        {last?.content ?? "—"}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                            c.aiEnabled ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900",
                          )}
                        >
                          {c.aiEnabled ? "IA activa" : "Humano"}
                        </span>
                        {c.unread > 0 && (
                          <span className="rounded-full bg-tangerine px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {c.unread} nuevo{c.unread > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {active ? (
            <ChatPanel
              key={active.id}
              conversation={{
                id: active.id,
                phone: active.phone,
                title: active.client?.name ?? active.profileName ?? `+${active.phone}`,
                clientId: active.client?.id ?? null,
                aiEnabled: active.aiEnabled,
                unread: active.unread,
              }}
              messages={active.messages.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                at: formatDateTime(m.createdAt),
              }))}
            />
          ) : (
            <div className="grid place-items-center text-muted">Selecciona una conversación</div>
          )}
        </div>
      ) : (
        <EmptyState
          title="Aún no hay conversaciones"
          text="Cuando un cliente escriba a tu WhatsApp Business aparecerá aquí. Prueba el asistente desde el Simulador IA."
        />
      )}
    </div>
  );
}
