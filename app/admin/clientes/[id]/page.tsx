import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Detalhe do cliente" };
export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();

  const [{ data: customer }, { data: orders }, { data: addresses }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("orders")
      .select("id, order_number, total, status, created_at")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("addresses").select("*").eq("customer_id", id),
  ]);

  if (!customer) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">{customer.name}</h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-text-secondary">Contato</h2>
          <p className="text-sm text-text-secondary">{customer.email}</p>
          {customer.phone && <p className="text-sm text-text-secondary">{customer.phone}</p>}
          <p className="mt-2 text-xs text-text-muted">
            Cliente desde {new Date(customer.created_at).toLocaleDateString("pt-BR")}
          </p>
        </Card>

        <Card>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-text-secondary">Endereços</h2>
          {(addresses ?? []).map((address) => (
            <p key={address.id} className="text-sm text-text-secondary">
              {address.street}, {address.number} — {address.city}/{address.state}
            </p>
          ))}
          {(addresses ?? []).length === 0 && <p className="text-sm text-text-muted">Nenhum endereço salvo.</p>}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-secondary">Pedidos</h2>
        <div className="space-y-2">
          {(orders ?? []).map((order) => (
            <Link
              key={order.id}
              href={`/admin/pedidos/${order.id}`}
              className="flex items-center justify-between rounded-sm border border-border px-3 py-2 hover:border-rose"
            >
              <span className="text-sm text-text-primary">{order.order_number}</span>
              <span className="text-sm text-text-secondary">{formatBRL(Number(order.total))}</span>
              <Badge variant="dark">{order.status}</Badge>
            </Link>
          ))}
          {(orders ?? []).length === 0 && <p className="text-sm text-text-muted">Nenhum pedido ainda.</p>}
        </div>
      </Card>
    </div>
  );
}
