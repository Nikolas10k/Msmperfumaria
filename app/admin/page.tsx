import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const PAID_STATUSES = ["pago", "em_preparacao", "enviado", "saiu_para_entrega", "entregue"];

export default async function AdminDashboardPage() {
  const { supabase } = await requireStaff();

  const [ordersRes, recentOrdersRes, lowStockRes, topProductsRes] = await Promise.all([
    supabase.from("orders").select("id, status, total, created_at"),
    supabase
      .from("orders")
      .select("id, order_number, status, total, created_at, customers(name)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("inventory")
      .select("quantity, low_stock_threshold, product_variants(sku, volume_ml, products(name))")
      .order("quantity", { ascending: true })
      .limit(8),
    supabase
      .from("order_items")
      .select("product_name, quantity"),
  ]);

  const allOrders = ordersRes.data ?? [];
  const paidOrders = allOrders.filter((o) => PAID_STATUSES.includes(o.status));
  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgTicket = paidOrders.length > 0 ? revenue / paidOrders.length : 0;

  const lowStock = (lowStockRes.data ?? []).filter(
    (i) => i.quantity <= i.low_stock_threshold,
  );

  const salesByProduct = new Map<string, number>();
  for (const item of topProductsRes.data ?? []) {
    salesByProduct.set(item.product_name, (salesByProduct.get(item.product_name) ?? 0) + item.quantity);
  }
  const topProducts = [...salesByProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="font-serif-display text-2xl text-text-primary">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-text-muted">Faturamento</p>
          <p className="mt-2 text-2xl text-gold-light">{formatBRL(revenue)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-text-muted">Pedidos pagos</p>
          <p className="mt-2 text-2xl text-text-primary">{paidOrders.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-text-muted">Ticket médio</p>
          <p className="mt-2 text-2xl text-text-primary">{formatBRL(avgTicket)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-text-muted">Total de pedidos</p>
          <p className="mt-2 text-2xl text-text-primary">{allOrders.length}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-text-secondary">
            Pedidos recentes
          </h2>
          <div className="space-y-3">
            {(recentOrdersRes.data ?? []).map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="flex items-center justify-between rounded-sm border border-border px-3 py-2 hover:border-gold"
              >
                <div>
                  <p className="text-sm text-text-primary">{order.order_number}</p>
                  <p className="text-xs text-text-muted">
                    {(order.customers as unknown as { name: string } | null)?.name ?? "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-primary">{formatBRL(Number(order.total))}</p>
                  <Badge variant="dark">{order.status}</Badge>
                </div>
              </Link>
            ))}
            {(recentOrdersRes.data ?? []).length === 0 && (
              <p className="text-sm text-text-muted">Nenhum pedido ainda.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-text-secondary">
            Estoque baixo
          </h2>
          <div className="space-y-3">
            {lowStock.map((item, idx) => {
              const variant = item.product_variants as unknown as {
                sku: string;
                volume_ml: number;
                products: { name: string } | null;
              } | null;
              return (
                <div key={idx} className="flex items-center justify-between rounded-sm border border-danger/30 px-3 py-2">
                  <div>
                    <p className="text-sm text-text-primary">{variant?.products?.name ?? "—"}</p>
                    <p className="text-xs text-text-muted">
                      {variant?.sku} · {variant?.volume_ml}ml
                    </p>
                  </div>
                  <Badge variant="danger">{item.quantity} un.</Badge>
                </div>
              );
            })}
            {lowStock.length === 0 && (
              <p className="text-sm text-text-muted">Nenhum produto com estoque baixo.</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-text-secondary">
          Mais vendidos
        </h2>
        <div className="space-y-2">
          {topProducts.map(([name, qty]) => (
            <div key={name} className="flex items-center justify-between text-sm">
              <span className="text-text-primary">{name}</span>
              <span className="text-text-muted">{qty} un. vendidas</span>
            </div>
          ))}
          {topProducts.length === 0 && <p className="text-sm text-text-muted">Sem vendas ainda.</p>}
        </div>
      </Card>
    </div>
  );
}
