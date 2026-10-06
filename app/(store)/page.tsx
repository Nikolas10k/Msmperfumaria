import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BadgeCheck, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCatalogProducts } from "@/lib/catalog/list-products";
import { ExpressDeliveryCheck } from "@/components/store/express-delivery-check";
import { PerfumeBottle3D } from "@/components/store/perfume-bottle-3d";
import { RoseAurora } from "@/components/store/rose-aurora";
import { FeaturedArch } from "@/components/store/featured-arch";
import { Button } from "@/components/ui/button";
import { onlyDigits } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [{ data: heroBanner }, { data: categories }, bestsellers, { data: settings }] = await Promise.all([
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
    supabase.from("store_settings").select("whatsapp_number, support_email, business_hours").eq("id", true).maybeSingle(),
  ]);

  const featured = bestsellers.slice(0, 8).map((p) => ({
    id: p.id,
    href: `/perfumes/${p.brandSlug}/${p.slug}`,
    name: p.name,
    brandName: p.brandName,
    imageUrl: p.imageUrl,
    price: p.minPrice,
  }));

  const whatsappHref = settings?.whatsapp_number
    ? `https://wa.me/${onlyDigits(settings.whatsapp_number)}`
    : null;

  return (
    <div>
      {/* Hero no padrão do site: degradê vinho→rosé, frasco 3D no centro,
          linhas de título em serif que sobem e botões em caixa com mola. */}
      <section className="hero-bg relative h-[calc(100svh-120px)] min-h-[600px] w-full overflow-hidden md:h-[92svh] md:min-h-[640px]">
        <RoseAurora />
        {heroBanner?.image_url && (
          <Image
            src={heroBanner.image_url}
            alt={heroBanner.title}
            fill
            priority
            className="object-cover opacity-30"
            unoptimized
          />
        )}
        <PerfumeBottle3D />

        <p className="hero-reveal hero-reveal-3 lbl absolute left-[8%] top-[24%] hidden max-w-[16ch] text-paper/80 md:block">
          Perfumes importados originais
        </p>
        <p className="hero-reveal hero-reveal-4 lbl absolute right-[16%] top-[30%] hidden max-w-[16ch] text-paper/80 md:block">
          Nota fiscal em todos os pedidos
        </p>

        {/* Laterais: fotos de perfumes do banco (ou a foto de reserva, sem produtos). */}
        <div className="hero-reveal hero-reveal-2 absolute left-[3%] bottom-[-2%] hidden aspect-[4/5] w-[clamp(110px,15vw,230px)] -rotate-2 overflow-hidden rounded-t-[6px] bg-paper shadow-[0_30px_50px_-20px_rgba(0,0,0,0.55)] lg:block">
          <Image
            src={featured[0]?.imageUrl ?? "/videos/hero-poster.jpg"}
            alt={featured[0] ? `${featured[0].brandName} ${featured[0].name}` : ""}
            fill
            className="object-contain p-3"
            sizes="230px"
            unoptimized={!featured[0]?.imageUrl}
          />
        </div>
        <div className="hero-reveal hero-reveal-2 absolute right-[3%] bottom-[-2%] hidden aspect-[5/4] w-[clamp(110px,15vw,230px)] rotate-2 overflow-hidden rounded-t-[6px] bg-paper shadow-[0_30px_50px_-20px_rgba(0,0,0,0.55)] lg:block">
          <Image
            src={featured[1]?.imageUrl ?? "/videos/hero-poster.jpg"}
            alt={featured[1] ? `${featured[1].brandName} ${featured[1].name}` : ""}
            fill
            className="object-contain p-3"
            sizes="230px"
            unoptimized={!featured[1]?.imageUrl}
          />
        </div>

        <div className="absolute inset-x-0 top-[12%] flex flex-col items-center px-4 text-center md:top-[30%]">
          <span className="hero-reveal hero-reveal-1 lbl mb-6 inline-flex items-center gap-2 rounded-[7px] border border-white/20 bg-ink/40 px-4 py-1.5 text-paper/90 backdrop-blur">
            Entrega expressa em Brasília
          </span>
          <h1 className="font-serif-display max-w-[1100px] text-[clamp(56px,11vw,190px)] text-paper [text-shadow:0_2px_30px_rgba(20,6,13,0.35)]">
            <span className="hero-reveal hero-reveal-2 block">Seu perfume.</span>
            <i className="hero-reveal hero-reveal-3 block text-rose-light">Sua assinatura.</i>
          </h1>
        </div>

        <div className="hero-reveal hero-reveal-4 absolute inset-x-0 bottom-7 flex flex-col items-center justify-center gap-2 px-4 sm:flex-row">
          <Link href="/perfumes" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Explorar perfumes
            </Button>
          </Link>
          <Link href="/perfumes?ofertas=1" className="w-full sm:w-auto">
            <Button size="lg" variant="glass" className="w-full sm:w-auto">
              Ver ofertas
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <ExpressDeliveryCheck />
      </section>

      {(categories ?? []).length > 0 && (
        <section className="relative overflow-hidden bg-paper py-24 text-ink">
          <div className="mx-auto max-w-[1360px] px-4 md:px-10">
            <span className="lbl text-ink/55">Explore</span>
            <h2 className="font-serif-display mt-3 text-[clamp(54px,8.4vw,140px)] leading-[0.92]">
              Por <i>categoria</i>
            </h2>

            <ul className="mt-12 border-t border-ink/15">
              {(categories ?? []).map((category, i) => (
                <li key={category.id}>
                  <Link
                    href={`/perfumes?categoria=${category.slug}`}
                    className="row-hover group flex items-baseline gap-6 border-b border-ink/15 px-0.5 py-6"
                  >
                    <span className="lbl w-8 text-ink/55">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-serif-display flex-1 text-[clamp(24px,2.6vw,38px)] leading-none tracking-[-0.015em]">
                      {category.name}
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="transition-transform duration-500 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="bg-bg py-24">
          <div className="mx-auto max-w-[1360px] px-4 md:px-10">
            <FeaturedArch items={featured} />
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-[1360px] gap-4 px-4 pb-24 md:grid-cols-[1.1fr_1fr] md:px-10">
        <div className="product-frame-card relative flex min-h-[420px] flex-col justify-between gap-7 overflow-hidden rounded-[10px] bg-[radial-gradient(120%_90%_at_85%_10%,var(--color-rose-dark),var(--color-wine)_55%,#0a0a0a_100%)] p-8 md:p-12">
          <div className="relative">
            <span className="lbl text-paper/55">Ofertas</span>
            <h2 className="font-serif-display mt-4 text-[clamp(36px,4.2vw,62px)] leading-[0.95]">
              Perfumes com <i>desconto.</i>
            </h2>
            <p className="mt-4 max-w-[42ch] text-sm text-paper/70">
              Os preços que estão em promoção agora, com a mesma originalidade e nota fiscal de sempre.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-2">
            <Link href="/perfumes?ofertas=1">
              <Button size="lg" variant="glass">Ver ofertas <ArrowUpRight size={16} /></Button>
            </Link>
          </div>
        </div>

        <div className="product-frame-card flex min-h-[420px] flex-col justify-between gap-7 rounded-[10px] border border-border bg-surface p-8 md:p-12">
          <div>
            <span className="lbl text-text-muted">Entrega</span>
            <h2 className="font-serif-display mt-4 text-[clamp(36px,4.2vw,62px)] leading-[0.95]">
              Chega em <i>Brasília</i> no mesmo dia.
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {[
              { icon: Truck, label: "Entrega expressa em Brasília" },
              { icon: PackageCheck, label: "Envio para todo o Brasil" },
              { icon: BadgeCheck, label: "100% original" },
              { icon: ShieldCheck, label: "Compra segura" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 py-3 text-sm text-text-secondary">
                <Icon size={16} className="text-rose-light" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1360px] gap-12 border-t border-border px-4 py-24 md:grid-cols-2 md:gap-20 md:px-10">
        <div>
          <span className="lbl text-text-muted">Atendimento</span>
          <h2 className="font-serif-display mt-3 text-[clamp(44px,5.4vw,92px)] leading-[0.92]">
            Fale com <i>a loja</i>
          </h2>
          <p className="mt-6 max-w-[36ch] text-text-muted">
            Tire dúvidas sobre fragrâncias, pedidos e entrega. Respondemos pelo WhatsApp ou pelo e-mail.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                <Button size="lg">Falar no WhatsApp</Button>
              </a>
            )}
            <Link href="/perfumes">
              <Button size="lg" variant="secondary">Ver catálogo</Button>
            </Link>
          </div>
        </div>

        <ul className="grid content-start gap-7">
          {settings?.support_email && (
            <li className="border-b border-border pb-6">
              <span className="lbl text-text-muted">E-mail</span>
              <p className="font-serif-display mt-2 text-2xl">{settings.support_email}</p>
            </li>
          )}
          {settings?.business_hours && (
            <li className="border-b border-border pb-6">
              <span className="lbl text-text-muted">Horário</span>
              <p className="font-serif-display mt-2 text-2xl">{settings.business_hours}</p>
            </li>
          )}
          <li className="border-b border-border pb-6">
            <span className="lbl text-text-muted">Entrega</span>
            <p className="font-serif-display mt-2 text-2xl">Brasília e todo o Brasil</p>
          </li>
        </ul>
      </section>
    </div>
  );
}
