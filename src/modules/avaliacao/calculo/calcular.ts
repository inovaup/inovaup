/**
 * Cálculo da nota da avaliação (A6), pela fórmula PROVISÓRIA de
 * docs/regras/calculo-da-nota.md (ainda não validada pela GP).
 *
 * Função pura: não lê banco nem grava nada, e a mesma entrada dá sempre a
 * mesma saída. O resultado fica só na memória do servidor e é a entrada de
 * montarRelatorioPublicavel() (A7), que aplica a supressão antes de gravar.
 *
 * Não devolve a nota de nenhum avaliador individual (R7): só médias por
 * grupo e contagens, sem ids de avaliador nem de atribuição.
 */
import {
  GRUPOS_AVALIADOR,
  type Atribuicao,
  type Comentario,
  type Competencia,
  type GrupoAvaliador,
  type GrupoOutros,
  type PesoGrupo,
  type Resposta,
  type ResultadoCompleto,
  type Secao,
} from "@/contracts/avaliacao";

/** O que o cálculo precisa saber do ciclo e de UM avaliado. */
export interface DadosDoAvaliado {
  ciclo_id: string;
  avaliado_id: string;
  secoes: Pick<Secao, "id" | "escala_max" | "peso">[];
  competencias: Pick<Competencia, "id" | "secao_id" | "peso">[];
  pesos_grupo: Pick<PesoGrupo, "grupo" | "peso">[];
  /** Atribuições em que esta pessoa é avaliada, pendentes também (o cálculo as ignora). */
  atribuicoes: Pick<Atribuicao, "id" | "avaliado_id" | "avaliador_id" | "grupo" | "status">[];
  respostas: Pick<Resposta, "atribuicao_id" | "competencia_id" | "valor" | "nao_se_aplica">[];
  comentarios: Pick<Comentario, "atribuicao_id" | "texto">[];
}

const GRUPOS_OUTROS = GRUPOS_AVALIADOR.filter(
  (g): g is GrupoOutros => g !== "autoavaliacao",
);

/** Média simples; `null` se não houver valores. */
function media(valores: number[] | undefined): number | null {
  if (!valores || valores.length === 0) return null;
  return valores.reduce((soma, v) => soma + v, 0) / valores.length;
}

/** Média ponderada só dos itens com valor; `null` se nenhum tiver. */
function mediaPonderada(itens: { valor: number | null; peso: number }[]): number | null {
  let soma = 0;
  let pesos = 0;
  for (const { valor, peso } of itens) {
    if (valor === null) continue;
    soma += peso * valor;
    pesos += peso;
  }
  return pesos === 0 ? null : soma / pesos;
}

