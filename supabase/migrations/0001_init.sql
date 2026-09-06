-- MSM Perfumaria — schema inicial
-- Convenções: uuid v4 como PK, timestamptz em UTC, soft state via is_active,
-- snapshots de preço/endereço em pedidos (não referenciar preço vivo do catálogo).

create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
create type user_role as enum ('admin', 'staff');
create type product_gender as enum ('masculino', 'feminino', 'unissex');
create type fragrance_type as enum ('eau_de_parfum', 'eau_de_toilette', 'eau_de_cologne', 'parfum', 'eau_fraiche');
create type discount_type as enum ('percentage', 'fixed_amount');
create type campaign_scope as enum ('all', 'products', 'categories', 'brands');
create type campaign_target_type as enum ('product', 'category', 'brand');
create type banner_placement as enum ('hero', 'secondary', 'category_top');
create type order_status as enum (
  'novo', 'pagamento_pendente', 'pago', 'em_preparacao',
  'enviado', 'saiu_para_entrega', 'entregue', 'cancelado'
);
create type payment_method as enum ('pix', 'credit_card', 'debit_card');
create type payment_status as enum ('pending', 'approved', 'rejected', 'refunded');
create type shipping_method_type as enum ('standard', 'express_brasilia');
create type notification_recipient as enum ('admin', 'customer');

-- ============================================================================
-- HELPERS
-- ============================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- IDENTIDADE
-- ============================================================================

-- Equipe interna (dono, staff). Um auth.users pode ser staff OU customer, não ambos.
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role user_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Função security definer: evita recursão de RLS ao checar papel de admin.
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from users where id = auth.uid() and role = 'admin' and is_active = true
  );
$$ language sql security definer stable set search_path = public;

create table customers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  cpf text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger customers_set_updated_at before update on customers
  for each row execute function set_updated_at();

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  label text not null default 'Principal',
  recipient_name text not null,
  cep text not null,
  street text not null,
  number text not null,
  complement text,
  neighborhood text not null,
  city text not null,
  state char(2) not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_customer_id_idx on addresses(customer_id);

-- ============================================================================
-- CATÁLOGO
-- ============================================================================

create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  description text,
  parent_id uuid references categories(id) on delete set null,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete restrict,
  name text not null,
  slug text not null unique,
  gender product_gender not null,
  fragrance_type fragrance_type not null,
  fragrance_family text not null,
  top_notes text[] not null default '{}',
  heart_notes text[] not null default '{}',
  base_notes text[] not null default '{}',
  description text not null default '',
  is_active boolean not null default true,
  is_original boolean not null default true,
  is_bestseller boolean not null default false,
  is_new_arrival boolean not null default false,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_brand_id_idx on products(brand_id);
create index products_gender_idx on products(gender);
create index products_is_active_idx on products(is_active);
create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();

