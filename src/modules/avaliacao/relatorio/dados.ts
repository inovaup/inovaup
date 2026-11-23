// Leituras do relatório (A7), sempre com a sessão do usuário (RLS da A1):
// - o avaliado lê só o próprio relatório, e só depois da liberação;
// - a GP lê os relatórios de todos (o mesmo conteúdo, já suprimido).
// Nunca lê respostas nem comentários individuais.
import type { Ciclo, Relatorio } from "@/contracts/avaliacao";
import type { Perfil } from "@/contracts/core";
import { createClient } from "@/lib/supabase/server";

export type RelatorioComCiclo = Pick<Relatorio, "ciclo_id" | "conteudo" | "gerado_em"> & {
  ciclo_nome: string;
};

async function nomesDosCiclos(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.from("ciclos").select("id, nome").in("id", ids);
  return new Map(((data ?? []) as Pick<Ciclo, "id" | "nome">[]).map((c) => [c.id, c.nome]));
}

/** Os relatórios da própria pessoa que já foram liberados (a RLS esconde os outros). */
export async function listarMeusRelatorios(usuarioId: string): Promise<RelatorioComCiclo[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("relatorios")
    .select("ciclo_id, conteudo, gerado_em")
    .eq("avaliado_id", usuarioId)
    .order("gerado_em", { ascending: false });
  if (error) return null;
  const linhas = (data ?? []) as Pick<Relatorio, "ciclo_id" | "conteudo" | "gerado_em">[];
  const nomes = await nomesDosCiclos(linhas.map((l) => l.ciclo_id));
  return linhas.map((l) => ({ ...l, ciclo_nome: nomes.get(l.ciclo_id) ?? "" }));
}

export type AvaliadoDoCiclo = { avaliado_id: string; nome: string };

/** GP: quem tem relatório gravado no ciclo (com o nome). */
export async function listarAvaliadosDoCiclo(
  cicloId: string,
): Promise<{ ciclo: Pick<Ciclo, "id" | "nome" | "status" | "relatorios_liberados">; avaliados: AvaliadoDoCiclo[] } | null> {
  const supabase = await createClient();
  const { data: ciclo } = await supabase
    .from("ciclos")
    .select("id, nome, status, relatorios_liberados")
    .eq("id", cicloId)
    .maybeSingle();
  if (!ciclo) return null;

  const { data: relatorios, error } = await supabase
    .from("relatorios")
    .select("avaliado_id")
    .eq("ciclo_id", cicloId);
  if (error) return null;
  const ids = ((relatorios ?? []) as Pick<Relatorio, "avaliado_id">[]).map((r) => r.avaliado_id);
  if (ids.length === 0) return { ciclo, avaliados: [] };

  const { data: perfis } = await supabase.from("perfis").select("id, nome").in("id", ids);
  const nomePorId = new Map(((perfis ?? []) as Pick<Perfil, "id" | "nome">[]).map((p) => [p.id, p.nome]));
  const avaliados = ids
    .map((id) => ({ avaliado_id: id, nome: nomePorId.get(id) ?? "—" }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return { ciclo, avaliados };
}

/** GP: o relatório de uma pessoa num ciclo. */
export async function carregarRelatorioDaPessoa(
  cicloId: string,
  avaliadoId: string,
): Promise<{ conteudo: unknown; nome: string; ciclo_nome: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("relatorios")
    .select("conteudo")
    .eq("ciclo_id", cicloId)
    .eq("avaliado_id", avaliadoId)
    .maybeSingle();
  if (error || !data) return null;
  const [{ data: perfil }, nomes] = await Promise.all([
    supabase.from("perfis").select("nome").eq("id", avaliadoId).maybeSingle(),
    nomesDosCiclos([cicloId]),
  ]);
  return { conteudo: data.conteudo, nome: perfil?.nome ?? "—", ciclo_nome: nomes.get(cicloId) ?? "" };
}
