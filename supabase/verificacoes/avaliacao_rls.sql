-- =============================================================================
-- Verificação da RLS e das funções da avaliação (A1, contrato I3)
--
-- Roda numa transação que termina em ROLLBACK: não deixa nenhum dado no banco
-- (pode rodar no banco de dev compartilhado, D-16). Cria pessoas e ciclos
-- fictícios só durante a execução e confere UM CASO PARA CADA REGRA de acesso.
--
-- Como rodar:
--   banco de dev:  npx supabase db query --remote -f supabase/verificacoes/avaliacao_rls.sql
--   CI (local):    psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/verificacoes/avaliacao_rls.sql
--
-- Resultado: para no primeiro "FALHOU: ..."; se tudo passar, a última linha
-- mostra "OK: ...".
--
-- Elenco (ids fixos, só nesta transação):
--   GP  e1..01 (papel gp)          C1 e1..02 (colaborador, avalia C2)
--   C2  e1..03 (avaliado)          L1 e1..04 (líder, gestor de C2)
--   X   e1..05 (colaborador sem nenhuma atribuição)
--   Ciclos: CA a1..01 (aberto), CR a1..02 (rascunho), CE a1..03 (encerrado)
--   Seções: S1 b1..01 (CA, 1 a 10, permite N/A), S2 b1..02 (CA, 1 a 5, sem N/A),
--           SR b1..03 (CR), SE b1..04 (CE)
--   Competências: K1 c1..01 e K2 c1..02 (S1), K3 c1..03 (S2), KR c1..04 (SR), KE c1..05 (SE)
--   Atribuições: T1 d1..01 C1->C2 pares (CA)    T2 d1..02 C2->C2 autoavaliação (CA)
--                T3 d1..03 L1->C2 gestor (CA)   TR d1..04 C1->C2 pares (CR)
--                TE d1..05 C1->C2 pares (CE)
-- =============================================================================

begin;

-- 1) Estrutura ---------------------------------------------------------------
do $$
declare
  t text;
  p text;
  f text;
  tabelas text[] := array['ciclos', 'secoes', 'competencias', 'pesos_grupo',
                          'atribuicoes', 'respostas', 'comentarios', 'relatorios'];
begin
  foreach t in array tabelas loop
    if not (select c.relrowsecurity from pg_class c where c.oid = format('public.%I', t)::regclass) then
      raise exception 'FALHOU: RLS desligada em public.%', t;
    end if;
    if has_table_privilege('anon', format('public.%I', t), 'SELECT') then
      raise exception 'FALHOU: anon tem SELECT em public.%', t;
    end if;
    if has_table_privilege('authenticated', format('public.%I', t), 'DELETE') then
      raise exception 'FALHOU: authenticated tem DELETE em public.%', t;
    end if;
    foreach p in array array['INSERT', 'UPDATE'] loop
      if t not in ('respostas', 'comentarios')
         and has_table_privilege('authenticated', format('public.%I', t), p) then
        raise exception 'FALHOU: authenticated tem % em public.%', p, t;
      end if;
    end loop;
  end loop;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = any (tabelas)
      and (cmd in ('DELETE', 'ALL')
           or (cmd in ('INSERT', 'UPDATE') and tablename not in ('respostas', 'comentarios')))
  ) then
    raise exception 'FALHOU: política de escrita fora de respostas/comentários (ou de DELETE)';
  end if;

  if has_schema_privilege('anon', 'private', 'USAGE') then
    raise exception 'FALHOU: anon tem acesso ao schema private';
  end if;

  foreach f in array array['public.minhas_atribuicoes()', 'public.enviar_atribuicao(uuid)',
                           'public.abrir_ciclo(uuid)', 'public.encerrar_ciclo(uuid)',
                           'public.liberar_relatorios(uuid)', 'private.participa_do_ciclo(uuid)',
                           'private.pode_responder(uuid)', 'private.minha_atribuicao(uuid)'] loop
    if not exists (
      select 1 from pg_proc
      where oid = f::regprocedure and prosecdef
        and exists (select 1 from unnest(proconfig) cfg where cfg like 'search_path=%')
    ) then
      raise exception 'FALHOU: % precisa ser security definer com search_path fixo', f;
    end if;
    if has_function_privilege('anon', f, 'EXECUTE') then
      raise exception 'FALHOU: anon pode executar %', f;
    end if;
  end loop;
