-- =============================================================================
-- A1 — Modelo da avaliação de desempenho (contrato I3, Davi -> Daniel)
--
-- Tabelas: ciclos, secoes, competencias, pesos_grupo, atribuicoes, respostas,
-- comentarios e relatorios. Funções para as telas: minhas_atribuicoes(),
-- enviar_atribuicao(), abrir_ciclo(), encerrar_ciclo() e liberar_relatorios().
--
-- Piso de segurança (docs/regras/seguranca-da-demo.md):
--   * RLS ligada em todas as tabelas, negando por padrão;
--   * ninguém lê respostas ou comentários de outra pessoa, nem a GP;
--   * o avaliado não vê quem o avalia;
--   * o avaliador grava só nas próprias atribuições, com o ciclo aberto e a
--     atribuição pendente; nunca apaga (o upsert resolve);
--   * relatorios só recebe o conteúdo publicável, gravado pela service_role
--     (src/modules/avaliacao/calculo/executar.ts, A6);
--   * funções security definer com search_path fixo e conferência explícita
--     de quem chama.
--
-- As funções auxiliares da RLS ficam no schema "private", que não é exposto
-- pela API do Supabase.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Schema privado (fora da API) para as funções auxiliares da RLS
-- -----------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------
create type public.status_ciclo as enum ('rascunho', 'aberto', 'encerrado');
create type public.grupo_avaliador as enum ('autoavaliacao', 'gestor', 'pares', 'liderados');
create type public.status_atribuicao as enum ('pendente', 'enviada');

-- -----------------------------------------------------------------------------
-- ciclos
-- -----------------------------------------------------------------------------
create table public.ciclos (
  id                    uuid primary key default gen_random_uuid(),
  nome                  text not null check (length(btrim(nome)) > 0),
  status                public.status_ciclo not null default 'rascunho',
  relatorios_liberados  boolean not null default false,
  criado_em             timestamptz not null default now(),
  constraint ciclos_liberar_so_encerrado
    check (not relatorios_liberados or status = 'encerrado')
);

-- No máximo um ciclo aberto por vez.
create unique index ciclos_um_aberto on public.ciclos ((true)) where status = 'aberto';

comment on table public.ciclos is
  'Ciclos de avaliação: rascunho -> aberto -> encerrado. Mudam só pelas funções da GP.';

-- -----------------------------------------------------------------------------
-- secoes e competencias (questionário do ciclo; sem comportamentos no MVP)
-- -----------------------------------------------------------------------------
create table public.secoes (
  id          uuid primary key default gen_random_uuid(),
  ciclo_id    uuid not null references public.ciclos (id) on delete cascade,
  nome        text not null check (length(btrim(nome)) > 0),
  escala_min  smallint not null,
  escala_max  smallint not null,
  permite_na  boolean not null default false,
  peso        numeric not null default 1 check (peso > 0),
  ordem       smallint not null,
  constraint secoes_escala_valida check (escala_min < escala_max),
  constraint secoes_ordem_unica unique (ciclo_id, ordem)
);

create table public.competencias (
  id        uuid primary key default gen_random_uuid(),
  secao_id  uuid not null references public.secoes (id) on delete cascade,
  pergunta  text not null check (length(btrim(pergunta)) > 0),
  peso      numeric not null default 1 check (peso > 0),
  ordem     smallint not null,
  constraint competencias_ordem_unica unique (secao_id, ordem)
);

-- -----------------------------------------------------------------------------
-- pesos_grupo: peso de cada grupo de avaliador no ciclo (fórmula provisória)
-- -----------------------------------------------------------------------------
create table public.pesos_grupo (
  ciclo_id  uuid not null references public.ciclos (id) on delete cascade,
  grupo     public.grupo_avaliador not null,
  peso      numeric not null check (peso > 0),
  primary key (ciclo_id, grupo)
);

-- -----------------------------------------------------------------------------
-- atribuicoes: o mapa "quem avalia quem" do ciclo
-- -----------------------------------------------------------------------------
create table public.atribuicoes (
  id            uuid primary key default gen_random_uuid(),
  ciclo_id      uuid not null references public.ciclos (id) on delete cascade,
  avaliado_id   uuid not null references public.perfis (id) on delete cascade,
  avaliador_id  uuid not null references public.perfis (id) on delete cascade,
  grupo         public.grupo_avaliador not null,
  status        public.status_atribuicao not null default 'pendente',
  enviada_em    timestamptz,
  criado_em     timestamptz not null default now(),
  constraint atribuicoes_par_unico unique (ciclo_id, avaliado_id, avaliador_id),
  -- Autoavaliação se, e só se, a pessoa avalia a si mesma.
  constraint atribuicoes_autoavaliacao
    check ((grupo = 'autoavaliacao') = (avaliado_id = avaliador_id)),
  constraint atribuicoes_envio_coerente
    check ((status = 'enviada') = (enviada_em is not null))
);

