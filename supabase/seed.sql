-- Dados mínimos para a loja não nascer vazia. Ajuste taxas e regiões reais
-- pelo painel em /admin/entrega antes de abrir para clientes.

insert into shipping_methods (name, description, type, base_price, is_active)
values ('Frete padrão', 'Envio para todo o Brasil via transportadora/Correios.', 'standard', 25.00, true)
on conflict do nothing;

insert into shipping_methods (name, description, type, base_price, is_active)
values ('Entrega expressa Brasília', 'Entrega no mesmo dia/próximo dia útil em regiões atendidas do DF.', 'express_brasilia', 0, true)
on conflict do nothing;
