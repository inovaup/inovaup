"use server";

// Ações do painel da GP (A8). Cada uma confere requireRole("gp") e valida o id,
// porque pode ser chamada por um POST direto. As mudanças de status são as
// funções da A1 (o banco confere as transições); o cálculo é o executarCalculo
// do I4, que é o único lugar com a service_role.
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireRole } from "@/lib/auth/sessao";
import { createClient } from "@/lib/supabase/server";
import { executarCalculo } from "@/modules/avaliacao/calculo/executar";
import { ehUuid } from "@/modules/avaliacao/resposta/entrada";

export type ResultadoPainel = { ok: true; mensagem: string } | { ok: false; erro: string };

const ID_INVALIDO: ResultadoPainel = { ok: false, erro: "Ciclo inválido." };

/** Mensagens das funções da A1 (ex.: "Já existe um ciclo aberto") são para a GP; o resto vira genérico. */
function mensagemDoBanco(error: { code?: string; message: string }, generica: string): string {
  return error.code === "P0001" ? error.message : generica;
}

async function chamarFuncao(nome: string, cicloId: string, generica: string): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.rpc(nome, { p_ciclo_id: cicloId });
  return error ? mensagemDoBanco(error, generica) : null;
}

/** Calcula e grava os relatórios do ciclo (I4). Pode rodar de novo até a liberação. */
async function calcular(cicloId: string): Promise<ResultadoPainel> {
  try {
    const { avaliados } = await executarCalculo(cicloId);
    return { ok: true, mensagem: `Relatórios calculados para ${avaliados} pessoa(s).` };
  } catch (erro) {
    unstable_rethrow(erro); // não engolir o redirect do requireRole
    console.error("Falha ao calcular os relatórios do ciclo", cicloId, erro);
    return {
      ok: false,
      erro: "Não foi possível calcular os relatórios. Use \"Calcular relatórios\" para tentar de novo.",
    };
  }
}

export async function abrirCiclo(cicloId: unknown): Promise<ResultadoPainel> {
  await requireRole("gp");
  if (!ehUuid(cicloId)) return ID_INVALIDO;
  const erro = await chamarFuncao("abrir_ciclo", cicloId, "Não foi possível abrir o ciclo.");
  revalidatePath("/painel");
  return erro ? { ok: false, erro } : { ok: true, mensagem: "Ciclo aberto." };
}

/** Encerra o ciclo e, em seguida, dispara o cálculo dos relatórios. */
export async function encerrarCiclo(cicloId: unknown): Promise<ResultadoPainel> {
  await requireRole("gp");
  if (!ehUuid(cicloId)) return ID_INVALIDO;
  const erro = await chamarFuncao("encerrar_ciclo", cicloId, "Não foi possível encerrar o ciclo.");
  if (erro) {
    revalidatePath("/painel");
    return { ok: false, erro };
  }
  const resultado = await calcular(cicloId);
  revalidatePath("/painel");
  return resultado.ok
    ? { ok: true, mensagem: `Ciclo encerrado. ${resultado.mensagem}` }
    : { ok: false, erro: `Ciclo encerrado, mas o cálculo falhou. ${resultado.erro}` };
}

/** Recalcula (se o cálculo falhou ao encerrar). O I4 recusa depois da liberação. */
export async function calcularRelatorios(cicloId: unknown): Promise<ResultadoPainel> {
  await requireRole("gp");
  if (!ehUuid(cicloId)) return ID_INVALIDO;
  const resultado = await calcular(cicloId);
  revalidatePath("/painel");
  return resultado;
}

export async function liberarRelatorios(cicloId: unknown): Promise<ResultadoPainel> {
  await requireRole("gp");
  if (!ehUuid(cicloId)) return ID_INVALIDO;
  const erro = await chamarFuncao("liberar_relatorios", cicloId, "Não foi possível liberar os relatórios.");
  revalidatePath("/painel");
  return erro ? { ok: false, erro } : { ok: true, mensagem: "Relatórios liberados para as pessoas avaliadas." };
}
