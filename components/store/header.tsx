import Link from "next/link";
import Image from "next/image";
import { Search, User, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CartLink } from "./cart-link";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS = [
  { href: "/perfumes", label: "Perfumes" },
  { href: "/perfumes?genero=masculino", label: "Masculinos" },
  { href: "/perfumes?genero=feminino", label: "Femininos" },
  { href: "/perfumes?genero=unissex", label: "Unissex" },
  { href: "/perfumes?lancamentos=1", label: "Lançamentos" },
  { href: "/perfumes?ofertas=1", label: "Ofertas" },
];

export async function StoreHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="bg-ink px-4 py-2 text-center text-[11px] uppercase tracking-wider text-rose-light">
        🚚 Entrega expressa em Brasília · Envios para todo o Brasil
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <MobileNav links={NAV_LINKS} />

        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="MSM Perfumaria"
            width={36}
            height={36}
            className="rounded-full transition-transform duration-300 group-hover:scale-105"
          />
          <span className="hidden font-serif-display text-xl tracking-wide text-gradient-rose sm:inline">
            MSM PERFUMARIA
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link-underline rounded-full px-3 py-2 text-xs uppercase tracking-wide text-text-secondary transition-colors hover:text-rose"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 text-text-primary">
          <Link
            href="/busca"
            aria-label="Buscar"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface hover:text-rose"
          >
            <Search size={19} />
          </Link>
          <Link
            href={user ? "/conta/favoritos" : "/entrar"}
            aria-label="Favoritos"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface hover:text-rose"
          >
            <Heart size={19} />
          </Link>
          <Link
            href={user ? "/conta" : "/entrar"}
            aria-label="Minha conta"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface hover:text-rose"
          >
            <User size={19} />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface">
            <CartLink />
          </div>
        </div>
      </div>
    </header>
  );
}
