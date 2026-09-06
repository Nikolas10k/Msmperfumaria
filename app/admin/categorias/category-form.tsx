"use client";

import { useActionState } from "react";
import { saveCategoryAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";
import type { Database } from "@/lib/types/database";

const initialState: ActionState = { ok: false };

export function CategoryForm({
  category,
}: {
  category?: Database["public"]["Tables"]["categories"]["Row"];
}) {
  const [state, formAction, pending] = useActionState(saveCategoryAction, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}
      {state.message && <p className="text-sm text-danger">{state.message}</p>}

      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" defaultValue={category?.name} required />
        {state.fieldErrors?.name && <p className="mt-1 text-xs text-danger">{state.fieldErrors.name}</p>}
      </div>

      <div>
        <Label htmlFor="image_url">URL da imagem</Label>
        <Input id="image_url" name="image_url" defaultValue={category?.image_url ?? ""} placeholder="https://…" />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={category?.description ?? ""} />
      </div>

      <div>
        <Label htmlFor="position">Ordem de exibição</Label>
        <Input id="position" name="position" type="number" defaultValue={category?.position ?? 0} />
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="is_active" defaultChecked={category?.is_active ?? true} />
        Categoria ativa (visível na loja)
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar categoria"}
      </Button>
    </form>
  );
}
