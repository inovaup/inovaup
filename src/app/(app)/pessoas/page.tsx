import { requireRole } from "@/lib/auth/sessao";
import { createClient } from "@/lib/supabase/server";

import type { ParticipacaoSquad, Perfil, Squad } from "@/contracts/core";

// Tipos do contrato I1 (src/contracts/core.ts), só com as colunas lidas aqui.
type PessoaLinha = Pick<Perfil, "id" | "nome" | "area" | "cargo" | "nivel" | "papel" | "situacao">;
type SquadLinha = Pick<Squad, "id" | "nome">;
type ParticipacaoLinha = Pick<ParticipacaoSquad, "squad_id" | "perfil_id" | "inicio" | "fim">;

export default async function PessoasPage() {
  await requireRole("gp");
  const supabase = await createClient();

  // Leitura com a sessão da própria GP: quem filtra é a RLS (a GP lê todos os perfis).
  const [pessoas, squads, participacoes] = await Promise.all([
    supabase
      .from("perfis")
      .select("id, nome, area, cargo, nivel, papel, situacao")
      .order("nome"),
    supabase.from("squads").select("id, nome").order("nome"),
    supabase.from("participacoes_squad").select("squad_id, perfil_id, inicio, fim"),
  ]);

  if (pessoas.error || squads.error || participacoes.error) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Pessoas e squads</h1>
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os dados. Tente de novo em instantes.
        </p>
      </div>
    );
  }

  const listaPessoas = (pessoas.data ?? []) as PessoaLinha[];
  const listaSquads = (squads.data ?? []) as SquadLinha[];
  const listaParticipacoes = (participacoes.data ?? []) as ParticipacaoLinha[];
  const nomePorId = new Map(listaPessoas.map((p) => [p.id, p.nome]));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Pessoas e squads</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Pessoas ({listaPessoas.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left border-b">
              <tr>
                <th className="py-2 pr-4">Nome</th>
                <th className="py-2 pr-4">Área</th>
                <th className="py-2 pr-4">Cargo</th>
                <th className="py-2 pr-4">Nível</th>
                <th className="py-2 pr-4">Papel</th>
                <th className="py-2 pr-4">Situação</th>
              </tr>
            </thead>
            <tbody>
              {listaPessoas.map((p) => (
                <tr key={p.id} className="border-b border-foreground/10">
                  <td className="py-2 pr-4">{p.nome}</td>
                  <td className="py-2 pr-4">{p.area ?? "—"}</td>
                  <td className="py-2 pr-4">{p.cargo ?? "—"}</td>
                  <td className="py-2 pr-4">{p.nivel ?? "—"}</td>
                  <td className="py-2 pr-4">{p.papel}</td>
                  <td className="py-2 pr-4">{p.situacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Squads ({listaSquads.length})</h2>
        <ul className="flex flex-col gap-3 text-sm">
          {listaSquads.map((s) => {
            const membros = listaParticipacoes
              .filter((p) => p.squad_id === s.id)
              .map((p) => ({
                nome: nomePorId.get(p.perfil_id) ?? "—",
                periodo: `${p.inicio} a ${p.fim ?? "atual"}`,
              }));
            return (
              <li key={s.id}>
                <span className="font-medium">{s.nome}</span>
                {membros.length === 0 ? (
                  <span className="text-muted-foreground"> (sem participantes)</span>
                ) : (
                  <ul className="ml-4 list-disc">
                    {membros.map((m, i) => (
                      <li key={i}>
                        {m.nome} <span className="text-muted-foreground">({m.periodo})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
