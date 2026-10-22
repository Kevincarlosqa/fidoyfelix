import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { Paw } from "@/components/brand/Paw";
import { LoginForm } from "./LoginForm";
import { DEMO_MODE } from "@/lib/demo";
import { DEMO_ADMIN } from "@/lib/seed-data";

export const metadata: Metadata = { title: "Acceso equipo" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy p-12 text-paper lg:flex lg:flex-col lg:justify-between">
        <div className="bg-grid-light absolute inset-0 opacity-30" />
        {Array.from({ length: 10 }, (_, i) => (
          <Paw
            key={i}
            className="absolute size-10 text-paper/10"
            style={{ left: `${12 + (i % 2) * 9 + i * 7}%`, top: `${88 - i * 9}%`, rotate: `${30 + i * 4}deg` }}
          />
        ))}
        <Link href="/" className="relative">
          <Wordmark light className="text-4xl" />
        </Link>
        <div className="relative">
          <p className="font-display text-8xl leading-[0.9]">
            Hola,
            <br />
            <span className="text-sun">equipo</span> 🐾
          </p>
          <p className="mt-6 max-w-sm text-paper/70">
            Gestiona reservas, conversaciones de WhatsApp y métricas de Fido&amp;Felix en un solo lugar.
          </p>
        </div>
        <p className="relative text-sm text-paper/50">Beyond grooming.</p>
      </div>

      <div className="flex items-center justify-center bg-cream p-6">
        <div className="w-full max-w-sm">
          <LogoMark size={72} className="rounded-2xl" />
          <h1 className="font-display mt-8 text-5xl text-navy">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-muted">Acceso exclusivo para el equipo de Fido&amp;Felix.</p>
          {DEMO_MODE && (
            <div className="mt-6 rounded-2xl border-2 border-dashed border-navy/30 bg-sun/30 p-4 text-sm text-navy">
              <p className="font-bold">🧪 Modo demo</p>
              <p className="mt-1 text-navy/80">
                No hay base de datos configurada: se usan datos de ejemplo que se reinician solos.
              </p>
              <p className="mt-2">
                Correo: <code className="font-bold">{DEMO_ADMIN.email}</code>
                <br />
                Contraseña: <code className="font-bold">{DEMO_ADMIN.password}</code>
              </p>
            </div>
          )}
          <LoginForm next={typeof next === "string" ? next : undefined} />
          <Link href="/" className="mt-8 block text-center text-sm font-semibold text-muted hover:text-navy">
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
