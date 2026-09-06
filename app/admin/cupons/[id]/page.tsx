import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { CouponForm } from "../coupon-form";

export const metadata: Metadata = { title: "Editar cupom" };

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: coupon } = await supabase.from("coupons").select("*").eq("id", id).maybeSingle();

  if (!coupon) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Editar cupom</h1>
      <CouponForm coupon={coupon} />
    </div>
  );
}
