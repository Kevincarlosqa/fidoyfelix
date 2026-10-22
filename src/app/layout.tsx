import type { Metadata, Viewport } from "next";
import { Anton, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Fido&Felix · Servicio de mascotas — Beyond grooming.",
    template: "%s · Fido&Felix",
  },
  description:
    "Grooming, spa, salud, entrenamiento y guardería para perros y gatos en Lima. Agenda en segundos por WhatsApp.",
  openGraph: {
    title: "Fido&Felix — Beyond grooming.",
    description: "Servicio integral para mascotas. Agenda por WhatsApp 🐾",
    images: ["/brand/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#13214a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${anton.variable} ${jakarta.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
