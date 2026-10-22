import { prisma } from "@/lib/prisma";
import { FALLBACK_SERVICES, type PublicService } from "@/lib/catalog";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Highlights } from "@/components/site/Highlights";
import { Services } from "@/components/site/Services";
import { WhatsAppDemo } from "@/components/site/WhatsAppDemo";
import { Species } from "@/components/site/Species";
import { Stats } from "@/components/site/Stats";
import { Testimonials } from "@/components/site/Testimonials";
import { StayTuned } from "@/components/site/StayTuned";
import { BookingSection } from "@/components/site/BookingSection";
import { Footer } from "@/components/site/Footer";
import { PawProgress, PawTrail } from "@/components/site/PawTrail";

// Regenera el catálogo cada 5 minutos.
export const revalidate = 300;

async function getServices(): Promise<PublicService[]> {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, description: true, category: true, durationMin: true, price: true },
    });
    return services.length ? services : FALLBACK_SERVICES;
  } catch (err) {
    console.warn("[home] base de datos no disponible, usando catálogo de respaldo", err);
    return FALLBACK_SERVICES;
  }
}

export default async function Home() {
  const services = await getServices();

  return (
    <SmoothScroll>
      <Navbar />
      <PawProgress />
      <main className="relative overflow-x-clip">
        <PawTrail />
        <Hero />
        <Marquee className="border-y-2 border-navy bg-sun text-navy" />
        <Highlights />
        <Services services={services} />
        <Marquee
          reverse
          tilt={2}
          className="my-10 border-y-2 border-navy bg-tangerine text-paper"
          items={[
            { label: "Baño", emoji: "🫧" },
            { label: "Corte", emoji: "✂️" },
            { label: "Uñas", emoji: "💅" },
            { label: "Vacunas", emoji: "💉" },
            { label: "Juegos", emoji: "🎾" },
            { label: "Mimos", emoji: "🥰" },
          ]}
        />
        <WhatsAppDemo />
        <Species />
        <Stats />
        <Testimonials />
        <StayTuned />
        <BookingSection services={services} />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
