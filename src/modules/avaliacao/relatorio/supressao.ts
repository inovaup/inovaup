// Supressão contra identificação indireta (A7): transforma o ResultadoCompleto
// do cálculo (A6) no RelatorioPublicavel que o executar.ts grava em `relatorios`.
// Regras R1 a R7 de docs/regras/seguranca-da-demo.md. Função pura: não lê banco,
// não grava nada e sempre devolve a mesma saída para a mesma entrada.
//
// A supressão acontece no dado, antes de gravar: o avaliado lê a linha inteira
// de `relatorios`, então nada aqui pode permitir deduzir a nota de um avaliador.
import {
  VERSAO_RELATORIO,
  type CompetenciaPublicavel,
  type Competencia,
  type RelatorioPublicavel,
  type ResultadoCompleto,
  type Secao,
} from "@/contracts/avaliacao";

/** Provisório até a GP responder a pergunta 7 (mínimo de respostas). */
export const MIN_AVALIADORES_POR_RECORTE = 2;

export const AVISO_INSUFICIENTE =
  "Resultado consolidado indisponível: número insuficiente de avaliadores para preservar o anonimato.";

/** O texto do questionário, para o relatório não precisar de outra consulta. */
export type QuestionarioDoCiclo = {
  secoes: Pick<Secao, "id" | "nome" | "ordem">[];
  competencias: Pick<Competencia, "id" | "secao_id" | "pergunta" | "ordem">[];
};

/** Percentual com 2 casas: é o que a tela mostra e não guarda precisão além do necessário. */
function arredondar(pct: number | null): number | null {
  return pct === null ? null : Math.round(pct * 100) / 100;
}

/** Hash FNV-1a de 32 bits: ordem neutra e estável para os comentários (R6). */
function hashTexto(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** R6: comentários sem autor e sem grupo, em ordem neutra (por hash do texto). */
export function ordenarComentarios(textos: string[]): string[] {
  return [...textos].sort((a, b) => hashTexto(a) - hashTexto(b) || (a < b ? -1 : a > b ? 1 : 0));
}

export function montarRelatorioPublicavel(
  resultado: ResultadoCompleto,
  questionario: QuestionarioDoCiclo,
): RelatorioPublicavel {
  const min = MIN_AVALIADORES_POR_RECORTE;
  const autoavaliacao_pct = arredondar(resultado.autoavaliacao_pct); // R5

  // R1: menos de 2 avaliadores além da própria pessoa → só a autoavaliação e o aviso.
  if (resultado.n_avaliadores_outros < min || resultado.nota_final_pct === null) {
    return { versao: VERSAO_RELATORIO, disponivel: false, aviso: AVISO_INSUFICIENTE, autoavaliacao_pct };
  }

  // R3: nota da competência só com 2 ou mais avaliadores além da própria pessoa
  // respondendo aquela competência (sem N/A). A lista vem do questionário, na ordem dele.
  const porId = new Map(resultado.competencias.map((c) => [c.competencia_id, c]));
  const ordemSecao = new Map(questionario.secoes.map((s) => [s.id, s.ordem]));
  const nomeSecao = new Map(questionario.secoes.map((s) => [s.id, s.nome]));
  const competencias: CompetenciaPublicavel[] = [...questionario.competencias]
    .sort(
      (a, b) =>
        (ordemSecao.get(a.secao_id) ?? 0) - (ordemSecao.get(b.secao_id) ?? 0) || a.ordem - b.ordem,
    )
    .map((c) => {
      const r = porId.get(c.id);
      const liberada = r !== undefined && r.n_avaliadores_outros >= min;
      return {
        competencia_id: c.id,
        secao_nome: nomeSecao.get(c.secao_id) ?? "",
        pergunta: c.pergunta,
        pct: liberada ? arredondar(r.pct) : null,
      };
    });

  // R4: grupos separados só se TODOS os grupos com respondentes tiverem 2 ou mais.
  // Se algum tiver 1, nenhum aparece separado (senão daria para deduzi-lo por subtração).
  const comRespondentes = resultado.grupos.filter((g) => g.n > 0 && g.pct !== null);
  const separar = comRespondentes.length > 0 && comRespondentes.every((g) => g.n >= min);
  const grupos = separar
    ? comRespondentes.map((g) => ({ grupo: g.grupo, pct: arredondar(g.pct) as number }))
    : null;
  const outros_avaliadores_pct = separar ? null : arredondar(resultado.outros_avaliadores.pct);

  // R6: comentários só se 2 ou mais avaliadores diferentes (além da própria pessoa) comentaram.
  const textos = resultado.comentarios.textos.filter((t) => t.trim().length > 0);
  const comentarios =
    resultado.comentarios.n_comentaristas >= min && textos.length > 0 ? ordenarComentarios(textos) : null;

  // R7: a saída não tem contagens nem nota de nenhum avaliador individual.
  return {
    versao: VERSAO_RELATORIO,
    disponivel: true,
    nota_final_pct: arredondar(resultado.nota_final_pct) as number, // R2
    competencias,
    grupos,
    outros_avaliadores_pct,
    autoavaliacao_pct,
    comentarios,
  };
}
