/**
 * Contrato I3 — avaliação de desempenho (Davi -> Daniel).
 *
 * Espelha a migração supabase/migrations/20261122022830_avaliacao.sql.
 * Os campos ficam em snake_case, iguais às colunas e aos retornos das funções.
 *
 * Mudança neste arquivo só pelo dono (Davi), em PR com [CONTRATO] no título.
 *
 * Quem lê e quem grava (RLS):
 *   - ciclos, secoes, competencias: a GP lê tudo; quem participa do ciclo
 *     (avaliador ou avaliado) lê o do ciclo fora do rascunho;
 *   - pesos_grupo: só a GP;
 *   - atribuicoes: a GP lê o mapa todo; o avaliador lê só as próprias.
 *     O avaliado NÃO vê quem o avalia;
 *   - respostas e comentarios: só o próprio avaliador lê. Grava (upsert, sem
 *     apagar) só com o ciclo aberto e a atribuição pendente. A GP NÃO lê;
 *   - relatorios: a GP lê todos; o avaliado lê o próprio só depois da liberação.
 *
 * Funções (supabase.rpc), todas para usuários logados:
 *   - minhas_atribuicoes() -> MinhaAtribuicao[]
 *   - enviar_atribuicao({ p_atribuicao_id })
 *   - abrir_ciclo({ p_ciclo_id }), encerrar_ciclo({ p_ciclo_id }),
 *     liberar_relatorios({ p_ciclo_id }): só a GP. encerrar_ciclo só fecha o
 *     ciclo; o cálculo é do executar.ts (I4). liberar_relatorios exige o ciclo
 *     encerrado e os relatórios de todos os avaliados já gravados.
 *
 * Upsert pela tela (A5):
 *   - respostas: onConflict "atribuicao_id,competencia_id";
 *   - comentarios: onConflict "atribuicao_id,secao_id".
 */

import type { Perfil } from "./core";

// --- Enums --------------------------------------------------------------------

export const STATUS_CICLO = ["rascunho", "aberto", "encerrado"] as const;
export type StatusCiclo = (typeof STATUS_CICLO)[number];

export const GRUPOS_AVALIADOR = ["autoavaliacao", "gestor", "pares", "liderados"] as const;
export type GrupoAvaliador = (typeof GRUPOS_AVALIADOR)[number];

/** Grupos além da própria pessoa (os que entram em "outros avaliadores"). */
export type GrupoOutros = Exclude<GrupoAvaliador, "autoavaliacao">;

export const STATUS_ATRIBUICAO = ["pendente", "enviada"] as const;
export type StatusAtribuicao = (typeof STATUS_ATRIBUICAO)[number];

/** Tamanho máximo de um comentário (conferido também no banco). */
export const LIMITE_COMENTARIO = 2000;

// --- Linhas das tabelas -------------------------------------------------------

/** Uma linha de `public.ciclos`. */
export interface Ciclo {
  id: string;
  nome: string;
  status: StatusCiclo;
  relatorios_liberados: boolean;
  /** Data e hora em ISO 8601. */
  criado_em: string;
}

/** Uma linha de `public.secoes`. */
export interface Secao {
  id: string;
  ciclo_id: string;
  nome: string;
  escala_min: number;
  escala_max: number;
  permite_na: boolean;
  peso: number;
  ordem: number;
}

/** Uma linha de `public.competencias` (sem comportamentos no MVP). */
export interface Competencia {
  id: string;
  secao_id: string;
  pergunta: string;
  peso: number;
  ordem: number;
}

/** Uma linha de `public.pesos_grupo` (fórmula provisória). */
export interface PesoGrupo {
  ciclo_id: string;
  grupo: GrupoAvaliador;
  peso: number;
}

/** Uma linha de `public.atribuicoes`. Autoavaliação: avaliador = avaliado. */
export interface Atribuicao {
  id: string;
  ciclo_id: string;
  avaliado_id: Perfil["id"];
  avaliador_id: Perfil["id"];
  grupo: GrupoAvaliador;
  status: StatusAtribuicao;
  /** Data e hora do envio; `null` enquanto pendente. */
  enviada_em: string | null;
  criado_em: string;
}

/**
 * Uma linha de `public.respostas`.
 * - `valor` dentro da escala da seção, ou `nao_se_aplica` (se a seção permitir);
 * - nunca os dois ao mesmo tempo;
 * - `valor` nulo e `nao_se_aplica` falso = ainda não respondida (rascunho).
 */
export interface Resposta {
  id: string;
  atribuicao_id: string;
  competencia_id: string;
  valor: number | null;
  nao_se_aplica: boolean;
  atualizado_em: string;
}

/**
 * Uma linha de `public.comentarios` (um por seção em cada atribuição).
 * Texto vazio ou só com espaços é aceito e o cálculo o ignora.
 */
export interface Comentario {
  id: string;
  atribuicao_id: string;
  secao_id: string;
  texto: string;
  atualizado_em: string;
}

