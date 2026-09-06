import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Detalhe do pedido" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  pagamento_pendente: "Pagamento pendente",
  pago: "Pago",
  em_preparacao: "Em preparação",
  enviado: "Enviado",
  saiu_para_entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export default async function MyOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/entrar?proximo=/conta/pedidos/${id}`);

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).eq("customer_id", user.id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);

  if (!order) notFound();
  const address = order.shipping_address as Record<string, string>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-text-primary">{order.order_number}</h1>
        <Badge variant="dark">{STATUS_LABELS[order.status] ?? order.status}</Badge>
      </div>

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-secondary">Itens</h2>
        {(items ?? []).map((item) => (
          <div key={item.id} className="flex justify-between border-b border-border py-2 text-sm last:border-0">
            <span className="text-text-secondary">
              {item.quantity}x {item.brand_name} {item.product_name} ({item.variant_label})
            </span>
            <span className="text-text-primary">{formatBRL(Number(item.total))}</span>
          </div>
        ))}
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal</span>
            <span>{formatBRL(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Frete</span>
            <span>{formatBRL(Number(order.shipping_fee))}</span>
          </div>
          <div className="flex justify-between text-base text-text-primary">
            <span>Total</span>
            <span>{formatBRL(Number(order.total))}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-text-secondary">
          Endereço de entrega
        </h2>
        <p className="text-sm text-text-secondary">
          {address.street}, {address.number} {address.complement ? `- ${address.complement}` : ""}
        </p>
        <p className="text-sm text-text-secondary">
          {address.neighborhood} — {address.city}/{address.state}
        </p>
      </Card>
    </div>
  );
}
