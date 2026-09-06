import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/input";
import { StatusSelect } from "../status-select";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Detalhe do pedido" };
export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();

  const [{ data: order }, { data: items }, { data: payments }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, customers(name, email, phone)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("payments").select("*").eq("order_id", id),
  ]);

  if (!order) notFound();

  const customer = order.customers as unknown as { name: string; email: string; phone: string | null } | null;
  const address = order.shipping_address as Record<string, string>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-2xl text-text-primary">{order.order_number}</h1>
          <p className="text-sm text-text-muted">
            {new Date(order.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <div>
          <Label>Status do pedido</Label>
          <StatusSelect orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-secondary">Cliente</h2>
          <p className="text-text-primary">{customer?.name}</p>
          <p className="text-sm text-text-secondary">{customer?.email}</p>
          {customer?.phone && <p className="text-sm text-text-secondary">{customer.phone}</p>}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-secondary">
            Endereço de entrega
          </h2>
          <p className="text-sm text-text-secondary">
            {address.street}, {address.number} {address.complement ? `- ${address.complement}` : ""}
          </p>
          <p className="text-sm text-text-secondary">
            {address.neighborhood} — {address.city}/{address.state}
          </p>
          <p className="text-sm text-text-secondary">CEP {address.cep}</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-secondary">Itens</h2>
        <div className="space-y-2">
          {(items ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
              <div>
                <p className="text-text-primary">
                  {item.brand_name} — {item.product_name} ({item.variant_label})
                </p>
                <p className="text-text-muted">
                  {item.quantity}x {formatBRL(Number(item.unit_price))}
                </p>
              </div>
              <p className="text-text-primary">{formatBRL(Number(item.total))}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal</span>
            <span>{formatBRL(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Desconto</span>
            <span>-{formatBRL(Number(order.discount_total))}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Frete</span>
            <span>{formatBRL(Number(order.shipping_fee))}</span>
          </div>
          <div className="flex justify-between text-base font-medium text-text-primary">
            <span>Total</span>
            <span>{formatBRL(Number(order.total))}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-secondary">Pagamento</h2>
        {(payments ?? []).map((payment) => (
          <div key={payment.id} className="flex justify-between text-sm text-text-secondary">
            <span>
              {payment.method} · {payment.status}
            </span>
            <span>{formatBRL(Number(payment.amount))}</span>
          </div>
        ))}
        {(payments ?? []).length === 0 && <p className="text-sm text-text-muted">Sem registro de pagamento.</p>}
      </Card>
    </div>
  );
}
