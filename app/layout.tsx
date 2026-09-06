import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text-primary">
        {children}
      </body>
    </html>
  );
}
