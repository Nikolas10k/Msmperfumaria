"use client";

import { useActionState } from "react";
import { saveRegionAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";
import type { Database } from "@/lib/types/database";

const initialState: ActionState = { ok: false };

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type Method = Database["public"]["Tables"]["shipping_methods"]["Row"];
type Region = Database["public"]["Tables"]["shipping_regions"]["Row"];

export function RegionForm({
  region,
  methods,
  onDone,
}: {
  region?: Region;
  methods: Method[];
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(async (prev: ActionState, fd: FormData) => {
    const result = await saveRegionAction(prev, fd);
    if (result.ok) onDone?.();
    return result;
  }, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-sm border border-border bg-surface p-4">
      {region && <input type="hidden" name="id" value={region.id} />}

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Método de entrega</Label>
          <Select name="shipping_method_id" defaultValue={region?.shipping_method_id} required>
            <option value="">Selecione…</option>
            {methods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Nome da região</Label>
          <Input name="name" defaultValue={region?.name} placeholder="Ex.: Asa Sul / Asa Norte" required />
        </div>
        <div>
          <Label>Taxa (R$)</Label>
          <Input name="fee" type="number" step="0.01" defaultValue={region?.fee ?? 0} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label>CEP inicial</Label>
          <Input name="cep_range_start" defaultValue={region?.cep_range_start} placeholder="70000000" required />
        </div>
        <div>
          <Label>CEP final</Label>
          <Input name="cep_range_end" defaultValue={region?.cep_range_end} placeholder="70999999" required />
        </div>
        <div>
          <Label>Prazo mínimo (dias)</Label>
          <Input name="delivery_days_min" type="number" defaultValue={region?.delivery_days_min ?? 0} />
        </div>
        <div>
          <Label>Prazo máximo (dias)</Label>
          <Input name="delivery_days_max" type="number" defaultValue={region?.delivery_days_max ?? 1} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Horário-limite do pedido</Label>
          <Input name="cutoff_time" type="time" defaultValue={region?.cutoff_time?.slice(0, 5) ?? "15:00"} required />
          <p className="mt-1 text-xs text-text-muted">
            Após esse horário, a expressa fica indisponível até o próximo dia atendido.
          </p>
        </div>
        <div>
          <Label>Dias atendidos</Label>
          <div className="flex flex-wrap gap-3 pt-1.5">
            {WEEKDAY_LABELS.map((label, day) => (
              <label key={day} className="flex items-center gap-1 text-xs text-text-secondary">
                <input
                  type="checkbox"
                  name={`weekday_${day}`}
                  defaultChecked={region?.active_weekdays?.includes(day) ?? [1, 2, 3, 4, 5].includes(day)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="is_active" defaultChecked={region?.is_active ?? true} />
        Região ativa
      </label>

      {state.message && <p className="text-xs text-danger">{state.message}</p>}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando…" : region ? "Atualizar região" : "Adicionar região"}
      </Button>
    </form>
  );
}
