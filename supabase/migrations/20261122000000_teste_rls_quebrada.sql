-- SABOTAGEM DE PROPÓSITO (F6): prova que o CI fica vermelho com a RLS quebrada.
-- Esta branch é temporária e NUNCA deve ser juntada na main.
alter policy perfis_select_proprio_ou_gp on public.perfis using (true);
