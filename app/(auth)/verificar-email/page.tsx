import type { Metadata } from "next";
import { ResendButton } from "./resend-button";

export const metadata: Metadata = { title: "Verifique seu e-mail" };

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
      <h1 className="mb-3 font-serif-display text-2xl text-text-primary">Verifique seu e-mail</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Enviamos um link de confirmação para o e-mail informado. Clique nele para ativar sua conta.
      </p>
      <ResendButton />
    </div>
  );
}
