import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, PackageCheck, Truck, BadgeCheck, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCatalogProducts } from "@/lib/catalog/list-products";
import { ProductCard } from "@/components/store/product-card";
import { ExpressDeliveryCheck } from "@/components/store/express-delivery-check";
import { LiquidRevealHero } from "@/components/store/liquid-reveal-hero";
import { RoseAurora } from "@/components/store/rose-aurora";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [{ data: heroBanner }, { data: categories }, bestsellers] = await Promise.all([
    supabase
      .from("banners")
      .select("*")
      .eq("placement", "hero")
      .eq("is_active", true)
      .lte("starts_at", nowIso)
      .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
      .order("position")
      .limit(1)
      .maybeSingle(),
    supabase.from("categories").select("*").eq("is_active", true).order("position").limit(6),
    getCatalogProducts(supabase, { sort: "mais-vendidos" }),
  ]);

  const featured = bestsellers.slice(0, 8);

  return (
    <div>
      <section className="relative h-[80vh] min-h-[560px] w-full overflow-hidden bg-bg sm:h-[92vh] sm:min-h-[640px]">
        {heroBanner?.image_url ? (
          <div className="absolute inset-0">
            <Image src={heroBanner.image_url} alt={heroBanner.title} fill priority className="object-cover opacity-40" unoptimized />
          </div>
        ) : (
          <>
            {/* Revelação líquida: a mesma foto em duas leituras (escura por
                baixo, vívida pintada pelo cursor) — ver liquid-reveal-hero.tsx.
                Canvas 2D puro, sem WebGL, sem risco de travar. */}
            <LiquidRevealHero src="/videos/hero-poster.jpg" />
            {/* Mesma aurora do fundo, agora por cima do canvas — "screen" só
                soma brilho rose, não esconde a imagem por baixo. Dá a
                sensação de luz girando sobre a cena, igual à referência. */}
            <RoseAurora />
            <div className="pointer-events-none absolute inset-0 bg-bg/55" />
          </>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-bg/50" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <span className="hero-reveal hero-reveal-1 mb-6 inline-flex items-center gap-2 rounded-full border border-rose-hairline bg-ink/50 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-rose-light backdrop-blur">
            Entrega expressa em Brasília
          </span>
          <h1 className="hero-reveal hero-reveal-2 max-w-4xl text-5xl font-bold uppercase leading-[0.95] tracking-tight text-text-primary sm:text-7xl lg:text-8xl">
            Seu perfume.
            <br />
            <span className="text-gradient-rose">Sua assinatura.</span>
          </h1>
          <p className="hero-reveal hero-reveal-3 mt-6 max-w-md text-xs uppercase tracking-[0.25em] text-text-secondary sm:text-sm">
            Perfumes importados originais para quem escolhe deixar uma marca
          </p>
          <div className="hero-reveal hero-reveal-4 mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/perfumes">
              <Button size="lg" className="group pr-2">
                Explorar perfumes
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight size={16} />
                </span>
              </Button>
            </Link>
            <Link href="/perfumes?ofertas=1">
              <Button size="lg" variant="secondary">
                Ver ofertas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <ExpressDeliveryCheck />
      </section>

      {(categories ?? []).length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-rose-light">Explore</p>
          <h2 className="mb-8 font-serif-display text-3xl text-text-primary">Categorias</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(categories ?? []).map((category) => (
              <Link
                key={category.id}
                href={`/perfumes?categoria=${category.slug}`}
                className="product-frame-card group relative block aspect-square overflow-hidden rounded-xl border border-rose-hairline/20 bg-surface"
              >
                {category.image_url && (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
                <p className="absolute inset-x-0 bottom-0 p-3 text-center text-xs uppercase tracking-wide text-text-primary">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-rose-light">Curadoria</p>
              <h2 className="font-serif-display text-3xl text-text-primary">Os mais desejados</h2>
            </div>
            <Link
              href="/perfumes"
              className="group hidden items-center gap-1 text-sm text-text-secondary hover:text-rose sm:flex"
            >
              Ver todos
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-border bg-surface py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:grid-cols-4">
          {[
            { icon: BadgeCheck, label: "100% original" },
            { icon: ShieldCheck, label: "Compra segura" },
            { icon: PackageCheck, label: "Nota fiscal em todos os pedidos" },
            { icon: Truck, label: "Envio para todo o Brasil" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-hairline bg-ink/40">
                <Icon className="text-rose" size={20} />
              </span>
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
