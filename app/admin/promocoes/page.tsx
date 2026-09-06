import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatBRL } from "@/lib/utils";
import { deletePromotionAction } from "./actions";

export const metadata: Metadata = { title: "Promoções" };
export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const { supabase } = await requireStaff();
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*, product_variants(sku, volume_ml, price, products(name))")
    .order("starts_at", { ascending: false });

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-2xl text-text-primary">Promoções</h1>
          <p className="text-sm text-text-muted">
            Preço promocional agendado por variante — liga e desliga sozinho nas datas configuradas.
          </p>
        </div>
        <Link href="/admin/promocoes/nova">
          <Button>Nova promoção</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">De / Por</th>
              <th className="px-4 py-3">Vigência</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(promotions ?? []).map((promo) => {
              const variant = promo.product_variants as unknown as {
                sku: string;
                volume_ml: number;
                price: number;
                products: { name: string } | null;
              } | null;
              const starts = new Date(promo.starts_at);
              const ends = new Date(promo.ends_at);
              const isLive = promo.is_active && starts <= now && now <= ends;

              return (
                <tr key={promo.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text-primary">
                    {variant?.products?.name} <span className="text-text-muted">({variant?.volume_ml}ml)</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    <span className="text-text-muted line-through">{formatBRL(Number(variant?.price ?? 0))}</span>{" "}
                    {formatBRL(Number(promo.promo_price))}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {starts.toLocaleDateString("pt-BR")} – {ends.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isLive ? "success" : "dark"}>{isLive ? "No ar" : "Fora do período"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/promocoes/${promo.id}`} className="text-gold hover:text-gold-light">
                        Editar
                      </Link>
                      <DeleteButton id={promo.id} action={deletePromotionAction} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(promotions ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-muted">
                  Nenhuma promoção criada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
