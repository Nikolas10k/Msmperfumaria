"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: ActionState = { ok: false };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.message}
        </p>
      )}
      <div>
        <Label htmlFor="password">Nova senha</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.password}</p>
        )}
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
        {state.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.confirmPassword}</p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Salvando…" : "Salvar nova senha"}
      </Button>
    </form>
  );
}