end $$;

-- 2) Dados fictícios, só dentro desta transação ------------------------------
-- Se o banco já tiver um ciclo aberto (ex.: o da semente), ele vira rascunho
-- só aqui dentro, para o CA poder abrir. O ROLLBACK desfaz.
update public.ciclos set status = 'rascunho' where status = 'aberto';

insert into auth.users (id, email, aud, role) values
  ('e1000000-0000-4000-8000-000000000001', 'verifav.gp@demo.inovaup.test', 'authenticated', 'authenticated'),
  ('e1000000-0000-4000-8000-000000000002', 'verifav.c1@demo.inovaup.test', 'authenticated', 'authenticated'),
  ('e1000000-0000-4000-8000-000000000003', 'verifav.c2@demo.inovaup.test', 'authenticated', 'authenticated'),
  ('e1000000-0000-4000-8000-000000000004', 'verifav.l1@demo.inovaup.test', 'authenticated', 'authenticated'),
  ('e1000000-0000-4000-8000-000000000005', 'verifav.x@demo.inovaup.test',  'authenticated', 'authenticated');

insert into public.perfis (id, nome, email, papel) values
  ('e1000000-0000-4000-8000-000000000001', 'Verif GP', 'verifav.gp@demo.inovaup.test', 'gp'),
  ('e1000000-0000-4000-8000-000000000002', 'Verif C1', 'verifav.c1@demo.inovaup.test', 'colaborador'),
  ('e1000000-0000-4000-8000-000000000003', 'Verif C2', 'verifav.c2@demo.inovaup.test', 'colaborador'),
  ('e1000000-0000-4000-8000-000000000004', 'Verif L1', 'verifav.l1@demo.inovaup.test', 'lider'),
  ('e1000000-0000-4000-8000-000000000005', 'Verif X',  'verifav.x@demo.inovaup.test',  'colaborador');

insert into public.ciclos (id, nome, status) values
  ('a1000000-0000-4000-8000-000000000001', 'Verif ciclo aberto', 'aberto'),
  ('a1000000-0000-4000-8000-000000000002', 'Verif ciclo rascunho', 'rascunho'),
  ('a1000000-0000-4000-8000-000000000003', 'Verif ciclo encerrado', 'encerrado');

insert into public.secoes (id, ciclo_id, nome, escala_min, escala_max, permite_na, ordem) values
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'Performance', 1, 10, true, 1),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'Comportamental', 1, 5, false, 2),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000002', 'Rascunho', 1, 10, true, 1),
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000003', 'Encerrado', 1, 10, true, 1);

