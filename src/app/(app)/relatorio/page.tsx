import { requireRole } from "@/lib/auth/sessao";
import { listarMeusRelatorios } from "@/modules/avaliacao/relatorio/dados";
import { RelatorioView } from "@/modules/avaliacao/relatorio/relatorio-view";

// O próprio relatório, só depois que a GP libera (quem garante é a RLS da A1:
// antes da liberação a consulta não devolve nada). Nunca o relatório de outra pessoa.
export default async function MeuRelatorioPage() {
  const usuario = await requireRole("colaborador", "lider", "gp");
  const relatorios = await listarMeusRelatorios(usuario.id);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Meu relatório</h1>
      {!relatorios ? (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar o relatório. Tente de novo em instantes.
        </p>
      ) : relatorios.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Seu relatório aparece aqui depois que a Gestão de Pessoas liberar os resultados do ciclo.
        </p>
      ) : (
        relatorios.map((r) => (
          <section key={r.ciclo_id} className="flex flex-col gap-4 rounded-lg border p-5">
            <h2 className="text-lg font-semibold">{r.ciclo_nome}</h2>
            <RelatorioView conteudo={r.conteudo} />
          </section>
        ))
      )}
    </div>
  );
}
