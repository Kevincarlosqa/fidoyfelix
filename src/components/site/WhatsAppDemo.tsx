"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { CheckCheck, Sparkles } from "lucide-react";
import { Paw, WhatsAppIcon } from "@/components/brand/Paw";
import { whatsappLink } from "@/lib/config";
import { cn } from "@/lib/utils";

const CHAT: { from: "me" | "bot"; text: string }[] = [
  { from: "me", text: "Hola! Quiero agendar baño para mi frenchie 🐶" },
  { from: "bot", text: "¡Hola! Soy Felix 🐾 ¿Cómo se llama tu peludo y qué día te acomoda?" },
  { from: "me", text: "Se llama Milo, ¿el sábado en la mañana?" },
  { from: "bot", text: "Para Baño & Cepillado el sábado tengo: *10:00*, *10:30* y *11:30* ⏰" },
  { from: "me", text: "10:30 porfa" },
  { from: "bot", text: "¡Listo! ✅ Milo · sábado *10:30* · S/ 60\nTu código: *FF-7KQ2MX*" },
];

const STEPS = [
  { title: "Escríbenos", text: "Mándanos un WhatsApp a cualquier hora. Nuestro asistente con IA responde al instante." },
  { title: "Elige horario", text: "Te muestra horarios reales disponibles y recomienda el servicio ideal para tu mascota." },
  { title: "¡Listo!", text: "Recibes tu código de reserva y el equipo la confirma. Sin llamadas ni esperas." },
];

function renderText(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") ? <b key={i}>{part.slice(1, -1)}</b> : <span key={i}>{part}</span>,
  );
}

export function WhatsAppDemo() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [visible, setVisible] = useState(0);
  const phoneRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-6, 0, 4]);
  const blobScale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setVisible(Math.min(CHAT.length, Math.floor(p * (CHAT.length + 1.2))));
  });

  const step = visible <= 2 ? 0 : visible <= 4 ? 1 : 2;

  return (
    <section id="whatsapp" ref={ref} className="relative h-[320vh] scroll-mt-0 bg-navy text-paper">
      <div className="sticky top-0 z-10 flex h-dvh items-center overflow-hidden">
        <motion.div
          style={{ scale: blobScale }}
          className="pointer-events-none absolute -right-40 top-1/2 size-[640px] -translate-y-1/2 rounded-full bg-navy-soft"
        />
        <div className="bg-grid-light pointer-events-none absolute inset-0 opacity-30" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-6 px-5 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border-2 border-sun px-3 py-1 text-xs font-bold uppercase tracking-wider text-sun">
              <Sparkles className="size-3.5" /> Reservas con IA 24/7
            </p>
            <h2 className="font-display mt-4 text-5xl sm:text-6xl md:text-8xl">
              Agenda en <span className="text-sun">30 segundos</span>
            </h2>
            <ol className="mt-8 hidden space-y-3 md:block">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className={cn(
                    "flex gap-4 rounded-3xl border-2 p-4 transition-all duration-500",
                    i === step ? "border-sun bg-sun text-navy" : "border-paper/15 text-paper/60",
                  )}
                >
                  <span className="font-display grid size-11 shrink-0 place-items-center rounded-full border-2 border-current text-2xl">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display text-2xl">{s.title}</p>
                    <p className="text-sm">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-bold lg:mt-8 lg:px-6 lg:py-3 text-navy-deep transition hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="size-5" /> Probarlo ahora
            </a>
          </div>

          {/* Teléfono */}
          <motion.div style={{ rotate: phoneRotate }} className="relative z-10 mx-auto w-full max-w-[290px] sm:max-w-[330px]">
            <div className="rounded-[46px] border-[10px] border-navy-deep bg-navy-deep shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
              <div className="overflow-hidden rounded-[36px] bg-[#efe7dc]">
                <div className="flex items-center gap-3 bg-[#0b5c4f] px-4 pb-3 pt-6 text-white">
                  <span className="grid size-9 place-items-center rounded-full bg-sun text-navy">
                    <Paw className="size-5" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-bold">Fido&amp;Felix</p>
                    <p className="text-[11px] text-white/80">{visible % 2 === 1 && visible < CHAT.length ? "escribiendo…" : "en línea"}</p>
                  </div>
                </div>
                <div data-lenis-prevent className="flex h-[clamp(200px,38dvh,440px)] flex-col justify-end gap-2 overflow-hidden p-3 lg:h-[440px]">
                  <AnimatePresence initial={false}>
                    {CHAT.slice(0, visible).map((m, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        className={cn(
                          "max-w-[82%] whitespace-pre-line rounded-2xl px-3 py-2 text-[13px] leading-snug text-[#111b21] shadow-sm",
                          m.from === "me" ? "self-end rounded-tr-sm bg-[#d9fdd3]" : "self-start rounded-tl-sm bg-white",
                        )}
                      >
                        {renderText(m.text)}
                        <span className="ml-2 inline-flex translate-y-0.5 items-center gap-0.5 text-[10px] text-[#667781]">
                          10:2{i}
                          {m.from === "me" && <CheckCheck className="size-3 text-[#53bdeb]" />}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2 bg-[#f0f2f5] px-3 py-2.5">
                  <div className="h-9 flex-1 rounded-full bg-white px-4 text-[13px] leading-9 text-[#667781]">Mensaje</div>
                  <span className="grid size-9 place-items-center rounded-full bg-[#00a884] text-white">
                    <WhatsAppIcon className="size-4" />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
