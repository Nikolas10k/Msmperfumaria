"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: ActionState = { ok: false };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.message}
        </p>
      )}

      <div>
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" name="name" autoComplete="name" required />
        {state.fieldErrors?.name && <p className="mt-1 text-xs text-danger">{state.fieldErrors.name}</p>}
      </div>

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state.fieldErrors?.email && <p className="mt-1 text-xs text-danger">{state.fieldErrors.email}</p>}
      </div>

      <div>
        <Label htmlFor="phone">WhatsApp (opcional)</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="(61) 99999-9999" />
      </div>

      <div>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.password}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
        {state.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.confirmPassword}</p>
        )}
      </div>

      <label className="flex items-start gap-2 text-xs text-text-secondary">
        <input type="checkbox" name="consent" className="mt-0.5" required />
        <span>
          Li e aceito os{" "}
          <Link href="/termos" className="text-gold hover:text-gold-light">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="text-gold hover:text-gold-light">
            Política de Privacidade
          </Link>
          .
        </span>
      </label>
      {state.fieldErrors?.consent && <p className="text-xs text-danger">{state.fieldErrors.consent}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Criando conta…" : "Criar conta"}
      </Button>
    </form>
  );
}
