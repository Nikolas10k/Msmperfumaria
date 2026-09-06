"use client";

import { useActionState } from "react";
import { saveBrandAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";
import type { Database } from "@/lib/types/database";

const initialState: ActionState = { ok: false };

export function BrandForm({ brand }: { brand?: Database["public"]["Tables"]["brands"]["Row"] }) {
  const [state, formAction, pending] = useActionState(saveBrandAction, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {brand && <input type="hidden" name="id" value={brand.id} />}

      {state.message && <p className="text-sm text-danger">{state.message}</p>}

      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" defaultValue={brand?.name} required />
        {state.fieldErrors?.name && <p className="mt-1 text-xs text-danger">{state.fieldErrors.name}</p>}
      </div>

      <div>
        <Label htmlFor="logo_url">URL do logo</Label>
        <Input id="logo_url" name="logo_url" defaultValue={brand?.logo_url ?? ""} placeholder="https://…" />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={brand?.description ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="is_active" defaultChecked={brand?.is_active ?? true} />
        Marca ativa (visível na loja)
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar marca"}
      </Button>
    </form>
  );
}