create index atribuicoes_avaliador_id_idx on public.atribuicoes (avaliador_id);
create index atribuicoes_avaliado_id_idx on public.atribuicoes (avaliado_id);

-- -----------------------------------------------------------------------------
-- respostas: valor dentro da escala da seção, ou N/A (se a seção permitir)
-- valor nulo e N/A falso = competência ainda não respondida (rascunho).
-- -----------------------------------------------------------------------------
create table public.respostas (
  id              uuid primary key default gen_random_uuid(),
  atribuicao_id   uuid not null references public.atribuicoes (id) on delete cascade,
  competencia_id  uuid not null references public.competencias (id) on delete cascade,
  valor           smallint,
  nao_se_aplica   boolean not null default false,
  atualizado_em   timestamptz not null default now(),
  constraint respostas_unica unique (atribuicao_id, competencia_id),
  constraint respostas_valor_ou_na check (not (nao_se_aplica and valor is not null))
);

create index respostas_competencia_id_idx on public.respostas (competencia_id);

-- -----------------------------------------------------------------------------
-- comentarios: um por seção em cada atribuição. Texto vazio (ou só com
-- espaços) é aceito e o cálculo o ignora (A6).
-- -----------------------------------------------------------------------------
create table public.comentarios (
  id             uuid primary key default gen_random_uuid(),
  atribuicao_id  uuid not null references public.atribuicoes (id) on delete cascade,
  secao_id       uuid not null references public.secoes (id) on delete cascade,
  texto          text not null default '' check (length(texto) <= 2000),
  atualizado_em  timestamptz not null default now(),
  constraint comentarios_unico unique (atribuicao_id, secao_id)
);

create index comentarios_secao_id_idx on public.comentarios (secao_id);

-- -----------------------------------------------------------------------------
-- relatorios: só o conteúdo publicável (já suprimido), um por ciclo e avaliado
-- -----------------------------------------------------------------------------
create table public.relatorios (
  ciclo_id     uuid not null references public.ciclos (id) on delete cascade,
  avaliado_id  uuid not null references public.perfis (id) on delete cascade,
  conteudo     jsonb not null,
  gerado_em    timestamptz not null default now(),
  primary key (ciclo_id, avaliado_id)
);

create index relatorios_avaliado_id_idx on public.relatorios (avaliado_id);

comment on table public.relatorios is
  'Só o RelatorioPublicavel (já com a supressão). Nenhuma nota individual. Gravado pela service_role.';

-- -----------------------------------------------------------------------------
-- Funções auxiliares da RLS (schema private, fora da API)
-- -----------------------------------------------------------------------------

-- O ciclo já saiu do rascunho?
create function private.ciclo_publicado(p_ciclo_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.ciclos c
    where c.id = p_ciclo_id and c.status <> 'rascunho'
  );
$$;

-- O usuário logado participa do ciclo (como avaliador ou avaliado) e o ciclo
-- já saiu do rascunho?
create function private.participa_do_ciclo(p_ciclo_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.atribuicoes a
    join public.ciclos c on c.id = a.ciclo_id
    where a.ciclo_id = p_ciclo_id
      and c.status <> 'rascunho'
      and (select auth.uid()) in (a.avaliador_id, a.avaliado_id)
  );
$$;

-- Ciclo de uma seção (para a política de competencias).
create function private.ciclo_da_secao(p_secao_id uuid)
returns uuid
language sql stable security definer set search_path = ''
as $$
  select s.ciclo_id from public.secoes s where s.id = p_secao_id;
$$;

-- A atribuição é do usuário logado (como avaliador)?
create function private.minha_atribuicao(p_atribuicao_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.atribuicoes a
    where a.id = p_atribuicao_id and a.avaliador_id = (select auth.uid())
  );
$$;

-- O usuário logado pode gravar nesta atribuição agora? (dele, pendente, ciclo aberto)
create function private.pode_responder(p_atribuicao_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.atribuicoes a
    join public.ciclos c on c.id = a.ciclo_id
    where a.id = p_atribuicao_id
      and a.avaliador_id = (select auth.uid())
      and a.status = 'pendente'
      and c.status = 'aberto'
  );
