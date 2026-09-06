import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { BrandForm } from "../brand-form";

export const metadata: Metadata = { title: "Editar marca" };

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: brand } = await supabase.from("brands").select("*").eq("id", id).maybeSingle();

  if (!brand) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Editar marca</h1>
      <BrandForm brand={brand} />
    </div>
  );
}
