import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types/database";

export const metadata: Metadata = { title: "Pedidos" };
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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { supabase } = await requireStaff();

  let query = supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, customers(name, email)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status as OrderStatus);

  const { data: orders } = await query;

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Pedidos</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={`rounded-full border px-3 py-1 text-xs ${!status ? "border-rose text-rose" : "border-border text-text-muted"}`}
        >
          Todos
        </Link>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/pedidos?status=${value}`}
            className={`rounded-full border px-3 py-1 text-xs ${status === value ? "border-rose text-rose" : "border-border text-text-muted"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/admin/pedidos/${order.id}`} className="text-rose hover:text-rose-light">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {(order.customers as unknown as { name: string } | null)?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-text-secondary">{formatBRL(Number(order.total))}</td>
                <td className="px-4 py-3">
                  <Badge variant="dark">{STATUS_LABELS[order.status] ?? order.status}</Badge>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
            {(orders ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-muted">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
