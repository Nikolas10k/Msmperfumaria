import Link from "next/link";
import Image from "next/image";
import { Search, User, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CartLink } from "./cart-link";
import { StoreMenu } from "./store-menu";

const NAV_LINKS = [
  { href: "/perfumes", label: "Perfumes" },
  { href: "/perfumes?genero=masculino", label: "Masculinos" },
  { href: "/perfumes?genero=feminino", label: "Femininos" },
  { href: "/perfumes?genero=unissex", label: "Unissex" },
  { href: "/perfumes?lancamentos=1", label: "Lançamentos" },
  { href: "/perfumes?ofertas=1", label: "Ofertas" },
];

const TABS = NAV_LINKS.filter((l) => ["Perfumes", "Lançamentos", "Ofertas"].includes(l.label));

// Ícone dentro de um quadrado de vidro (como os botões de ícone do site).
const iconBtn =
  "pill-glass flex h-9 w-9 items-center justify-center rounded-[7px] text-text-primary transition-colors hover:text-white";

export async function StoreHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 bg-wine/85 backdrop-blur-md">
      <div className="lbl bg-ink px-4 py-2 text-center text-rose-light">
        Entrega expressa em Brasília · Envios para todo o Brasil
      </div>

      <div className="mx-auto grid max-w-[1360px] grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:px-10">
        <Link href="/" className="group flex items-start gap-3 justify-self-start">
          <Image
            src="/logo.jpg"
            alt="MSM Perfumaria"
            width={38}
            height={38}
            className="mt-[-2px] rounded-full transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-serif-display text-[17px] leading-[0.95] text-text-primary">
            <b className="block font-normal">MSM</b>
            <b className="block font-normal text-rose-light">Perfumaria</b>
          </span>
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Principal">
          {TABS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="pill-glass lbl inline-flex h-[30px] min-w-[110px] items-center justify-center rounded-[7px] px-4 text-text-primary hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-1.5">
          <Link href="/busca" aria-label="Buscar" className={`${iconBtn} hidden sm:flex`}>
            <Search size={16} />
          </Link>
          <Link
            href={user ? "/conta/favoritos" : "/entrar"}
            aria-label="Favoritos"
            className={`${iconBtn} hidden sm:flex`}
          >
            <Heart size={16} />
          </Link>
          <Link
            href={user ? "/conta" : "/entrar"}
            aria-label="Minha conta"
            className={iconBtn}
          >
            <User size={16} />
          </Link>
          <span className={iconBtn}>
            <CartLink />
          </span>
          <StoreMenu links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
