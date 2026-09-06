"use client";

import { useActionState } from "react";
import { saveMethodAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";
import type { Database } from "@/lib/types/database";

const initialState: ActionState = { ok: false };

export function MethodForm({
  method,
  onDone,
}: {
  method?: Database["public"]["Tables"]["shipping_methods"]["Row"];
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(async (prev: ActionState, fd: FormData) => {
    const result = await saveMethodAction(prev, fd);
    if (result.ok) onDone?.();
    return result;
  }, initialState);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 rounded-sm border border-border bg-surface p-4 sm:grid-cols-4">
      {method && <input type="hidden" name="id" value={method.id} />}
      <div className="col-span-2">
        <Label>Nome</Label>
        <Input name="name" defaultValue={method?.name} placeholder="Ex.: Entrega expressa Brasília" required />
      </div>
      <div>
        <Label>Tipo</Label>
        <Select name="type" defaultValue={method?.type ?? "express_brasilia"}>
          <option value="express_brasilia">Expressa (Brasília)</option>
          <option value="standard">Padrão (nacional)</option>
        </Select>
      </div>
      <div>
        <Label>Preço base (R$)</Label>
        <Input name="base_price" type="number" step="0.01" defaultValue={method?.base_price ?? 0} />
      </div>
      <label className="col-span-full flex items-center gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="is_active" defaultChecked={method?.is_active ?? true} />
        Ativo
      </label>
      {state.message && <p className="col-span-full text-xs text-danger">{state.message}</p>}
      <div className="col-span-full">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Salvando…" : method ? "Atualizar método" : "Adicionar método"}
        </Button>
      </div>
    </form>
  );
}
