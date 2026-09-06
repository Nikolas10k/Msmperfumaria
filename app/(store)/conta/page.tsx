import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logOutAction } from "@/app/(auth)/actions";

export const metadata: Metadata = { title: "Minha conta" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?proximo=/conta");

  const { data: customer } = await supabase.from("customers").select("*").eq("id", user.id).maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 font-serif-display text-3xl text-text-primary">Minha conta</h1>
      <p className="mb-8 text-sm text-text-muted">Olá, {customer?.name ?? user.email}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/conta/pedidos">
          <Card className="h-full hover:border-rose-hairline">
            <p className="text-text-primary">Meus pedidos</p>
            <p className="mt-1 text-xs text-text-muted">Acompanhe status e histórico</p>
          </Card>
        </Link>
        <Link href="/conta/enderecos">
          <Card className="h-full hover:border-rose-hairline">
            <p className="text-text-primary">Endereços</p>
            <p className="mt-1 text-xs text-text-muted">Gerencie seus endereços de entrega</p>
          </Card>
        </Link>
        <Link href="/conta/favoritos">
          <Card className="h-full hover:border-rose-hairline">
            <p className="text-text-primary">Favoritos</p>
            <p className="mt-1 text-xs text-text-muted">Perfumes que você salvou</p>
          </Card>
        </Link>
      </div>

      <form action={logOutAction} className="mt-8">
        <Button type="submit" variant="ghost">Sair da conta</Button>
      </form>
    </div>
  );
}
