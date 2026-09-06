"use client";

import { useActionState, useState } from "react";
import { saveVariantAction, deleteVariantAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatBRL } from "@/lib/utils";
import type { ActionState } from "@/app/(auth)/actions";

export interface VariantRow {
  id: string;
  sku: string;
  volume_ml: number;
  price: number;
  compare_at_price: number | null;
  installments_max: number;
  is_active: boolean;
  inventory: { quantity: number; low_stock_threshold: number } | null;
}

const initialState: ActionState = { ok: false };

function VariantForm({
  productId,
  variant,
  onDone,
}: {
  productId: string;
  variant?: VariantRow;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(async (prev: ActionState, fd: FormData) => {
    const result = await saveVariantAction(prev, fd);
    if (result.ok) onDone?.();
    return result;
  }, initialState);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 rounded-sm border border-border bg-surface p-4 sm:grid-cols-4">
      <input type="hidden" name="product_id" value={productId} />
      {variant && <input type="hidden" name="id" value={variant.id} />}

      <div>
        <Label htmlFor={`sku-${variant?.id ?? "new"}`}>SKU</Label>
        <Input id={`sku-${variant?.id ?? "new"}`} name="sku" defaultValue={variant?.sku} required />
      </div>
      <div>
        <Label htmlFor={`vol-${variant?.id ?? "new"}`}>Volume (ml)</Label>
        <Input id={`vol-${variant?.id ?? "new"}`} name="volume_ml" type="number" defaultValue={variant?.volume_ml} required />
      </div>
      <div>
        <Label htmlFor={`price-${variant?.id ?? "new"}`}>Preço</Label>
        <Input id={`price-${variant?.id ?? "new"}`} name="price" type="number" step="0.01" defaultValue={variant?.price} required />
      </div>
      <div>
        <Label htmlFor={`cap-${variant?.id ?? "new"}`}>Preço &quot;de&quot; (opcional)</Label>
        <Input id={`cap-${variant?.id ?? "new"}`} name="compare_at_price" type="number" step="0.01" defaultValue={variant?.compare_at_price ?? ""} />
      </div>
      <div>
        <Label htmlFor={`inst-${variant?.id ?? "new"}`}>Máx. parcelas</Label>
        <Input id={`inst-${variant?.id ?? "new"}`} name="installments_max" type="number" defaultValue={variant?.installments_max ?? 1} />
      </div>
      <div>
        <Label htmlFor={`qty-${variant?.id ?? "new"}`}>Estoque</Label>
        <Input id={`qty-${variant?.id ?? "new"}`} name="quantity" type="number" defaultValue={variant?.inventory?.quantity ?? 0} />
      </div>
      <div>
        <Label htmlFor={`low-${variant?.id ?? "new"}`}>Alerta estoque baixo</Label>
        <Input id={`low-${variant?.id ?? "new"}`} name="low_stock_threshold" type="number" defaultValue={variant?.inventory?.low_stock_threshold ?? 5} />
      </div>
      <div className="flex items-end gap-3">
        <label className="flex items-center gap-1.5 text-sm text-text-secondary">
          <input type="checkbox" name="is_active" defaultChecked={variant?.is_active ?? true} />
          Ativa
        </label>
      </div>

      {state.message && <p className="col-span-full text-xs text-danger">{state.message}</p>}

      <div className="col-span-full">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Salvando…" : variant ? "Atualizar variante" : "Adicionar variante"}
        </Button>
      </div>
    </form>
  );
}

export function VariantManager({ productId, variants }: { productId: string; variants: VariantRow[] }) {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Volume</th>
              <th className="px-3 py-2">Preço</th>
              <th className="px-3 py-2">Estoque</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id} className="border-t border-border align-top">
                <td className="px-3 py-2 text-text-primary">{variant.sku}</td>
                <td className="px-3 py-2 text-text-secondary">{variant.volume_ml}ml</td>
                <td className="px-3 py-2 text-text-secondary">
                  {formatBRL(Number(variant.price))}
                  {variant.compare_at_price && (
                    <span className="ml-1 text-xs text-text-muted line-through">
                      {formatBRL(Number(variant.compare_at_price))}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-text-secondary">{variant.inventory?.quantity ?? 0}</td>
                <td className="px-3 py-2 text-right">
                  <DeleteButton id={variant.id} action={deleteVariantAction} />
                </td>
              </tr>
            ))}
            {variants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-text-muted">
                  Nenhuma variante (tamanho) cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {variants.map((variant) => (
        <details key={`edit-${variant.id}`} className="rounded-sm border border-border p-2">
          <summary className="cursor-pointer text-xs text-text-muted">Editar {variant.sku}</summary>
          <div className="mt-3">
            <VariantForm productId={productId} variant={variant} />
          </div>
        </details>
      ))}

      {showNew ? (
        <VariantForm productId={productId} onDone={() => setShowNew(false)} />
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setShowNew(true)}>
          + Adicionar variante (tamanho)
        </Button>
      )}
    </div>
  );
}
