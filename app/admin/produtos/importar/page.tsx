import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/guard";
import { ImportForm } from "./import-form";

export const metadata: Metadata = { title: "Importar catálogo" };

export default async function ImportProductsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/produtos" className="text-sm text-rose hover:text-rose-light">
          ← Voltar para produtos
        </Link>
        <h1 className="mt-1 font-serif-display text-2xl text-text-primary">Importar catálogo (CSV)</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Envie um CSV com a lista de perfumes. Marcas e categorias que ainda não existem são criadas
          automaticamente. As fotos não vêm pelo CSV — adicione depois pelo gerenciador de imagens de cada
          produto.
        </p>
      </div>

      <ImportForm />
    </div>
  );
}
