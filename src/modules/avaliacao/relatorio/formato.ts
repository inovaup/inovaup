// Leitura e formatação do relatório publicável (A7) para a tela. O conteúdo vem
// de `relatorios.conteudo` (jsonb), já suprimido pelo executar.ts; aqui só se
// confere o formato e se monta o texto. Nada é recalculado.
import { VERSAO_RELATORIO, type GrupoOutros, type RelatorioPublicavel } from "@/contracts/avaliacao";

export const NOME_DO_GRUPO: Record<GrupoOutros, string> = {
  gestor: "Gestor(a)",
  pares: "Pares",
  liderados: "Liderados",
};

/** "71,33%"; `null` vira "indisponível". */
export function formatarPct(pct: number | null): string {
  if (pct === null) return "indisponível";
  return `${pct.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

/** Aceita só o formato conhecido (versão 1); qualquer outra coisa não é exibida. */
export function lerRelatorio(conteudo: unknown): RelatorioPublicavel | null {
  if (typeof conteudo !== "object" || conteudo === null) return null;
  const r = conteudo as Partial<RelatorioPublicavel>;
  if (r.versao !== VERSAO_RELATORIO || typeof r.disponivel !== "boolean") return null;
  if (r.disponivel && !Array.isArray((r as { competencias?: unknown }).competencias)) return null;
  return r as RelatorioPublicavel;
}

export type SecaoDoRelatorio = {
  nome: string;
  competencias: { competencia_id: string; pergunta: string; pct: number | null }[];
};

/** Agrupa as competências pela seção, mantendo a ordem em que vieram (a do questionário). */
export function agruparPorSecao(
  competencias: { competencia_id: string; secao_nome: string; pergunta: string; pct: number | null }[],
): SecaoDoRelatorio[] {
  const secoes: SecaoDoRelatorio[] = [];
  for (const c of competencias) {
    let atual = secoes.at(-1);
    if (!atual || atual.nome !== c.secao_nome) {
      atual = { nome: c.secao_nome, competencias: [] };
      secoes.push(atual);
    }
    atual.competencias.push({ competencia_id: c.competencia_id, pergunta: c.pergunta, pct: c.pct });
  }
  return secoes;
}
