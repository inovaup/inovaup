"use server";

// Ações de servidor da resposta (A5). Cada uma confere a sessão com
// requireRole() e valida a entrada, porque pode ser chamada por um POST direto.
// Gravam com a sessão do próprio usuário: a RLS da A1 só deixa gravar nas
// próprias atribuições, com o ciclo aberto e a atribuição pendente.
import { revalidatePath } from "next/cache";
import { PAPEIS } from "@/contracts/core";
import { requireRole } from "@/lib/auth/sessao";
import { createClient } from "@/lib/supabase/server";
import { validarEntrada } from "./entrada";

export type ResultadoAcao = { ok: true } | { ok: false; erro: string };

const ERRO_FORMATO = "Não foi possível salvar: dados inválidos.";
const ERRO_GENERICO =
  "Não foi possível salvar. Confira se o ciclo ainda está aberto e se a avaliação não foi enviada.";

async function gravar(entrada: unknown): Promise<ResultadoAcao & { atribuicaoId?: string }> {
  // Fora de try/catch: requireRole() redireciona quem não tem sessão ou perfil.
  await requireRole(...PAPEIS);

  const dados = validarEntrada(entrada);
  if (!dados) return { ok: false, erro: ERRO_FORMATO };

  const supabase = await createClient();

  if (dados.respostas.length > 0) {
    const { error } = await supabase.from("respostas").upsert(
      dados.respostas.map((r) => ({ atribuicao_id: dados.atribuicaoId, ...r })),
      { onConflict: "atribuicao_id,competencia_id" },
    );
    if (error) return { ok: false, erro: ERRO_GENERICO };
  }

  if (dados.comentarios.length > 0) {
    const { error } = await supabase.from("comentarios").upsert(
      dados.comentarios.map((c) => ({ atribuicao_id: dados.atribuicaoId, ...c })),
      { onConflict: "atribuicao_id,secao_id" },
    );
    if (error) return { ok: false, erro: ERRO_GENERICO };
  }

  return { ok: true, atribuicaoId: dados.atribuicaoId };
}

/** Salva o rascunho (respostas e comentários). Pode ser chamada quantas vezes quiser. */
export async function salvarRascunho(entrada: unknown): Promise<ResultadoAcao> {
  const resultado = await gravar(entrada);
  if (!resultado.ok) return resultado;
  revalidatePath(`/avaliacoes/${resultado.atribuicaoId}`);
  return { ok: true };
}

/** Salva e envia. Depois de enviada, a avaliação não volta (o banco garante). */
export async function enviarAvaliacao(entrada: unknown): Promise<ResultadoAcao> {
  const resultado = await gravar(entrada);
  if (!resultado.ok) return resultado;

  const supabase = await createClient();
  const { error } = await supabase.rpc("enviar_atribuicao", {
    p_atribuicao_id: resultado.atribuicaoId,
  });
  if (error) {
    // As mensagens de enviar_atribuicao() (ex.: "Faltam 2 competência(s) sem
    // resposta") são para a pessoa; erros de permissão viram a mensagem genérica.
    const mensagemDoBanco = error.code === "P0001" ? error.message : null;
    return { ok: false, erro: mensagemDoBanco ?? "Não foi possível enviar a avaliação." };
  }

  revalidatePath("/avaliacoes");
  revalidatePath(`/avaliacoes/${resultado.atribuicaoId}`);
  return { ok: true };
}
