// Recursos visuales del sitio (fotos de Unsplash con fondos de color de marca).

export function unsplash(id: string, w = 900, h?: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=80`;
}

export const PHOTOS = {
  heroFrenchie: "1583337130417-3346a1be7dee",
  pugYellow: "1517849845537-4d257902454a",
  catBlue: "1574158622682-e40e69881006",
  frenchieBlue: "1583511655857-d19b40a7a54e",
  kittenMint: "1592194996308-7b43878e84a6",
  catAndDog: "1450778869180-41d0601e046e",
  corgiOrange: "1537151625747-768eb6cf92b2",
  samoyedPink: "1596492784531-6e6eb5ea9993",
  goldenBlue: "1558788353-f76d92427f16",
  terrier: "1561037404-61cd46aa615b",
  beagle: "1543466835-00a7907e9de1",
  retrieverField: "1544568100-847a948585b9",
  aussie: "1587300003388-59208cc962cb",
  jackRussell: "1477884213360-7e9d7dcc1e48",
} as const;

type Visual = { photo: string; bg: string; emoji: string };

export const SERVICE_VISUALS: Record<string, Visual> = {
  "bano-cepillado": { photo: "1587300003388-59208cc962cb", bg: "bg-sky", emoji: "🛁" },
  "grooming-completo": { photo: "1516734212186-a967f81ad0d7", bg: "bg-sun", emoji: "✂️" },
  "spa-felino": { photo: "1494256997604-768d1f608cac", bg: "bg-lilac", emoji: "🐱" },
  "spa-deluxe": { photo: "1596492784531-6e6eb5ea9993", bg: "bg-bubble", emoji: "💆" },
  "unas-oidos": { photo: "1534361960057-19889db9621e", bg: "bg-mint", emoji: "💅" },
  "consulta-veterinaria": { photo: "1628009368231-7bb7cfcb0def", bg: "bg-sky", emoji: "🩺" },
  vacunacion: { photo: "1537151625747-768eb6cf92b2", bg: "bg-tangerine", emoji: "💉" },
  entrenamiento: { photo: "1552053831-71594a27632d", bg: "bg-sun", emoji: "🎓" },
  guarderia: { photo: "1548199973-03cce0bbc87b", bg: "bg-tangerine", emoji: "🏡" },
  "paseo-grupal": { photo: "1530281700549-e82e7bf110d6", bg: "bg-mint", emoji: "🦮" },
};

export const FALLBACK_VISUAL: Visual = { photo: PHOTOS.aussie, bg: "bg-sun", emoji: "🐾" };

export type PublicService = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  durationMin: number;
  price: number;
};

// Se usa si la base de datos aún no está configurada (la web sigue funcionando).
export const FALLBACK_SERVICES: PublicService[] = [
  { id: "", slug: "bano-cepillado", name: "Baño & Cepillado", category: "GROOMING", durationMin: 60, price: 60, description: "Baño con shampoo hipoalergénico, secado, cepillado profundo y perfume." },
  { id: "", slug: "grooming-completo", name: "Grooming Completo", category: "GROOMING", durationMin: 120, price: 110, description: "Baño, corte de raza o estilo a elección, uñas, oídos y glándulas." },
  { id: "", slug: "spa-felino", name: "Spa Felino", category: "SPA", durationMin: 90, price: 90, description: "Baño libre de estrés para gatos, deslanado y corte de uñas con manejo cat-friendly." },
  { id: "", slug: "consulta-veterinaria", name: "Consulta Veterinaria", category: "HEALTH", durationMin: 30, price: 80, description: "Revisión general con médico veterinario, plan preventivo y receta si se requiere." },
  { id: "", slug: "entrenamiento", name: "Entrenamiento 1:1", category: "TRAINING", durationMin: 60, price: 90, description: "Sesión personalizada de obediencia básica, paseo con correa y socialización." },
  { id: "", slug: "guarderia", name: "Guardería de Día", category: "DAYCARE", durationMin: 30, price: 55, description: "Día de juego supervisado. La hora elegida es el check-in; recoge antes de las 19:00." },
];
