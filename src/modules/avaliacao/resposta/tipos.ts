// Tipos da tela de resposta montados a partir do contrato I3
// (src/contracts/avaliacao.ts, dono: Davi). Não duplicam tabelas: só juntam
// a seção com as suas competências e recortam o que a tela edita.
import type { Competencia, Resposta, Secao } from "@/contracts/avaliacao";

/** Uma seção do ciclo com as suas competências, como a tela mostra. */
export type SecaoQuestionario = Secao & { competencias: Competencia[] };

/** O que o avaliador edita numa competência (o resto da linha vem do banco). */
export type RespostaRascunho = Pick<Resposta, "valor" | "nao_se_aplica">;

export const RESPOSTA_VAZIA: RespostaRascunho = { valor: null, nao_se_aplica: false };
