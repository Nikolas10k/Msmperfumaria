import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, PackageCheck, Truck, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/catalog/get-product";
import { getCatalogProducts } from "@/lib/catalog/list-products";
import { ProductCard } from "@/components/store/product-card";
import { ExpressDeliveryCheck } from "@/components/store/express-delivery-check";
import { Badge } from "@/components/ui/badge";
import { Gallery } from "./gallery";
import { PurchasePanel } from "./purchase-panel";
import { FavoriteButton } from "@/components/store/favorite-button";
import { isFavoritedAction } from "@/lib/favorites/actions";
import { getSiteUrl } from "@/lib/env";
import { onlyDigits } from "@/lib/utils";

const FRAGRANCE_TYPE_LABELS: Record<string, string> = {
  eau_de_parfum: "Eau de Parfum",
  eau_de_toilette: "Eau de Toilette",
  eau_de_cologne: "Eau de Cologne",
  parfum: "Parfum",
  eau_fraiche: "Eau Fraîche",
};

async function loadProduct(brand: string, slug: string) {
  const supabase = await createClient();
  return { supabase, product: await getProductBySlug(supabase, brand, slug) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}): Promise<Metadata> {
  const { brand, slug } = await params;
  const { product } = await loadProduct(brand, slug);
  if (!product) return {};

  const title = product.metaTitle || `${product.brandName} ${product.name}`;
  const description =
    product.metaDescription ||
    `${product.brandName} ${product.name} — ${FRAGRANCE_TYPE_LABELS[product.fragranceType]} original, ${product.fragranceFamily}. Entrega expressa em Brasília e envio para todo o Brasil.`;

  return {
    title,
    description,
    alternates: { canonical: `/perfumes/${product.brandSlug}/${product.slug}` },
    openGraph: {
      title,
      description,
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}) {
  const { brand, slug } = await params;
  const { supabase, product } = await loadProduct(brand, slug);

  if (!product) notFound();

  const [related, { data: settings }, { data: { user } }, favorited] = await Promise.all([
    getCatalogProducts(supabase, { fragranceFamily: product.fragranceFamily }),
    supabase.from("store_settings").select("whatsapp_number").eq("id", true).maybeSingle(),
    supabase.auth.getUser(),
    isFavoritedAction(product.id),
  ]);

  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4);
  const siteUrl = getSiteUrl();
  const whatsappHref = settings?.whatsapp_number
    ? `https://wa.me/${onlyDigits(settings.whatsapp_number)}?text=${encodeURIComponent(
        `Olá! Tenho uma dúvida sobre o ${product.brandName} ${product.name}.`,
      )}`
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brandName} ${product.name}`,
    description: product.description,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: product.brandName },
    sku: product.variants[0]?.sku,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      url: `${siteUrl}/perfumes/${product.brandSlug}/${product.slug}`,
      priceCurrency: "BRL",
      price: v.price.finalPrice.toFixed(2),
      availability:
        v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.averageRating.toFixed(1),
        reviewCount: product.reviewCount,
      },
    }),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 text-xs text-text-muted">
        <Link href="/perfumes" className="hover:text-rose">Perfumes</Link> / {product.brandName} / {product.name}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery images={product.images} alt={`${product.brandName} ${product.name}`} />

        <div>
          <p className="text-sm uppercase tracking-wide text-text-muted">{product.brandName}</p>
          <h1 className="mt-1 font-serif-display text-3xl text-text-primary">{product.name}</h1>

          <div className="mt-2 flex flex-wrap gap-2">
            {product.isOriginal && <Badge>Original</Badge>}
            {product.isBestseller && <Badge variant="dark">Mais vendido</Badge>}
            {product.isNewArrival && <Badge variant="dark">Lançamento</Badge>}
          </div>

          <p className="mt-3 text-sm text-text-secondary">
            {FRAGRANCE_TYPE_LABELS[product.fragranceType]} · {product.fragranceFamily} ·{" "}
            <span className="capitalize">{product.gender}</span>
          </p>

          <div className="mt-6">
            <PurchasePanel variants={product.variants} />
          </div>

          <div className="mt-4">
            <FavoriteButton productId={product.id} initialFavorited={favorited} isAuthenticated={!!user} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-y border-border py-4 text-center text-xs text-text-muted">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck size={18} className="text-rose" />
              Compra segura
            </div>
            <div className="flex flex-col items-center gap-1">
              <PackageCheck size={18} className="text-rose" />
              Nota fiscal
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck size={18} className="text-rose" />
              Envio Brasil
            </div>
          </div>

          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-sm border border-rose-hairline py-3 text-sm text-rose hover:bg-rose/10"
            >
              <MessageCircle size={16} /> Fale com um especialista
            </a>
          )}

          <div className="mt-6">
            <ExpressDeliveryCheck />
          </div>
        </div>
      </div>

      <section className="mt-14 grid gap-8 lg:grid-cols-3">
        <div>
          <h2 className="mb-3 text-sm uppercase tracking-wide text-text-secondary">Notas de saída</h2>
          <p className="text-sm text-text-primary">{product.topNotes.join(", ") || "—"}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm uppercase tracking-wide text-text-secondary">Notas de coração</h2>
          <p className="text-sm text-text-primary">{product.heartNotes.join(", ") || "—"}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm uppercase tracking-wide text-text-secondary">Notas de fundo</h2>
          <p className="text-sm text-text-primary">{product.baseNotes.join(", ") || "—"}</p>
        </div>
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="mb-3 text-sm uppercase tracking-wide text-text-secondary">Sobre a fragrância</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">{product.description}</p>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-serif-display text-2xl text-text-primary">Você também pode gostar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
