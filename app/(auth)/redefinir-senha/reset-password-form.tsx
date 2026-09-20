"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { resetPasswordAction, type ActionState } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: ActionState = { ok: false };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");

  useEffect(() => {
    // O e-mail de recuperação do Supabase (template padrão, sem SMTP
    // customizado) entrega a sessão como fragmento da URL (#access_token=...),
    // não como query param — o fragmento nunca chega ao servidor, então essa
    // troca por uma sessão de verdade só pode acontecer aqui, no cliente.
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("ready");
      return;
    }

    const supabase = createClient();
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
      window.history.replaceState(null, "", window.location.pathname);
      setStatus(error ? "invalid" : "ready");
    });
  }, []);

  if (status === "checking") {
    return <p className="text-sm text-text-secondary">Verificando link…</p>;
  }

  if (status === "invalid") {
    return (
      <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        Esse link de redefinição é inválido ou expirou.{" "}
        <Link href="/esqueci-senha" className="underline">
          Peça um novo aqui
        </Link>
        .
      </p>
    );
  }

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
