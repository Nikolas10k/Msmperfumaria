"use client";

import { useTransition } from "react";
import { updateOrderStatusAction } from "./actions";
import { Select } from "@/components/ui/input";

const STATUS_OPTIONS = [
  ["novo", "Novo"],
  ["pagamento_pendente", "Pagamento pendente"],
  ["pago", "Pago"],
  ["em_preparacao", "Em preparação"],
  ["enviado", "Enviado"],
  ["saiu_para_entrega", "Saiu para entrega"],
  ["entregue", "Entregue"],
  ["cancelado", "Cancelado"],
] as const;

export function StatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateOrderStatusAction(orderId, e.target.value))}
      className="max-w-xs"
    >
      {STATUS_OPTIONS.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  );
}
