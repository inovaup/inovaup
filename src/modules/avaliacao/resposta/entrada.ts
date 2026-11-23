// Validação da entrada das ações de servidor da resposta (A5). As ações podem
// ser chamadas por um POST direto, então nada que vem do navegador é confiável:
// aqui conferimos só o formato. Dono, ciclo aberto, escala e N/A o banco confere (A1).
import { LIMITE_COMENTARIO } from "@/contracts/avaliacao";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ITENS = 200;

export type RespostaEnviada = { competencia_id: string; valor: number | null; nao_se_aplica: boolean };
export type ComentarioEnviado = { secao_id: string; texto: string };
export type EntradaRascunho = {
  atribuicaoId: string;
  respostas: RespostaEnviada[];
  comentarios: ComentarioEnviado[];
};

export function ehUuid(valor: unknown): valor is string {
  return typeof valor === "string" && UUID.test(valor);
}

function ehResposta(r: unknown): r is RespostaEnviada {
  if (typeof r !== "object" || r === null) return false;
  const { competencia_id, valor, nao_se_aplica } = r as Record<string, unknown>;
  if (!ehUuid(competencia_id) || typeof nao_se_aplica !== "boolean") return false;
  if (valor !== null && !(typeof valor === "number" && Number.isInteger(valor))) return false;
  return !(nao_se_aplica && valor !== null);
}

function ehComentario(c: unknown): c is ComentarioEnviado {
  if (typeof c !== "object" || c === null) return false;
  const { secao_id, texto } = c as Record<string, unknown>;
  return ehUuid(secao_id) && typeof texto === "string" && texto.length <= LIMITE_COMENTARIO;
}

/** Devolve a entrada limpa (só os campos esperados) ou `null` se o formato for inválido. */
export function validarEntrada(entrada: unknown): EntradaRascunho | null {
  if (typeof entrada !== "object" || entrada === null) return null;
  const { atribuicaoId, respostas, comentarios } = entrada as Record<string, unknown>;
  if (!ehUuid(atribuicaoId)) return null;
  if (!Array.isArray(respostas) || respostas.length > MAX_ITENS || !respostas.every(ehResposta)) {
    return null;
  }
  if (!Array.isArray(comentarios) || comentarios.length > MAX_ITENS || !comentarios.every(ehComentario)) {
    return null;
  }
  return {
    atribuicaoId,
    respostas: respostas.map(({ competencia_id, valor, nao_se_aplica }) => ({
      competencia_id,
      valor,
      nao_se_aplica,
    })),
    comentarios: comentarios.map(({ secao_id, texto }) => ({ secao_id, texto })),
  };
}
