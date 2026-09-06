"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { MethodForm } from "./method-form";
import { RegionForm } from "./region-form";
import { deleteMethodAction, deleteRegionAction } from "./actions";
import type { Database } from "@/lib/types/database";

type Method = Database["public"]["Tables"]["shipping_methods"]["Row"];
type Region = Database["public"]["Tables"]["shipping_regions"]["Row"];

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function EntregaClient({ methods, regions }: { methods: Method[]; regions: Region[] }) {
  const [showNewMethod, setShowNewMethod] = useState(false);
  const [showNewRegion, setShowNewRegion] = useState(false);

  const methodName = (id: string) => methods.find((m) => m.id === id)?.name ?? "—";

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-text-secondary">
          Métodos de entrega
        </h2>
        <div className="space-y-3">
          {methods.map((method) => (
            <details key={method.id} className="rounded-sm border border-border">
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm">
                <span className="text-text-primary">
                  {method.name} <span className="text-text-muted">({method.type})</span>
                </span>
                <div className="flex items-center gap-3">
                  <Badge variant={method.is_active ? "success" : "dark"}>
                    {method.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                  <DeleteButton id={method.id} action={deleteMethodAction} />
                </div>
              </summary>
              <div className="p-3">
                <MethodForm method={method} />
              </div>
            </details>
          ))}
        </div>
        {showNewMethod ? (
          <MethodForm onDone={() => setShowNewMethod(false)} />
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setShowNewMethod(true)}>
            + Novo método de entrega
          </Button>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wide text-text-secondary">
            Regiões atendidas pela expressa
          </h2>
          <p className="text-xs text-text-muted">
            Faixas de CEP, taxa, prazo real, dias da semana e horário-limite do pedido.
          </p>
        </div>

        <div className="space-y-3">
          {regions.map((region) => (
            <details key={region.id} className="rounded-sm border border-border">
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm">
                <span className="text-text-primary">
                  {region.name}{" "}
                  <span className="text-text-muted">
                    · {region.cep_range_start}–{region.cep_range_end} · {methodName(region.shipping_method_id)}
                  </span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">
                    {region.active_weekdays.map((d) => WEEKDAY_LABELS[d]).join(", ")} até {region.cutoff_time?.slice(0, 5)}
                  </span>
                  <Badge variant={region.is_active ? "success" : "dark"}>
                    {region.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                  <DeleteButton id={region.id} action={deleteRegionAction} />
                </div>
              </summary>
              <div className="p-3">
                <RegionForm region={region} methods={methods} />
              </div>
            </details>
          ))}
          {regions.length === 0 && (
            <p className="text-sm text-text-muted">Nenhuma região configurada ainda.</p>
          )}
        </div>

        {showNewRegion ? (
          <RegionForm methods={methods} onDone={() => setShowNewRegion(false)} />
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setShowNewRegion(true)}>
            + Nova região de entrega
          </Button>
        )}
      </section>
    </div>
  );
}
