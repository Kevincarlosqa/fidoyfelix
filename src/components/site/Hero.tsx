"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDownRight, Star } from "lucide-react";
import { Bone, Heart, Paw, WhatsAppIcon } from "@/components/brand/Paw";
import { PHOTOS, unsplash } from "@/lib/catalog";
import { whatsappLink } from "@/lib/config";

const ease = [0.22, 1, 0.36, 1] as const;

function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="-mr-6 block overflow-hidden pb-[0.06em] pr-6">
      <motion.span
        className="flex items-center gap-[0.18em]"
        initial={{ y: "105%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const archY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const badgeY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const ticketY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const ticketR = useTransform(scrollYProgress, [0, 1], [-4, -14]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section ref={ref} className="bg-grid relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 md:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div style={{ y: textY }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-navy bg-paper px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-navy"
          >
            <Paw className="size-4 text-tangerine" /> Servicio de mascotas · Beyond grooming.
          </motion.p>

          <h1 className="font-display whitespace-nowrap text-[clamp(2.8rem,7.4vw,5.9rem)] text-navy" aria-label="El mejor amigo de tu mejor amigo">
            <Line delay={0.1}>
              El mejor
              <span className="relative inline-block h-[0.78em] w-[1.5em] overflow-hidden rounded-full border-[3px] border-navy bg-sun align-middle">
                <Image src={unsplash(PHOTOS.pugYellow, 300, 200)} alt="" fill sizes="160px" className="object-cover" priority />
              </span>
            </Line>
            <Line delay={0.22}>amigo de tu</Line>
            <Line delay={0.34}>
              mejor amigo
              <motion.span
                className="inline-grid size-[0.72em] place-items-center rounded-full bg-bubble text-white shadow-[0_8px_24px_-6px_rgba(255,111,165,0.8)]"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="size-[0.42em]" />
              </motion.span>
            </Line>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-7 max-w-md text-lg leading-relaxed text-muted"
          >
            Grooming, spa, salud, entrenamiento y guardería para perros y gatos en Lima. Porque cuidarlos
            bien es cosa de familia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full border-2 border-navy bg-sun py-2 pl-5 pr-2 font-bold text-navy shadow-sticker-sm transition hover:-translate-y-0.5 hover:shadow-sticker"
            >
              Agenda por WhatsApp
              <span className="grid size-9 place-items-center rounded-full bg-navy text-sun transition group-hover:rotate-12">
                <WhatsAppIcon className="size-5" />
              </span>
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold text-navy underline-offset-4 hover:underline"
            >
              Ver servicios <ArrowDownRight className="size-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-10 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[PHOTOS.goldenBlue, PHOTOS.kittenMint, PHOTOS.corgiOrange, PHOTOS.samoyedPink].map((p) => (
                <span key={p} className="relative size-11 overflow-hidden rounded-full border-[3px] border-cream">
                  <Image src={unsplash(p, 120, 120)} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ))}
            </div>
            <div className="text-sm">
              <p className="flex items-center gap-1 font-bold text-navy">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-4 fill-sun text-sun" />
                ))}
                <span className="ml-1">4.9</span>
              </p>
              <p className="text-muted">+2,500 peludos felices</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Collage visual */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px]">
          <motion.div
            style={{ y: archY }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 1, ease }}
            className="absolute inset-x-6 bottom-0 top-10 origin-bottom rounded-t-full border-[3px] border-navy bg-sky"
          >
            <div className="bg-grid-light absolute inset-0 rounded-t-full" />
          </motion.div>

          <motion.div
            style={{ y: imgY }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.25, ease }}
            className="absolute inset-x-6 bottom-0 top-10 overflow-hidden rounded-t-full"
          >
            <Image
              src={unsplash(PHOTOS.heroFrenchie, 900, 1100)}
              alt="Bulldog francés con sudadera amarilla"
              fill
              priority
              sizes="(min-width: 1024px) 460px, 90vw"
              className="object-cover"
            />
          </motion.div>

          {/* Badge giratorio */}
          <motion.div
            style={{ y: badgeY }}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="absolute -right-2 top-1/3 z-10 size-32 md:-right-8 md:size-36"
          >
            <div className="relative size-full rounded-full border-[3px] border-navy bg-sun shadow-sticker-sm">
              <svg viewBox="0 0 100 100" className="animate-spin-slow absolute inset-0 size-full">
                <defs>
                  <path id="circle" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
                </defs>
                <text className="fill-navy text-[10px] font-extrabold uppercase">
                  <textPath href="#circle" textLength={224} lengthAdjust="spacing">
                    Beyond grooming • Stay tuned •
                  </textPath>
                </text>
              </svg>
              <Paw className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 text-navy" />
            </div>
          </motion.div>

          {/* Ticket estilo estampilla */}
          <motion.div
            style={{ y: ticketY, rotate: ticketR }}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease }}
            className="absolute -left-3 bottom-10 z-10 md:-left-14"
          >
            <div className="stamp bg-tangerine px-1 py-3 drop-shadow-[4px_4px_0_#13214a]">
              <div className="flex items-stretch border-2 border-dashed border-white/70 text-white">
                <div className="grid place-items-center border-r-2 border-dashed border-white/70 px-3">
                  <Bone className="size-9 -rotate-12" />
                </div>
                <div className="px-3 py-1.5">
                  <p className="font-display text-xl tracking-wide">Spa Deluxe</p>
                  <p className="text-[11px] font-medium leading-tight text-white/90">
                    Mascarilla · Aromaterapia
                    <br />
                    Masaje relajante
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hueso flotante */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.1, type: "spring" }}
            className="absolute left-0 top-16 z-10 md:-left-6"
          >
            <div className="animate-float grid size-16 place-items-center rounded-full border-2 border-navy bg-paper shadow-sticker-sm [--r:-12deg]">
              <Bone className="size-9 text-sun-deep" />
            </div>
          </motion.div>

          {/* Gato en burbuja */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.25, type: "spring" }}
            className="absolute -top-2 right-6 z-10"
          >
            <div className="animate-float relative size-20 overflow-hidden rounded-full border-[3px] border-navy bg-sky [animation-delay:1s]">
              <Image src={unsplash(PHOTOS.catBlue, 200, 200)} alt="Gato" fill sizes="80px" className="object-cover" />
            </div>
          </motion.div>

          {/* Notificación de WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.6, ease }}
            className="absolute -bottom-6 right-0 z-10 w-56 rounded-2xl border-2 border-navy bg-paper p-3 shadow-sticker-sm md:-right-10"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-[#25D366] text-white">
                <WhatsAppIcon className="size-4" />
              </span>
              <div className="text-xs">
                <p className="font-bold text-navy">Fido&amp;Felix</p>
                <p className="text-muted">ahora</p>
              </div>
            </div>
            <p className="mt-2 text-sm leading-snug text-navy">
              ¡Listo! 🐾 Cita para <b>Milo</b> el <b>sábado 10:30</b>. Código <b>FF-7KQ2MX</b>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
