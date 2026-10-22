"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SplitHeading } from "./Reveal";
import { PHOTOS, unsplash } from "@/lib/catalog";

const ITEMS = [
  {
    quote: "Llevé a Milo por su primer grooming y regresó feliz y oliendo delicioso. Agendé por WhatsApp a las 11 de la noche. ¡Increíble!",
    name: "Shannon Pérez",
    role: "Mamá de Milo",
    photo: PHOTOS.frenchieBlue,
    bg: "bg-sky",
  },
  {
    quote: "Mi gata odia los baños, pero en el Spa Felino la trataron con muchísima paciencia. Por fin encontré un lugar de confianza.",
    name: "Ricardo Lozano",
    role: "Papá de Nala",
    photo: PHOTOS.kittenMint,
    bg: "bg-mint",
  },
  {
    quote: "El entrenamiento cambió nuestros paseos. Rocky ya no jala la correa y el equipo siempre nos manda fotos y avances.",
    name: "Andrea Domínguez",
    role: "Mamá de Rocky",
    photo: PHOTOS.goldenBlue,
    bg: "bg-sun",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const item = ITEMS[i];
  const go = (d: number) => setI((v) => (v + d + ITEMS.length) % ITEMS.length);

  return (
    <section id="opiniones" className="relative mx-auto max-w-6xl scroll-mt-28 px-5 py-24 md:px-6">
      <div className="relative z-10 grid overflow-hidden rounded-[36px] border-2 border-navy bg-paper lg:grid-cols-[1fr_1.1fr_0.8fr]">
        <div className="flex flex-col justify-between gap-8 border-b-2 border-navy p-8 lg:border-b-0 lg:border-r-2">
          <Paw2 />
          <div>
            <SplitHeading text="Lo que más nos importa" className="font-display text-5xl text-navy md:text-6xl" />
            <p className="mt-4 text-sm text-muted">
              <b className="font-display text-lg text-navy">Fido&amp;Felix —</b> un servicio único que combina
              cuidado profesional, bienestar y mucho cariño.
            </p>
          </div>
        </div>

        <div className="flex flex-col border-b-2 border-navy lg:border-b-0 lg:border-r-2">
          <div className="flex items-center justify-between border-b-2 border-navy px-8 py-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Testimonios</p>
            <p className="font-display text-4xl text-navy">0{i + 1} —</p>
          </div>
          <div className="relative min-h-60 flex-1 p-8">
            <span className="grid size-10 place-items-center rounded-full bg-tangerine text-white">
              <Quote className="size-5" />
            </span>
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="mt-5"
              >
                <p className="text-lg font-medium leading-relaxed text-navy">“{item.quote}”</p>
                <footer className="mt-6">
                  <p className="font-display text-2xl text-navy">{item.name}</p>
                  <p className="text-xs font-semibold text-muted">{item.role}</p>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          <div className="flex gap-2 border-t-2 border-navy px-8 py-4">
            <button type="button" onClick={() => go(-1)} aria-label="Anterior" className="grid size-10 place-items-center rounded-full border-2 border-navy hover:bg-sun">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Siguiente" className="grid size-10 place-items-center rounded-full border-2 border-navy bg-navy text-paper hover:bg-navy-soft">
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, rotate: -8, scale: 0.9 }}
              animate={{ opacity: 1, rotate: 3, scale: 1 }}
              exit={{ opacity: 0, rotate: 8, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className={`relative aspect-square w-full max-w-56 overflow-hidden rounded-[28px] border-2 border-navy ${item.bg}`}
            >
              <Image src={unsplash(item.photo, 500, 500)} alt="" fill sizes="224px" className="object-cover" />
            </motion.div>
          </AnimatePresence>
          <p className="text-sm font-bold text-navy">¡No te pierdas ningún momento!</p>
          <a href="#reservar" className="rounded-full border-2 border-navy bg-sun px-5 py-2 text-sm font-bold text-navy hover:shadow-sticker-sm">
            Reservar cita 🐶
          </a>
        </div>
      </div>
    </section>
  );
}

function Paw2() {
  return (
    <span className="grid size-14 place-items-center rounded-full border-2 border-navy bg-sun text-3xl">🐶</span>
  );
}
