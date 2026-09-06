import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteBrandAction } from "./actions";

export const metadata: Metadata = { title: "Marcas" };
export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const { supabase } = await requireStaff();
  const { data: brands } = await supabase.from("brands").select("*").order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-text-primary">Marcas</h1>
        <Link href="/admin/marcas/nova">
          <Button>Nova marca</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(brands ?? []).map((brand) => (
              <tr key={brand.id} className="border-t border-border">
                <td className="px-4 py-3 text-text-primary">{brand.name}</td>
                <td className="px-4 py-3">
                  <Badge variant={brand.is_active ? "success" : "dark"}>
                    {brand.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/marcas/${brand.id}`} className="text-gold hover:text-gold-light">
                      Editar
                    </Link>
                    <DeleteButton id={brand.id} action={deleteBrandAction} />
                  </div>
                </td>
              </tr>
            ))}
            {(brands ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-text-muted">
                  Nenhuma marca cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
