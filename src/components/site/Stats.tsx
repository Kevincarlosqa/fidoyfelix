"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

const STATS = [
  { value: 2500, suffix: "+", label: "Peludos felices", bg: "bg-sun" },
  { value: 4.9, suffix: "★", label: "Calificación promedio", bg: "bg-sky", decimals: 1 },
  { value: 12, suffix: "", label: "Expertos certificados", bg: "bg-bubble" },
  { value: 24, suffix: "/7", label: "Agenda por WhatsApp", bg: "bg-mint" },
];

function Counter({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = v.toLocaleString("es-PE", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      },
    });
    return () => controls.stop();
  }, [inView, to, decimals]);
  return <span ref={ref}>0</span>;
}

export function Stats() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 md:px-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`${s.bg} relative z-10 rounded-[28px] border-2 border-navy p-6 text-navy shadow-sticker-sm ${i % 2 ? "lg:translate-y-6" : ""}`}
          >
            <p className="font-display text-6xl md:text-7xl">
              <Counter to={s.value} decimals={s.decimals} />
              {s.suffix}
            </p>
            <p className="mt-2 text-sm font-bold">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