insert into public.competencias (id, secao_id, pergunta, ordem) values
  ('c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'Cumpre prazos', 1),
  ('c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000001', 'Liderança', 2),
  ('c1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000002', 'Direcionamentos', 1),
  ('c1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000003', 'Pergunta do rascunho', 1),
  ('c1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000004', 'Pergunta encerrada', 1);

insert into public.pesos_grupo (ciclo_id, grupo, peso) values
  ('a1000000-0000-4000-8000-000000000001', 'autoavaliacao', 1),
  ('a1000000-0000-4000-8000-000000000001', 'gestor', 2),
  ('a1000000-0000-4000-8000-000000000001', 'pares', 2),
  ('a1000000-0000-4000-8000-000000000001', 'liderados', 2);

insert into public.atribuicoes (id, ciclo_id, avaliado_id, avaliador_id, grupo) values
  ('d1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000002', 'pares'),
  ('d1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000003', 'autoavaliacao'),
  ('d1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000004', 'gestor'),
  ('d1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000002', 'pares'),
  ('d1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000002', 'pares');

-- Resposta e comentário do gestor (L1), gravados aqui como dono das tabelas.
insert into public.respostas (atribuicao_id, competencia_id, valor) values
  ('d1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 7);
insert into public.comentarios (atribuicao_id, secao_id, texto) values
  ('d1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000001', 'Comentário do gestor');

-- Regras do banco que valem para qualquer um (inclusive o dono das tabelas).
do $$
begin
  begin
    insert into public.atribuicoes (ciclo_id, avaliado_id, avaliador_id, grupo) values
      ('a1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000003',
       'e1000000-0000-4000-8000-000000000005', 'autoavaliacao');
    raise exception 'FALHOU: aceitou autoavaliação com avaliador diferente do avaliado';
  exception when check_violation then null;
  end;

  begin
    insert into public.ciclos (nome, status) values ('Segundo aberto', 'aberto');
    raise exception 'FALHOU: aceitou dois ciclos abertos ao mesmo tempo';
  exception when unique_violation then null;
  end;

  begin
    update public.ciclos set relatorios_liberados = true
    where id = 'a1000000-0000-4000-8000-000000000001';
    raise exception 'FALHOU: liberou relatórios de um ciclo aberto';
  exception when check_violation then null;
  end;
end $$;

-- 3) Visitante sem login ------------------------------------------------------
set local role anon;

do $$
begin
  begin
    perform 1 from public.ciclos;
    raise exception 'FALHOU: anon leu ciclos';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.respostas;
    raise exception 'FALHOU: anon leu respostas';
  exception when insufficient_privilege then null;
  end;
  begin
    perform * from public.minhas_atribuicoes();
    raise exception 'FALHOU: anon executou minhas_atribuicoes()';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.abrir_ciclo('a1000000-0000-4000-8000-000000000002');
    raise exception 'FALHOU: anon executou abrir_ciclo()';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;

-- 4) C1, avaliador de C2 ------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"e1000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;

do $$
declare
  n int;
  v smallint;
