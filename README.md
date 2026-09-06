# MSM Perfumaria

E-commerce completo de perfumes importados originais, com entrega expressa em
Brasília e painel administrativo próprio.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS · Supabase (Postgres +
Auth + Storage + Row Level Security). Estrutura de pagamento pronta para
integrar um gateway (Mercado Pago / Stripe / PIX) — nenhum dado de cartão é
coletado ou armazenado pela aplicação.

## Como rodar localmente

```bash
pnpm install
cp .env.example .env.local   # preencha com as chaves do seu projeto Supabase
```

1. Crie um projeto no [Supabase](https://supabase.com).
2. Rode as migrations em `supabase/migrations/` na ordem, pelo SQL editor do
   Supabase ou via `supabase db push` (Supabase CLI).
3. Rode `supabase/seed.sql` para criar os métodos de frete padrão/expresso.
4. Preencha `.env.local` com `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` (Project
   Settings → API no Supabase).
5. Crie o primeiro usuário do dono pelo fluxo de cadastro (`/cadastro`) e, no
   banco, insira-o na tabela `users` com `role = 'admin'`:

   ```sql
   insert into public.users (id, name, email, role)
   values ('<uuid do usuário em auth.users>', 'Nome do dono', 'email@dono.com', 'admin');
   ```

6. `pnpm dev` e acesse `/admin` para cadastrar marcas, categorias, produtos e
   configurar a entrega expressa antes de divulgar a loja.

## Verificadores

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Arquitetura

- `supabase/migrations/` — schema completo (catálogo, pedidos, campanhas,
  entrega, RLS) e a função `decrement_inventory` (baixa de estoque atômica).
- `lib/pricing/effective-price.ts` — resolve o preço final combinando
  promoção agendada, campanhas ativas e preço base; usado em toda a loja e
  recalculado no servidor no carrinho/checkout (nunca confia em preço vindo
  do client).
- `lib/shipping/brasilia.ts` — regra de elegibilidade da entrega expressa
  (CEP, dia da semana, horário-limite) a partir da configuração real do
  painel em `/admin/entrega`.
- `lib/coupons/validate.ts` — validação de cupom (período, pedido mínimo,
  limites de uso).
- `app/admin/` — painel administrativo (produtos, marcas, categorias,
  pedidos, clientes, campanhas, promoções, cupons, banners, entrega,
  configurações). Protegido por `lib/admin/guard.ts` + RLS.
- `app/(store)/` — loja: home, catálogo, produto, busca, carrinho, checkout,
  conta do cliente.

## Papéis de acesso

A tabela `users` guarda a equipe interna (`role`: `admin` ou `staff`). Ações
de escrita administrativas (produtos, campanhas, pedidos etc.) exigem
`role = 'admin'` nas políticas de RLS — `staff` hoje só visualiza o painel.
Clientes da loja ficam em `customers`, criados automaticamente na
confirmação do e-mail de cadastro.

## Limitações conhecidas (estrutura pronta para evoluir)

- Pagamento: o checkout registra o pedido e o método escolhido (PIX/cartão)
  com status `pending`; a cobrança real depende de conectar as chaves do
  gateway (`MERCADOPAGO_ACCESS_TOKEN`) e implementar o webhook de
  confirmação em `payments`.
- Carrinho de visitante é mantido no `localStorage`; some ao trocar de
  navegador/dispositivo até o login.
- Fase 2 do briefing (recuperação de carrinho abandonado, quiz de
  recomendação, "comprados juntos", importação de reviews externas,
  auditoria administrativa) não está implementada — o schema já reserva
  `audit_logs` e `notifications` para isso.
