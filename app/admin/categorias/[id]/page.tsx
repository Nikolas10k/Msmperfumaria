import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "Editar categoria" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: category } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Editar categoria</h1>
      <CategoryForm category={category} />
    </div>
  );
}
