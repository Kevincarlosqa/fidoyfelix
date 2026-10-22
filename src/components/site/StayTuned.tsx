"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Lock } from "lucide-react";
import { Paw } from "@/components/brand/Paw";

const SOON = [
  { title: "Hotel boutique", text: "Suites con cámara 24/7 para que los veas desde tu celular.", emoji: "🏨", bg: "bg-sky" },
  { title: "Tele-vet", text: "Videoconsultas con nuestros veterinarios cuando lo necesites.", emoji: "📱", bg: "bg-bubble" },
  { title: "Pet taxi", text: "Recogemos y llevamos a tu peludo de forma segura.", emoji: "🚐", bg: "bg-mint" },
  { title: "Tienda gourmet", text: "Comida natural y snacks horneados en casa.", emoji: "🦴", bg: "bg-sun" },
];

/** "Beyond grooming. Stay tuned": lo que viene. Las tarjetas se despliegan con el scroll. */
export function StayTuned() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const titleScale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <section id="pronto" ref={ref} className="relative scroll-mt-20 overflow-hidden bg-sun py-28">
      <div className="bg-grid absolute inset-0" />
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        <motion.div style={{ scale: titleScale, opacity: titleOpacity }} className="text-center">
          <p className="font-display text-2xl text-navy/70">Beyond grooming.</p>
          <h2 className="font-display text-[clamp(4.5rem,16vw,12rem)] text-navy">
            Stay tuned
            <motion.span
              className="inline-block"
              animate={{ rotate: [0, 18, -10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2 }}
            >
              <Paw className="ml-3 inline size-[0.6em] text-tangerine" />
            </motion.span>
          </h2>
          <p className="mx-auto max-w-lg font-semibold text-navy/80">
            Estamos preparando nuevos servicios para consentir a tu familia peluda. Sé el primero en enterarte.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SOON.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 80, rotate: i % 2 ? 6 : -6 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 2 : -2 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ rotate: 0, y: -6 }}
              className="relative z-10 rounded-[28px] border-2 border-navy bg-paper p-6 shadow-sticker"
            >
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sun">
                <Lock className="size-3" /> Pronto
              </span>
              <span className={`grid size-14 place-items-center rounded-2xl border-2 border-navy text-3xl ${s.bg}`}>
                {s.emoji}
              </span>
              <h3 className="font-display mt-5 text-3xl text-navy">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
