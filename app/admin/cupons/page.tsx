import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCouponAction } from "./actions";

export const metadata: Metadata = { title: "Cupons" };
export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const { supabase } = await requireStaff();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*, coupon_usages(id)")
    .order("starts_at", { ascending: false });

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-text-primary">Cupons</h1>
        <Link href="/admin/cupons/novo">
          <Button>Novo cupom</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Desconto</th>
              <th className="px-4 py-3">Usos</th>
              <th className="px-4 py-3">Vigência</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(coupons ?? []).map((coupon) => {
              const uses = (coupon.coupon_usages as unknown as unknown[])?.length ?? 0;
              const starts = new Date(coupon.starts_at);
              const ends = new Date(coupon.ends_at);
              const isLive = coupon.is_active && starts <= now && now <= ends;
              return (
                <tr key={coupon.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-text-primary">{coupon.code}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value}`}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {uses}
                    {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {starts.toLocaleDateString("pt-BR")} – {ends.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isLive ? "success" : "dark"}>{isLive ? "Ativo" : "Fora do período"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/cupons/${coupon.id}`} className="text-rose hover:text-rose-light">
                        Editar
                      </Link>
                      <DeleteButton id={coupon.id} action={deleteCouponAction} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(coupons ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-text-muted">
                  Nenhum cupom criado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
