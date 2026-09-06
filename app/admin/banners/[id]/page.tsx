import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { BannerForm } from "../banner-form";

export const metadata: Metadata = { title: "Editar banner" };

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: banner } = await supabase.from("banners").select("*").eq("id", id).maybeSingle();

  if (!banner) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Editar banner</h1>
      <BannerForm banner={banner} />
    </div>
  );
}
