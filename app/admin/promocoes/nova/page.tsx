import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { PromotionForm } from "../promotion-form";

export const metadata: Metadata = { title: "Nova promoção" };

export default async function NewPromotionPage() {
  const { supabase } = await requireStaff();
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, sku, volume_ml, price, products(name)")
    .order("sku");

  const variantOptions = (variants ?? []).map((v) => ({
    id: v.id,
    label: `${(v.products as unknown as { name: string } | null)?.name} — ${v.volume_ml}ml (${v.sku})`,
    price: Number(v.price),
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Nova promoção</h1>
      <PromotionForm variantOptions={variantOptions} />
    </div>
  );
}
