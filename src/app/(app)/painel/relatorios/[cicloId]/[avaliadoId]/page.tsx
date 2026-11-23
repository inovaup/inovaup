import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/sessao";
import { carregarRelatorioDaPessoa } from "@/modules/avaliacao/relatorio/dados";
import { RelatorioView } from "@/modules/avaliacao/relatorio/relatorio-view";
import { ehUuid } from "@/modules/avaliacao/resposta/entrada";

// GP: o relatório de uma pessoa — o mesmo conteúdo suprimido que ela vê (R7:
// nenhuma nota de avaliador individual, nem para a GP).
export default async function RelatorioDaPessoaPage({
  params,
}: {
  params: Promise<{ cicloId: string; avaliadoId: string }>;
}) {
  await requireRole("gp");
  const { cicloId, avaliadoId } = await params;
  if (!ehUuid(cicloId) || !ehUuid(avaliadoId)) notFound();

  const relatorio = await carregarRelatorioDaPessoa(cicloId, avaliadoId);
  if (!relatorio) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/painel/relatorios/${cicloId}`} className="text-sm text-muted-foreground hover:underline">
        ← Relatórios do ciclo
      </Link>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{relatorio.nome}</h1>
        <p className="text-sm text-muted-foreground">
          {relatorio.ciclo_nome} · o mesmo relatório que a pessoa vê depois da liberação
        </p>
      </header>
      <RelatorioView conteudo={relatorio.conteudo} visao="gp" />
    </div>
  );
}
