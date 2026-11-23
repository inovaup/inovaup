/**
 * Execução do cálculo de um ciclo (A6, contrato I4): lê o ciclo, calcula cada
 * avaliado, monta o relatório publicável e grava SÓ esse relatório.
 *
 * Recebe o cliente do Supabase e a função que monta o relatório, para poder
 * ser testado com um cliente falso. Quem usa de verdade é o executar.ts
 * (server-only, chave service_role, depois de requireRole("gp")). Não importe
 * este arquivo em outro lugar.
 *
 * Regras combinadas com o Daniel (A6/A8):
 * - só com o ciclo encerrado (a ação da GP chama encerrar_ciclo() antes);
 * - recusa depois da liberação, para não trocar um relatório que o avaliado já viu;
 * - pode rodar de novo enquanto não liberar (upsert por ciclo e avaliado);
 * - grava um relatório para CADA avaliado do ciclo, mesmo sem nenhuma avaliação
 *   enviada, senão liberar_relatorios() não libera;
 * - o ResultadoCompleto (com contagens por grupo) nunca é gravado.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Atribuicao,
  Comentario,
  Competencia,
  PesoGrupo,
  RelatorioPublicavel,
  Resposta,
  ResultadoCompleto,
  Secao,
} from "@/contracts/avaliacao";
import { calcularResultado } from "./calcular";

/** O texto do questionário que o relatório usa (mesmo formato da A7). */
export type QuestionarioDoCiclo = {
  secoes: Pick<Secao, "id" | "nome" | "ordem">[];
  competencias: Pick<Competencia, "id" | "secao_id" | "pergunta" | "ordem">[];
};

/** A função da A7 (montarRelatorioPublicavel) ou, até ela chegar, o stub. */
export type MontarRelatorio = (
  resultado: ResultadoCompleto,
  questionario: QuestionarioDoCiclo,
) => RelatorioPublicavel;

type Erro = { message: string } | null;
type Pagina<T> = PromiseLike<{ data: T[] | null; error: Erro }>;

/**
 * Lê todas as linhas, página por página. O Supabase devolve no máximo
 * `max_rows` linhas por consulta (1000 por padrão); continua até vir uma página vazia.
 */
async function lerTodas<T>(oQue: string, pagina: (de: number, ate: number) => Pagina<T>): Promise<T[]> {
  const linhas: T[] = [];
  for (;;) {
    const de = linhas.length;
    const { data, error } = await pagina(de, de + 999);
    if (error) throw new Error(`Falha ao ler ${oQue}: ${error.message}`);
    if (!data || data.length === 0) return linhas;
    linhas.push(...data);
  }
}

/** Agrupa as linhas pela chave. */
function agrupar<T>(linhas: T[], chave: (linha: T) => string): Map<string, T[]> {
  const grupos = new Map<string, T[]>();
  for (const l of linhas) grupos.set(chave(l), [...(grupos.get(chave(l)) ?? []), l]);
  return grupos;
}

