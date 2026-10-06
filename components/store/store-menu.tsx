"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";

// Botão "Menu" branco (como o do site) que abre um menu em tela cheia, com os
// itens em serif grande entrando em sequência. Renderizado num portal em
// document.body: o header usa backdrop-blur, que prenderia o overlay à altura
// do header se ficasse dentro dele.
export function StoreMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Portal só pode ser criado no cliente, depois de montado (document não
    // existe durante o SSR) — sincronização com esse sistema externo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const overlay = open && (
    <div className="menu-overlay mobile-nav-overlay fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto px-6 pb-10 pt-6 text-text-primary md:px-10">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="lbl inline-flex h-[30px] items-center gap-2 rounded-[7px] bg-paper px-4 text-ink"
        >
          <X size={14} /> Fechar
        </button>
      </div>

      <nav aria-label="Menu principal" className="my-10">
        <ul>
          {links.map((link, i) => (
            <li key={link.label}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="menu-item font-serif-display flex items-baseline gap-5 py-1 text-[clamp(40px,7vw,90px)] leading-none"
                style={{ ["--d" as string]: `${i * 90}ms` }}
              >
                <small className="font-sans text-[11px] opacity-60">{String(i + 1).padStart(2, "0")}</small>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="lbl flex flex-wrap gap-x-7 gap-y-3 text-text-secondary">
        <Link href="/conta" onClick={() => setOpen(false)} className="hover:text-white">Minha conta</Link>
        <Link href="/carrinho" onClick={() => setOpen(false)} className="hover:text-white">Carrinho</Link>
        <Link href="/termos" onClick={() => setOpen(false)} className="hover:text-white">Termos de uso</Link>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Abrir menu"
        className="lbl inline-flex h-9 items-center rounded-[7px] bg-paper px-4 text-ink transition-transform hover:scale-[1.03]"
      >
        Menu
      </button>

      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
