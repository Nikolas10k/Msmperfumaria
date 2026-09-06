import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Configurações" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase } = await requireStaff();
  const { data: settings } = await supabase.from("store_settings").select("*").eq("id", true).single();

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Configurações da loja</h1>
      <SettingsForm settings={settings!} />
    </div>
  );
}
