import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

// Geist (Vercel, open-source) — substituto legal da San Francisco da Apple:
// a SF Pro em si não pode ser hospedada num site (licença restrita a
// plataformas Apple), então usamos essa fonte com visual bem próximo dela.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MSM Perfumaria — Perfumes importados originais",
    template: "%s | MSM Perfumaria",
  },
  description:
    "Perfumes importados originais para todo o Brasil, com entrega expressa em Brasília. Seu perfume. Sua assinatura.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "MSM Perfumaria",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MSM Perfumaria",
  url: siteUrl,
  description:
    "Perfumes importados originais para todo o Brasil, com entrega expressa em Brasília.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geist.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text-primary">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
