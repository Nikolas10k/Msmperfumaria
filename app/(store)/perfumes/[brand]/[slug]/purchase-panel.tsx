"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { formatBRL } from "@/lib/utils";
import type { ProductVariantDetail } from "@/lib/catalog/get-product";

export function PurchasePanel({ variants }: { variants: ProductVariantDetail[] }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(() => variants.find((v) => v.id === variantId), [variants, variantId]);

  if (!variant) {
    return <p className="text-sm text-text-muted">Produto sem variantes disponíveis no momento.</p>;
  }

  const outOfStock = variant.stock <= 0;
  const installmentValue = variant.price.finalPrice / variant.installmentsMax;
  const maxQuantity = Math.min(5, Math.max(1, variant.stock));
  const clampedQuantity = Math.min(quantity, maxQuantity);

  function handleAddToCart() {
    addItem(variant!.id, clampedQuantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem(variant!.id, clampedQuantity);
    router.push("/carrinho");
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline gap-3">
          {variant.price.hasDiscount && (
            <span className="text-sm text-text-muted line-through">{formatBRL(variant.price.originalPrice)}</span>
          )}
          <span className="text-3xl text-rose-light">{formatBRL(variant.price.finalPrice)}</span>
        </div>
        {variant.installmentsMax > 1 && (
          <p className="mt-1 text-xs text-text-muted">
            ou {variant.installmentsMax}x de {formatBRL(installmentValue)} sem juros
          </p>
        )}
        <p className="mt-1 text-xs text-text-muted">ou via PIX com aprovação imediata</p>
      </div>

      {variants.length > 1 && (
        <div>
          <Select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {v.volumeMl}ml {v.stock <= 0 ? "— esgotado" : ""}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-11 items-center rounded-full border border-border">
          <button
            type="button"
            disabled={outOfStock || clampedQuantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, Math.min(q, maxQuantity) - 1))}
            aria-label="Diminuir quantidade"
            className="chip-spring flex h-full w-10 items-center justify-center text-text-secondary disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm tabular-nums text-text-primary">{clampedQuantity}</span>
          <button
            type="button"
            disabled={outOfStock || clampedQuantity >= maxQuantity}
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            aria-label="Aumentar quantidade"
            className="chip-spring flex h-full w-10 items-center justify-center text-text-secondary disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
        {outOfStock && <span className="text-sm text-danger">Esgotado no momento</span>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={outOfStock}>
          Comprar agora
        </Button>
        <Button size="lg" variant="secondary" className="flex-1" onClick={handleAddToCart} disabled={outOfStock}>
          {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
        </Button>
      </div>
    </div>
  );
}
