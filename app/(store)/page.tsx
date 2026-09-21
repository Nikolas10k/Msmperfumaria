import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, PackageCheck, Truck, BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCatalogProducts } from "@/lib/catalog/list-products";
import { ProductCard } from "@/components/store/product-card";
import { ExpressDeliveryCheck } from "@/components/store/express-delivery-check";
import { CinematicHeroBackground } from "@/components/store/cinematic-hero-background";
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
            <CinematicHeroBackground />
            {/* video/tag nativo — sem JS, sem hidratação, sem risco de crash como
                a cena WebGL anterior. Some sozinho se prefers-reduced-motion.
                object-position deslocado no mobile: o vídeo é bem mais largo
                (paisagem) que o recorte retrato da tela, e a modelo fica
                posicionada à direita do quadro — sem isso, o corte central
                padrão cortava ela ao meio. */}
            <video
              className="hero-video absolute inset-0 h-full w-full object-cover object-[78%_center] sm:object-center"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/videos/hero-poster.jpg"
              aria-hidden="true"
            >
              <source src="/videos/hero-perfume.mp4" type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-0 bg-bg/55" />
          </>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-bg/50" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-hairline bg-ink/50 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-rose-light backdrop-blur">
            Entrega expressa em Brasília
          </span>
          <h1 className="max-w-4xl text-5xl font-bold uppercase leading-[0.95] tracking-tight text-text-primary sm:text-7xl lg:text-8xl">
            Seu perfume.
            <br />
            <span className="text-gradient-rose">Sua assinatura.</span>
          </h1>
          <p className="mt-6 max-w-md text-xs uppercase tracking-[0.25em] text-text-secondary sm:text-sm">
            Perfumes importados originais para quem escolhe deixar uma marca
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/perfumes">
              <Button size="lg">Explorar perfumes</Button>
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
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="mb-6 font-serif-display text-2xl text-text-primary">Categorias</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(categories ?? []).map((category) => (
              <Link
                key={category.id}
                href={`/perfumes?categoria=${category.slug}`}
                className="group overflow-hidden rounded-md border border-border bg-surface"
              >
                <div className="relative aspect-square bg-surface-2">
                  {category.image_url && (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  )}
                </div>
                <p className="p-3 text-center text-xs uppercase tracking-wide text-text-secondary group-hover:text-rose">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif-display text-2xl text-text-primary">Os mais desejados</h2>
            <Link href="/perfumes" className="text-sm text-rose hover:text-rose-light">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-border bg-surface py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:grid-cols-4">
          {[
            { icon: BadgeCheck, label: "100% original" },
            { icon: ShieldCheck, label: "Compra segura" },
            { icon: PackageCheck, label: "Nota fiscal em todos os pedidos" },
            { icon: Truck, label: "Envio para todo o Brasil" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <Icon className="mb-2 text-rose" size={28} />
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
