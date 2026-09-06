-- Bucket público único para mídia administrável (produtos, marcas, categorias, banners).
-- Leitura pública via URL; escrita restrita a administradores.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy media_public_read on storage.objects for select
  using (bucket_id = 'media');

create policy media_admin_write on storage.objects for insert
  with check (bucket_id = 'media' and is_admin());

create policy media_admin_update on storage.objects for update
  using (bucket_id = 'media' and is_admin())
  with check (bucket_id = 'media' and is_admin());

create policy media_admin_delete on storage.objects for delete
  using (bucket_id = 'media' and is_admin());
