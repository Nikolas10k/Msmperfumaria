import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCategoryAction } from "./actions";

export const metadata: Metadata = { title: "Categorias" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const { supabase } = await requireStaff();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("position");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-text-primary">Categorias</h1>
        <Link href="/admin/categorias/nova">
          <Button>Nova categoria</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Ordem</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(categories ?? []).map((category) => (
              <tr key={category.id} className="border-t border-border">
                <td className="px-4 py-3 text-text-primary">{category.name}</td>
                <td className="px-4 py-3 text-text-muted">{category.position}</td>
                <td className="px-4 py-3">
                  <Badge variant={category.is_active ? "success" : "dark"}>
                    {category.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/categorias/${category.id}`} className="text-gold hover:text-gold-light">
                      Editar
                    </Link>
                    <DeleteButton id={category.id} action={deleteCategoryAction} />
                  </div>
                </td>
              </tr>
            ))}
            {(categories ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                  Nenhuma categoria cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
