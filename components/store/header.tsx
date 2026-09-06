import Link from "next/link";
import { Search, User, Heart, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CartLink } from "./cart-link";

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
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="bg-ink px-4 py-2 text-center text-[11px] uppercase tracking-wider text-rose-light">
        🚚 Entrega expressa em Brasília · Envios para todo o Brasil
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <button className="text-text-primary md:hidden" aria-label="Menu">
          <Menu size={22} />
        </button>

        <Link href="/" className="font-serif-display text-xl tracking-wide text-gradient-rose">
          MSM PERFUMARIA
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs uppercase tracking-wide text-text-secondary hover:text-rose"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-text-primary">
          <Link href="/busca" aria-label="Buscar" className="hover:text-rose">
            <Search size={20} />
          </Link>
          <Link href={user ? "/conta/favoritos" : "/entrar"} aria-label="Favoritos" className="hover:text-rose">
            <Heart size={20} />
          </Link>
          <Link href={user ? "/conta" : "/entrar"} aria-label="Minha conta" className="hover:text-rose">
            <User size={20} />
          </Link>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