create table product_categories (
  product_id uuid not null references products(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt_text text,
  position int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index product_images_product_id_idx on product_images(product_id);

-- Cada variante é o SKU vendável (ex.: mesmo perfume em 50ml e 100ml).
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text not null unique,
  volume_ml int not null check (volume_ml > 0),
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= price),
  installments_max int not null default 1 check (installments_max >= 1),
  barcode text,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_variants_product_id_idx on product_variants(product_id);
create trigger product_variants_set_updated_at before update on product_variants
  for each row execute function set_updated_at();

create table inventory (
  variant_id uuid primary key references product_variants(id) on delete cascade,
  quantity int not null default 0 check (quantity >= 0),
  low_stock_threshold int not null default 5 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);
create trigger inventory_set_updated_at before update on inventory
  for each row execute function set_updated_at();

-- ============================================================================
-- ENTREGA (frete padrão + expressa Brasília)
-- ============================================================================

create table shipping_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type shipping_method_type not null,
  base_price numeric(10, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Regiões atendidas pela expressa: faixas de CEP + regras reais de prazo/corte.
create table shipping_regions (
  id uuid primary key default gen_random_uuid(),
  shipping_method_id uuid not null references shipping_methods(id) on delete cascade,
  name text not null,
  cep_range_start char(8) not null,
  cep_range_end char(8) not null,
  fee numeric(10, 2) not null default 0,
  delivery_days_min int not null default 0,
  delivery_days_max int not null default 1,
  cutoff_time time not null default '15:00',
  active_weekdays int[] not null default '{1,2,3,4,5}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint shipping_regions_cep_range_chk check (cep_range_start <= cep_range_end)
);
create index shipping_regions_method_idx on shipping_regions(shipping_method_id);

-- ============================================================================
-- CAMPANHAS E PROMOÇÕES
-- ============================================================================

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  discount_type discount_type not null,
  discount_value numeric(10, 2) not null check (discount_value > 0),
  scope campaign_scope not null default 'all',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint campaigns_period_chk check (starts_at < ends_at)
);
create index campaigns_period_idx on campaigns(starts_at, ends_at);

create table campaign_targets (
  campaign_id uuid not null references campaigns(id) on delete cascade,
  target_type campaign_target_type not null,
  target_id uuid not null,
  primary key (campaign_id, target_type, target_id)
);

-- Promoção agendada por variante (preço promocional com início/fim reais).
create table promotions (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  promo_price numeric(10, 2) not null check (promo_price >= 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint promotions_period_chk check (starts_at < ends_at)
);
create index promotions_variant_idx on promotions(variant_id);
create index promotions_period_idx on promotions(starts_at, ends_at);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type discount_type not null,
  discount_value numeric(10, 2) not null check (discount_value > 0),
  min_order_value numeric(10, 2) not null default 0,
  max_uses int,
  max_uses_per_customer int not null default 1,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint coupons_period_chk check (starts_at < ends_at)
);

create table coupon_usages (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  order_id uuid not null,
  used_at timestamptz not null default now()
);
create index coupon_usages_coupon_idx on coupon_usages(coupon_id);
create index coupon_usages_customer_idx on coupon_usages(customer_id);

create table banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  image_url_mobile text,
  link_url text,
  placement banner_placement not null default 'hero',
  position int not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index banners_placement_idx on banners(placement);
create index banners_period_idx on banners(starts_at, ends_at);

-- ============================================================================
-- PEDIDOS
-- ============================================================================

create sequence order_number_seq start 1001;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('MSM-' || nextval('order_number_seq')::text),
  customer_id uuid not null references customers(id) on delete restrict,
  status order_status not null default 'novo',
  subtotal numeric(10, 2) not null default 0,
  discount_total numeric(10, 2) not null default 0,
  shipping_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  coupon_id uuid references coupons(id) on delete set null,
  shipping_method_id uuid references shipping_methods(id) on delete set null,
  shipping_region_id uuid references shipping_regions(id) on delete set null,
  shipping_address jsonb not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_idx on orders(customer_id);
create index orders_status_idx on orders(status);
create index orders_created_at_idx on orders(created_at desc);
create trigger orders_set_updated_at before update on orders
  for each row execute function set_updated_at();

alter table coupon_usages
  add constraint coupon_usages_order_fk foreign key (order_id) references orders(id) on delete cascade;

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete restrict,
  product_name text not null,
  brand_name text not null,
  variant_label text not null,
  sku text not null,
  unit_price numeric(10, 2) not null,
  quantity int not null check (quantity > 0),
  total numeric(10, 2) not null
);
create index order_items_order_idx on order_items(order_id);
create index order_items_variant_idx on order_items(variant_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  method payment_method not null,
  status payment_status not null default 'pending',
  amount numeric(10, 2) not null,
  installments int not null default 1,
  gateway text not null default 'mercadopago',
  gateway_payment_id text,
  gateway_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on payments(order_id);
create trigger payments_set_updated_at before update on payments
  for each row execute function set_updated_at();

-- ============================================================================
-- ENGAJAMENTO
-- ============================================================================

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index reviews_product_idx on reviews(product_id);
create unique index reviews_customer_product_uidx on reviews(customer_id, product_id);

create table favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, variant_id)
);
create trigger cart_items_set_updated_at before update on cart_items
  for each row execute function set_updated_at();

create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_type notification_recipient not null,
  recipient_id uuid,
  type text not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_recipient_idx on notifications(recipient_type, recipient_id);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  changes jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on audit_logs(entity_type, entity_id);

-- Configuração institucional (linha única).
create table store_settings (
  id boolean primary key default true,
  whatsapp_number text,
  support_email text,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  footer_about text,
  footer_cnpj text,
  business_hours text,
  updated_at timestamptz not null default now(),
  constraint store_settings_singleton check (id)
);
create trigger store_settings_set_updated_at before update on store_settings
  for each row execute function set_updated_at();

insert into store_settings (id) values (true);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table users enable row level security;
alter table customers enable row level security;
alter table addresses enable row level security;
alter table brands enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_categories enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table inventory enable row level security;
alter table shipping_methods enable row level security;
alter table shipping_regions enable row level security;
alter table campaigns enable row level security;
alter table campaign_targets enable row level security;
alter table promotions enable row level security;
alter table coupons enable row level security;
alter table coupon_usages enable row level security;
alter table banners enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table favorites enable row level security;
alter table cart_items enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table store_settings enable row level security;

-- users: cada um vê a própria linha; admin vê todas.
create policy users_select_self_or_admin on users for select
  using (id = auth.uid() or is_admin());
create policy users_admin_write on users for all
  using (is_admin()) with check (is_admin());

-- customers
create policy customers_select_self_or_admin on customers for select
  using (id = auth.uid() or is_admin());
create policy customers_insert_self on customers for insert
  with check (id = auth.uid());
create policy customers_update_self_or_admin on customers for update
  using (id = auth.uid() or is_admin()) with check (id = auth.uid() or is_admin());
create policy customers_admin_delete on customers for delete
  using (is_admin());

-- addresses
create policy addresses_select_self_or_admin on addresses for select
  using (customer_id = auth.uid() or is_admin());
create policy addresses_write_self on addresses for insert
  with check (customer_id = auth.uid());
create policy addresses_update_self on addresses for update
  using (customer_id = auth.uid() or is_admin()) with check (customer_id = auth.uid() or is_admin());
