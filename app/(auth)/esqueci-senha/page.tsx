import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif-display text-2xl text-text-primary">Recuperar senha</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Informe seu e-mail para receber o link de redefinição.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