/** Uma linha de `public.relatorios`: só o conteúdo publicável. */
export interface Relatorio {
  ciclo_id: string;
  avaliado_id: Perfil["id"];
  conteudo: RelatorioPublicavel;
  gerado_em: string;
}

// --- Retornos das funções -----------------------------------------------------

/** Uma linha de `minhas_atribuicoes()`: só o nome de quem é avaliado. */
export interface MinhaAtribuicao {
  atribuicao_id: string;
  ciclo_id: string;
  ciclo_nome: string;
  /** "aberto" = formulário; "encerrado" = só leitura. Nunca "rascunho". */
  ciclo_status: Exclude<StatusCiclo, "rascunho">;
  avaliado_nome: string;
  grupo: GrupoAvaliador;
  status: StatusAtribuicao;
}

// --- Resultado do cálculo (I4) ------------------------------------------------

/** Nota de uma competência no resultado. */
export interface ResultadoCompetencia {
  competencia_id: string;
  secao_id: string;
  /** Percentual combinado (0 a 100, sem arredondar); `null` se ninguém respondeu. */
  pct: number | null;
  /** Avaliadores além da própria pessoa que responderam sem N/A (R3). */
  n_avaliadores_outros: number;
}

/** Nota de um grupo além da autoavaliação. */
export interface ResultadoGrupo {
  grupo: GrupoOutros;
  /** Percentual do grupo; `null` se o grupo não respondeu. */
  pct: number | null;
  /** Avaliadores do grupo com pelo menos uma resposta que não seja N/A. */
  n: number;
}

/**
 * Saída completa de `calcularResultado()` (A6), para UM avaliado.
 * Fica só na memória do servidor: é a entrada de `montarRelatorioPublicavel()`
 * (A7) e NUNCA é gravada nem exibida.
 * Não contém a nota de nenhum avaliador individual (R7).
 */
export interface ResultadoCompleto {
  ciclo_id: string;
  avaliado_id: string;
  /** Nota final em % (todos os grupos, pela fórmula provisória); `null` se não houver respostas. */
  nota_final_pct: number | null;
  competencias: ResultadoCompetencia[];
  /** Um item por grupo além da autoavaliação (gestor, pares, liderados). */
  grupos: ResultadoGrupo[];
  /** Combinação dos grupos além da autoavaliação ("Outros avaliadores", R4). */
  outros_avaliadores: { pct: number | null; n: number };
  /** Autoavaliação como um único percentual (R5). */
  autoavaliacao_pct: number | null;
  /** Total de avaliadores além da própria pessoa com resposta que não seja N/A (R1). */
  n_avaliadores_outros: number;
  /** Comentários de quem não é a própria pessoa (R6), só o texto, sem autor nem grupo. */
  comentarios: {
    /** Sem textos vazios ou só com espaços. */
    textos: string[];
    /** Quantos avaliadores diferentes comentaram (sem dizer quem). */
    n_comentaristas: number;
  };
}

// --- Relatório publicável (A7) ------------------------------------------------

/** Versão do formato de `RelatorioPublicavel` gravado em `relatorios.conteudo`. */
export const VERSAO_RELATORIO = 1;

/** Uma competência no relatório publicável (já com o texto, sem outra consulta). */
export interface CompetenciaPublicavel {
  competencia_id: string;
  secao_nome: string;
  pergunta: string;
  /** R3: `null` = "indisponível" para aquela competência. */
  pct: number | null;
}

/**
 * Conteúdo gravado em `relatorios.conteudo`, já com a supressão (R1 a R7).
 * É a saída de `montarRelatorioPublicavel()` (A7), formato combinado com o
 * Daniel na revisão da A1 (versão 1).
 *
 * Atenção: o avaliado lê esta linha inteira pela API. Por isso aqui NÃO entram
 * contagens por grupo (R7: o avaliado não vê contagens; a GP as obtém pelas
 * atribuições).
 */
export type RelatorioPublicavel =
  | {
      versao: typeof VERSAO_RELATORIO;
      /** R1: menos de 2 avaliadores além da própria pessoa. */
      disponivel: false;
      aviso: string;
      autoavaliacao_pct: number | null;
    }
  | {
      versao: typeof VERSAO_RELATORIO;
      disponivel: true;
      /** R2. */
      nota_final_pct: number;
      /** R3. */
      competencias: CompetenciaPublicavel[];
      /** R4: `null` quando os grupos não podem aparecer separados. */
      grupos: { grupo: GrupoOutros; pct: number }[] | null;
      /** R4: "Outros avaliadores (combinado)", usado quando `grupos` é `null`. */
      outros_avaliadores_pct: number | null;
      /** R5. */
      autoavaliacao_pct: number | null;
      /** R6: `null` = indisponível; lista sem autor e sem grupo, em ordem neutra. */
      comentarios: string[] | null;
    };
