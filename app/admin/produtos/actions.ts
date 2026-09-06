"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { slugify } from "@/lib/utils";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";
import type { ActionState } from "@/app/(auth)/actions";

function splitNotes(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
}

const productSchema = z.object({
  brand_id: z.string().uuid("Selecione uma marca."),
  name: z.string().trim().min(1, "Informe o nome do produto."),
  gender: z.enum(["masculino", "feminino", "unissex"]),
  fragrance_type: z.enum([
    "eau_de_parfum",
    "eau_de_toilette",
    "eau_de_cologne",
    "parfum",
    "eau_fraiche",
  ]),
  fragrance_family: z.string().trim().min(1, "Informe a família olfativa."),
  description: z.string().trim().default(""),
  meta_title: z.string().trim().optional(),
  meta_description: z.string().trim().optional(),
  is_active: z.boolean(),
  is_original: z.boolean(),
  is_bestseller: z.boolean(),
  is_new_arrival: z.boolean(),
});

export async function saveProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = productSchema.safeParse({
    brand_id: formData.get("brand_id"),
    name: formData.get("name"),
    gender: formData.get("gender"),
    fragrance_type: formData.get("fragrance_type"),
    fragrance_family: formData.get("fragrance_family"),
    description: formData.get("description") || "",
    meta_title: formData.get("meta_title") || undefined,
    meta_description: formData.get("meta_description") || undefined,
    is_active: formData.get("is_active") === "on",
    is_original: formData.get("is_original") === "on",
    is_bestseller: formData.get("is_bestseller") === "on",
    is_new_arrival: formData.get("is_new_arrival") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const id = formData.get("id") as string | null;
  const categoryIds = formData.getAll("category_ids") as string[];

  const payload = {
    ...parsed.data,
    meta_title: parsed.data.meta_title || null,
    meta_description: parsed.data.meta_description || null,
    top_notes: splitNotes(formData.get("top_notes")),
    heart_notes: splitNotes(formData.get("heart_notes")),
    base_notes: splitNotes(formData.get("base_notes")),
    slug: slugify(parsed.data.name),
  };

  let productId = id;

  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) return { ok: false, message: "Não foi possível salvar o produto. " + error.message };
  } else {
    const { data, error } = await supabase.from("products").insert(payload).select("id").single();
    if (error) return { ok: false, message: "Não foi possível criar o produto. " + error.message };
    productId = data.id;
  }

  await supabase.from("product_categories").delete().eq("product_id", productId!);
  if (categoryIds.length > 0) {
    await supabase
      .from("product_categories")
      .insert(categoryIds.map((category_id) => ({ product_id: productId!, category_id })));
  }

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${productId}`);

  if (!id) redirect(`/admin/produtos/${productId}`);
  return { ok: true, message: "Produto salvo." };
}

export async function deleteProductAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/produtos");
}

export async function duplicateProductAction(id: string) {
  const { supabase } = await requireAdmin();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!product) return;

  const { id: _oldId, created_at: _c, updated_at: _u, ...rest } = product;
  const { data: copy, error } = await supabase
    .from("products")
    .insert({
      ...rest,
      name: `${product.name} (cópia)`,
      slug: slugify(`${product.name}-copia-${Date.now()}`),
      is_active: false,
    })
    .select("id")
    .single();

  if (!error && copy) {
    const { data: variants } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id);

    for (const variant of variants ?? []) {
      const { id: _vid, product_id: _pid, created_at: _vc, updated_at: _vu, ...variantRest } = variant;
      await supabase
        .from("product_variants")
        .insert({ ...variantRest, product_id: copy.id, sku: `${variant.sku}-COPY` });
    }
  }

  revalidatePath("/admin/produtos");
}

const variantSchema = z.object({
  sku: z.string().trim().min(1, "Informe o SKU."),
  volume_ml: z.coerce.number().int().positive("Informe um volume válido."),
  price: z.coerce.number().nonnegative("Informe um preço válido."),
  compare_at_price: z.coerce.number().nonnegative().optional(),
  installments_max: z.coerce.number().int().min(1).default(1),
  is_active: z.boolean(),
  quantity: z.coerce.number().int().min(0).default(0),
  low_stock_threshold: z.coerce.number().int().min(0).default(5),
});

export async function saveVariantAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const productId = formData.get("product_id") as string;

  const parsed = variantSchema.safeParse({
    sku: formData.get("sku"),
    volume_ml: formData.get("volume_ml"),
    price: formData.get("price"),
    compare_at_price: formData.get("compare_at_price") || undefined,
    installments_max: formData.get("installments_max") || 1,
    is_active: formData.get("is_active") === "on",
    quantity: formData.get("quantity") || 0,
    low_stock_threshold: formData.get("low_stock_threshold") || 5,
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const id = formData.get("id") as string | null;
  const { quantity, low_stock_threshold, ...variantPayload } = parsed.data;
  const payload = {
    ...variantPayload,
    compare_at_price: variantPayload.compare_at_price || null,
    product_id: productId,
  };

  let variantId = id;
  if (id) {
    const { error } = await supabase.from("product_variants").update(payload).eq("id", id);
    if (error) return { ok: false, message: "Não foi possível salvar a variante. " + error.message };
  } else {
    const { data, error } = await supabase
      .from("product_variants")
      .insert(payload)
      .select("id")
      .single();
    if (error) return { ok: false, message: "Não foi possível criar a variante. " + error.message };
    variantId = data.id;
  }

  await supabase
    .from("inventory")
    .upsert({ variant_id: variantId!, quantity, low_stock_threshold }, { onConflict: "variant_id" });

  revalidatePath(`/admin/produtos/${productId}`);
  return { ok: true, message: "Variante salva." };
}

export async function deleteVariantAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("product_variants").delete().eq("id", id);
  revalidatePath("/admin/produtos");
}
