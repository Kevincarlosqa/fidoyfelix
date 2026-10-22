"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Check } from "lucide-react";
import { Reveal, SplitHeading } from "./Reveal";
import { PHOTOS, unsplash } from "@/lib/catalog";

const CARDS = [
  { title: "Perros", photo: PHOTOS.frenchieBlue, bg: "bg-sky", note: "Todas las razas y tamaños", r: -4 },
  { title: "Gatos", photo: PHOTOS.kittenMint, bg: "bg-mint", note: "Manejo cat-friendly certificado", r: 3 },
  { title: "Familias", photo: PHOTOS.catAndDog, bg: "bg-sun", note: "Descuento multi-mascota", r: -2 },
];

const PERKS = ["Adopción responsable", "Cuidado preventivo", "Vacunación", "Grooming sin estrés"];

export function Species() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [90, -10]);
  const y3 = useTransform(scrollYProgress, [0, 1], [30, -50]);
  const ys = [y1, y2, y3];

  return (
    <section id="especies" ref={ref} className="relative mx-auto max-w-6xl scroll-mt-28 px-5 py-28 md:px-6">
      <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-32">
          <SplitHeading text="Así cuidamos a cada peludo" className="font-display text-6xl text-navy md:text-7xl" />
          <Reveal>
            <p className="mt-5 max-w-md text-muted">
              Hacemos que criar una mascota sea más sencillo. Cada rutina está pensada con amor y con
              protocolos de bienestar animal.
            </p>
            <ul className="mt-7 space-y-3">
              {PERKS.map((p, i) => (
                <li key={p} className="flex items-center gap-3 font-semibold text-navy">
                  <span
                    className={`grid size-6 place-items-center rounded-full border-2 border-navy ${
                      ["bg-sun", "bg-sky", "bg-bubble", "bg-mint"][i]
                    }`}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-16 sm:gap-x-6">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              style={{ y: ys[i], rotate: c.r }}
              className={i === 2 ? "relative z-10 col-span-2 mx-auto w-full max-w-sm" : "relative z-10"}
            >
              <div className={`group relative aspect-[4/5] overflow-hidden rounded-[32px] border-2 border-navy ${c.bg} shadow-sticker`}>
                <Image
                  src={unsplash(c.photo, 600, 750)}
                  alt={c.title}
                  fill
                  sizes="(min-width: 1024px) 300px, 45vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-x-3 bottom-3 rounded-2xl border-2 border-navy bg-paper p-3">
                  <p className="font-display text-3xl text-navy">{c.title}</p>
                  <p className="text-xs font-semibold text-muted">{c.note}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
