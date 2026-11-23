// Ponta a ponta sem banco: os dados da semente da demo (A2) passam pelo
// cálculo (A6) e pela supressão (A7). Prova o que cada pessoa verá na demo.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { GrupoAvaliador, RelatorioPublicavel } from "@/contracts/avaliacao";
import { calcularResultado } from "@/modules/avaliacao/calculo/calcular";
import { montarRelatorioPublicavel, type QuestionarioDoCiclo } from "./supressao";

type Semente = {
  pesos_grupo: Record<GrupoAvaliador, number>;
  secoes: { nome: string; escala_max: number; permite_na: boolean; peso: number; competencias: string[] }[];
  atribuicoes: {
    avaliado: string;
    avaliador: string;
    grupo: GrupoAvaliador;
    respostas?: (number | "NA")[];
    comentarios?: Record<string, string>;
    pendente?: boolean;
  }[];
};

const semente = JSON.parse(
  readFileSync(path.resolve(process.cwd(), "supabase/seed/avaliacao.json"), "utf8"),
) as Semente;

const secoes = semente.secoes.map((s, i) => ({ id: `s${i}`, nome: s.nome, escala_max: s.escala_max, peso: s.peso, ordem: i + 1 }));
const competencias = semente.secoes.flatMap((s, i) =>
  s.competencias.map((pergunta, j) => ({ id: `s${i}c${j}`, secao_id: `s${i}`, pergunta, peso: 1, ordem: j + 1 })),
);
const questionario: QuestionarioDoCiclo = { secoes, competencias };
const idDaSecao = new Map(semente.secoes.map((s, i) => [s.nome, `s${i}`]));

/** Relatório publicável de uma pessoa, como o executar.ts gravaria. */
function relatorioDe(avaliado: string, extras: { enviarPendentes?: (number | "NA")[] } = {}): RelatorioPublicavel {
  const suas = semente.atribuicoes
    .filter((a) => a.avaliado === avaliado)
    .map((a, i) => ({
      ...a,
      id: `${avaliado}-${i}`,
      respostas: a.pendente ? extras.enviarPendentes : a.respostas,
      status: a.pendente && !extras.enviarPendentes ? ("pendente" as const) : ("enviada" as const),
    }));
  const resultado = calcularResultado({
    ciclo_id: "demo",
    avaliado_id: avaliado,
    secoes,
    competencias,
    pesos_grupo: Object.entries(semente.pesos_grupo).map(([grupo, peso]) => ({ grupo: grupo as GrupoAvaliador, peso })),
    atribuicoes: suas.map((a) => ({ id: a.id, avaliado_id: a.avaliado, avaliador_id: a.avaliador, grupo: a.grupo, status: a.status })),
    respostas: suas.flatMap((a) =>
      (a.respostas ?? []).map((r, k) => ({
        atribuicao_id: a.id,
        competencia_id: competencias[k].id,
        valor: r === "NA" ? null : r,
        nao_se_aplica: r === "NA",
      })),
    ),
    comentarios: suas.flatMap((a) =>
      Object.entries(a.comentarios ?? {}).map(([secao, texto]) => ({ atribuicao_id: a.id, secao_id: idDaSecao.get(secao)!, texto })),
    ),
  });
  return montarRelatorioPublicavel(resultado, questionario);
}

function disponivel(r: RelatorioPublicavel) {
  if (!r.disponivel) throw new Error("esperava relatório disponível");
  return r;
}

describe("casos da semente da demo, do cálculo à supressão", () => {
  it("caso A (Líder): grupos separados, Liderança indisponível e comentários aparecem", () => {
    const r = disponivel(relatorioDe("LIDER"));
    expect(r.grupos?.map((g) => g.grupo)).toEqual(["gestor", "pares", "liderados"]);
    expect(r.outros_avaliadores_pct).toBeNull();
    expect(r.competencias.find((c) => c.pergunta === "Liderança")?.pct).toBeNull();
    expect(r.comentarios).toHaveLength(3); // o da autoavaliação não entra
    expect(r.comentarios).not.toContain("Quero melhorar a gestão do meu tempo.");
  });

  it("caso B (Colaborador Um): gestor único → só 'Outros avaliadores'; comentário de um só some", () => {
    const r = disponivel(relatorioDe("COLABORADOR1"));
    expect(r.grupos).toBeNull();
    expect(r.outros_avaliadores_pct).not.toBeNull();
    expect(r.comentarios).toBeNull();
  });

  it("caso C (Colaboradora Dois): só a autoavaliação e o aviso", () => {
    const r = relatorioDe("COLABORADOR2");
    expect(r.disponivel).toBe(false);
    expect(r.autoavaliacao_pct).not.toBeNull();
  });

  it("demo ao vivo (Consultor Três): indisponível antes; disponível depois das 2 pendentes", () => {
    expect(relatorioDe("CONSULTOR3").disponivel).toBe(false);
    const depois = disponivel(relatorioDe("CONSULTOR3", { enviarPendentes: [8, 9, 8, 7, "NA", 8, 9] }));
    expect(depois.grupos).toBeNull(); // gestor único (o Líder) → combinado
  });

  it("nenhum relatório da demo tem contagem ou dado de avaliador individual (R7)", () => {
    for (const pessoa of ["LIDER", "COLABORADOR1", "COLABORADOR2", "CONSULTOR3"]) {
      // ("outros_avaliadores_pct" é o combinado permitido pela R4; o proibido são contagens e ids)
      const json = JSON.stringify(relatorioDe(pessoa));
      expect(json).not.toMatch(/"n"|n_avaliadores|n_comentaristas|avaliador_id|atribuicao/);
      for (const avaliador of ["DIRETORA", "DIRETOR", "GERENTE1", "CONSULTOR5", "TRAINEE8"]) {
        expect(json).not.toContain(avaliador);
      }
    }
  });
});
