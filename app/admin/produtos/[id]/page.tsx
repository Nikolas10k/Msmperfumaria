import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { ProductForm } from "../product-form";
import { VariantManager, type VariantRow } from "../variant-manager";
import { ImageManager } from "../image-manager";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Editar produto" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();

  const [{ data: product }, { data: brands }, { data: categories }, { data: productCategories }, { data: variants }, { data: images }] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase.from("brands").select("*").order("name"),
      supabase.from("categories").select("*").order("position"),
      supabase.from("product_categories").select("category_id").eq("product_id", id),
      supabase
        .from("product_variants")
        .select("*, inventory(quantity, low_stock_threshold)")
        .eq("product_id", id)
        .order("position"),
      supabase.from("product_images").select("*").eq("product_id", id).order("position"),
    ]);

  if (!product) notFound();

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="font-serif-display text-2xl text-text-primary">Editar produto</h1>
        <p className="text-sm text-text-muted">{product.name}</p>
      </div>

      <Card>
        <ProductForm
          product={product}
          brands={brands ?? []}
          categories={categories ?? []}
          selectedCategoryIds={(productCategories ?? []).map((c) => c.category_id)}
        />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-text-secondary">
          Variantes (tamanhos e estoque)
        </h2>
        <VariantManager productId={id} variants={(variants ?? []) as unknown as VariantRow[]} />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-text-secondary">
          Imagens
        </h2>
        <ImageManager productId={id} images={images ?? []} />
      </Card>
    </div>
  );
}
