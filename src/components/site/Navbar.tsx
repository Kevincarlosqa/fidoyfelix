"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { Paw } from "@/components/brand/Paw";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#whatsapp", label: "Cómo agendar" },
  { href: "#especies", label: "Especies" },
  { href: "#opiniones", label: "Opiniones" },
  { href: "#pronto", label: "Stay tuned" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 400 && !open);
    setScrolled(y > 24);
  });

  return (
    <motion.header
      animate={{ y: hidden ? -120 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4"
    >
      <nav
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border-2 border-navy bg-paper/90 py-2 pl-2 pr-2 backdrop-blur-md transition-shadow md:pl-3",
          scrolled ? "shadow-sticker-sm" : "shadow-none",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="Fido&Felix, inicio">
          <LogoMark size={40} className="rounded-full" />
          <Wordmark className="text-2xl" />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative rounded-full px-3.5 py-2 text-sm font-semibold text-navy/80 transition hover:text-navy"
              >
                {l.label}
                <Paw className="absolute -top-0.5 left-1/2 size-3 -translate-x-1/2 scale-0 text-tangerine transition group-hover:scale-100" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-xs font-semibold text-muted hover:text-navy sm:block"
          >
            Equipo
          </Link>
          <a
            href="#reservar"
            className="rounded-full border-2 border-navy bg-sun px-4 py-2 text-sm font-bold text-navy transition hover:-translate-y-0.5 hover:shadow-sticker-sm md:px-5"
          >
            Reservar
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border-2 border-navy lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className="mx-auto mt-2 grid max-w-6xl gap-1 rounded-3xl border-2 border-navy bg-paper p-3 shadow-sticker-sm lg:hidden"
          >
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-display block rounded-2xl px-4 py-3 text-2xl text-navy hover:bg-sun"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/login" className="block px-4 py-2 text-sm font-semibold text-muted">
                Acceso equipo →
              </Link>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