$$;

-- Os relatórios do ciclo já foram liberados?
create function private.relatorios_liberados(p_ciclo_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.ciclos c
    where c.id = p_ciclo_id and c.relatorios_liberados
  );
$$;

revoke all on function
  private.ciclo_publicado(uuid),
  private.participa_do_ciclo(uuid),
  private.ciclo_da_secao(uuid),
  private.minha_atribuicao(uuid),
  private.pode_responder(uuid),
  private.relatorios_liberados(uuid)
from public, anon;

grant execute on function
  private.ciclo_publicado(uuid),
  private.participa_do_ciclo(uuid),
  private.ciclo_da_secao(uuid),
  private.minha_atribuicao(uuid),
  private.pode_responder(uuid),
  private.relatorios_liberados(uuid)
to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Gatilhos de validação (respostas e comentarios)
-- -----------------------------------------------------------------------------
create function private.validar_resposta()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_escala_min  smallint;
  v_escala_max  smallint;
  v_permite_na  boolean;
  v_ciclo_comp  uuid;
  v_ciclo_atr   uuid;
begin
  if tg_op = 'UPDATE'
     and (new.atribuicao_id <> old.atribuicao_id or new.competencia_id <> old.competencia_id) then
    raise exception 'Não é permitido trocar a atribuição ou a competência de uma resposta'
      using errcode = 'check_violation';
  end if;

  select s.escala_min, s.escala_max, s.permite_na, s.ciclo_id
    into v_escala_min, v_escala_max, v_permite_na, v_ciclo_comp
  from public.competencias c
  join public.secoes s on s.id = c.secao_id
  where c.id = new.competencia_id;

  select a.ciclo_id into v_ciclo_atr
  from public.atribuicoes a
  where a.id = new.atribuicao_id;

  if v_ciclo_comp is null or v_ciclo_comp is distinct from v_ciclo_atr then
    raise exception 'A competência não pertence ao ciclo desta atribuição'
      using errcode = 'check_violation';
  end if;

  if new.nao_se_aplica and not v_permite_na then
    raise exception 'Esta seção não permite N/A'
      using errcode = 'check_violation';
  end if;

  if new.valor is not null and (new.valor < v_escala_min or new.valor > v_escala_max) then
    raise exception 'Valor fora da escala da seção (de % a %)', v_escala_min, v_escala_max
      using errcode = 'check_violation';
  end if;

  new.atualizado_em := now();
  return new;
end;
$$;

create trigger respostas_validar
  before insert or update on public.respostas
  for each row execute function private.validar_resposta();

create function private.validar_comentario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_ciclo_secao  uuid;
  v_ciclo_atr    uuid;
begin
  if tg_op = 'UPDATE'
     and (new.atribuicao_id <> old.atribuicao_id or new.secao_id <> old.secao_id) then
    raise exception 'Não é permitido trocar a atribuição ou a seção de um comentário'
      using errcode = 'check_violation';
  end if;

  select s.ciclo_id into v_ciclo_secao from public.secoes s where s.id = new.secao_id;
  select a.ciclo_id into v_ciclo_atr from public.atribuicoes a where a.id = new.atribuicao_id;

  if v_ciclo_secao is null or v_ciclo_secao is distinct from v_ciclo_atr then
    raise exception 'A seção não pertence ao ciclo desta atribuição'
      using errcode = 'check_violation';
  end if;

  new.atualizado_em := now();
  return new;
end;
$$;

create trigger comentarios_validar
  before insert or update on public.comentarios
  for each row execute function private.validar_comentario();

revoke all on function private.validar_resposta(), private.validar_comentario()
  from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Funções para as telas (expostas na API, só para usuários logados)
-- -----------------------------------------------------------------------------

-- Atribuições do avaliador logado, com só o nome de quem é avaliado.
-- Nunca lista ciclo em rascunho.
create function public.minhas_atribuicoes()
returns table (
  atribuicao_id  uuid,
  ciclo_id       uuid,
  ciclo_nome     text,
  ciclo_status   public.status_ciclo,
  avaliado_nome  text,
  grupo          public.grupo_avaliador,
  status         public.status_atribuicao
)
language sql stable security definer set search_path = ''
as $$
  select a.id, a.ciclo_id, c.nome, c.status, p.nome, a.grupo, a.status
  from public.atribuicoes a
  join public.ciclos c on c.id = a.ciclo_id
  join public.perfis p on p.id = a.avaliado_id
  where a.avaliador_id = (select auth.uid())
    and c.status <> 'rascunho'
  order by c.criado_em desc, p.nome;
