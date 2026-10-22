"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, RotateCcw, Send } from "lucide-react";
import { resetSimulation, simulateMessage } from "../actions";
import { renderWhatsApp } from "../conversaciones/ChatPanel";
import { Paw } from "@/components/brand/Paw";
import { cn } from "@/lib/utils";
import { btnSecondary } from "@/components/dashboard/ui";

type Msg = { role: "USER" | "ASSISTANT" | "STAFF"; content: string };

const SUGGESTIONS = [
  "Hola! Quiero agendar un baño para mi perrita Luna 🐶",
  "¿Cuánto cuesta el spa para gatos?",
  "¿Tienen espacio mañana a las 11?",
  "Quiero cancelar mi cita",
];

export function Simulator({ phone, initial, aiConfigured }: { phone: string; initial: Msg[]; aiConfigured: boolean }) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, pending]);

  function send(content: string) {
    const body = content.trim();
    if (!body || pending) return;
    setMessages((m) => [...m, { role: "USER", content: body }]);
    setText("");
    start(async () => {
      try {
        const { reply } = await simulateMessage(phone, body);
        setMessages((m) => [
          ...m,
          { role: "ASSISTANT", content: reply ?? "(La IA está pausada en esta conversación. Actívala desde WhatsApp → Simulador.)" },
        ]);
      } catch {
        setMessages((m) => [...m, { role: "ASSISTANT", content: "⚠️ Error al contactar a la IA. Revisa ANTHROPIC_API_KEY." }]);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-[40px] border-[10px] border-navy-deep bg-navy-deep shadow-2xl">
          <div className="flex items-center gap-3 rounded-t-[30px] bg-[#0b5c4f] px-4 pb-3 pt-5 text-white">
            <span className="grid size-9 place-items-center rounded-full bg-sun text-navy">
              <Paw className="size-5" />
            </span>
            <div className="flex-1 leading-tight">
              <p className="text-sm font-bold">Fido&amp;Felix</p>
              <p className="text-[11px] text-white/80">{pending ? "escribiendo…" : "en línea"}</p>
            </div>
          </div>
          <div data-lenis-prevent className="h-[520px] space-y-2 overflow-y-auto bg-[#efe7dc] p-3">
            {!messages.length && (
              <p className="mx-auto mt-8 max-w-60 rounded-xl bg-[#fff3c4] p-3 text-center text-xs text-[#54656f]">
                Escribe como si fueras un cliente. El asistente puede consultar horarios reales y crear reservas.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "USER" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[82%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-snug text-[#111b21] shadow-sm",
                    m.role === "USER" ? "rounded-tr-sm bg-[#d9fdd3]" : "rounded-tl-sm bg-white",
                  )}
                >
                  {renderWhatsApp(m.content)}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex">
                <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-white px-3 py-3 shadow-sm">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="size-2 animate-bounce rounded-full bg-[#667781]" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            className="flex items-center gap-2 rounded-b-[30px] bg-[#f0f2f5] px-3 py-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Mensaje"
              className="h-10 flex-1 rounded-full bg-white px-4 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={pending || !text.trim()}
              className="grid size-10 place-items-center rounded-full bg-[#00a884] text-white disabled:opacity-50"
              aria-label="Enviar"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </form>
        </div>
      </div>

      <aside className="space-y-4">
        {!aiConfigured && (
          <p className="rounded-2xl bg-amber-100 p-4 text-sm font-semibold text-amber-900">
            No se detectó <code>ANTHROPIC_API_KEY</code> en el .env. Configúrala para que la IA pueda responder.
          </p>
        )}
        <div className="rounded-3xl border border-line bg-paper p-4">
          <p className="mb-3 text-sm font-bold text-navy">Prueba con…</p>
          <div className="grid gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() => send(s)}
                className="rounded-2xl bg-cream px-3 py-2 text-left text-xs font-semibold text-navy transition hover:bg-sun disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className={`${btnSecondary} w-full`}
          disabled={pending}
          onClick={() => start(async () => { await resetSimulation(phone); setMessages([]); })}
        >
          <RotateCcw className="size-4" /> Reiniciar conversación
        </button>
      </aside>
    </div>
  );
}
