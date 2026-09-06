import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { CampaignForm } from "../campaign-form";

export const metadata: Metadata = { title: "Nova campanha" };

export default async function NewCampaignPage() {
  const { supabase } = await requireStaff();
  const [{ data: products }, { data: categories }, { data: brands }] = await Promise.all([
    supabase.from("products").select("id, name").order("name"),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Nova campanha</h1>
      <CampaignForm products={products ?? []} categories={categories ?? []} brands={brands ?? []} />
    </div>
  );
}
