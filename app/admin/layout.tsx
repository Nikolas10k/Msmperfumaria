import Link from "next/link";
import type { ReactNode } from "react";
import { requireStaff } from "@/lib/admin/guard";
import { logOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/campanhas", label: "Campanhas" },
  { href: "/admin/promocoes", label: "Promoções" },
  { href: "/admin/cupons", label: "Cupons" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/entrega", label: "Entrega expressa" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { staff } = await requireStaff();

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:block">
        <div className="border-b border-border px-6 py-5">
          <Link href="/admin" className="font-serif-display text-lg text-gradient-rose">
            MSM Perfumaria
          </Link>
          <p className="mt-0.5 text-xs text-text-muted">Painel administrativo</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-rose"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
          <p className="text-sm text-text-secondary">
            Olá, <span className="text-text-primary">{staff.name}</span>{" "}
            <span className="text-text-muted">({staff.role})</span>
          </p>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-text-muted hover:text-rose" target="_blank">
              Ver loja ↗
            </Link>
            <form action={logOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
