"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Portal só pode ser criado no cliente, depois de montado (document
    // não existe durante o SSR) — sincronização com esse sistema externo,
    // não estado derivado de props/state do React.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const overlay = open && (
    // Renderizado via portal direto em document.body: o <header> usa
    // backdrop-blur (backdrop-filter), que cria um novo containing block
    // pra elementos position:fixed — sem o portal, esse overlay ficava
    // preso à altura do header em vez de cobrir a tela inteira.
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Fechar menu"
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <nav className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col gap-1 overflow-y-auto bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-serif-display text-lg text-text-primary">Menu</span>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="text-text-secondary hover:text-rose"
          >
            <X size={22} />
          </button>
        </div>
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={() => setOpen(false)}
            className="rounded-sm px-3 py-3 text-sm uppercase tracking-wide text-text-secondary hover:bg-surface-2 hover:text-rose"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="text-text-primary md:hidden"
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
      >
        <Menu size={22} />
      </button>

      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
