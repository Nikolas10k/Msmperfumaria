import Link from "next/link";
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
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="mb-3 font-serif-display text-lg text-gradient-gold">MSM PERFUMARIA</p>
          <p className="text-sm text-text-muted">
            {settings?.footer_about ??
              "Perfumes importados originais para todo o Brasil, com entrega expressa em Brasília."}
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-wide text-text-secondary">Institucional</p>
          <ul className="space-y-2 text-sm text-text-muted">
            <li><Link href="/perfumes" className="hover:text-gold">Todos os perfumes</Link></li>
            <li><Link href="/termos" className="hover:text-gold">Termos de Uso</Link></li>
            <li><Link href="/privacidade" className="hover:text-gold">Política de Privacidade</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-wide text-text-secondary">Atendimento</p>
          <ul className="space-y-2 text-sm text-text-muted">
            {settings?.support_email && <li>{settings.support_email}</li>}
            {whatsappHref && (
              <li>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:text-gold">
                  Fale conosco no WhatsApp
                </a>
              </li>
            )}
            {settings?.business_hours && <li>{settings.business_hours}</li>}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-wide text-text-secondary">Redes sociais</p>
          <ul className="space-y-2 text-sm text-text-muted">
            {settings?.instagram_url && (
              <li><a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-gold">Instagram</a></li>
            )}
            {settings?.facebook_url && (
              <li><a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-gold">Facebook</a></li>
            )}
            {settings?.tiktok_url && (
              <li><a href={settings.tiktok_url} target="_blank" rel="noreferrer" className="hover:text-gold">TikTok</a></li>
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
