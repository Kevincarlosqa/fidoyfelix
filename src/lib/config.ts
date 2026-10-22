// Configuración del negocio. Ajusta horarios y capacidad aquí.

export const BUSINESS = {
  name: "Fido&Felix",
  tagline: "Beyond grooming.",
  timeZone: "America/Lima",
  // Perú no usa horario de verano: offset fijo UTC-5.
  utcOffset: "-05:00",
  currency: "PEN",
  address: "Av. José Pardo 620, Miraflores, Lima",
  email: "hola@fidofelix.mx",
  instagram: "https://instagram.com/fidoandfelix",
  // Intervalo entre posibles horas de inicio (minutos)
  slotStepMin: 30,
  // Citas simultáneas que el equipo puede atender
  capacity: 2,
  // Anticipación mínima para reservar (minutos)
  minLeadMin: 60,
  // Días hacia adelante que se pueden reservar
  maxDaysAhead: 45,
  // Horario por día de la semana (0 = domingo). null = cerrado.
  hours: {
    0: null,
    1: { open: "09:00", close: "19:00" },
    2: { open: "09:00", close: "19:00" },
    3: { open: "09:00", close: "19:00" },
    4: { open: "09:00", close: "19:00" },
    5: { open: "09:00", close: "19:00" },
    6: { open: "10:00", close: "16:00" },
  } as Record<number, { open: string; close: string } | null>,
};

export const WHATSAPP_PUBLIC_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51987654321";

export function whatsappLink(text = "¡Hola Fido&Felix! Quiero agendar una cita 🐾") {
  return `https://wa.me/${WHATSAPP_PUBLIC_NUMBER}?text=${encodeURIComponent(text)}`;
}