begin
  -- Questionário: vê os ciclos em que participa, nunca o rascunho.
  select count(*) into n from public.ciclos where id in (
    'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000003');
  if n <> 2 then raise exception 'FALHOU: C1 vê % de 3 ciclos (esperado 2, sem o rascunho)', n; end if;
  if exists (select 1 from public.ciclos where id = 'a1000000-0000-4000-8000-000000000002') then
    raise exception 'FALHOU: C1 vê ciclo em rascunho';
  end if;

  select count(*) into n from public.secoes where id in (
    'b1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000004');
  if n <> 3 then raise exception 'FALHOU: C1 vê % seções (esperado 3, sem a do rascunho)', n; end if;

  select count(*) into n from public.competencias where id in (
    'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002',
    'c1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000004',
    'c1000000-0000-4000-8000-000000000005');
  if n <> 4 then raise exception 'FALHOU: C1 vê % competências (esperado 4, sem a do rascunho)', n; end if;

  select count(*) into n from public.pesos_grupo;
  if n <> 0 then raise exception 'FALHOU: C1 vê pesos dos grupos'; end if;

  -- Atribuições: só as próprias, fora do rascunho.
  select count(*) into n from public.atribuicoes where id in (
    'd1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002',
    'd1000000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000004',
    'd1000000-0000-4000-8000-000000000005');
  if n <> 2 then raise exception 'FALHOU: C1 vê % atribuições (esperado 2: T1 e TE)', n; end if;

  select count(*) into n from public.minhas_atribuicoes();
  if n <> 2 then raise exception 'FALHOU: minhas_atribuicoes() de C1 tem % linhas (esperado 2)', n; end if;
  if exists (select 1 from public.minhas_atribuicoes() m
             where m.ciclo_id = 'a1000000-0000-4000-8000-000000000002') then
    raise exception 'FALHOU: minhas_atribuicoes() listou ciclo em rascunho';
  end if;
  if not exists (select 1 from public.minhas_atribuicoes() m
                 where m.atribuicao_id = 'd1000000-0000-4000-8000-000000000001'
                   and m.avaliado_nome = 'Verif C2' and m.ciclo_status = 'aberto'
                   and m.grupo = 'pares' and m.status = 'pendente') then
    raise exception 'FALHOU: minhas_atribuicoes() não trouxe T1 com nome, ciclo_status, grupo e status';
  end if;

  -- O núcleo continua fechado: só o próprio perfil.
  select count(*) into n from public.perfis;
  if n <> 1 then raise exception 'FALHOU: C1 vê % perfis (esperado só o próprio)', n; end if;

  -- Não lê respostas nem comentários de outro avaliador (L1).
  select count(*) into n from public.respostas;
  if n <> 0 then raise exception 'FALHOU: C1 vê % respostas de outro avaliador', n; end if;
  select count(*) into n from public.comentarios;
  if n <> 0 then raise exception 'FALHOU: C1 vê % comentários de outro avaliador', n; end if;

  -- Grava e regrava (upsert) na própria atribuição pendente.
  insert into public.respostas (atribuicao_id, competencia_id, valor) values
    ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 8);
  insert into public.respostas (atribuicao_id, competencia_id, valor) values
    ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 9)
  on conflict (atribuicao_id, competencia_id)
  do update set valor = excluded.valor, nao_se_aplica = excluded.nao_se_aplica;
  select r.valor into v from public.respostas r
  where r.atribuicao_id = 'd1000000-0000-4000-8000-000000000001'
    and r.competencia_id = 'c1000000-0000-4000-8000-000000000001';
  if v is distinct from 9 then raise exception 'FALHOU: upsert da resposta não gravou (valor=%)', v; end if;

  -- Não grava em atribuição de outra pessoa.
  begin
    insert into public.respostas (atribuicao_id, competencia_id, valor) values
      ('d1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000002', 5);
    raise exception 'FALHOU: C1 gravou resposta em atribuição de outra pessoa';
  exception when insufficient_privilege then null;
  end;

  -- Não grava em ciclo fora de "aberto" (TE é dele, mas o ciclo está encerrado).
  begin
    insert into public.respostas (atribuicao_id, competencia_id, valor) values
      ('d1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000005', 5);
    raise exception 'FALHOU: C1 gravou resposta em ciclo encerrado';
  exception when insufficient_privilege then null;
  end;

  -- Validações do valor e do N/A.
  begin
    insert into public.respostas (atribuicao_id, competencia_id, valor) values
      ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 11);
    raise exception 'FALHOU: aceitou valor acima da escala';
  exception when check_violation then null;
  end;
  begin
    insert into public.respostas (atribuicao_id, competencia_id, valor) values
      ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 0);
    raise exception 'FALHOU: aceitou valor abaixo da escala';
  exception when check_violation then null;
  end;
  begin
    insert into public.respostas (atribuicao_id, competencia_id, nao_se_aplica) values
      ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', true);
    raise exception 'FALHOU: aceitou N/A em seção que não permite';
  exception when check_violation then null;
  end;
  begin
    insert into public.respostas (atribuicao_id, competencia_id, valor, nao_se_aplica) values
      ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 5, true);
    raise exception 'FALHOU: aceitou valor e N/A ao mesmo tempo';
  exception when check_violation then null;
  end;
  begin
    insert into public.respostas (atribuicao_id, competencia_id, valor) values
      ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000004', 5);
    raise exception 'FALHOU: aceitou competência de outro ciclo';
  exception when check_violation then null;
  end;
  begin
    update public.respostas set competencia_id = 'c1000000-0000-4000-8000-000000000002'
    where atribuicao_id = 'd1000000-0000-4000-8000-000000000001'
      and competencia_id = 'c1000000-0000-4000-8000-000000000001';
    raise exception 'FALHOU: aceitou trocar a competência de uma resposta';
  exception when check_violation then null;
  end;

  -- Nunca apaga.
  begin
    delete from public.respostas where atribuicao_id = 'd1000000-0000-4000-8000-000000000001';
    raise exception 'FALHOU: C1 apagou resposta';
  exception when insufficient_privilege then null;
  end;

  -- Comentários: grava, regrava, limite de 2.000 caracteres, seção do ciclo, sem apagar.
  insert into public.comentarios (atribuicao_id, secao_id, texto) values
    ('d1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'Bom trabalho');
  insert into public.comentarios (atribuicao_id, secao_id, texto) values
    ('d1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'Ótimo trabalho')
  on conflict (atribuicao_id, secao_id) do update set texto = excluded.texto;
  if not exists (select 1 from public.comentarios where texto = 'Ótimo trabalho') then
    raise exception 'FALHOU: upsert do comentário não gravou';
  end if;
  begin
    insert into public.comentarios (atribuicao_id, secao_id, texto) values
      ('d1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', repeat('a', 2001));
    raise exception 'FALHOU: aceitou comentário com mais de 2.000 caracteres';
  exception when check_violation then null;
  end;
  begin
    insert into public.comentarios (atribuicao_id, secao_id, texto) values
      ('d1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'outro ciclo');
    raise exception 'FALHOU: aceitou comentário em seção de outro ciclo';
  exception when check_violation then null;
  end;
  begin
    delete from public.comentarios where atribuicao_id = 'd1000000-0000-4000-8000-000000000001';
    raise exception 'FALHOU: C1 apagou comentário';
  exception when insufficient_privilege then null;
  end;

  -- Não mexe em atribuições nem em ciclos.
  begin
    update public.atribuicoes set status = 'enviada', enviada_em = now()
    where id = 'd1000000-0000-4000-8000-000000000001';
    raise exception 'FALHOU: C1 mudou o status da atribuição direto na tabela';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.ciclos (nome) values ('Ciclo do C1');
    raise exception 'FALHOU: C1 criou ciclo';
  exception when insufficient_privilege then null;
  end;

  -- Enviar: recusa com competência faltando.
  begin
    perform public.enviar_atribuicao('d1000000-0000-4000-8000-000000000001');
    raise exception 'FALHOU: enviou com competências faltando';
  exception when raise_exception then
    if sqlerrm not like 'Faltam 2 %' then
      raise exception 'FALHOU: mensagem inesperada ao enviar incompleto: %', sqlerrm;
    end if;
  end;

  -- Completa (N/A onde a seção permite) e envia.
  insert into public.respostas (atribuicao_id, competencia_id, nao_se_aplica) values
    ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', true);
  insert into public.respostas (atribuicao_id, competencia_id, valor) values
    ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 3);
  perform public.enviar_atribuicao('d1000000-0000-4000-8000-000000000001');
  if not exists (select 1 from public.atribuicoes
                 where id = 'd1000000-0000-4000-8000-000000000001'
                   and status = 'enviada' and enviada_em is not null) then
    raise exception 'FALHOU: enviar_atribuicao() não marcou T1 como enviada';
  end if;

  -- Depois de enviada: nada muda.
  update public.respostas set valor = 1
  where atribuicao_id = 'd1000000-0000-4000-8000-000000000001'
    and competencia_id = 'c1000000-0000-4000-8000-000000000001';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALHOU: C1 alterou % respostas depois de enviar', n; end if;
  begin
    insert into public.respostas (atribuicao_id, competencia_id, valor) values
      ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 2)
    on conflict (atribuicao_id, competencia_id) do update set valor = excluded.valor;
    raise exception 'FALHOU: upsert passou depois de enviar';
  exception when insufficient_privilege then null;
  end;
  update public.comentarios set texto = 'mudei'
  where atribuicao_id = 'd1000000-0000-4000-8000-000000000001';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALHOU: C1 alterou comentário depois de enviar'; end if;

  begin
    perform public.enviar_atribuicao('d1000000-0000-4000-8000-000000000001');
    raise exception 'FALHOU: enviou duas vezes';
  exception when raise_exception then
    if sqlerrm not like 'Esta avaliação já foi enviada%' then
      raise exception 'FALHOU: mensagem inesperada ao reenviar: %', sqlerrm;
    end if;
  end;

  -- Não envia atribuição de outra pessoa.
  begin
    perform public.enviar_atribuicao('d1000000-0000-4000-8000-000000000003');
    raise exception 'FALHOU: C1 enviou atribuição de outra pessoa';
  exception when insufficient_privilege then null;
  end;

  -- Funções da GP.
  begin
    perform public.abrir_ciclo('a1000000-0000-4000-8000-000000000002');
    raise exception 'FALHOU: C1 abriu ciclo';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.encerrar_ciclo('a1000000-0000-4000-8000-000000000001');
    raise exception 'FALHOU: C1 encerrou ciclo';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.liberar_relatorios('a1000000-0000-4000-8000-000000000003');
    raise exception 'FALHOU: C1 liberou relatórios';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;

-- 5) C2, o avaliado (também faz a própria autoavaliação) ---------------------
select set_config('request.jwt.claims',
  '{"sub":"e1000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
set local role authenticated;

do $$
declare
  n int;
begin
  -- Não vê quem o avalia: só a própria autoavaliação.
  select count(*) into n from public.atribuicoes where id in (
    'd1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002',
    'd1000000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000004',
    'd1000000-0000-4000-8000-000000000005');
  if n <> 1 then raise exception 'FALHOU: C2 vê % atribuições (esperado só a autoavaliação)', n; end if;

  select count(*) into n from public.minhas_atribuicoes();
  if n <> 1 then raise exception 'FALHOU: minhas_atribuicoes() de C2 tem % linhas (esperado 1)', n; end if;

  -- Não lê o que os outros responderam sobre ele.
  select count(*) into n from public.respostas;
  if n <> 0 then raise exception 'FALHOU: C2 vê % respostas sobre ele', n; end if;
  select count(*) into n from public.comentarios;
  if n <> 0 then raise exception 'FALHOU: C2 vê % comentários sobre ele', n; end if;

  -- Vê o questionário dos ciclos em que é avaliado (não o rascunho).
  select count(*) into n from public.ciclos where id in (
    'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000003');
  if n <> 2 then raise exception 'FALHOU: C2 vê % ciclos (esperado 2)', n; end if;
end $$;

reset role;

-- 6) X, colaborador sem nenhuma atribuição -----------------------------------
select set_config('request.jwt.claims',
  '{"sub":"e1000000-0000-4000-8000-000000000005","role":"authenticated"}', true);