$$;

-- Envia uma atribuição: confere se é do usuário, se está pendente, se o ciclo
-- está aberto e se toda competência do ciclo tem valor (ou N/A, quando a seção
-- permite). Comentário é opcional. Depois de enviada, não volta.
create function public.enviar_atribuicao(p_atribuicao_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_avaliador     uuid;
  v_status        public.status_atribuicao;
  v_ciclo_id      uuid;
  v_ciclo_status  public.status_ciclo;
  v_faltando      integer;
begin
  select a.avaliador_id, a.status, a.ciclo_id, c.status
    into v_avaliador, v_status, v_ciclo_id, v_ciclo_status
  from public.atribuicoes a
  join public.ciclos c on c.id = a.ciclo_id
  where a.id = p_atribuicao_id
  for update of a;

  if not found or v_avaliador is distinct from (select auth.uid()) then
    raise exception 'Atribuição não encontrada' using errcode = 'insufficient_privilege';
  end if;
  if v_status <> 'pendente' then
    raise exception 'Esta avaliação já foi enviada';
  end if;
  if v_ciclo_status <> 'aberto' then
    raise exception 'O ciclo desta avaliação não está aberto';
  end if;

  select count(*) into v_faltando
  from public.competencias c
  join public.secoes s on s.id = c.secao_id
  where s.ciclo_id = v_ciclo_id
    and not exists (
      select 1 from public.respostas r
      where r.atribuicao_id = p_atribuicao_id
        and r.competencia_id = c.id
        and (r.valor is not null or (r.nao_se_aplica and s.permite_na))
    );

  if v_faltando > 0 then
    raise exception 'Faltam % competência(s) sem resposta', v_faltando;
  end if;

  update public.atribuicoes
  set status = 'enviada', enviada_em = now()
  where id = p_atribuicao_id;
end;
$$;

-- GP: rascunho -> aberto (no máximo um ciclo aberto por vez).
create function public.abrir_ciclo(p_ciclo_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.eh_gp() then
    raise exception 'Só a GP pode abrir um ciclo' using errcode = 'insufficient_privilege';
  end if;

  begin
    update public.ciclos set status = 'aberto'
    where id = p_ciclo_id and status = 'rascunho';
  exception when unique_violation then
    raise exception 'Já existe um ciclo aberto';
  end;

  if not found then
    raise exception 'Só um ciclo em rascunho pode ser aberto';
  end if;
end;
$$;

-- GP: aberto -> encerrado. O cálculo é feito depois, pelo executar.ts (A6).
create function public.encerrar_ciclo(p_ciclo_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.eh_gp() then
    raise exception 'Só a GP pode encerrar um ciclo' using errcode = 'insufficient_privilege';
  end if;

  update public.ciclos set status = 'encerrado'
  where id = p_ciclo_id and status = 'aberto';

  if not found then
    raise exception 'Só um ciclo aberto pode ser encerrado';
  end if;
end;
$$;

-- GP: libera os relatórios de um ciclo encerrado, só depois de gravados os
-- relatórios de todas as pessoas avaliadas no ciclo.
create function public.liberar_relatorios(p_ciclo_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_status     public.status_ciclo;
  v_liberados  boolean;
begin
  if not public.eh_gp() then
    raise exception 'Só a GP pode liberar relatórios' using errcode = 'insufficient_privilege';
  end if;

  select c.status, c.relatorios_liberados into v_status, v_liberados
  from public.ciclos c
  where c.id = p_ciclo_id
  for update;

  if not found then
    raise exception 'Ciclo não encontrado';
  end if;
  if v_status <> 'encerrado' then
    raise exception 'Só um ciclo encerrado pode ter os relatórios liberados';
  end if;
  if v_liberados then
    raise exception 'Os relatórios deste ciclo já foram liberados';
  end if;
  if not exists (select 1 from public.atribuicoes a where a.ciclo_id = p_ciclo_id) then
    raise exception 'O ciclo não tem atribuições';
  end if;
  if exists (
    select 1
    from (select distinct a.avaliado_id from public.atribuicoes a where a.ciclo_id = p_ciclo_id) x
    where not exists (
      select 1 from public.relatorios r
      where r.ciclo_id = p_ciclo_id and r.avaliado_id = x.avaliado_id
    )
  ) then
    raise exception 'Ainda há relatórios por gravar neste ciclo (rode o cálculo antes)';
  end if;

  update public.ciclos set relatorios_liberados = true where id = p_ciclo_id;
end;
$$;

revoke all on function
  public.minhas_atribuicoes(),
  public.enviar_atribuicao(uuid),
  public.abrir_ciclo(uuid),
  public.encerrar_ciclo(uuid),
  public.liberar_relatorios(uuid)
from public, anon;

grant execute on function
  public.minhas_atribuicoes(),
  public.enviar_atribuicao(uuid),
  public.abrir_ciclo(uuid),
  public.encerrar_ciclo(uuid),
  public.liberar_relatorios(uuid)
to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Privilégios: negar por padrão e conceder só o necessário
-- -----------------------------------------------------------------------------
revoke all on table
  public.ciclos, public.secoes, public.competencias, public.pesos_grupo,
  public.atribuicoes, public.respostas, public.comentarios, public.relatorios
from public, anon, authenticated;

grant select on table
  public.ciclos, public.secoes, public.competencias, public.pesos_grupo,
  public.atribuicoes, public.respostas, public.comentarios, public.relatorios
to authenticated;

-- O avaliador grava (upsert) respostas e comentários; nunca apaga.
grant insert, update on table public.respostas, public.comentarios to authenticated;

-- A semente (A2) e o cálculo (A6) usam a service_role.
grant select, insert, update, delete on table
  public.ciclos, public.secoes, public.competencias, public.pesos_grupo,
  public.atribuicoes, public.respostas, public.comentarios, public.relatorios
to service_role;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.ciclos enable row level security;
alter table public.secoes enable row level security;
alter table public.competencias enable row level security;
alter table public.pesos_grupo enable row level security;
alter table public.atribuicoes enable row level security;
alter table public.respostas enable row level security;
alter table public.comentarios enable row level security;
alter table public.relatorios enable row level security;

-- Questionário: a GP lê tudo; quem participa lê o do ciclo fora do rascunho.
create policy ciclos_select_gp_ou_participante on public.ciclos
  for select to authenticated
  using ((select public.eh_gp()) or private.participa_do_ciclo(id));

create policy secoes_select_gp_ou_participante on public.secoes
  for select to authenticated
  using ((select public.eh_gp()) or private.participa_do_ciclo(ciclo_id));

create policy competencias_select_gp_ou_participante on public.competencias
  for select to authenticated
  using (
    (select public.eh_gp())
    or private.participa_do_ciclo(private.ciclo_da_secao(secao_id))
  );

create policy pesos_grupo_select_gp on public.pesos_grupo
  for select to authenticated
  using ((select public.eh_gp()));

-- Atribuições: a GP lê o mapa todo; o avaliador lê só as próprias (fora do
-- rascunho). O avaliado não vê quem o avalia.
create policy atribuicoes_select_gp_ou_avaliador on public.atribuicoes
  for select to authenticated
  using (
    (select public.eh_gp())
    or (avaliador_id = (select auth.uid()) and private.ciclo_publicado(ciclo_id))
  );

-- Respostas e comentários: só o próprio avaliador lê; grava só enquanto pode
-- responder. A GP NÃO lê. Não há política de DELETE.
create policy respostas_select_proprias on public.respostas
  for select to authenticated
  using (private.minha_atribuicao(atribuicao_id));

create policy respostas_insert_proprias on public.respostas
  for insert to authenticated
  with check (private.pode_responder(atribuicao_id));

create policy respostas_update_proprias on public.respostas
  for update to authenticated
  using (private.pode_responder(atribuicao_id))
  with check (private.pode_responder(atribuicao_id));

create policy comentarios_select_proprios on public.comentarios
  for select to authenticated
  using (private.minha_atribuicao(atribuicao_id));

create policy comentarios_insert_proprios on public.comentarios
  for insert to authenticated
  with check (private.pode_responder(atribuicao_id));

create policy comentarios_update_proprios on public.comentarios
  for update to authenticated
  using (private.pode_responder(atribuicao_id))
  with check (private.pode_responder(atribuicao_id));

-- Relatórios: a GP lê todos; o avaliado lê o próprio, só depois da liberação.
create policy relatorios_select_gp_ou_proprio_liberado on public.relatorios
  for select to authenticated
  using (
    (select public.eh_gp())
    or (avaliado_id = (select auth.uid()) and private.relatorios_liberados(ciclo_id))
  );
