/**
 * Contrato I1 — núcleo (Davi -> Daniel).
 *
 * Espelha a migração supabase/migrations/20261121041138_nucleo.sql.
 * Os campos ficam em snake_case, iguais às colunas: é assim que o Supabase
 * devolve as linhas, sem conversão.
 *
 * Mudança neste arquivo só pelo dono (Davi), em PR com [CONTRATO] no título.
 *
 * Quem lê o quê (RLS):
 *   - perfis: cada pessoa lê o próprio; a GP lê todos;
 *   - squads e participacoes_squad: só a GP;
 *   - ninguém escreve pela aplicação (só a semente, com a service_role).
 */

/** Papéis de acesso, na ordem do menor para o maior. */
export const PAPEIS = ["colaborador", "lider", "gp"] as const;

/** Papel de acesso de uma pessoa. Lido sempre de `perfis.papel`, nunca de `user_metadata`. */
export type Papel = (typeof PAPEIS)[number];

/** Situações possíveis de uma pessoa na empresa (RF-04). */
export const SITUACOES_PESSOA = ["ativa", "trainee", "desligada"] as const;

export type SituacaoPessoa = (typeof SITUACOES_PESSOA)[number];

/** Uma linha de `public.perfis` (1:1 com `auth.users`). */
export interface Perfil {
  /** Mesmo id do usuário em `auth.users`. */
  id: string;
  nome: string;
  /** Sempre em minúsculas. Na demo, só `@demo.inovaup.test`. */
  email: string;
  area: string | null;
  cargo: string | null;
  nivel: string | null;
  papel: Papel;
  situacao: SituacaoPessoa;
  /** Data e hora em ISO 8601. */
  criado_em: string;
}

/** Uma linha de `public.squads`. */
export interface Squad {
  id: string;
  nome: string;
  /** Data e hora em ISO 8601. */
  criado_em: string;
}

/**
 * Uma linha de `public.participacoes_squad`: a pessoa esteve no squad de
 * `inicio` até `fim` (as edições do Núcleo são períodos).
 */
export interface ParticipacaoSquad {
  id: string;
  perfil_id: string;
  squad_id: string;
  /** Data no formato AAAA-MM-DD. */
  inicio: string;
  /** Data no formato AAAA-MM-DD; `null` = participação em andamento. */
  fim: string | null;
  /** Data e hora em ISO 8601. */
  criado_em: string;
}
