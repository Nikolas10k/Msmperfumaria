import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { PromotionForm } from "../promotion-form";

export const metadata: Metadata = { title: "Editar promoção" };

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();

  const [{ data: promotion }, { data: variants }] = await Promise.all([
    supabase.from("promotions").select("*").eq("id", id).maybeSingle(),
    supabase.from("product_variants").select("id, sku, volume_ml, price, products(name)").order("sku"),
  ]);

  if (!promotion) notFound();

  const variantOptions = (variants ?? []).map((v) => ({
    id: v.id,
    label: `${(v.products as unknown as { name: string } | null)?.name} — ${v.volume_ml}ml (${v.sku})`,
    price: Number(v.price),
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Editar promoção</h1>
      <PromotionForm promotion={promotion} variantOptions={variantOptions} />
    </div>
  );
}