set local role authenticated;

do $$
declare
  n int;
begin
  select (select count(*) from public.ciclos where id::text like 'a1000000-%')
       + (select count(*) from public.secoes where id::text like 'b1000000-%')
       + (select count(*) from public.competencias where id::text like 'c1000000-%')
       + (select count(*) from public.atribuicoes where id::text like 'd1000000-%')
       + (select count(*) from public.minhas_atribuicoes())
       + (select count(*) from public.relatorios)
    into n;
  if n <> 0 then raise exception 'FALHOU: X, sem atribuição, vê % linhas da avaliação', n; end if;
end $$;

reset role;

-- 7) GP ------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"e1000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;

do $$
declare
  n int;
begin
  -- Lê ciclos, questionário, pesos e o mapa de atribuições.
  select count(*) into n from public.ciclos where id::text like 'a1000000-%';
  if n <> 3 then raise exception 'FALHOU: GP vê % de 3 ciclos', n; end if;
  select count(*) into n from public.secoes where id::text like 'b1000000-%';
  if n <> 4 then raise exception 'FALHOU: GP vê % de 4 seções', n; end if;
  select count(*) into n from public.competencias where id::text like 'c1000000-%';
  if n <> 5 then raise exception 'FALHOU: GP vê % de 5 competências', n; end if;
  select count(*) into n from public.pesos_grupo where ciclo_id = 'a1000000-0000-4000-8000-000000000001';
  if n <> 4 then raise exception 'FALHOU: GP vê % de 4 pesos', n; end if;
  select count(*) into n from public.atribuicoes where id::text like 'd1000000-%';
  if n <> 5 then raise exception 'FALHOU: GP vê % de 5 atribuições', n; end if;

  -- Contador "X de Y respondidas" pelas atribuições do ciclo.
  select count(*) filter (where status = 'enviada') into n
  from public.atribuicoes where ciclo_id = 'a1000000-0000-4000-8000-000000000001';
  if n <> 1 then raise exception 'FALHOU: contador da GP mostra % enviadas (esperado 1)', n; end if;

  -- NÃO lê respostas nem comentários de ninguém.
  select count(*) into n from public.respostas;
  if n <> 0 then raise exception 'FALHOU: GP vê % respostas', n; end if;
  select count(*) into n from public.comentarios;
  if n <> 0 then raise exception 'FALHOU: GP vê % comentários', n; end if;

  -- Não escreve direto nas tabelas.
  begin
    update public.ciclos set status = 'aberto' where id = 'a1000000-0000-4000-8000-000000000002';
    raise exception 'FALHOU: GP mudou ciclo direto na tabela';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.relatorios (ciclo_id, avaliado_id, conteudo) values
      ('a1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000003', '{}');
    raise exception 'FALHOU: GP gravou relatório direto na tabela';
  exception when insufficient_privilege then null;
  end;

  -- Transições inválidas.
  begin
    perform public.abrir_ciclo('a1000000-0000-4000-8000-000000000002');
    raise exception 'FALHOU: abriu um segundo ciclo com outro já aberto';
  exception when raise_exception then
    if sqlerrm not like 'Já existe um ciclo aberto%' then
      raise exception 'FALHOU: mensagem inesperada ao abrir segundo ciclo: %', sqlerrm;
    end if;
  end;
  begin
    perform public.encerrar_ciclo('a1000000-0000-4000-8000-000000000002');
    raise exception 'FALHOU: encerrou ciclo em rascunho';
  exception when raise_exception then
    if sqlerrm not like 'Só um ciclo aberto%' then
      raise exception 'FALHOU: mensagem inesperada ao encerrar rascunho: %', sqlerrm;
    end if;
  end;
  begin
    perform public.liberar_relatorios('a1000000-0000-4000-8000-000000000001');
    raise exception 'FALHOU: liberou relatórios de ciclo aberto';
  exception when raise_exception then
    if sqlerrm not like 'Só um ciclo encerrado%' then
      raise exception 'FALHOU: mensagem inesperada ao liberar ciclo aberto: %', sqlerrm;
    end if;
  end;
  begin
    perform public.liberar_relatorios('a1000000-0000-4000-8000-000000000003');
    raise exception 'FALHOU: liberou relatórios antes de gravados';
  exception when raise_exception then
    if sqlerrm not like 'Ainda há relatórios por gravar%' then
      raise exception 'FALHOU: mensagem inesperada ao liberar sem relatórios: %', sqlerrm;
    end if;
  end;

  -- Transições válidas: encerra o aberto e abre o rascunho.
  perform public.encerrar_ciclo('a1000000-0000-4000-8000-000000000001');
  perform public.abrir_ciclo('a1000000-0000-4000-8000-000000000002');
  if (select status from public.ciclos where id = 'a1000000-0000-4000-8000-000000000001') <> 'encerrado'
     or (select status from public.ciclos where id = 'a1000000-0000-4000-8000-000000000002') <> 'aberto' then
    raise exception 'FALHOU: encerrar_ciclo()/abrir_ciclo() não mudaram o status';
  end if;
  begin
    perform public.abrir_ciclo('a1000000-0000-4000-8000-000000000002');
    raise exception 'FALHOU: abriu de novo um ciclo já aberto';
  exception when raise_exception then
    if sqlerrm not like 'Só um ciclo em rascunho%' then
      raise exception 'FALHOU: mensagem inesperada ao reabrir: %', sqlerrm;
    end if;
  end;
