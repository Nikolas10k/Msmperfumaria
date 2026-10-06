import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { onlyDigits } from "@/lib/utils";

// Rodapé no padrão do site do condomínio: degradê escuro, colunas em
// rótulo pequeno e a marca escrita em tamanho gigante no fim.
export async function StoreFooter() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("store_settings").select("*").eq("id", true).maybeSingle();

  const whatsappHref = settings?.whatsapp_number
    ? `https://wa.me/${onlyDigits(settings.whatsapp_number)}`
    : null;

  const linkClass = "text-[13.5px] text-text-secondary transition-colors hover:text-text-primary";

  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-bg)_0%,var(--color-wine)_55%,var(--color-rose-dark)_100%)] pb-7 pt-24 text-text-primary">
      <div className="mx-auto max-w-[1360px] px-4 md:px-10">
        <div className="grid gap-9 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-5 flex items-start gap-3">
              <Image src="/logo.jpg" alt="" width={34} height={34} className="rounded-full" />
              <p className="font-serif-display text-[26px] leading-[0.95]">
                MSM
                <br />
                <span className="text-rose-light">Perfumaria</span>
              </p>
            </div>
            <p className="max-w-[36ch] text-[13px] text-text-muted">
              {settings?.footer_about ??
                "Perfumes importados originais para todo o Brasil, com entrega expressa em Brasília."}
            </p>
          </div>

          <div>
            <h4 className="lbl mb-4 text-white/45">Loja</h4>
            <ul className="space-y-2">
              <li><Link href="/perfumes" className={linkClass}>Todos os perfumes</Link></li>
              <li><Link href="/perfumes?ofertas=1" className={linkClass}>Ofertas</Link></li>
              <li><Link href="/perfumes?lancamentos=1" className={linkClass}>Lançamentos</Link></li>
              <li><Link href="/busca" className={linkClass}>Buscar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="lbl mb-4 text-white/45">Atendimento</h4>
            <ul className="space-y-2">
              {settings?.support_email && <li className="text-[13.5px] text-text-secondary">{settings.support_email}</li>}
              {whatsappHref && (
                <li>
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className={linkClass}>
                    Fale conosco no WhatsApp
                  </a>
                </li>
              )}
              {settings?.business_hours && <li className="text-[13.5px] text-text-secondary">{settings.business_hours}</li>}
            </ul>
          </div>

          <div>
            <h4 className="lbl mb-4 text-white/45">Institucional</h4>
            <ul className="space-y-2">
              <li><Link href="/termos" className={linkClass}>Termos de Uso</Link></li>
              <li><Link href="/privacidade" className={linkClass}>Política de Privacidade</Link></li>
              {settings?.instagram_url && (
                <li><a href={settings.instagram_url} target="_blank" rel="noreferrer" className={linkClass}>Instagram</a></li>
              )}
              {settings?.facebook_url && (
                <li><a href={settings.facebook_url} target="_blank" rel="noreferrer" className={linkClass}>Facebook</a></li>
              )}
              {settings?.tiktok_url && (
                <li><a href={settings.tiktok_url} target="_blank" rel="noreferrer" className={linkClass}>TikTok</a></li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-word mt-24" aria-hidden="true">Perfumaria</div>

      <div className="mx-auto mt-8 flex max-w-[1360px] flex-wrap justify-between gap-3 px-4 text-white/55 md:px-10">
        <span className="lbl">
          © {new Date().getFullYear()} MSM Perfumaria. Todos os direitos reservados.
          {settings?.footer_cnpj && ` · CNPJ ${settings.footer_cnpj}`}
        </span>
        <nav aria-label="Legal" className="lbl flex gap-5">
          <Link href="/termos" className="hover:text-white">Termos</Link>
          <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
        </nav>
      </div>
    </footer>
  );
}