export async function executarCiclo(
  cliente: SupabaseClient,
  cicloId: string,
  montar: MontarRelatorio,
): Promise<{ avaliados: number }> {
  const { data: ciclo, error: erroCiclo } = await cliente
    .from("ciclos")
    .select("id, status, relatorios_liberados")
    .eq("id", cicloId)
    .maybeSingle();
  if (erroCiclo) throw new Error(`Falha ao ler o ciclo: ${erroCiclo.message}`);
  if (!ciclo) throw new Error("Ciclo não encontrado");
  if (ciclo.status !== "encerrado") {
    throw new Error("Só um ciclo encerrado pode ter os relatórios calculados");
  }
  if (ciclo.relatorios_liberados) {
    throw new Error("Os relatórios deste ciclo já foram liberados e não podem ser recalculados");
  }

  type LinhaSecao = Pick<Secao, "id" | "nome" | "escala_max" | "peso" | "ordem">;
  type LinhaCompetencia = Pick<Competencia, "id" | "secao_id" | "pergunta" | "peso" | "ordem">;
  type LinhaAtribuicao = Pick<Atribuicao, "id" | "avaliado_id" | "avaliador_id" | "grupo" | "status">;
  type LinhaResposta = Pick<Resposta, "atribuicao_id" | "competencia_id" | "valor" | "nao_se_aplica">;
  type LinhaComentario = Pick<Comentario, "atribuicao_id" | "texto">;

  const secoes = (
    await lerTodas<LinhaSecao>("as seções", (de, ate) =>
      cliente
        .from("secoes")
        .select("id, nome, escala_max, peso, ordem")
        .eq("ciclo_id", cicloId)
        .order("id")
        .range(de, ate),
    )
  ).map((s) => ({ ...s, peso: Number(s.peso) })); // numeric pode chegar como texto

  const secaoIds = secoes.map((s) => s.id);
  const competencias =
    secaoIds.length === 0
      ? []
      : (
          await lerTodas<LinhaCompetencia>("as competências", (de, ate) =>
            cliente
              .from("competencias")
              .select("id, secao_id, pergunta, peso, ordem")
              .in("secao_id", secaoIds)
              .order("id")
              .range(de, ate),
          )
        ).map((c) => ({ ...c, peso: Number(c.peso) }));

  const pesosGrupo = (
    await lerTodas<Pick<PesoGrupo, "grupo" | "peso">>("os pesos dos grupos", (de, ate) =>
      cliente
        .from("pesos_grupo")
        .select("grupo, peso")
        .eq("ciclo_id", cicloId)
        .order("grupo")
        .range(de, ate),
    )
  ).map((p) => ({ ...p, peso: Number(p.peso) }));

  const atribuicoes = await lerTodas<LinhaAtribuicao>("as atribuições", (de, ate) =>
    cliente
      .from("atribuicoes")
      .select("id, avaliado_id, avaliador_id, grupo, status")
      .eq("ciclo_id", cicloId)
      .order("id")
      .range(de, ate),
  );

  // Pelas competências e seções do ciclo (listas curtas e com índice), e não
  // por atribuição. O cálculo descarta as que não estão enviadas.
  const competenciaIds = competencias.map((c) => c.id);
  const respostas =
    competenciaIds.length === 0
      ? []
      : await lerTodas<LinhaResposta>("as respostas", (de, ate) =>
          cliente
            .from("respostas")
            .select("atribuicao_id, competencia_id, valor, nao_se_aplica")
            .in("competencia_id", competenciaIds)
            .order("id")
            .range(de, ate),
        );
  const comentarios =
    secaoIds.length === 0
      ? []
      : await lerTodas<LinhaComentario>("os comentários", (de, ate) =>
          cliente
            .from("comentarios")
            .select("atribuicao_id, texto")
            .in("secao_id", secaoIds)
            .order("id")
            .range(de, ate),
        );

  const questionario: QuestionarioDoCiclo = {
    secoes: secoes.map(({ id, nome, ordem }) => ({ id, nome, ordem })),
    competencias: competencias.map(({ id, secao_id, pergunta, ordem }) => ({
      id,
      secao_id,
      pergunta,
      ordem,
    })),
  };

  const atribuicoesDoAvaliado = agrupar(atribuicoes, (a) => a.avaliado_id);
  const respostasDaAtribuicao = agrupar(respostas, (r) => r.atribuicao_id);
  const comentariosDaAtribuicao = agrupar(comentarios, (c) => c.atribuicao_id);
  const gerado_em = new Date().toISOString();

  // Todo avaliado do ciclo, inclusive quem só tem atribuições pendentes.
  const relatorios = [...atribuicoesDoAvaliado].map(([avaliado_id, suas]) => {
    const resultado = calcularResultado({
      ciclo_id: cicloId,
      avaliado_id,
      secoes,
      competencias,
      pesos_grupo: pesosGrupo,
      atribuicoes: suas,
      respostas: suas.flatMap((a) => respostasDaAtribuicao.get(a.id) ?? []),
      comentarios: suas.flatMap((a) => comentariosDaAtribuicao.get(a.id) ?? []),
    });
    return { ciclo_id: cicloId, avaliado_id, conteudo: montar(resultado, questionario), gerado_em };
  });

  if (relatorios.length > 0) {
    const { error } = await cliente
      .from("relatorios")
      .upsert(relatorios, { onConflict: "ciclo_id,avaliado_id" });
    if (error) throw new Error(`Falha ao gravar os relatórios: ${error.message}`);
  }
  return { avaliados: relatorios.length };
}
