import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Clientes" };
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const { supabase } = await requireStaff();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, email, phone, created_at, orders(total, status, created_at)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Clientes</h1>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3">Total gasto</th>
              <th className="px-4 py-3">Última compra</th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).map((customer) => {
              const orders = (customer.orders as unknown as { total: number; status: string; created_at: string }[]) ?? [];
              const paid = orders.filter((o) =>
                ["pago", "em_preparacao", "enviado", "saiu_para_entrega", "entregue"].includes(o.status),
              );
              const totalSpent = paid.reduce((s, o) => s + Number(o.total), 0);
              const lastOrder = orders.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
              )[0];

              return (
                <tr key={customer.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clientes/${customer.id}`} className="text-text-primary hover:text-rose">
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {customer.email}
                    {customer.phone && <div className="text-xs text-text-muted">{customer.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{orders.length}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatBRL(totalSpent)}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {lastOrder ? new Date(lastOrder.created_at).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              );
            })}
            {(customers ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-muted">
                  Nenhum cliente cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
