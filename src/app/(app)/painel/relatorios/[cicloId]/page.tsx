import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/sessao";
import { listarAvaliadosDoCiclo } from "@/modules/avaliacao/relatorio/dados";
import { ehUuid } from "@/modules/avaliacao/resposta/entrada";

// GP: as pessoas avaliadas do ciclo, para abrir o relatório de qualquer uma.
export default async function RelatoriosDoCicloPage({
  params,
}: {
  params: Promise<{ cicloId: string }>;
}) {
  await requireRole("gp");
  const { cicloId } = await params;
  if (!ehUuid(cicloId)) notFound();

  const dados = await listarAvaliadosDoCiclo(cicloId);
  if (!dados) notFound();
  const { ciclo, avaliados } = dados;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/painel" className="text-sm text-muted-foreground hover:underline">
        ← Painel da GP
      </Link>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Relatórios: {ciclo.nome}</h1>
        <p className="text-sm text-muted-foreground">
          {ciclo.relatorios_liberados
            ? "Liberados: cada pessoa já vê o próprio relatório."
            : "Ainda não liberados: só a GP vê. Confira antes de liberar."}
        </p>
      </header>
      {avaliados.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum relatório calculado. Encerre o ciclo (ou use &quot;Calcular relatórios&quot;) no painel.
        </p>
      ) : (
        <ul>
          {avaliados.map((a) => (
            <li key={a.avaliado_id} className="flex items-center justify-between gap-2 border-b py-3">
              <span>{a.nome}</span>
              <Link
                href={`/painel/relatorios/${ciclo.id}/${a.avaliado_id}`}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
              >
                Ver relatório
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
