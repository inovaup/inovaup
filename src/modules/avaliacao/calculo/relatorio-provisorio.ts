/**
 * Stub da A7, até montarRelatorioPublicavel() entrar na main: grava
 * "indisponível" para todo mundo, nunca dados sem supressão (TAREFAS.md, A6).
 *
 * Quem juntar por último troca, em executar.ts, este stub pela função da A7
 * (src/modules/avaliacao/relatorio/supressao.ts) e apaga este arquivo.
 */
import { VERSAO_RELATORIO, type RelatorioPublicavel } from "@/contracts/avaliacao";

export const AVISO_PROVISORIO = "Relatório ainda indisponível.";

export function montarRelatorioProvisorio(): RelatorioPublicavel {
  return {
    versao: VERSAO_RELATORIO,
    disponivel: false,
    aviso: AVISO_PROVISORIO,
    autoavaliacao_pct: null,
  };
}
