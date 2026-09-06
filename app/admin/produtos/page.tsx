import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatBRL } from "@/lib/utils";
import { deleteProductAction, duplicateProductAction } from "./actions";

export const metadata: Metadata = { title: "Produtos" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { supabase } = await requireStaff();
  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, gender, is_active, is_bestseller, is_new_arrival, brands(name), product_variants(price, product_id, inventory(quantity))",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-text-primary">Produtos</h1>
        <Link href="/admin/produtos/novo">
          <Button>Novo produto</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Gênero</th>
              <th className="px-4 py-3">A partir de</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((product) => {
              const variants = product.product_variants as unknown as {
                price: number;
                inventory: { quantity: number } | null;
              }[];
              const minPrice = variants.length
                ? Math.min(...variants.map((v) => Number(v.price)))
                : null;
              const totalStock = variants.reduce((s, v) => s + (v.inventory?.quantity ?? 0), 0);

              return (
                <tr key={product.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text-primary">
                    {product.name}
                    <div className="mt-1 flex gap-1">
                      {product.is_bestseller && <Badge>Mais vendido</Badge>}
                      {product.is_new_arrival && <Badge variant="dark">Lançamento</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {(product.brands as unknown as { name: string } | null)?.name}
                  </td>
                  <td className="px-4 py-3 text-text-secondary capitalize">{product.gender}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {minPrice !== null ? formatBRL(minPrice) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={totalStock > 0 ? "success" : "danger"}>{totalStock} un.</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.is_active ? "success" : "dark"}>
                      {product.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/produtos/${product.id}`} className="text-gold hover:text-gold-light">
                        Editar
                      </Link>
                      <DeleteButton
                        id={product.id}
                        action={duplicateProductAction}
                        label="Duplicar"
                        confirmMessage="Duplicar este produto como rascunho inativo?"
                        tone="neutral"
                      />
                      <DeleteButton id={product.id} action={deleteProductAction} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(products ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-text-muted">
                  Nenhum produto cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
