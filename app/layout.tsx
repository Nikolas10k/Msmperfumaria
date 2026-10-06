import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

// Mesmas famílias do site do condomínio: Bodoni Moda nos títulos (serif de
// alto contraste) e Inter no corpo.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
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
      className={`${inter.variable} ${bodoni.variable} h-full antialiased`}
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
