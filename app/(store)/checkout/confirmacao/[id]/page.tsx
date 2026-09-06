import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Pedido confirmado" };

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }, { data: payment }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("payments").select("*").eq("order_id", id).maybeSingle(),
  ]);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto mb-4 text-success" size={48} />
      <h1 className="mb-2 font-serif-display text-3xl text-text-primary">Pedido recebido!</h1>
      <p className="mb-8 text-sm text-text-muted">
        Pedido <span className="text-text-primary">{order.order_number}</span> registrado com sucesso.
      </p>

      <Card className="mb-6 text-left">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-secondary">Itens</h2>
        {(items ?? []).map((item) => (
          <div key={item.id} className="flex justify-between border-b border-border py-2 text-sm last:border-0">
            <span className="text-text-secondary">
              {item.quantity}x {item.brand_name} {item.product_name} ({item.variant_label})
            </span>
            <span className="text-text-primary">{formatBRL(Number(item.total))}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-base text-text-primary">
          <span>Total</span>
          <span>{formatBRL(Number(order.total))}</span>
        </div>
      </Card>

      <Card className="mb-8 text-left">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-text-secondary">
          Próximos passos do pagamento
        </h2>
        {payment?.method === "pix" ? (
          <p className="text-sm text-text-secondary">
            Assim que a integração com o gateway de pagamento for concluída, você receberá o QR
            Code PIX por e-mail e WhatsApp. Enquanto isso, nossa equipe entrará em contato para
            confirmar o pagamento e dar sequência ao seu pedido.
          </p>
        ) : (
          <p className="text-sm text-text-secondary">
            Recebemos seu pedido para pagamento com cartão de crédito. Nossa equipe entrará em
            contato para concluir a cobrança com segurança.
          </p>
        )}
      </Card>

      <div className="flex justify-center gap-4">
        <Link href="/conta/pedidos">
          <Button variant="secondary">Ver meus pedidos</Button>
        </Link>
        <Link href="/perfumes">
          <Button>Continuar comprando</Button>
        </Link>
      </div>
    </div>
  );
}
