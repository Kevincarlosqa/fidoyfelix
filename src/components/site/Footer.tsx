import Link from "next/link";
import { AtSign, Mail, MapPin } from "lucide-react";
import { Wordmark } from "@/components/brand/Logo";
import { Paw } from "@/components/brand/Paw";
import { BUSINESS } from "@/lib/config";

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden bg-navy-deep pt-20 text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-3 md:px-6">
        <div>
          <Wordmark light className="text-5xl" />
          <p className="mt-3 text-paper/60">Servicio de mascotas · {BUSINESS.tagline}</p>
        </div>
        <ul className="space-y-3 text-sm text-paper/80">
          <li className="flex items-center gap-2"><MapPin className="size-4 text-sun" /> {BUSINESS.address}</li>
          <li className="flex items-center gap-2"><Mail className="size-4 text-sun" /> {BUSINESS.email}</li>
          <li>
            <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sun">
              <AtSign className="size-4 text-sun" /> @fidoandfelix
            </a>
          </li>
        </ul>
        <div className="text-sm text-paper/80">
          <p className="font-display text-xl text-paper">Horario</p>
          <p className="mt-2">Lunes a viernes · 9:00 – 19:00</p>
          <p>Sábado · 10:00 – 16:00</p>
          <p className="mt-4 text-paper/50">
            <Link href="/login" className="hover:text-sun">Acceso equipo</Link>
          </p>
        </div>
      </div>
      <div className="relative mt-16 select-none overflow-hidden">
        <p className="font-display translate-y-[18%] text-center text-[22vw] leading-none text-paper/[0.06]">
          FIDO&amp;FELIX
        </p>
        <Paw className="absolute bottom-6 right-[8%] size-16 rotate-12 text-sun" />
      </div>
      <p className="border-t border-paper/10 py-5 text-center text-xs text-paper/40">
        © {new Date().getFullYear()} Fido&amp;Felix. Hecho con 🐾 en Lima.
      </p>
    </footer>
  );
}
