"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { slugify } from "@/lib/utils";
import { parseCatalogCsv, uniqueSlug, type ParsedImportRow } from "@/lib/admin/csv-import";

export type PreviewRow = ParsedImportRow & {
  brandIsNew: boolean;
  categoryIsNew: boolean;
};

export type PreviewState = {
  step: "idle" | "preview" | "done";
  csvText?: string;
  rows?: PreviewRow[];
  validCount?: number;
  errorCount?: number;
  newBrands?: string[];
  newCategories?: string[];
  message?: string;
  result?: { created: number; skipped: number };
};

const initialState: PreviewState = { step: "idle" };

export { initialState as previewInitialState };

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export async function previewImportAction(_prev: PreviewState, formData: FormData): Promise<PreviewState> {
  const { supabase } = await requireAdmin();

  const file = formData.get("csv");
  if (!(file instanceof File) || file.size === 0) {
    return { step: "idle", message: "Selecione um arquivo CSV." };
  }

  const csvText = await file.text();
  const parsedRows = parseCatalogCsv(csvText);

  if (parsedRows.length === 0) {
    return { step: "idle", message: "Não encontrei linhas de produtos nesse arquivo." };
  }

  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from("brands").select("name"),
    supabase.from("categories").select("name"),
  ]);

  const knownBrands = new Set((brands ?? []).map((b) => normalizeName(b.name)));
  const knownCategories = new Set((categories ?? []).map((c) => normalizeName(c.name)));

  const seenNewBrands = new Set<string>();
  const seenNewCategories = new Set<string>();

  const rows: PreviewRow[] = parsedRows.map((row) => {
    const brandIsNew = !!row.brandName && !knownBrands.has(normalizeName(row.brandName));
    const categoryIsNew = !!row.categoryName && !knownCategories.has(normalizeName(row.categoryName));
    if (brandIsNew) seenNewBrands.add(row.brandName);
    if (categoryIsNew && row.categoryName) seenNewCategories.add(row.categoryName);
    return { ...row, brandIsNew, categoryIsNew };
  });

  const validCount = rows.filter((r) => r.errors.length === 0).length;

  return {
    step: "preview",
    csvText,
    rows,
    validCount,
    errorCount: rows.length - validCount,
    newBrands: [...seenNewBrands],
    newCategories: [...seenNewCategories],
  };
}

export async function commitImportAction(_prev: PreviewState, formData: FormData): Promise<PreviewState> {
  const { supabase } = await requireAdmin();

  const csvText = formData.get("csvText") as string | null;
  const activate = formData.get("activate") === "on";
  if (!csvText) {
    return { step: "idle", message: "Sessão de importação expirou, envie o CSV de novo." };
  }

  const rows = parseCatalogCsv(csvText).filter((r) => r.errors.length === 0);

  const [{ data: existingBrands }, { data: existingCategories }, { data: existingProducts }] = await Promise.all([
    supabase.from("brands").select("id, name"),
    supabase.from("categories").select("id, name"),
    supabase.from("products").select("slug"),
  ]);

  const brandByName = new Map((existingBrands ?? []).map((b) => [normalizeName(b.name), b.id]));
  const categoryByName = new Map((existingCategories ?? []).map((c) => [normalizeName(c.name), c.id]));
  const takenSlugs = new Set((existingProducts ?? []).map((p) => p.slug));

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    let brandId = brandByName.get(normalizeName(row.brandName));
    if (!brandId) {
      const { data: newBrand, error } = await supabase
        .from("brands")
        .insert({ name: row.brandName, slug: slugify(row.brandName) })
        .select("id")
        .single();
      if (error || !newBrand) {
        skipped++;
        continue;
      }
      brandId = newBrand.id;
      brandByName.set(normalizeName(row.brandName), brandId);
    }

    let categoryId: string | undefined;
    if (row.categoryName) {
      categoryId = categoryByName.get(normalizeName(row.categoryName));
      if (!categoryId) {
        const { data: newCategory, error } = await supabase
          .from("categories")
          .insert({ name: row.categoryName, slug: slugify(row.categoryName) })
          .select("id")
          .single();
        if (!error && newCategory) {
          categoryId = newCategory.id;
          categoryByName.set(normalizeName(row.categoryName), categoryId);
        }
      }
    }

    const slug = uniqueSlug(row.name, takenSlugs);

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        brand_id: brandId,
        name: row.name,
        slug,
        gender: row.gender!,
        fragrance_type: row.fragranceType!,
        fragrance_family: row.fragranceFamily,
        description: row.description,
        is_active: activate,
        is_original: true,
      })
      .select("id")
      .single();

    if (productError || !product) {
      skipped++;
      continue;
    }

    if (categoryId) {
      await supabase.from("product_categories").insert({ product_id: product.id, category_id: categoryId });
    }

    const sku = `${slug}-${row.volumeMl}ml`.toUpperCase();
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .insert({
        product_id: product.id,
        sku,
        volume_ml: row.volumeMl!,
        price: row.price,
        is_active: activate,
      })
      .select("id")
      .single();

    if (!variantError && variant) {
      await supabase.from("inventory").upsert({ variant_id: variant.id, quantity: row.stock });
    }

    created++;
  }

  revalidatePath("/admin/produtos");

  return {
    step: "done",
    result: { created, skipped },
  };
}
