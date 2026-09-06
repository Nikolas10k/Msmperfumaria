"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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

  function handleAddToCart() {
    addItem(variant!.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem(variant!.id, quantity);
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
        <Select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-24"
          disabled={outOfStock}
        >
          {Array.from({ length: Math.min(5, Math.max(1, variant.stock)) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
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
