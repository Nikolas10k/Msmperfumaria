import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/guard";
import { BulkPhotoUpload } from "./bulk-photo-upload";

export const metadata: Metadata = { title: "Upload de fotos em massa" };
export const dynamic = "force-dynamic";

export default async function BulkPhotosPage() {
  const { supabase } = await requireAdmin();

  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name, brands(name)")
    .order("name");

  const list = (products ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brandName: (p.brands as unknown as { name: string } | null)?.name ?? "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/produtos" className="text-sm text-rose hover:text-rose-light">
          ← Voltar para produtos
        </Link>
        <h1 className="mt-1 font-serif-display text-2xl text-text-primary">Upload de fotos em massa</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Selecione todas as fotos de uma vez. O nome de cada arquivo é comparado com o nome dos produtos pra
          já sugerir a correspondência — revise antes de enviar.
        </p>
      </div>

      <BulkPhotoUpload products={list} />
    </div>
  );
}
