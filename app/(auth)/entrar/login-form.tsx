"use client";

import { useActionState } from "react";
import Link from "next/link";
import { logInAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: ActionState = { ok: false };

export function LoginForm({ proximo }: { proximo?: string }) {
  const [state, formAction, pending] = useActionState(logInAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="proximo" value={proximo ?? ""} />

      {state.message && (
        <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.message}
        </p>
      )}

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link href="/esqueci-senha" className="text-xs text-text-muted hover:text-rose">
            Esqueci minha senha
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.password}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
