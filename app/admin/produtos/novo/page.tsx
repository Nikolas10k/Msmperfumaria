import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const { supabase } = await requireStaff();
  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from("brands").select("*").eq("is_active", true).order("name"),
    supabase.from("categories").select("*").eq("is_active", true).order("position"),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl text-text-primary">Novo produto</h1>
        <p className="text-sm text-text-muted">
          Salve os dados do perfume primeiro; variantes (tamanhos) e imagens são adicionadas em seguida.
        </p>
      </div>
      <ProductForm brands={brands ?? []} categories={categories ?? []} />
    </div>
  );
}
