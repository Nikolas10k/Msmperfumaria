import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignupPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif-display text-2xl text-text-primary">Criar conta</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Cadastre-se para comprar, acompanhar pedidos e salvar favoritos.
      </p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-text-secondary">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-gold hover:text-gold-light">
          Entrar
        </Link>
      </p>
    </div>
  );
}
