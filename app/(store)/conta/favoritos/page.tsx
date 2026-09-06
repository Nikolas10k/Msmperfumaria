import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCatalogProducts } from "@/lib/catalog/list-products";
import { ProductCard } from "@/components/store/product-card";

export const metadata: Metadata = { title: "Meus favoritos" };
export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?proximo=/conta/favoritos");

  const { data: favorites } = await supabase
    .from("favorites")
    .select("products(slug)")
    .eq("customer_id", user.id);

  const favoriteSlugs = new Set(
    (favorites ?? []).map((f) => (f.products as unknown as { slug: string } | null)?.slug),
  );

  const allProducts = await getCatalogProducts(supabase);
  const products = allProducts.filter((p) => favoriteSlugs.has(p.slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 font-serif-display text-3xl text-text-primary">Meus favoritos</h1>

      {products.length === 0 ? (
        <p className="py-10 text-center text-text-muted">Você ainda não salvou nenhum favorito.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