create policy addresses_delete_self on addresses for delete
  using (customer_id = auth.uid() or is_admin());

-- catálogo: leitura pública do que está ativo; escrita só admin
create policy brands_public_select on brands for select using (is_active or is_admin());
create policy brands_admin_write on brands for all using (is_admin()) with check (is_admin());

create policy categories_public_select on categories for select using (is_active or is_admin());
create policy categories_admin_write on categories for all using (is_admin()) with check (is_admin());

create policy products_public_select on products for select using (is_active or is_admin());
create policy products_admin_write on products for all using (is_admin()) with check (is_admin());

create policy product_categories_public_select on product_categories for select using (true);
create policy product_categories_admin_write on product_categories for all using (is_admin()) with check (is_admin());

create policy product_images_public_select on product_images for select using (true);
create policy product_images_admin_write on product_images for all using (is_admin()) with check (is_admin());

create policy product_variants_public_select on product_variants for select using (is_active or is_admin());
create policy product_variants_admin_write on product_variants for all using (is_admin()) with check (is_admin());

create policy inventory_public_select on inventory for select using (true);
create policy inventory_admin_write on inventory for all using (is_admin()) with check (is_admin());

-- entrega: leitura pública (necessário no carrinho), escrita só admin
create policy shipping_methods_public_select on shipping_methods for select using (is_active or is_admin());
create policy shipping_methods_admin_write on shipping_methods for all using (is_admin()) with check (is_admin());

create policy shipping_regions_public_select on shipping_regions for select using (is_active or is_admin());
create policy shipping_regions_admin_write on shipping_regions for all using (is_admin()) with check (is_admin());

-- campanhas/promoções/cupons/banners: leitura pública do vigente, escrita admin
create policy campaigns_public_select on campaigns for select using (is_active or is_admin());
create policy campaigns_admin_write on campaigns for all using (is_admin()) with check (is_admin());

create policy campaign_targets_public_select on campaign_targets for select using (true);
create policy campaign_targets_admin_write on campaign_targets for all using (is_admin()) with check (is_admin());

create policy promotions_public_select on promotions for select using (is_active or is_admin());
create policy promotions_admin_write on promotions for all using (is_admin()) with check (is_admin());

-- cupons: não expor lista pública (só valida por código via RPC/server); admin gerencia
create policy coupons_admin_select on coupons for select using (is_admin());
create policy coupons_admin_write on coupons for all using (is_admin()) with check (is_admin());

create policy coupon_usages_select on coupon_usages for select
  using (customer_id = auth.uid() or is_admin());
create policy coupon_usages_insert on coupon_usages for insert
  with check (customer_id = auth.uid() or is_admin());

create policy banners_public_select on banners for select using (is_active or is_admin());
create policy banners_admin_write on banners for all using (is_admin()) with check (is_admin());

-- pedidos
create policy orders_select_self_or_admin on orders for select
  using (customer_id = auth.uid() or is_admin());
create policy orders_insert_self on orders for insert
  with check (customer_id = auth.uid() or is_admin());
create policy orders_update_admin_only on orders for update
  using (is_admin()) with check (is_admin());

create policy order_items_select on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin())));
create policy order_items_insert on order_items for insert
  with check (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin())));

create policy payments_select on payments for select
  using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin())));
create policy payments_admin_write on payments for all using (is_admin()) with check (is_admin());

-- reviews: leitura pública das aprovadas; cliente gerencia a própria
create policy reviews_public_select on reviews for select
  using (is_approved or customer_id = auth.uid() or is_admin());
create policy reviews_insert_self on reviews for insert
  with check (customer_id = auth.uid());
create policy reviews_update_self_or_admin on reviews for update
  using (customer_id = auth.uid() or is_admin()) with check (customer_id = auth.uid() or is_admin());
create policy reviews_delete_self_or_admin on reviews for delete
  using (customer_id = auth.uid() or is_admin());

-- favoritos
create policy favorites_select_self on favorites for select using (customer_id = auth.uid() or is_admin());
create policy favorites_insert_self on favorites for insert with check (customer_id = auth.uid());
create policy favorites_delete_self on favorites for delete using (customer_id = auth.uid());

-- carrinho
create policy cart_items_select_self on cart_items for select using (customer_id = auth.uid() or is_admin());
create policy cart_items_insert_self on cart_items for insert with check (customer_id = auth.uid());
create policy cart_items_update_self on cart_items for update
  using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy cart_items_delete_self on cart_items for delete using (customer_id = auth.uid());

-- notificações
create policy notifications_select on notifications for select
  using (
    (recipient_type = 'customer' and recipient_id = auth.uid())
    or (recipient_type = 'admin' and is_admin())
  );
create policy notifications_admin_write on notifications for all using (is_admin()) with check (is_admin());

-- auditoria: só admin
create policy audit_logs_admin_select on audit_logs for select using (is_admin());
create policy audit_logs_admin_insert on audit_logs for insert with check (is_admin());

-- configurações: leitura pública, escrita admin
create policy store_settings_public_select on store_settings for select using (true);
create policy store_settings_admin_write on store_settings for update using (is_admin()) with check (is_admin());
