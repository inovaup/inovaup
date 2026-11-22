// TIPOS SIMULADOS até o contrato I3 (src/contracts/avaliacao.ts, dono: Davi).
// Seguem o plano da A1 combinado em 22/11: seções com escala mínima e máxima,
// permite_na e ordem; competências com pergunta e ordem; respostas com valor
// inteiro ou vazio mais nao_se_aplica. Trocar pelos tipos reais quando o I3 entrar.

export type CompetenciaQuestionario = {
  id: string;
  pergunta: string;
  ordem: number;
};

export type SecaoQuestionario = {
  id: string;
  nome: string;
  escala_min: number;
  escala_max: number;
  permite_na: boolean;
  ordem: number;
  competencias: CompetenciaQuestionario[];
};

/** Resposta de uma competência enquanto o avaliador preenche. */
export type RespostaRascunho = {
  valor: number | null;
  nao_se_aplica: boolean;
};

export const RESPOSTA_VAZIA: RespostaRascunho = { valor: null, nao_se_aplica: false };
