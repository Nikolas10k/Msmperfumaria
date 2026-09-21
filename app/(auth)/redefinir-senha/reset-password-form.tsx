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
    // O projeto usa o fluxo PKCE (padrão do @supabase/ssr): depois do link do
    // e-mail ser verificado, o Supabase redireciona pra cá com ?code=... na
    // query string. Essa troca por uma sessão de verdade só pode acontecer
    // aqui, no cliente — o valor nunca é processado no server.
    const supabase = createClient();
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        window.history.replaceState(null, "", window.location.pathname);
        setStatus(error ? "invalid" : "ready");
      });
      return;
    }

    // Fallback para o fluxo implícito (#access_token=...), caso o tipo de
    // fluxo do projeto mude no futuro.
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
        window.history.replaceState(null, "", window.location.pathname);
        setStatus(error ? "invalid" : "ready");
      });
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("ready");
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
