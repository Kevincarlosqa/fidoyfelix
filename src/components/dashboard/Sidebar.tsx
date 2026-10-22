"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bot,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Scissors,
  Settings,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { logout } from "@/app/login/actions";
import { cn } from "@/lib/utils";

type NavUser = { name: string; email: string; role: "ADMIN" | "STAFF" };

const NAV = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/reservas", label: "Reservas", icon: ClipboardList },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/conversaciones", label: "WhatsApp", icon: MessageCircle, badgeKey: "unread" as const },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/simulador", label: "Simulador IA", icon: Bot },
  { href: "/dashboard/servicios", label: "Servicios", icon: Scissors, admin: true },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: UserCog, admin: true },
  { href: "/dashboard/cuenta", label: "Mi cuenta", icon: Settings },
];

export function Sidebar({ user, unread, pending }: { user: NavUser; unread: number; pending: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => !n.admin || user.role === "ADMIN");

  const nav = (
    <nav className="flex h-full flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <LogoMark size={42} className="rounded-xl ring-1 ring-paper/20" />
        <Wordmark light className="text-2xl" />
      </Link>

      <ul className="mt-10 space-y-1">
        {items.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          const count = item.badgeKey === "unread" ? unread : item.href === "/dashboard/reservas" ? pending : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
                  active ? "bg-sun text-navy" : "text-paper/70 hover:bg-paper/10 hover:text-paper",
                )}
              >
                <item.icon className="size-[18px]" />
                <span className="flex-1">{item.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-extrabold",
                      active ? "bg-navy text-sun" : "bg-tangerine text-white",
                    )}
                    aria-label={`${count} pendientes`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto rounded-2xl bg-paper/5 p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-sky font-display text-xl text-navy">
            {user.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-paper">{user.name}</p>
            <p className="truncate text-xs text-paper/50">{user.role === "ADMIN" ? "Administrador" : "Staff"}</p>
          </div>
          <form action={logout}>
            <button type="submit" title="Cerrar sesión" className="grid size-9 place-items-center rounded-full text-paper/60 hover:bg-paper/10 hover:text-paper">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-navy p-5 lg:block">{nav}</aside>

      <div className="sticky top-0 z-30 flex items-center justify-between bg-navy px-4 py-3 lg:hidden">
        <Wordmark light className="text-2xl" />
        <button type="button" onClick={() => setOpen(true)} className="text-paper" aria-label="Abrir menú">
          <Menu />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-navy-deep/60" onClick={() => setOpen(false)} aria-label="Cerrar menú" />
          <aside className="relative h-full w-72 bg-navy p-5">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-5 text-paper" aria-label="Cerrar">
              <X />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
