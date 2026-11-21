-- =============================================================================
-- Verificação da RLS do núcleo (F4)
--
-- Roda numa transação que termina em ROLLBACK: não deixa nenhum dado no banco.
-- Cria 3 pessoas fictícias (colaborador, líder e GP) só durante a execução,
-- simula cada uma (e um visitante anônimo) e confere a matriz de acesso de
-- docs/regras/seguranca-da-demo.md.
--
-- Como rodar no banco de dev (com a migração do núcleo já aplicada):
--   npx supabase db query --remote -f supabase/verificacoes/nucleo_rls.sql
-- ou cole o arquivo inteiro no SQL Editor do projeto.
--
-- Resultado:
--   * se alguma regra quebrar, para com um erro "FALHOU: ...";
--   * se tudo passar, a última linha mostra "OK: ...".
--
-- Não substitui os testes em Vitest, que entram depois da F2.
-- =============================================================================

begin;

-- 1) Estrutura: RLS ligada, sem privilégios nem políticas de escrita ----------
do $$
declare
  t text;
  p text;
begin
  foreach t in array array['perfis', 'squads', 'participacoes_squad'] loop
    if not (
      select c.relrowsecurity
      from pg_class c
      where c.oid = format('public.%I', t)::regclass
    ) then
      raise exception 'FALHOU: RLS desligada em public.%', t;
    end if;

    foreach p in array array['INSERT', 'UPDATE', 'DELETE'] loop
      if has_table_privilege('authenticated', format('public.%I', t), p) then
        raise exception 'FALHOU: authenticated tem % em public.%', p, t;
      end if;
    end loop;

    if has_table_privilege('anon', format('public.%I', t), 'SELECT') then
      raise exception 'FALHOU: anon tem SELECT em public.%', t;
    end if;
  end loop;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in ('perfis', 'squads', 'participacoes_squad')
      and cmd <> 'SELECT'
  ) then
    raise exception 'FALHOU: existe política de escrita no núcleo';
  end if;

  if not exists (
    select 1
    from pg_proc
    where oid = 'public.eh_gp()'::regprocedure
      and prosecdef
      and exists (
        select 1 from unnest(proconfig) as cfg where cfg like 'search_path=%'
      )
  ) then
    raise exception 'FALHOU: eh_gp() precisa ser security definer com search_path fixo';
  end if;

  if has_function_privilege('anon', 'public.eh_gp()', 'EXECUTE') then
    raise exception 'FALHOU: anon pode executar eh_gp()';
  end if;
end $$;

-- 2) Pessoas fictícias, só dentro desta transação ----------------------------
insert into auth.users (id, email, aud, role)
values
  ('00000000-0000-4000-8000-00000000c001', 'verif.colaborador@demo.inovaup.test', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-8000-00000000c002', 'verif.lider@demo.inovaup.test',       'authenticated', 'authenticated'),
  ('00000000-0000-4000-8000-00000000a001', 'verif.gp@demo.inovaup.test',          'authenticated', 'authenticated');

insert into public.perfis (id, nome, email, papel)
values
  ('00000000-0000-4000-8000-00000000c001', 'Verificação Colaborador', 'verif.colaborador@demo.inovaup.test', 'colaborador'),
  ('00000000-0000-4000-8000-00000000c002', 'Verificação Líder',       'verif.lider@demo.inovaup.test',       'lider'),
  ('00000000-0000-4000-8000-00000000a001', 'Verificação GP',          'verif.gp@demo.inovaup.test',          'gp');

insert into public.squads (id, nome)
values ('00000000-0000-4000-8000-00000000b001', 'Squad Verificação');

insert into public.participacoes_squad (perfil_id, squad_id, inicio)
values
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000b001', '2026-08-01'),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000b001', '2026-08-01');

-- Totais sem RLS (este trecho roda como dono das tabelas), para comparar com a GP.
select
  set_config('verif.total_perfis', (select count(*) from public.perfis)::text, true),
  set_config('verif.total_squads', (select count(*) from public.squads)::text, true),
  set_config('verif.total_participacoes', (select count(*) from public.participacoes_squad)::text, true);

-- 3) Visitante anônimo: não lê nada ------------------------------------------
set local role anon;

