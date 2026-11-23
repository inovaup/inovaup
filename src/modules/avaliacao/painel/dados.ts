// Leituras do painel da GP (A8), com a sessão da própria GP: a RLS da A1 deixa
// a GP ler ciclos e atribuições (mapa e status), mas NUNCA respostas nem comentários.
import type { Atribuicao, Ciclo } from "@/contracts/avaliacao";
import { createClient } from "@/lib/supabase/server";

export type CicloNoPainel = Pick<Ciclo, "id" | "nome" | "status" | "relatorios_liberados" | "criado_em"> & {
  /** Atribuições enviadas / total do ciclo ("X de Y avaliações respondidas"). */
  enviadas: number;
  total: number;
};

/** Conta enviadas e total por ciclo, a partir só do status das atribuições. */
export function contarPorCiclo(
  atribuicoes: Pick<Atribuicao, "ciclo_id" | "status">[],
): Map<string, { enviadas: number; total: number }> {
  const contagem = new Map<string, { enviadas: number; total: number }>();
  for (const a of atribuicoes) {
    const atual = contagem.get(a.ciclo_id) ?? { enviadas: 0, total: 0 };
    atual.total += 1;
    if (a.status === "enviada") atual.enviadas += 1;
    contagem.set(a.ciclo_id, atual);
  }
  return contagem;
}

export async function listarCiclosDoPainel(): Promise<CicloNoPainel[] | null> {
  const supabase = await createClient();
  const [ciclos, atribuicoes] = await Promise.all([
    supabase
      .from("ciclos")
      .select("id, nome, status, relatorios_liberados, criado_em")
      .order("criado_em", { ascending: false }),
    supabase.from("atribuicoes").select("ciclo_id, status"),
  ]);
  if (ciclos.error || atribuicoes.error) return null;

  const contagem = contarPorCiclo((atribuicoes.data ?? []) as Pick<Atribuicao, "ciclo_id" | "status">[]);
  return ((ciclos.data ?? []) as CicloNoPainel[]).map((c) => ({
    ...c,
    ...(contagem.get(c.id) ?? { enviadas: 0, total: 0 }),
  }));
}
