import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCatalogProducts } from "@/lib/catalog/list-products";
import { ProductCard } from "@/components/store/product-card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Buscar perfumes" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const products = q ? await getCatalogProducts(supabase, { search: q }) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-serif-display text-3xl text-text-primary">Buscar</h1>

      <form className="mb-8">
        <Input name="q" defaultValue={q} placeholder="Busque por nome, marca ou família olfativa…" autoFocus />
      </form>

      {q && (
        <p className="mb-6 text-sm text-text-muted">
          {products.length} resultado{products.length === 1 ? "" : "s"} para &quot;{q}&quot;
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {q && products.length === 0 && (
        <p className="py-10 text-center text-text-muted">Nenhum resultado encontrado.</p>
      )}
    </div>
  );
}
