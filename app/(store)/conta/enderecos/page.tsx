import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AddressesClient } from "./addresses-client";

export const metadata: Metadata = { title: "Meus endereços" };
export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?proximo=/conta/enderecos");

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("customer_id", user.id)
    .order("is_default", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 font-serif-display text-3xl text-text-primary">Meus endereços</h1>
      <AddressesClient addresses={addresses ?? []} />
    </div>
  );
}
