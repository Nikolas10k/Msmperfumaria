"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { getCartDetailsAction } from "@/lib/cart/actions";
import { validateCouponAction } from "@/lib/coupons/actions";
import { ExpressDeliveryCheck } from "@/components/store/express-delivery-check";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { formatBRL } from "@/lib/utils";
import type { CartDetailLine } from "@/lib/cart/queries";

const COUPON_REASON_LABELS: Record<string, string> = {
  inativo: "Cupom inválido ou inexistente.",
  fora_do_periodo: "Este cupom não está mais válido.",
  pedido_minimo_nao_atingido: "O pedido não atinge o valor mínimo exigido por este cupom.",
  limite_total_atingido: "Este cupom atingiu o limite total de usos.",
  limite_por_cliente_atingido: "Você já utilizou este cupom o máximo de vezes permitido.",
};

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const [details, setDetails] = useState<CartDetailLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // Busca preços/estoque atuais no servidor sempre que o carrinho local muda.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getCartDetailsAction(items)
      .then(setDetails)
      .finally(() => setLoading(false));
  }, [items]);

  const subtotal = details.reduce((sum, d) => sum + d.unitPrice * d.quantity, 0);
  const discount = coupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount);

  function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponError(null);
    startTransition(async () => {
      const result = await validateCouponAction(couponInput, subtotal);
      if (result.valid) {
        setCoupon({ code: result.code, discountAmount: result.discountAmount });
      } else {
        setCoupon(null);
        setCouponError(COUPON_REASON_LABELS[result.reason] ?? "Não foi possível aplicar o cupom.");
      }
    });
  }

  if (!loading && details.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="mb-3 font-serif-display text-2xl text-text-primary">Seu carrinho está vazio</h1>
        <p className="mb-6 text-sm text-text-muted">Explore nosso catálogo e encontre sua próxima fragrância.</p>
        <Link href="/perfumes">
          <Button>Explorar perfumes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 font-serif-display text-3xl text-text-primary">Carrinho</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {details.map((item) => (
            <div key={item.variantId} className="flex gap-4 rounded-md border border-border bg-surface p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-surface-2">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" unoptimized />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-muted">{item.brandName}</p>
                  <Link
                    href={`/perfumes/${item.brandSlug}/${item.productSlug}`}
                    className="text-sm text-text-primary hover:text-rose"
                  >
                    {item.productName} — {item.volumeMl}ml
                  </Link>
                  {!item.isActive || item.availableStock <= 0 ? (
                    <p className="mt-1 text-xs text-danger">Indisponível — remova para continuar.</p>
                  ) : null}
                </div>
                <div className="flex items-center justify-between">
                  <Select
                    className="w-20"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.variantId, Number(e.target.value))}
                  >
                    {Array.from({ length: Math.max(1, Math.min(5, item.availableStock)) }, (_, i) => i + 1).map(
                      (n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ),
                    )}
                  </Select>
                  <p className="text-sm text-text-primary">{formatBRL(item.unitPrice * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-text-muted hover:text-danger"
                    aria-label="Remover item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <ExpressDeliveryCheck />
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-surface p-5">
            <div className="flex gap-2">
              <Input
                placeholder="Código do cupom"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              />
              <Button type="button" size="sm" onClick={applyCoupon} disabled={pending}>
                Aplicar
              </Button>
            </div>
            {couponError && <p className="mt-2 text-xs text-danger">{couponError}</p>}
            {coupon && (
              <p className="mt-2 text-xs text-success">
                Cupom {coupon.code} aplicado: -{formatBRL(coupon.discountAmount)}
              </p>
            )}

            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Desconto</span>
                  <span>-{formatBRL(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base text-text-primary">
                <span>Total</span>
                <span>{formatBRL(total)}</span>
              </div>
              <p className="text-xs text-text-muted">Frete calculado na etapa de entrega do checkout.</p>
            </div>

            <Link
              href={`/checkout${coupon ? `?cupom=${coupon.code}` : ""}`}
              className="mt-4 block"
            >
              <Button size="lg" className="w-full">
                Finalizar compra
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
