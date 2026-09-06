"use client";

import { useActionState } from "react";
import { saveAddressAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { ActionState } from "@/app/(auth)/actions";

const initialState: ActionState = { ok: false };

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export function AddressForm({ onSaved }: { onSaved?: () => void }) {
  const [state, formAction, pending] = useActionState(async (prev: ActionState, fd: FormData) => {
    const result = await saveAddressAction(prev, fd);
    if (result.ok) onSaved?.();
    return result;
  }, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded-md border border-border bg-surface p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label>Apelido do endereço</Label>
        <Input name="label" defaultValue="Principal" />
      </div>
      <div className="sm:col-span-2">
        <Label>Nome do destinatário</Label>
        <Input name="recipient_name" required />
      </div>
      <div>
        <Label>CEP</Label>
        <Input name="cep" required />
      </div>
      <div>
        <Label>Cidade</Label>
        <Input name="city" required />
      </div>
      <div className="sm:col-span-2">
        <Label>Rua</Label>
        <Input name="street" required />
      </div>
      <div>
        <Label>Número</Label>
        <Input name="number" required />
      </div>
      <div>
        <Label>Complemento</Label>
        <Input name="complement" />
      </div>
      <div>
        <Label>Bairro</Label>
        <Input name="neighborhood" required />
      </div>
      <div>
        <Label>UF</Label>
        <Select name="state" defaultValue="DF">
          {BRAZILIAN_STATES.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </Select>
      </div>
      <label className="flex items-center gap-2 text-sm text-text-secondary sm:col-span-2">
        <input type="checkbox" name="is_default" />
        Definir como endereço padrão
      </label>

      {state.message && <p className="text-xs text-danger sm:col-span-2">{state.message}</p>}

      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Salvando…" : "Adicionar endereço"}
        </Button>
      </div>
    </form>
  );
}
