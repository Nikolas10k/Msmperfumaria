-- Decremento atômico de estoque: evita overselling sob concorrência (a
-- checagem de quantidade e o update acontecem na mesma instrução SQL).
create or replace function decrement_inventory(p_variant_id uuid, p_quantity int)
returns void as $$
begin
  update inventory
  set quantity = quantity - p_quantity
  where variant_id = p_variant_id and quantity >= p_quantity;

  if not found then
    raise exception 'Estoque insuficiente para a variante %', p_variant_id;
  end if;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function decrement_inventory(uuid, int) to authenticated;
