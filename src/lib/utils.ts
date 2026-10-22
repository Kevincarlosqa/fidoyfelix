import clsx, { type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { BUSINESS } from "./config";

// Conoce las utilidades propias para resolver conflictos (p. ej. bg-paper vs bg-navy).
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-family": ["font-display"], shadow: ["shadow-sticker", "shadow-sticker-sm"] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const tz = BUSINESS.timeZone;

export function formatPrice(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(d: Date | string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: tz,
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(new Date(d));
}

export function formatTime(d: Date | string) {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(d));
}

export function formatDateTime(d: Date | string) {
  return `${formatDate(d, { weekday: "short" })} · ${formatTime(d)}`;
}

/** "YYYY-MM-DD" de una fecha en la zona horaria del negocio. */
export function toBusinessDateKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Construye un Date a partir de fecha y hora locales del negocio. */
export function businessDateTime(date: string, time = "00:00") {
  return new Date(`${date}T${time}:00${BUSINESS.utcOffset}`);
}

/** Día de la semana (0-6) de una fecha "YYYY-MM-DD". */
export function weekdayOf(date: string) {
  return businessDateTime(date, "12:00").getUTCDay();
}

export function addDaysKey(date: string, days: number) {
  const d = businessDateTime(date, "12:00");
  d.setUTCDate(d.getUTCDate() + days);
  return toBusinessDateKey(d);
}

export function todayKey() {
  return toBusinessDateKey(new Date());
}

/**
 * Normaliza un teléfono a solo dígitos en formato WhatsApp (con código de país).
 * Un celular peruano de 9 dígitos (9XXXXXXXX) recibe el prefijo 51.
 */
export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return /^9\d{8}$/.test(digits) ? `51${digits}` : digits;
}

export function bookingCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "FF-";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export const STATUS_LABELS = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistió",
} as const;

export const SOURCE_LABELS = {
  WHATSAPP: "WhatsApp",
  WEB: "Web",
  DASHBOARD: "Dashboard",
  PHONE: "Teléfono",
} as const;

export const SPECIES_LABELS = { DOG: "Perro", CAT: "Gato", OTHER: "Otro" } as const;

export const SIZE_LABELS = {
  SMALL: "Chico",
  MEDIUM: "Mediano",
  LARGE: "Grande",
  XLARGE: "Gigante",
} as const;

export const CATEGORY_LABELS = {
  GROOMING: "Grooming",
  HEALTH: "Salud",
  TRAINING: "Entrenamiento",
  DAYCARE: "Guardería",
  WALKING: "Paseos",
  SPA: "Spa",
} as const;
