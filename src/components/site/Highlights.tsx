import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { PHOTOS, unsplash } from "@/lib/catalog";

function RotatingPrice({ price, label }: { price: string; label: string }) {
  return (
    <div className="relative grid size-32 place-items-center">
      <svg viewBox="0 0 100 100" className="animate-spin-slow absolute inset-0 size-full">
        <defs>
          <path id="ring" d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
        </defs>
        <text className="fill-navy text-[8.5px] font-bold uppercase">
          <textPath href="#ring" textLength={249} lengthAdjust="spacing">
            Grooming • Salud • Ejercicio • Amor •
          </textPath>
        </text>
      </svg>
      <div className="text-center">
        <p className="font-display text-4xl text-navy">{price}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</p>
      </div>
    </div>
  );
}

export function Highlights() {
  return (
    <section className="relative mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-2 md:px-6">
      <Reveal className="relative z-10">
        <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-navy bg-paper sm:ml-16 sm:min-h-48 sm:flex-row sm:items-stretch sm:overflow-visible md:ml-24">
          {/* Móvil: la foto va como encabezado de la tarjeta */}
          <div className="relative h-48 border-b-2 border-navy bg-tangerine sm:hidden">
            <Image src={unsplash(PHOTOS.corgiOrange, 700, 420)} alt="Corgi feliz" fill sizes="100vw" className="object-cover object-[50%_30%]" />
          </div>
          <div className="flex flex-1 flex-col justify-center p-6 sm:py-6 sm:pl-20 sm:pr-4 md:pl-24">
            <h3 className="font-display text-3xl text-navy">Membresía Club Peludo</h3>
            <p className="mt-2 text-sm text-muted">Baño mensual, uñas ilimitadas y 15% en spa.</p>
            <a href="#reservar" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-navy underline underline-offset-4">
              Quiero unirme <ArrowUpRight className="size-4" />
            </a>
          </div>
          <div className="grid place-items-center border-t-2 border-navy px-3 py-3 sm:border-l-2 sm:border-t-0 sm:py-0">
            <RotatingPrice price="S/140" label="al mes" />
          </div>
        </div>
        {/* Escritorio: foto en arco que sobresale por la izquierda */}
        <div className="absolute -left-2 bottom-0 hidden h-56 w-40 sm:block md:-left-4 md:h-64 md:w-48">
          <div className="relative size-full overflow-hidden rounded-t-full rounded-b-3xl border-2 border-navy bg-tangerine">
            <Image src={unsplash(PHOTOS.corgiOrange, 400, 520)} alt="Corgi feliz" fill sizes="200px" className="object-cover" />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="relative z-10">
        <div className="flex min-h-48 overflow-hidden rounded-3xl border-2 border-navy bg-sun">
          <div className="relative w-2/5 shrink-0 border-r-2 border-navy bg-bubble">
            <Image src={unsplash(PHOTOS.samoyedPink, 400, 400)} alt="Samoyedo recién bañado" fill sizes="240px" className="object-cover" />
            <span className="absolute left-3 top-3 rounded-full border-2 border-navy bg-paper px-2 py-0.5 text-[10px] font-extrabold uppercase text-navy">
              Nuevo
            </span>
          </div>
          <div className="flex flex-col justify-center p-6">
            <h3 className="font-display text-3xl text-navy">Spa Deluxe con aromaterapia</h3>
            <p className="mt-2 text-sm text-navy/80">Mascarilla hidratante, masaje relajante y perfume hipoalergénico.</p>
            <a href="#reservar" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-navy underline underline-offset-4">
              Reservar ahora <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
