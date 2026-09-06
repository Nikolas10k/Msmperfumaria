import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Redefinir senha" };

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif-display text-2xl text-text-primary">Redefinir senha</h1>
      <p className="mb-8 text-sm text-text-secondary">Escolha uma nova senha para sua conta.</p>
      <ResetPasswordForm />
    </div>
  );
}
