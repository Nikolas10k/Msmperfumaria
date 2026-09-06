import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Meus pedidos" };
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

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?proximo=/conta/pedidos");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 font-serif-display text-3xl text-text-primary">Meus pedidos</h1>

      <div className="space-y-3">
        {(orders ?? []).map((order) => (
          <Link
            key={order.id}
            href={`/conta/pedidos/${order.id}`}
            className="flex items-center justify-between rounded-md border border-border bg-surface p-4 hover:border-gold-hairline"
          >
            <div>
              <p className="text-text-primary">{order.order_number}</p>
              <p className="text-xs text-text-muted">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="text-right">
              <p className="text-text-primary">{formatBRL(Number(order.total))}</p>
              <Badge variant="dark">{STATUS_LABELS[order.status] ?? order.status}</Badge>
            </div>
          </Link>
        ))}
        {(orders ?? []).length === 0 && (
          <p className="py-10 text-center text-text-muted">Você ainda não fez nenhum pedido.</p>
        )}
      </div>
    </div>
  );
}
