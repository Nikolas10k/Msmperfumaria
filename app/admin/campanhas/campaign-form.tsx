"use client";

import { useActionState, useState } from "react";
import { saveCampaignAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";
import type { Database } from "@/lib/types/database";

const initialState: ActionState = { ok: false };

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function CampaignForm({
  campaign,
  products,
  categories,
  brands,
  selectedTargetIds = [],
}: {
  campaign?: Campaign;
  products: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  selectedTargetIds?: string[];
}) {
  const [state, formAction, pending] = useActionState(saveCampaignAction, initialState);
  const [scope, setScope] = useState(campaign?.scope ?? "all");

  const targetOptions =
    scope === "products" ? products : scope === "categories" ? categories : scope === "brands" ? brands : [];

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {campaign && <input type="hidden" name="id" value={campaign.id} />}
      {state.message && <p className="text-sm text-danger">{state.message}</p>}

      <div>
        <Label htmlFor="name">Nome da campanha</Label>
        <Input id="name" name="name" defaultValue={campaign?.name} placeholder="Ex.: Black Friday" required />
        {state.fieldErrors?.name && <p className="mt-1 text-xs text-danger">{state.fieldErrors.name}</p>}
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" rows={2} defaultValue={campaign?.description ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="discount_type">Tipo de desconto</Label>
          <Select id="discount_type" name="discount_type" defaultValue={campaign?.discount_type ?? "percentage"}>
            <option value="percentage">Percentual (%)</option>
            <option value="fixed_amount">Valor fixo (R$)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="discount_value">Valor do desconto</Label>
          <Input
            id="discount_value"
            name="discount_value"
            type="number"
            step="0.01"
            defaultValue={campaign?.discount_value}
            required
          />
          {state.fieldErrors?.discount_value && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.discount_value}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="starts_at">Início da vigência</Label>
          <Input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            defaultValue={toLocalInput(campaign?.starts_at)}
            required
          />
        </div>
        <div>
          <Label htmlFor="ends_at">Fim da vigência</Label>
          <Input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            defaultValue={toLocalInput(campaign?.ends_at)}
            required
          />
          {state.fieldErrors?.ends_at && <p className="mt-1 text-xs text-danger">{state.fieldErrors.ends_at}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="scope">Aplicar em</Label>
        <Select
          id="scope"
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
        >
          <option value="all">Toda a loja</option>
          <option value="products">Produtos selecionados</option>
          <option value="categories">Categorias selecionadas</option>
          <option value="brands">Marcas selecionadas</option>
        </Select>
      </div>

      {scope !== "all" && (
        <div>
          <Label>Selecione os itens</Label>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-sm border border-border bg-surface p-3">
            {targetOptions.map((item) => (
              <label key={item.id} className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  name="target_ids"
                  value={item.id}
                  defaultChecked={selectedTargetIds.includes(item.id)}
                />
                {item.name}
              </label>
            ))}
            {targetOptions.length === 0 && <p className="text-sm text-text-muted">Nenhum item disponível.</p>}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="is_active" defaultChecked={campaign?.is_active ?? true} />
        Campanha ativa
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar campanha"}
      </Button>
    </form>
  );
}