do $$
begin
  begin
    perform 1 from public.perfis;
    raise exception 'FALHOU: anon leu public.perfis';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.eh_gp();
    raise exception 'FALHOU: anon executou eh_gp()';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;

-- 4) Colaborador: lê só o próprio perfil; não vê squads; não escreve ---------
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-00000000c001","role":"authenticated"}',
  true
);
set local role authenticated;

do $$
declare
  n int;
begin
  select count(*) into n from public.perfis;
  if n <> 1 then
    raise exception 'FALHOU: colaborador vê % perfis (esperado: só o próprio)', n;
  end if;

  if not exists (
    select 1 from public.perfis where id = '00000000-0000-4000-8000-00000000c001'
  ) then
    raise exception 'FALHOU: colaborador não lê o próprio perfil';
  end if;

  select count(*) into n from public.squads;
  if n <> 0 then
    raise exception 'FALHOU: colaborador vê % squads (esperado: 0)', n;
  end if;

  select count(*) into n from public.participacoes_squad;
  if n <> 0 then
    raise exception 'FALHOU: colaborador vê % participações (esperado: 0)', n;
  end if;

  if public.eh_gp() then
    raise exception 'FALHOU: eh_gp() é true para o colaborador';
  end if;

  begin
    update public.perfis set papel = 'gp'
    where id = '00000000-0000-4000-8000-00000000c001';
    raise exception 'FALHOU: colaborador conseguiu alterar o próprio papel';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.perfis (id, nome, email)
    values (gen_random_uuid(), 'Intruso', 'intruso@demo.inovaup.test');
    raise exception 'FALHOU: colaborador conseguiu criar um perfil';
  exception when insufficient_privilege then null;
  end;

  begin
    delete from public.perfis
    where id = '00000000-0000-4000-8000-00000000c001';
    raise exception 'FALHOU: colaborador conseguiu apagar um perfil';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;

-- 5) Líder: na demo, mesmas permissões do colaborador ------------------------
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-00000000c002","role":"authenticated"}',
  true
);
set local role authenticated;

do $$
declare
  n int;
begin
  select count(*) into n from public.perfis;
  if n <> 1 then
    raise exception 'FALHOU: líder vê % perfis (esperado: só o próprio)', n;
  end if;

  select count(*) into n from public.squads;
  if n <> 0 then
    raise exception 'FALHOU: líder vê % squads (esperado: 0)', n;
  end if;

  begin
    update public.perfis set papel = 'gp'
    where id = '00000000-0000-4000-8000-00000000c002';
    raise exception 'FALHOU: líder conseguiu alterar o próprio papel';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;

-- 6) GP: lê todos os perfis, squads e participações; também não altera papel -
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-00000000a001","role":"authenticated"}',
  true
);
set local role authenticated;

do $$
declare
  n int;
begin
  select count(*) into n from public.perfis;
  if n <> current_setting('verif.total_perfis')::int then
    raise exception 'FALHOU: GP vê % de % perfis', n, current_setting('verif.total_perfis');
  end if;

  select count(*) into n from public.squads;
  if n <> current_setting('verif.total_squads')::int then
    raise exception 'FALHOU: GP vê % de % squads', n, current_setting('verif.total_squads');
  end if;

  select count(*) into n from public.participacoes_squad;
  if n <> current_setting('verif.total_participacoes')::int then
    raise exception 'FALHOU: GP vê % de % participações', n, current_setting('verif.total_participacoes');
  end if;

  if not public.eh_gp() then
    raise exception 'FALHOU: eh_gp() é false para a GP';
  end if;

  begin
    update public.perfis set papel = 'colaborador'
    where id = '00000000-0000-4000-8000-00000000c002';
    raise exception 'FALHOU: GP conseguiu alterar um papel pela aplicação';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;

-- 7) Conferência final, sem RLS: nenhum papel mudou ---------------------------
do $$
begin
  if (select papel from public.perfis where id = '00000000-0000-4000-8000-00000000c001') <> 'colaborador'
     or (select papel from public.perfis where id = '00000000-0000-4000-8000-00000000c002') <> 'lider' then
    raise exception 'FALHOU: um papel foi alterado';
  end if;
end $$;

rollback;

-- Só chega aqui se nenhuma verificação falhou (um erro interrompe o script).
select 'OK: todas as verificações da RLS do núcleo passaram' as resultado;
