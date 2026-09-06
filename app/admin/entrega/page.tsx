import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { EntregaClient } from "./entrega-client";

export const metadata: Metadata = { title: "Entrega expressa" };
export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const { supabase } = await requireStaff();
  const [{ data: methods }, { data: regions }] = await Promise.all([
    supabase.from("shipping_methods").select("*").order("name"),
    supabase.from("shipping_regions").select("*").order("name"),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl text-text-primary">Entrega expressa em Brasília</h1>
        <p className="text-sm text-text-muted">
          Configure de forma real quais CEPs recebem a expressa, a taxa, o prazo e o
          horário-limite do pedido. O site nunca promete um prazo fixo — ele consulta
          esta configuração a cada CEP digitado pelo cliente.
        </p>
      </div>
      <EntregaClient methods={methods ?? []} regions={regions ?? []} />
    </div>
  );
}
