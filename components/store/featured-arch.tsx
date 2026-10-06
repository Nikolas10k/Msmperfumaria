"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatBRL } from "@/lib/utils";

export interface FeaturedItem {
  id: string;
  href: string;
  name: string;
  brandName: string;
  imageUrl: string | null;
  price: number;
}

// Carrossel em arco (o "cofre" de avisos do site): uma imagem em formato de
// porta vai trocando entre os destaques, com botões redondos e contador.
export function FeaturedArch({ items }: { items: FeaturedItem[] }) {
  const [index, setIndex] = useState(0);
  const total = items.length;
  if (total === 0) return null;

  const current = items[index];
  const go = (delta: number) => setIndex((i) => (i + delta + total) % total);

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
      <div className="text-center lg:text-right">
        <span className="lbl text-rose-light">Curadoria</span>
        <h2 className="font-serif-display mt-3 text-[clamp(38px,4.4vw,64px)]">
          Os mais <i>desejados</i>
        </h2>
        <p className="mx-auto mt-4 max-w-[32ch] text-sm text-text-secondary lg:mr-0">
          Os perfumes que mais saem da nossa loja, escolhidos pelos clientes.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <Link
          href={current.href}
          className="arch-frame group relative aspect-[3/4.1] w-[min(380px,82vw)] bg-surface-2 shadow-[0_30px_50px_-20px_rgba(0,0,0,0.6)]"
        >
          {current.imageUrl && (
            <Image
              src={current.imageUrl}
              alt={`${current.brandName} ${current.name}`}
              fill
              sizes="380px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/10 to-ink/85" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-7 text-left">
            <span className="lbl text-text-secondary">{current.brandName}</span>
            <span className="font-serif-display text-[28px] leading-none">{current.name}</span>
            <span className="text-sm text-rose-light">{formatBRL(current.price)}</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Destaque anterior"
            className="btn-spring flex h-[46px] w-[46px] items-center justify-center rounded-full bg-ink/80 text-paper hover:bg-black"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-serif-display min-w-[60px] text-center text-[22px] tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Próximo destaque"
            className="btn-spring flex h-[46px] w-[46px] items-center justify-center rounded-full bg-ink/80 text-paper hover:bg-black"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="hidden lg:block" />
    </div>
  );
}
