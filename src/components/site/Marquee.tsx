"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Paw } from "@/components/brand/Paw";
import { cn } from "@/lib/utils";

const DEFAULT_ITEMS = [
  { label: "Grooming", emoji: "✂️" },
  { label: "Salud", emoji: "🩺" },
  { label: "Spa", emoji: "🛁" },
  { label: "Entrenamiento", emoji: "🎓" },
  { label: "Guardería", emoji: "🏡" },
  { label: "Paseos", emoji: "🦮" },
  { label: "Amor", emoji: "❤️" },
];

/** Cinta infinita; además se inclina y desplaza con el scroll. */
export function Marquee({
  items = DEFAULT_ITEMS,
  className,
  tilt = -2,
  reverse = false,
}: {
  items?: { label: string; emoji: string }[];
  className?: string;
  tilt?: number;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reverse ? ["-12%", "4%"] : ["4%", "-12%"]);
  const row = [...items, ...items];

  return (
    <div ref={ref} className={cn("relative overflow-hidden py-6", className)} style={{ rotate: `${tilt}deg` }}>
      <motion.div style={{ x }}>
        <div
          className="animate-marquee flex w-max items-center"
          style={{ animationDirection: reverse ? "reverse" : "normal" }}
        >
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {row.map((it, i) => (
                <span key={`${dup}-${i}`} className="flex items-center gap-4 px-5">
                  <span className="font-display text-4xl md:text-5xl">{it.label}</span>
                  <span className="grid size-11 place-items-center rounded-full border-2 border-current bg-paper text-2xl">
                    {it.emoji}
                  </span>
                  <Paw className="size-5 opacity-60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
