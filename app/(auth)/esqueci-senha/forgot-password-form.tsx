"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: ActionState = { ok: false };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  if (state.ok) {
    return (
      <p className="rounded-sm border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state.fieldErrors?.email && <p className="mt-1 text-xs text-danger">{state.fieldErrors.email}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Enviando…" : "Enviar link"}
      </Button>
    </form>
  );
}
