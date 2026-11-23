import Link from "next/link";
import type { MinhaAtribuicao } from "@/contracts/avaliacao";
import { requireRole } from "@/lib/auth/sessao";
import { listarMinhasAtribuicoes } from "@/modules/avaliacao/resposta/dados";

const NOME_DO_GRUPO: Record<MinhaAtribuicao["grupo"], string> = {
  autoavaliacao: "Autoavaliação",
  gestor: "Como gestor(a)",
  pares: "Como par",
  liderados: "Como liderado(a)",
};

function Linha({ a }: { a: MinhaAtribuicao }) {
  const pendente = a.status === "pendente" && a.ciclo_status === "aberto";
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b py-3">
      <div className="flex flex-col">
        <span className="font-medium">
          {a.grupo === "autoavaliacao" ? "Você mesmo(a)" : a.avaliado_nome}
        </span>
        <span className="text-xs text-muted-foreground">
          {NOME_DO_GRUPO[a.grupo]} · {a.ciclo_nome}
        </span>
      </div>
      <Link
        href={`/avaliacoes/${a.atribuicao_id}`}
        className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
      >
        {pendente ? "Responder" : "Ver"}
      </Link>
    </li>
  );
}

export default async function AvaliacoesPage() {
  await requireRole("colaborador", "lider", "gp");
  const atribuicoes = await listarMinhasAtribuicoes();

  if (!atribuicoes) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Minhas avaliações</h1>
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar as avaliações. Tente de novo em instantes.
        </p>
      </div>
    );
  }

  const pendentes = atribuicoes.filter((a) => a.status === "pendente" && a.ciclo_status === "aberto");
  const demais = atribuicoes.filter((a) => !pendentes.includes(a));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Minhas avaliações</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Pendentes ({pendentes.length})</h2>
        {pendentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma avaliação pendente.</p>
        ) : (
          <ul>{pendentes.map((a) => <Linha key={a.atribuicao_id} a={a} />)}</ul>
        )}
      </section>

      {demais.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Enviadas ou encerradas ({demais.length})</h2>
          <ul>{demais.map((a) => <Linha key={a.atribuicao_id} a={a} />)}</ul>
        </section>
      )}
    </div>
  );
}
