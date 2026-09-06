import type { Metadata } from "next";
import { BrandForm } from "../brand-form";

export const metadata: Metadata = { title: "Nova marca" };

export default function NewBrandPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Nova marca</h1>
      <BrandForm />
    </div>
  );
}
