"use client";

import { useActionState } from "react";
import { saveCouponAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";
import type { Database } from "@/lib/types/database";

const initialState: ActionState = { ok: false };

type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const [state, formAction, pending] = useActionState(saveCouponAction, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {coupon && <input type="hidden" name="id" value={coupon.id} />}
      {state.message && <p className="text-sm text-danger">{state.message}</p>}

      <div>
        <Label htmlFor="code">Código do cupom</Label>
        <Input id="code" name="code" defaultValue={coupon?.code} placeholder="Ex.: BEMVINDO10" required />
        {state.fieldErrors?.code && <p className="mt-1 text-xs text-danger">{state.fieldErrors.code}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="discount_type">Tipo de desconto</Label>
          <Select id="discount_type" name="discount_type" defaultValue={coupon?.discount_type ?? "percentage"}>
            <option value="percentage">Percentual (%)</option>
            <option value="fixed_amount">Valor fixo (R$)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="discount_value">Valor</Label>
          <Input id="discount_value" name="discount_value" type="number" step="0.01" defaultValue={coupon?.discount_value} required />
          {state.fieldErrors?.discount_value && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.discount_value}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="min_order_value">Pedido mínimo (R$)</Label>
        <Input id="min_order_value" name="min_order_value" type="number" step="0.01" defaultValue={coupon?.min_order_value ?? 0} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="max_uses">Limite total de usos (vazio = ilimitado)</Label>
          <Input id="max_uses" name="max_uses" type="number" defaultValue={coupon?.max_uses ?? ""} />
        </div>
        <div>
          <Label htmlFor="max_uses_per_customer">Limite por cliente</Label>
          <Input
            id="max_uses_per_customer"
            name="max_uses_per_customer"
            type="number"
            defaultValue={coupon?.max_uses_per_customer ?? 1}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="starts_at">Início</Label>
          <Input id="starts_at" name="starts_at" type="datetime-local" defaultValue={toLocalInput(coupon?.starts_at)} required />
        </div>
        <div>
          <Label htmlFor="ends_at">Fim</Label>
          <Input id="ends_at" name="ends_at" type="datetime-local" defaultValue={toLocalInput(coupon?.ends_at)} required />
          {state.fieldErrors?.ends_at && <p className="mt-1 text-xs text-danger">{state.fieldErrors.ends_at}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="is_active" defaultChecked={coupon?.is_active ?? true} />
        Cupom ativo
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar cupom"}
      </Button>
    </form>
  );
}
