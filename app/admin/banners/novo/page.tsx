import type { Metadata } from "next";
import { BannerForm } from "../banner-form";

export const metadata: Metadata = { title: "Novo banner" };

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Novo banner</h1>
      <BannerForm />
    </div>
  );
}