export function calcularResultado(dados: DadosDoAvaliado): ResultadoCompleto {
  const secaoPorId = new Map(dados.secoes.map((s) => [s.id, s]));
  const competencias = dados.competencias.filter((c) => secaoPorId.has(c.secao_id));
  const competenciaPorId = new Map(competencias.map((c) => [c.id, c]));
  const pesoDoGrupo = new Map(dados.pesos_grupo.map((p) => [p.grupo, p.peso]));

  // Passo 1: só as atribuições enviadas desta pessoa.
  const enviadas = new Map(
    dados.atribuicoes
      .filter((a) => a.avaliado_id === dados.avaliado_id && a.status === "enviada")
      .map((a) => [a.id, a]),
  );

  // Passo 2: sem N/A e sem vazias. Valores por competência e grupo, e quem respondeu.
  const valores = new Map<string, Map<GrupoAvaliador, number[]>>();
  const respondentesDaCompetencia = new Map<string, Set<string>>(); // só os outros
  const respondentesDoGrupo = new Map<GrupoAvaliador, Set<string>>();
  for (const r of dados.respostas) {
    const atribuicao = enviadas.get(r.atribuicao_id);
    if (!atribuicao || r.nao_se_aplica || r.valor === null) continue;
    if (!competenciaPorId.has(r.competencia_id)) continue;

    const { grupo, avaliador_id } = atribuicao;
    if (!pesoDoGrupo.has(grupo)) {
      throw new Error(`O ciclo não tem peso para o grupo "${grupo}" (tabela pesos_grupo)`);
    }

    const porGrupo = valores.get(r.competencia_id) ?? new Map<GrupoAvaliador, number[]>();
    porGrupo.set(grupo, [...(porGrupo.get(grupo) ?? []), r.valor]);
    valores.set(r.competencia_id, porGrupo);

    respondentesDoGrupo.set(grupo, (respondentesDoGrupo.get(grupo) ?? new Set()).add(avaliador_id));
    if (grupo !== "autoavaliacao") {
      const quem = respondentesDaCompetencia.get(r.competencia_id) ?? new Set<string>();
      respondentesDaCompetencia.set(r.competencia_id, quem.add(avaliador_id));
    }
  }

  // Passo 3: G(g, c), média do grupo na competência.
  const notaDoGrupo = (grupo: GrupoAvaliador, competenciaId: string) =>
    media(valores.get(competenciaId)?.get(grupo));

  // Passo 4: S(c), combinando os grupos presentes pelos pesos deles.
  const notaCombinada = (grupos: readonly GrupoAvaliador[], competenciaId: string) =>
    mediaPonderada(
      grupos.map((g) => ({ valor: notaDoGrupo(g, competenciaId), peso: pesoDoGrupo.get(g) ?? 0 })),
    );

  // Passos 5 a 7: seções pelas competências, % pelo máximo da escala, final pelas seções.
  const percentualFinal = (notaDaCompetencia: (competenciaId: string) => number | null) =>
    mediaPonderada(
      dados.secoes.map((s) => {
        const nota = mediaPonderada(
          competencias
            .filter((c) => c.secao_id === s.id)
            .map((c) => ({ valor: notaDaCompetencia(c.id), peso: c.peso })),
        );
        return { valor: nota === null ? null : (nota / s.escala_max) * 100, peso: s.peso };
      }),
    );

  const outros = new Set(GRUPOS_OUTROS.flatMap((g) => [...(respondentesDoGrupo.get(g) ?? [])]));

  // Comentários de quem não é a própria pessoa, sem os vazios ou só com espaços.
  const textos: string[] = [];
  const comentaristas = new Set<string>();
  for (const c of dados.comentarios) {
    const atribuicao = enviadas.get(c.atribuicao_id);
    const texto = c.texto.trim();
    if (!atribuicao || atribuicao.grupo === "autoavaliacao" || texto === "") continue;
    textos.push(texto);
    comentaristas.add(atribuicao.avaliador_id);
  }

  return {
    ciclo_id: dados.ciclo_id,
    avaliado_id: dados.avaliado_id,
    nota_final_pct: percentualFinal((c) => notaCombinada(GRUPOS_AVALIADOR, c)),
    // Passo 8: % de cada competência.
    competencias: competencias.map((c) => {
      const nota = notaCombinada(GRUPOS_AVALIADOR, c.id);
      const escalaMax = secaoPorId.get(c.secao_id)!.escala_max;
      return {
        competencia_id: c.id,
        secao_id: c.secao_id,
        pct: nota === null ? null : (nota / escalaMax) * 100,
        n_avaliadores_outros: respondentesDaCompetencia.get(c.id)?.size ?? 0,
      };
    }),
    // Passo 9: por grupo, por "outros avaliadores" e a autoavaliação.
    grupos: GRUPOS_OUTROS.map((grupo) => ({
      grupo,
      pct: percentualFinal((c) => notaDoGrupo(grupo, c)),
      n: respondentesDoGrupo.get(grupo)?.size ?? 0,
    })),
    outros_avaliadores: {
      pct: percentualFinal((c) => notaCombinada(GRUPOS_OUTROS, c)),
      n: outros.size,
    },
    autoavaliacao_pct: percentualFinal((c) => notaDoGrupo("autoavaliacao", c)),
    n_avaliadores_outros: outros.size,
    comentarios: { textos, n_comentaristas: comentaristas.size },
  };
}
