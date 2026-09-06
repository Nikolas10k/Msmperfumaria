"use client";

import { useActionState } from "react";
import { saveProductAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";
import type { Database } from "@/lib/types/database";

const initialState: ActionState = { ok: false };

type Product = Database["public"]["Tables"]["products"]["Row"];
type Brand = Database["public"]["Tables"]["brands"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export function ProductForm({
  product,
  brands,
  categories,
  selectedCategoryIds = [],
}: {
  product?: Product;
  brands: Brand[];
  categories: Category[];
  selectedCategoryIds?: string[];
}) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      {state.message && (
        <p className={state.ok ? "text-sm text-success" : "text-sm text-danger"}>{state.message}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nome do perfume</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
          {state.fieldErrors?.name && <p className="mt-1 text-xs text-danger">{state.fieldErrors.name}</p>}
        </div>

        <div>
          <Label htmlFor="brand_id">Marca</Label>
          <Select id="brand_id" name="brand_id" defaultValue={product?.brand_id} required>
            <option value="">Selecione…</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </Select>
          {state.fieldErrors?.brand_id && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.brand_id}</p>
          )}
        </div>

        <div>
          <Label htmlFor="gender">Gênero</Label>
          <Select id="gender" name="gender" defaultValue={product?.gender ?? "unissex"}>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="unissex">Unissex</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="fragrance_type">Tipo de fragrância</Label>
          <Select id="fragrance_type" name="fragrance_type" defaultValue={product?.fragrance_type ?? "eau_de_parfum"}>
            <option value="eau_de_parfum">Eau de Parfum</option>
            <option value="eau_de_toilette">Eau de Toilette</option>
            <option value="eau_de_cologne">Eau de Cologne</option>
            <option value="parfum">Parfum</option>
            <option value="eau_fraiche">Eau Fraîche</option>
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="fragrance_family">Família olfativa</Label>
          <Input
            id="fragrance_family"
            name="fragrance_family"
            defaultValue={product?.fragrance_family}
            placeholder="Ex.: Amadeirado Aromático"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="top_notes">Notas de saída (separadas por vírgula)</Label>
          <Textarea id="top_notes" name="top_notes" rows={2} defaultValue={product?.top_notes?.join(", ")} />
        </div>
        <div>
          <Label htmlFor="heart_notes">Notas de coração</Label>
          <Textarea id="heart_notes" name="heart_notes" rows={2} defaultValue={product?.heart_notes?.join(", ")} />
        </div>
        <div>
          <Label htmlFor="base_notes">Notas de fundo</Label>
          <Textarea id="base_notes" name="base_notes" rows={2} defaultValue={product?.base_notes?.join(", ")} />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={product?.description} />
      </div>

      <div>
        <Label>Categorias</Label>
        <div className="flex flex-wrap gap-3 rounded-sm border border-border bg-surface p-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-1.5 text-sm text-text-secondary">
              <input
                type="checkbox"
                name="category_ids"
                value={category.id}
                defaultChecked={selectedCategoryIds.includes(category.id)}
              />
              {category.name}
            </label>
          ))}
          {categories.length === 0 && <p className="text-sm text-text-muted">Cadastre categorias primeiro.</p>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="meta_title">Meta title (SEO)</Label>
          <Input id="meta_title" name="meta_title" defaultValue={product?.meta_title ?? ""} />
        </div>
        <div>
          <Label htmlFor="meta_description">Meta description (SEO)</Label>
          <Input id="meta_description" name="meta_description" defaultValue={product?.meta_description ?? ""} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
          Ativo na loja
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" name="is_original" defaultChecked={product?.is_original ?? true} />
          Selo &quot;Original&quot;
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" name="is_bestseller" defaultChecked={product?.is_bestseller ?? false} />
          Selo &quot;Mais vendido&quot;
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" name="is_new_arrival" defaultChecked={product?.is_new_arrival ?? false} />
          Selo &quot;Lançamento&quot;
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar produto"}
      </Button>
    </form>
  );
}