end $$;

reset role;

-- 8) L1, gestor, depois que o ciclo foi encerrado ----------------------------
select set_config('request.jwt.claims',
  '{"sub":"e1000000-0000-4000-8000-000000000004","role":"authenticated"}', true);
set local role authenticated;

do $$
declare
  n int;
begin
  -- Lê a própria resposta (rascunho), mas não grava mais.
  select count(*) into n from public.respostas;
  if n <> 1 then raise exception 'FALHOU: L1 vê % respostas próprias (esperado 1)', n; end if;
  begin
    insert into public.respostas (atribuicao_id, competencia_id, valor) values
      ('d1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000002', 5);
    raise exception 'FALHOU: L1 gravou resposta com o ciclo encerrado';
  exception when insufficient_privilege then null;
  end;
  update public.respostas set valor = 1;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALHOU: L1 alterou resposta com o ciclo encerrado'; end if;

  begin
    perform public.enviar_atribuicao('d1000000-0000-4000-8000-000000000003');
    raise exception 'FALHOU: L1 enviou com o ciclo encerrado';
  exception when raise_exception then
    if sqlerrm not like 'O ciclo desta avaliação não está aberto%' then
      raise exception 'FALHOU: mensagem inesperada ao enviar em ciclo encerrado: %', sqlerrm;
    end if;
  end;

  if not exists (select 1 from public.minhas_atribuicoes() m
                 where m.atribuicao_id = 'd1000000-0000-4000-8000-000000000003'
                   and m.ciclo_status = 'encerrado') then
    raise exception 'FALHOU: minhas_atribuicoes() não mostra o ciclo encerrado (só leitura)';
  end if;
