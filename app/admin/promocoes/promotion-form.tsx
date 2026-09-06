"use client";

import { useActionState } from "react";
import { savePromotionAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";
import type { Database } from "@/lib/types/database";

const initialState: ActionState = { ok: false };

type Promotion = Database["public"]["Tables"]["promotions"]["Row"];

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function PromotionForm({
  promotion,
  variantOptions,
}: {
  promotion?: Promotion;
  variantOptions: { id: string; label: string; price: number }[];
}) {
  const [state, formAction, pending] = useActionState(savePromotionAction, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {promotion && <input type="hidden" name="id" value={promotion.id} />}
      {state.message && <p className="text-sm text-danger">{state.message}</p>}

      <div>
        <Label htmlFor="variant_id">Produto / variante</Label>
        <Select id="variant_id" name="variant_id" defaultValue={promotion?.variant_id} required>
          <option value="">Selecione…</option>
          {variantOptions.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.label} — de R$ {variant.price}
            </option>
          ))}
        </Select>
        {state.fieldErrors?.variant_id && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.variant_id}</p>
        )}
      </div>

      <div>
        <Label htmlFor="promo_price">Preço promocional (R$)</Label>
        <Input id="promo_price" name="promo_price" type="number" step="0.01" defaultValue={promotion?.promo_price} required />
        {state.fieldErrors?.promo_price && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.promo_price}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="starts_at">Início</Label>
          <Input id="starts_at" name="starts_at" type="datetime-local" defaultValue={toLocalInput(promotion?.starts_at)} required />
        </div>
        <div>
          <Label htmlFor="ends_at">Fim</Label>
          <Input id="ends_at" name="ends_at" type="datetime-local" defaultValue={toLocalInput(promotion?.ends_at)} required />
          {state.fieldErrors?.ends_at && <p className="mt-1 text-xs text-danger">{state.fieldErrors.ends_at}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="is_active" defaultChecked={promotion?.is_active ?? true} />
        Promoção ativa
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar promoção"}
      </Button>
    </form>
  );
}
