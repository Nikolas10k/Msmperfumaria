"use client";

import { useState, useTransition } from "react";
import { Zap } from "lucide-react";
import { checkExpressDeliveryAction } from "@/lib/shipping/actions";
import { formatCep, formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExpressCheckResult } from "@/lib/shipping/brasilia";

const REASON_LABELS: Record<string, string> = {
  cep_fora_da_area: "A entrega expressa ainda não atende essa região. Seu pedido segue normalmente pelo frete padrão para todo o Brasil.",
  regiao_inativa: "A entrega expressa está temporariamente indisponível para essa região.",
  dia_indisponivel: "A entrega expressa não opera hoje nessa região.",
  horario_limite_passou: "O horário-limite de hoje para a entrega expressa já passou.",
};

export function ExpressDeliveryCheck({ onResolved }: { onResolved?: (result: ExpressCheckResult) => void }) {
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<ExpressCheckResult | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCheck() {
    if (cep.replace(/\D/g, "").length !== 8) return;
    startTransition(async () => {
      const res = await checkExpressDeliveryAction(cep);
      setResult(res);
      onResolved?.(res);
    });
  }

  return (
    <div className="rounded-md border border-rose-hairline bg-surface p-4">
      <p className="mb-2 flex items-center gap-2 text-sm text-text-primary">
        <Zap size={16} className="text-rose" />É de Brasília? Confira o prazo de entrega expressa.
      </p>
      <div className="flex gap-2">
        <Input
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          placeholder="00000-000"
          maxLength={9}
          inputMode="numeric"
        />
        <Button type="button" onClick={handleCheck} disabled={pending} size="sm">
          {pending ? "Consultando…" : "Consultar"}
        </Button>
      </div>

      {result && (
        <div className="mt-3 text-sm">
          {result.available ? (
            <p className="text-success">
              ⚡ Entrega expressa disponível — chega {result.deliveryEstimateLabel} por {formatBRL(result.region.fee)}.
            </p>
          ) : (
            <p className="text-text-muted">
              {REASON_LABELS[result.reason]}
              {result.nextAvailableLabel && ` Próxima janela: ${result.nextAvailableLabel}.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
