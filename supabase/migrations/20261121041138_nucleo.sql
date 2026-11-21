-- =============================================================================
-- F4 — Núcleo: perfis, squads, participacoes_squad e eh_gp()
-- Contrato I1 (Davi -> Daniel). Raia de dados.
--
-- Piso de segurança (docs/regras/seguranca-da-demo.md):
--   * RLS ligada em todas as tabelas, negando por padrão (sem política = nega);
--   * usuários (anon e authenticated) não escrevem no núcleo: não há política
--     nem privilégio de INSERT, UPDATE ou DELETE para eles;
--   * perfis.papel é escrito só pela semente, com a chave service_role;
--   * o papel nunca vem de user_metadata.
--
-- Matriz de acesso (seguranca-da-demo.md, "Acesso a dados"):
--   * perfis: cada pessoa lê o próprio; a GP lê todos;
--   * squads e participacoes_squad ("Pessoas e squads"): só a GP lê.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------
create type public.papel as enum ('colaborador', 'lider', 'gp');

comment on type public.papel is
  'Papel de acesso no InovaUp. Escrito só pela semente (service_role).';

-- Valores tirados de docs/referencias/analise-reuniao-gp-inovaup.md
-- ("status de pessoa (ativa, trainee, desligada)").
create type public.situacao_pessoa as enum ('ativa', 'trainee', 'desligada');

comment on type public.situacao_pessoa is
  'Situação da pessoa na empresa (RF-04).';

-- -----------------------------------------------------------------------------
-- perfis: uma linha por pessoa, 1:1 com auth.users
-- -----------------------------------------------------------------------------
create table public.perfis (
  id         uuid primary key references auth.users (id) on delete cascade,
  nome       text not null check (length(btrim(nome)) > 0),
  email      text not null unique check (email = lower(email)),
  area       text,
  cargo      text,
  nivel      text,
  papel      public.papel not null default 'colaborador',
  situacao   public.situacao_pessoa not null default 'ativa',
  criado_em  timestamptz not null default now()
);

comment on table public.perfis is
  'Pessoas (1:1 com auth.users). Fonte do papel de acesso.';
comment on column public.perfis.email is
  'E-mail em minúsculas. Na demo, só fictícios (@demo.inovaup.test).';
comment on column public.perfis.papel is
  'colaborador | lider | gp. Nunca derivar de user_metadata.';

-- -----------------------------------------------------------------------------
-- squads
-- -----------------------------------------------------------------------------
create table public.squads (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique check (length(btrim(nome)) > 0),
  criado_em  timestamptz not null default now()
);

comment on table public.squads is 'Squads (equipes) da empresa.';

-- -----------------------------------------------------------------------------
-- participacoes_squad: quem esteve em qual squad e em que período
-- (as edições do Núcleo são períodos; fim nulo = participação em andamento)
-- -----------------------------------------------------------------------------
create table public.participacoes_squad (
  id         uuid primary key default gen_random_uuid(),
  perfil_id  uuid not null references public.perfis (id) on delete cascade,
  squad_id   uuid not null references public.squads (id) on delete restrict,
  inicio     date not null,
  fim        date,
  criado_em  timestamptz not null default now(),
  constraint participacoes_squad_periodo_valido
    check (fim is null or fim >= inicio),
  constraint participacoes_squad_unica
    unique (perfil_id, squad_id, inicio)
);

create index participacoes_squad_squad_id_idx
  on public.participacoes_squad (squad_id);

comment on table public.participacoes_squad is
  'Participação de uma pessoa num squad, por período (inicio a fim).';

-- -----------------------------------------------------------------------------
-- eh_gp(): a pessoa logada tem papel gp?
-- security definer: lê perfis sem cair na própria RLS (evita recursão).
-- search_path vazio: nomes sempre qualificados, sem risco de sequestro.
-- -----------------------------------------------------------------------------
create function public.eh_gp()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfis
    where id = (select auth.uid())
      and papel = 'gp'
  );
$$;

comment on function public.eh_gp() is
  'true se o usuário autenticado tem papel gp em perfis. Usada nas políticas de RLS.';

revoke all on function public.eh_gp() from public, anon;
grant execute on function public.eh_gp() to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Privilégios: negar por padrão e conceder só o necessário.
-- (Vale com ou sem a exposição automática de tabelas novas do Supabase.)
-- -----------------------------------------------------------------------------
revoke all on table public.perfis, public.squads, public.participacoes_squad
  from public, anon, authenticated;

grant select on table public.perfis, public.squads, public.participacoes_squad
  to authenticated;

-- A semente usa service_role (que ignora a RLS).
grant select, insert, update, delete
  on table public.perfis, public.squads, public.participacoes_squad
  to service_role;

-- -----------------------------------------------------------------------------
-- RLS: ligada em todas as tabelas. Só políticas de SELECT.
-- -----------------------------------------------------------------------------
alter table public.perfis enable row level security;
alter table public.squads enable row level security;
alter table public.participacoes_squad enable row level security;

create policy perfis_select_proprio_ou_gp
  on public.perfis
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or (select public.eh_gp())
  );

create policy squads_select_gp
  on public.squads
  for select
  to authenticated
  using ((select public.eh_gp()));

create policy participacoes_squad_select_gp
  on public.participacoes_squad
  for select
  to authenticated
  using ((select public.eh_gp()));

-- Nenhuma política de INSERT, UPDATE ou DELETE: usuários não escrevem no núcleo.
