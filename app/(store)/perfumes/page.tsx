import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCatalogProducts } from "@/lib/catalog/list-products";
import { ProductCard } from "@/components/store/product-card";
import { CatalogFiltersBar } from "./filters-bar";
import type { ProductGender } from "@/lib/types/database";

export const metadata: Metadata = {
  title: "Perfumes importados originais",
  description: "Catálogo completo de perfumes importados originais da MSM Perfumaria.",
};
export const revalidate = 30;

type SearchParams = {
  genero?: string;
  marca?: string;
  categoria?: string;
  familia?: string;
  precoMin?: string;
  precoMax?: string;
  ordenar?: string;
  lancamentos?: string;
  ofertas?: string;
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: brands }, products] = await Promise.all([
    supabase.from("brands").select("id, name, slug").eq("is_active", true).order("name"),
    getCatalogProducts(supabase, {
      gender: (params.genero as ProductGender) || undefined,
      brandSlug: params.marca || undefined,
      categorySlug: params.categoria || undefined,
      fragranceFamily: params.familia || undefined,
      priceMin: params.precoMin ? Number(params.precoMin) : undefined,
      priceMax: params.precoMax ? Number(params.precoMax) : undefined,
      onlyNewArrivals: params.lancamentos === "1",
      onlyOnSale: params.ofertas === "1",
      sort: (params.ordenar as "mais-vendidos" | "menor-preco" | "maior-preco" | "recentes") || undefined,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-2 font-serif-display text-3xl text-text-primary">Perfumes</h1>
      <p className="mb-8 text-sm text-text-muted">{products.length} produtos encontrados</p>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <CatalogFiltersBar brands={brands ?? []} />

        <div>
          {products.length === 0 ? (
            <p className="py-16 text-center text-text-muted">
              Nenhum produto encontrado com esses filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
