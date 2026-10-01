import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { onlyDigits } from "@/lib/utils";

export async function StoreFooter() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("store_settings").select("*").eq("id", true).maybeSingle();

  const whatsappHref = settings?.whatsapp_number
    ? `https://wa.me/${onlyDigits(settings.whatsapp_number)}`
    : null;

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Image src="/logo.jpg" alt="MSM Perfumaria" width={32} height={32} className="rounded-full" />
            <p className="font-serif-display text-lg text-gradient-rose">MSM PERFUMARIA</p>
          </div>
          <p className="text-sm leading-relaxed text-text-muted">
            {settings?.footer_about ??
              "Perfumes importados originais para todo o Brasil, com entrega expressa em Brasília."}
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-rose-light">Institucional</p>
          <ul className="space-y-2.5 text-sm text-text-muted">
            <li><Link href="/perfumes" className="transition-colors hover:text-rose">Todos os perfumes</Link></li>
            <li><Link href="/termos" className="transition-colors hover:text-rose">Termos de Uso</Link></li>
            <li><Link href="/privacidade" className="transition-colors hover:text-rose">Política de Privacidade</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-rose-light">Atendimento</p>
          <ul className="space-y-2.5 text-sm text-text-muted">
            {settings?.support_email && <li>{settings.support_email}</li>}
            {whatsappHref && (
              <li>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="transition-colors hover:text-rose">
                  Fale conosco no WhatsApp
                </a>
              </li>
            )}
            {settings?.business_hours && <li>{settings.business_hours}</li>}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-rose-light">Redes sociais</p>
          <ul className="space-y-2.5 text-sm text-text-muted">
            {settings?.instagram_url && (
              <li><a href={settings.instagram_url} target="_blank" rel="noreferrer" className="transition-colors hover:text-rose">Instagram</a></li>
            )}
            {settings?.facebook_url && (
              <li><a href={settings.facebook_url} target="_blank" rel="noreferrer" className="transition-colors hover:text-rose">Facebook</a></li>
            )}
            {settings?.tiktok_url && (
              <li><a href={settings.tiktok_url} target="_blank" rel="noreferrer" className="transition-colors hover:text-rose">TikTok</a></li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 text-center text-xs text-text-muted">
        © {new Date().getFullYear()} MSM Perfumaria. Todos os direitos reservados.
        {settings?.footer_cnpj && ` · CNPJ ${settings.footer_cnpj}`}
      </div>
    </footer>
  );
}
