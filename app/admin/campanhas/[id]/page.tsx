import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { CampaignForm } from "../campaign-form";

export const metadata: Metadata = { title: "Editar campanha" };

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();

  const [{ data: campaign }, { data: products }, { data: categories }, { data: brands }, { data: targets }] =
    await Promise.all([
      supabase.from("campaigns").select("*").eq("id", id).maybeSingle(),
      supabase.from("products").select("id, name").order("name"),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("brands").select("id, name").order("name"),
      supabase.from("campaign_targets").select("target_id").eq("campaign_id", id),
    ]);

  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Editar campanha</h1>
      <CampaignForm
        campaign={campaign}
        products={products ?? []}
        categories={categories ?? []}
        brands={brands ?? []}
        selectedTargetIds={(targets ?? []).map((t) => t.target_id)}
      />
    </div>
  );
}
