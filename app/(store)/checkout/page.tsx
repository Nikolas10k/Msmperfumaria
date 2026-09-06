import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cupom?: string }>;
}) {
  const { cupom } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar?proximo=/checkout");

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("customer_id", user.id)
    .order("is_default", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 font-serif-display text-3xl text-text-primary">Finalizar compra</h1>
      <CheckoutForm addresses={addresses ?? []} initialCoupon={cupom} />
    </div>
  );
}
