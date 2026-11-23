// Leituras da tela de resposta (A5), sempre com a sessão do próprio usuário:
// quem filtra é a RLS da A1 (o avaliador só vê as próprias atribuições,
// respostas e comentários). Nunca usa a service_role.
import type {
  Comentario,
  Competencia,
  MinhaAtribuicao,
  Resposta,
  Secao,
} from "@/contracts/avaliacao";
import { createClient } from "@/lib/supabase/server";
import type { RespostaRascunho, SecaoQuestionario } from "./tipos";

export async function listarMinhasAtribuicoes(): Promise<MinhaAtribuicao[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("minhas_atribuicoes");
  if (error) return null;
  return (data ?? []) as MinhaAtribuicao[];
}

export type AvaliacaoParaResponder = {
  atribuicao: MinhaAtribuicao;
  secoes: SecaoQuestionario[];
  respostas: Record<string, RespostaRascunho>;
  comentarios: Record<string, string>;
};

/** Carrega uma atribuição do próprio avaliador; `null` se não for dele ou não existir. */
export async function carregarAvaliacao(atribuicaoId: string): Promise<AvaliacaoParaResponder | null> {
  const minhas = await listarMinhasAtribuicoes();
  const atribuicao = minhas?.find((a) => a.atribuicao_id === atribuicaoId);
  if (!atribuicao) return null;

  const supabase = await createClient();
  const { data: secoes, error: erroSecoes } = await supabase
    .from("secoes")
    .select("id, ciclo_id, nome, escala_min, escala_max, permite_na, peso, ordem")
    .eq("ciclo_id", atribuicao.ciclo_id)
    .order("ordem");
  if (erroSecoes || !secoes) return null;

  const idsSecoes = (secoes as Secao[]).map((s) => s.id);
  const [competencias, respostas, comentarios] = await Promise.all([
    supabase
      .from("competencias")
      .select("id, secao_id, pergunta, peso, ordem")
      .in("secao_id", idsSecoes)
      .order("ordem"),
    supabase
      .from("respostas")
      .select("competencia_id, valor, nao_se_aplica")
      .eq("atribuicao_id", atribuicaoId),
    supabase.from("comentarios").select("secao_id, texto").eq("atribuicao_id", atribuicaoId),
  ]);
  if (competencias.error || respostas.error || comentarios.error) return null;

  const listaCompetencias = (competencias.data ?? []) as Competencia[];
  return {
    atribuicao,
    secoes: (secoes as Secao[]).map((s) => ({
      ...s,
      competencias: listaCompetencias.filter((c) => c.secao_id === s.id),
    })),
    respostas: Object.fromEntries(
      ((respostas.data ?? []) as Pick<Resposta, "competencia_id" | "valor" | "nao_se_aplica">[]).map(
        (r) => [r.competencia_id, { valor: r.valor, nao_se_aplica: r.nao_se_aplica }],
      ),
    ),
    comentarios: Object.fromEntries(
      ((comentarios.data ?? []) as Pick<Comentario, "secao_id" | "texto">[]).map((c) => [
        c.secao_id,
        c.texto,
      ]),
    ),
  };
}
