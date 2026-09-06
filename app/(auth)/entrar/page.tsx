import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string; erro?: string }>;
}) {
  const { proximo, erro } = await searchParams;

  return (
    <div>
      <h1 className="mb-1 font-serif-display text-2xl text-text-primary">Entrar</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Acesse sua conta para ver seus pedidos e favoritos.
      </p>
      {erro === "link_invalido" && (
        <p className="mb-4 rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          Esse link expirou ou já foi usado. Tente novamente.
        </p>
      )}
      <LoginForm proximo={proximo} />
      <p className="mt-6 text-center text-sm text-text-secondary">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-gold hover:text-gold-light">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
