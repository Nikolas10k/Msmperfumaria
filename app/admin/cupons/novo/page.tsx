import type { Metadata } from "next";
import { CouponForm } from "../coupon-form";

export const metadata: Metadata = { title: "Novo cupom" };

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Novo cupom</h1>
      <CouponForm />
    </div>
  );
}
