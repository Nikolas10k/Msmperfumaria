import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-text-secondary">
      <h1 className="mb-6 font-serif-display text-3xl text-text-primary">Termos de Uso</h1>
      <p className="mb-4">
        Estes Termos de Uso regem a compra de produtos na MSM Perfumaria. Ao criar uma conta
        ou realizar um pedido, você concorda com as condições descritas abaixo.
      </p>
      <p className="mb-4">
        Todos os perfumes comercializados são importados e originais. Emitimos nota fiscal
        para todas as vendas. As condições de entrega, prazos e valores de frete são exibidos
        no carrinho antes da finalização da compra, de acordo com o CEP informado.
      </p>
      <p>
        Para dúvidas sobre pedidos, trocas ou devoluções, entre em contato pelos canais
        informados no rodapé do site.
      </p>
    </main>
  );
}