end $$;

reset role;

-- 9) C1 depois que o rascunho abriu: a atribuição TR passa a aparecer ---------
select set_config('request.jwt.claims',
  '{"sub":"e1000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;

do $$
declare
  n int;
begin
  select count(*) into n from public.minhas_atribuicoes();
  if n <> 3 then raise exception 'FALHOU: C1 tem % atribuições depois de abrir o ciclo (esperado 3)', n; end if;
end $$;

reset role;

-- 10) Relatórios: gravados pela service_role (aqui, o dono) e liberados pela GP
insert into public.relatorios (ciclo_id, avaliado_id, conteudo) values
  ('a1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000003',
   '{"disponivel": false, "aviso": "verificação", "autoavaliacao_pct": null}');

-- Antes da liberação, o avaliado não lê.
select set_config('request.jwt.claims',
  '{"sub":"e1000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
set local role authenticated;
do $$
begin
  if exists (select 1 from public.relatorios) then
    raise exception 'FALHOU: C2 leu o relatório antes da liberação';
  end if;
end $$;
reset role;

-- A GP libera (agora com os relatórios gravados) e lê.
select set_config('request.jwt.claims',
  '{"sub":"e1000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;
do $$
begin
  perform public.liberar_relatorios('a1000000-0000-4000-8000-000000000003');
  if not exists (select 1 from public.relatorios
                 where ciclo_id = 'a1000000-0000-4000-8000-000000000003') then
    raise exception 'FALHOU: GP não lê o relatório';
  end if;
  begin
    perform public.liberar_relatorios('a1000000-0000-4000-8000-000000000003');
    raise exception 'FALHOU: liberou duas vezes';
  exception when raise_exception then
    if sqlerrm not like 'Os relatórios deste ciclo já foram liberados%' then
      raise exception 'FALHOU: mensagem inesperada ao liberar de novo: %', sqlerrm;
    end if;
  end;
end $$;
reset role;

-- Depois da liberação: o avaliado lê o próprio; outra pessoa não.
select set_config('request.jwt.claims',
  '{"sub":"e1000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
set local role authenticated;
do $$
declare
  n int;
begin
  select count(*) into n from public.relatorios;
  if n <> 1 then raise exception 'FALHOU: C2 vê % relatórios depois da liberação (esperado 1)', n; end if;
end $$;
reset role;

select set_config('request.jwt.claims',
  '{"sub":"e1000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;
do $$
begin
  if exists (select 1 from public.relatorios) then
    raise exception 'FALHOU: C1 leu o relatório de outra pessoa';
  end if;
end $$;
reset role;

-- 11) Conferência final, sem RLS ---------------------------------------------
do $$
begin
  if (select valor from public.respostas
      where atribuicao_id = 'd1000000-0000-4000-8000-000000000003'
        and competencia_id = 'c1000000-0000-4000-8000-000000000001') <> 7 then
    raise exception 'FALHOU: a resposta do gestor foi alterada';
  end if;
  if (select valor from public.respostas
      where atribuicao_id = 'd1000000-0000-4000-8000-000000000001'
        and competencia_id = 'c1000000-0000-4000-8000-000000000001') <> 9 then
    raise exception 'FALHOU: a resposta enviada de C1 foi alterada';
  end if;
end $$;

rollback;

-- Só chega aqui se nenhuma verificação falhou.
select 'OK: todas as verificações da RLS da avaliação passaram' as resultado;
