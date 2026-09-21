"use client";

import { useActionState } from "react";
import Link from "next/link";
import { previewImportAction, commitImportAction, type PreviewState } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";

const initialState: PreviewState = { step: "idle" };

export function ImportForm() {
  const [previewState, previewAction, previewPending] = useActionState<PreviewState, FormData>(
    previewImportAction,
    initialState,
  );
  const [commitState, commitActionFn, commitPending] = useActionState<PreviewState, FormData>(
    commitImportAction,
    initialState,
  );

  if (commitState.step === "done") {
    return (
      <div className="rounded-sm border border-success/30 bg-success/10 px-4 py-4 text-sm text-success">
        <p className="font-medium">Importação concluída.</p>
        <p className="mt-1">
          {commitState.result?.created} produto(s) criado(s)
          {commitState.result?.skipped ? `, ${commitState.result.skipped} ignorado(s) por erro` : ""}.
        </p>
        <div className="mt-4 flex gap-4">
          <Link href="/admin/produtos" className="underline">
            Ver produtos
          </Link>
          <Link href="/admin/produtos/importar" className="underline">
            Importar outro arquivo
          </Link>
        </div>
      </div>
    );
  }

  if (previewState.step === "preview" && previewState.rows) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">{previewState.validCount} prontos para importar</Badge>
          {!!previewState.errorCount && (
            <Badge variant="danger">{previewState.errorCount} com erro (serão ignorados)</Badge>
          )}
          {!!previewState.newBrands?.length && (
            <Badge variant="dark">{previewState.newBrands.length} marca(s) nova(s)</Badge>
          )}
          {!!previewState.newCategories?.length && (
            <Badge variant="dark">{previewState.newCategories.length} categoria(s) nova(s)</Badge>
          )}
        </div>

        <div className="max-h-[480px] overflow-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface-2 text-left uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-3 py-2">Linha</th>
                <th className="px-3 py-2">Produto</th>
                <th className="px-3 py-2">Marca</th>
                <th className="px-3 py-2">Gênero</th>
                <th className="px-3 py-2">Volume</th>
                <th className="px-3 py-2">Preço</th>
                <th className="px-3 py-2">Estoque</th>
                <th className="px-3 py-2">Situação</th>
              </tr>
            </thead>
            <tbody>
              {previewState.rows.map((row) => (
                <tr key={row.line} className="border-t border-border">
                  <td className="px-3 py-2 text-text-muted">{row.line}</td>
                  <td className="px-3 py-2 text-text-primary">{row.name || "—"}</td>
                  <td className="px-3 py-2 text-text-secondary">
                    {row.brandName || "—"} {row.brandIsNew && <Badge variant="dark">novo</Badge>}
                  </td>
                  <td className="px-3 py-2 text-text-secondary capitalize">{row.gender ?? "—"}</td>
                  <td className="px-3 py-2 text-text-secondary">{row.volumeMl ? `${row.volumeMl}ml` : "—"}</td>
                  <td className="px-3 py-2 text-text-secondary">
                    {row.price > 0 ? row.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "definir depois"}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{row.stock}</td>
                  <td className="px-3 py-2">
                    {row.errors.length === 0 ? (
                      <Badge variant="success">OK</Badge>
                    ) : (
                      <span className="text-danger" title={row.errors.join(" ")}>
                        {row.errors[0]}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={commitActionFn} className="space-y-4 rounded-sm border border-border bg-surface p-4">
          <input type="hidden" name="csvText" value={previewState.csvText} />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" name="activate" />
            Já deixar os produtos importados ativos na loja (sem foto ainda — recomendo deixar desmarcado e
            ativar depois de adicionar as imagens)
          </label>
          <div className="flex gap-3">
            <Button type="submit" disabled={commitPending || previewState.validCount === 0}>
              {commitPending ? "Importando…" : `Importar ${previewState.validCount} produto(s)`}
            </Button>
            <Link href="/admin/produtos/importar">
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form action={previewAction} className="max-w-lg space-y-4">
      {previewState.message && <p className="text-sm text-danger">{previewState.message}</p>}
      <div>
        <Label htmlFor="csv">Arquivo CSV</Label>
        <Input id="csv" name="csv" type="file" accept=".csv,text/csv" required />
        <p className="mt-2 text-xs text-text-muted">
          Colunas esperadas: Produto, Marca, Gênero, Concentração, Volume, Categoria, Família Olfativa, Preço,
          Estoque, Descrição. Preço e Estoque podem ficar em branco — dá pra completar depois pelo produto.
        </p>
      </div>
      <Button type="submit" disabled={previewPending}>
        {previewPending ? "Lendo arquivo…" : "Analisar CSV"}
      </Button>
    </form>
  );
}
