"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { Clock, ArrowUpRight } from "lucide-react";
import { Reveal, SplitHeading } from "./Reveal";
import { FALLBACK_VISUAL, SERVICE_VISUALS, unsplash, type PublicService } from "@/lib/catalog";
import { CATEGORY_LABELS, cn, formatPrice } from "@/lib/utils";

const FILTERS = ["TODOS", "GROOMING", "SPA", "HEALTH", "TRAINING", "DAYCARE", "WALKING"] as const;

export function Services({ services }: { services: PublicService[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("TODOS");
  const available = FILTERS.filter((f) => f === "TODOS" || services.some((s) => s.category === f));
  const list = filter === "TODOS" ? services : services.filter((s) => s.category === filter);

  return (
    <section id="servicios" className="relative mx-auto max-w-6xl scroll-mt-28 px-5 py-20 md:px-6">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SplitHeading text="Mucho más que un baño" className="font-display max-w-xl text-6xl text-navy md:text-7xl" />
        <Reveal className="max-w-xs text-muted">
          <p>Todo lo que tu peludo necesita, en un solo lugar y con gente que lo trata como familia.</p>
        </Reveal>
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        {available.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border-2 border-navy px-4 py-1.5 text-sm font-bold transition",
              filter === f ? "bg-navy text-paper" : "bg-paper text-navy hover:bg-sun",
            )}
          >
            {f === "TODOS" ? "Todos" : CATEGORY_LABELS[f]}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s, i) => {
          const v = SERVICE_VISUALS[s.slug] ?? FALLBACK_VISUAL;
          return (
            <motion.article
              layout
              key={s.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, rotate: i % 2 ? 1 : -1 }}
              className="group relative z-10 flex flex-col"
            >
              <div className={cn("relative aspect-[5/4] overflow-hidden rounded-[28px] border-2 border-navy", v.bg)}>
                <div className="bg-grid-light absolute inset-0" />
                <Image
                  src={unsplash(v.photo, 700, 560)}
                  alt={s.name}
                  fill
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full border-2 border-navy bg-paper px-3 py-1 text-xs font-extrabold uppercase text-navy">
                  {v.emoji} {CATEGORY_LABELS[s.category as keyof typeof CATEGORY_LABELS] ?? s.category}
                </span>
                <span className="absolute bottom-4 right-4 rounded-2xl border-2 border-navy bg-sun px-3 py-1.5 font-display text-2xl text-navy shadow-sticker-sm">
                  {formatPrice(s.price)}
                </span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-4 px-1">
                <div>
                  <h3 className="font-display text-3xl text-navy">{s.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{s.description}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-navy/70">
                    <Clock className="size-3.5" /> {s.durationMin} min
                  </p>
                </div>
                <a
                  href="#reservar"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("ff:select-service", { detail: s.slug }));
                  }}
                  aria-label={`Reservar ${s.name}`}
                  className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-navy bg-paper text-navy transition group-hover:rotate-45 group-hover:bg-sun"
                >
                  <ArrowUpRight className="size-5" />
                </a>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
