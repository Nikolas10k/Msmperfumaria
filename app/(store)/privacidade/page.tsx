import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-text-secondary">
      <h1 className="mb-6 font-serif-display text-3xl text-text-primary">Política de Privacidade</h1>
      <p className="mb-4">
        A MSM Perfumaria coleta apenas os dados necessários para processar seu cadastro,
        pedidos e entregas: nome, e-mail, telefone, endereço e histórico de compras.
      </p>
      <p className="mb-4">
        Não armazenamos dados de cartão de crédito — os pagamentos são processados
        diretamente pelo gateway de pagamento integrado. Seus dados não são vendidos ou
        compartilhados com terceiros para fins de marketing.
      </p>
      <p>
        Você pode solicitar a exclusão da sua conta e dos seus dados a qualquer momento
        pelos canais de atendimento informados no rodapé do site.
      </p>
    </main>
  );
}
