import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/sessao";
import { carregarAvaliacao } from "@/modules/avaliacao/resposta/dados";
import { ehUuid } from "@/modules/avaliacao/resposta/entrada";
import { FormularioAvaliacao } from "@/modules/avaliacao/resposta/formulario-avaliacao";

export default async function ResponderAvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("colaborador", "lider", "gp");
  const { id } = await params;
  // O id vem da URL: é entrada do usuário. Formato inválido ou atribuição de
  // outra pessoa dão a mesma resposta (404), sem revelar se ela existe.
  if (!ehUuid(id)) notFound();

  const avaliacao = await carregarAvaliacao(id);
  if (!avaliacao) notFound();

  const { atribuicao } = avaliacao;
  const somenteLeitura = atribuicao.status === "enviada" || atribuicao.ciclo_status !== "aberto";
  const titulo =
    atribuicao.grupo === "autoavaliacao" ? "Autoavaliação" : `Avaliação de ${atribuicao.avaliado_nome}`;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/avaliacoes" className="text-sm text-muted-foreground hover:underline">
        ← Minhas avaliações
      </Link>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <p className="text-sm text-muted-foreground">
          {atribuicao.ciclo_nome}
          {atribuicao.status === "enviada"
            ? " · Enviada (só leitura)"
            : atribuicao.ciclo_status !== "aberto"
              ? " · Ciclo encerrado (só leitura)"
              : " · Suas respostas não aparecem para a pessoa avaliada nem para a GP."}
        </p>
      </header>
      <FormularioAvaliacao
        atribuicaoId={atribuicao.atribuicao_id}
        secoes={avaliacao.secoes}
        respostasIniciais={avaliacao.respostas}
        comentariosIniciais={avaliacao.comentarios}
        somenteLeitura={somenteLeitura}
      />
    </div>
  );
}
