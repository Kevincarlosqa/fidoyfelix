"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, Loader2, Send, User } from "lucide-react";
import { markConversationRead, sendStaffReply, toggleConversationAI } from "../actions";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "USER" | "ASSISTANT" | "STAFF"; content: string; at: string };

export function renderWhatsApp(text: string) {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") && part.length > 2 ? <b key={i}>{part.slice(1, -1)}</b> : <span key={i}>{part}</span>,
  );
}

export function ChatPanel({
  conversation,
  messages,
}: {
  conversation: { id: string; phone: string; title: string; clientId: string | null; aiEnabled: boolean; unread: number };
  messages: Msg[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (conversation.unread > 0) markConversationRead(conversation.id).then(() => router.refresh());
  }, [conversation.id, conversation.unread, router]);

  // Refresco periódico para ver mensajes nuevos que entran por el webhook
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(t);
  }, [router]);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/conversaciones" className="md:hidden" aria-label="Volver">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="font-bold text-navy">
              {conversation.clientId ? (
                <Link href={`/dashboard/clientes/${conversation.clientId}`} className="hover:underline">{conversation.title}</Link>
              ) : (
                conversation.title
              )}
            </p>
            <p className="text-xs text-muted">+{conversation.phone}</p>
          </div>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => { await toggleConversationAI(conversation.id, !conversation.aiEnabled); })}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition",
            conversation.aiEnabled ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200" : "bg-amber-100 text-amber-900 hover:bg-amber-200",
          )}
          title={conversation.aiEnabled ? "Pausar la IA y responder tú" : "Devolver la conversación a la IA"}
        >
          {conversation.aiEnabled ? <Bot className="size-4" /> : <User className="size-4" />}
          {conversation.aiEnabled ? "IA respondiendo · Tomar control" : "Atiende un humano · Activar IA"}
        </button>
      </div>

      <div data-lenis-prevent className="flex-1 space-y-2 overflow-y-auto bg-[#efe7dc] p-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "USER" ? "justify-start" : "justify-end")}>
            <div
              className={cn(
                "max-w-[78%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm text-[#111b21] shadow-sm",
                m.role === "USER" ? "rounded-tl-sm bg-white" : m.role === "ASSISTANT" ? "rounded-tr-sm bg-[#d9fdd3]" : "rounded-tr-sm bg-[#fff3c4]",
              )}
            >
              {m.role !== "USER" && (
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0b5c4f]">
                  {m.role === "ASSISTANT" ? "🤖 Felix (IA)" : "👤 Equipo"}
                </p>
              )}
              {renderWhatsApp(m.content)}
              <p className="mt-1 text-right text-[10px] text-[#667781]">{m.at}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-line bg-paper p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setError(null);
          start(async () => {
            const res = await sendStaffReply(conversation.id, text);
            if (res.ok) setText("");
            else setError(res.error);
          });
        }}
      >
        <div className="flex-1">
          {error && <p className="mb-1 text-xs font-semibold text-rose-700">{error}</p>}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            placeholder={conversation.aiEnabled ? "Escribe para responder (esto pausará la IA)…" : "Escribe un mensaje…"}
            className="max-h-32 w-full resize-none rounded-2xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-navy"
          />
        </div>
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="grid size-11 place-items-center rounded-full bg-navy text-paper disabled:opacity-40"
          aria-label="Enviar"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </form>
    </div>
  );
}
