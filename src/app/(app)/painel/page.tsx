import type { StatusCiclo } from "@/contracts/avaliacao";
import { requireRole } from "@/lib/auth/sessao";
import { AcoesDoCiclo } from "@/modules/avaliacao/painel/acoes-do-ciclo";
import { listarCiclosDoPainel } from "@/modules/avaliacao/painel/dados";

const NOME_DO_STATUS: Record<StatusCiclo, string> = {
  rascunho: "Rascunho",
  aberto: "Aberto",
  encerrado: "Encerrado",
};

// Painel reduzido da GP (A8): só os botões do ciclo e o contador. Sem tabelas
// por pessoa, filtros, reabertura, reenvio, liberação individual, edição ou exportação.
export default async function PainelPage() {
  await requireRole("gp");
  const ciclos = await listarCiclosDoPainel();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Painel da GP</h1>
      {!ciclos ? (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os ciclos. Tente de novo em instantes.
        </p>
      ) : ciclos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum ciclo cadastrado.</p>
      ) : (
        ciclos.map((c) => (
          <section key={c.id} className="flex flex-col gap-4 rounded-lg border p-5">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">{c.nome}</h2>
              <span className="rounded-full border px-2.5 py-0.5 text-xs">
                {NOME_DO_STATUS[c.status]}
                {c.status === "encerrado" && (c.relatorios_liberados ? " · relatórios liberados" : " · relatórios não liberados")}
              </span>
            </header>
            <p className="text-sm">
              <strong>
                {c.enviadas} de {c.total}
              </strong>{" "}
              avaliações respondidas
            </p>
            <AcoesDoCiclo cicloId={c.id} status={c.status} liberados={c.relatorios_liberados} />
          </section>
        ))
      )}
      <p className="text-xs text-muted-foreground">
        A nota usa a fórmula provisória (ainda não validada pela GP). Respostas individuais não
        aparecem aqui: os relatórios só mostram o que passa pelas regras de anonimato.
      </p>
    </div>
  );
}
