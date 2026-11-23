// Regras puras da tela de resposta (A5). Espelham o que o banco confere na A1
// (o banco continua sendo a última palavra): valor dentro da escala, N/A só se a
// seção permitir, nunca valor e N/A juntos, comentário de até 2.000 caracteres.
import { LIMITE_COMENTARIO } from "@/contracts/avaliacao";
import {
  RESPOSTA_VAZIA,
  type RespostaRascunho,
  type SecaoQuestionario,
} from "./tipos";

export { LIMITE_COMENTARIO };

/** Opções da escala, em ordem crescente (ex.: 1 a 10). Vazio se a escala for inválida. */
export function opcoesDaEscala(min: number, max: number): number[] {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) return [];
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

/** A resposta respeita a escala e a regra de N/A da seção (vazia também é válida: é rascunho). */
export function respostaValida(resposta: RespostaRascunho, secao: SecaoQuestionario): boolean {
  if (resposta.nao_se_aplica) return secao.permite_na && resposta.valor === null;
  if (resposta.valor === null) return true;
  return (
    Number.isInteger(resposta.valor) &&
    resposta.valor >= secao.escala_min &&
    resposta.valor <= secao.escala_max
  );
}

/** A competência conta como respondida: um valor válido, ou N/A quando a seção permite. */
export function competenciaRespondida(
  resposta: RespostaRascunho | undefined,
  secao: SecaoQuestionario,
): boolean {
  if (!resposta || !respostaValida(resposta, secao)) return false;
  return resposta.nao_se_aplica || resposta.valor !== null;
}

/** Competências da seção que ainda faltam responder (ids, na ordem da seção). */
export function pendenciasDaSecao(
  secao: SecaoQuestionario,
  respostas: Record<string, RespostaRascunho>,
): string[] {
  return ordenarCompetencias(secao)
    .filter((c) => !competenciaRespondida(respostas[c.id], secao))
    .map((c) => c.id);
}

/** Competências em ordem crescente de `ordem`, sem alterar a seção original. */
export function ordenarCompetencias(secao: SecaoQuestionario) {
  return [...secao.competencias].sort((a, b) => a.ordem - b.ordem);
}

/** Comentário só com espaços não conta como comentário (regra R6 da supressão). */
export function comentarioTemConteudo(texto: string): boolean {
  return texto.trim().length > 0;
}

/** Nova resposta ao escolher um valor da escala (desmarca o N/A). */
export function escolherValor(valor: number): RespostaRascunho {
  return { valor, nao_se_aplica: false };
}

/** Nova resposta ao marcar ou desmarcar "Não se aplica" (limpa o valor). */
export function alternarNaoSeAplica(marcado: boolean): RespostaRascunho {
  return marcado ? { valor: null, nao_se_aplica: true } : RESPOSTA_VAZIA;
}
