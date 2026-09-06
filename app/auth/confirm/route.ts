import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Alvo dos links enviados por e-mail pelo Supabase (confirmação de cadastro e
 * recuperação de senha). Troca o token_hash por uma sessão e, no primeiro
 * acesso, cria o registro em `customers` a partir dos metadados do cadastro.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error && data.user) {
      const { user } = data;
      await supabase.from("customers").upsert(
        {
          id: user.id,
          name: (user.user_metadata?.name as string) || user.email!.split("@")[0],
          email: user.email!,
          phone: (user.user_metadata?.phone as string) || null,
        },
        { onConflict: "id", ignoreDuplicates: true },
      );

      const next = type === "recovery" ? "/redefinir-senha" : "/conta";
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?erro=link_invalido`);
}
