import { describe, expect, it } from "vitest";
import type { RelatorioPublicavel, ResultadoCompleto } from "@/contracts/avaliacao";
import {
  AVISO_INSUFICIENTE,
  MIN_AVALIADORES_POR_RECORTE,
  montarRelatorioPublicavel,
  ordenarComentarios,
  type QuestionarioDoCiclo,
} from "./supressao";

const questionario: QuestionarioDoCiclo = {
  secoes: [
    { id: "s2", nome: "Comportamental", ordem: 2 },
    { id: "s1", nome: "Performance", ordem: 1 },
  ],
  competencias: [
    { id: "c3", secao_id: "s2", pergunta: "Direcionamentos das lideranças", ordem: 1 },
    { id: "c2", secao_id: "s1", pergunta: "Preza pela organização", ordem: 2 },
    { id: "c1", secao_id: "s1", pergunta: "Cumpre prazos", ordem: 1 },
  ],
};

/** Caso 1 de docs/regras/calculo-da-nota.md: gestor único (n = 1) e 2 pares. */
function caso1(): ResultadoCompleto {
  return {
    ciclo_id: "ciclo",
    avaliado_id: "pessoa",
    nota_final_pct: 71.33333333,
    competencias: [
      { competencia_id: "c1", secao_id: "s1", pct: 76, n_avaliadores_outros: 3 },
      { competencia_id: "c2", secao_id: "s1", pct: 66.66666667, n_avaliadores_outros: 2 },
      { competencia_id: "c3", secao_id: "s2", pct: 80, n_avaliadores_outros: 3 },
    ],
    grupos: [
      { grupo: "gestor", pct: 90, n: 1 },
      { grupo: "pares", pct: 65, n: 2 },
      { grupo: "liderados", pct: null, n: 0 },
    ],
    outros_avaliadores: { pct: 72.5, n: 3 },
    autoavaliacao_pct: 70,
    n_avaliadores_outros: 3,
    comentarios: { textos: ["Muito organizado.", "Entrega no prazo."], n_comentaristas: 2 },
  };
}

function disponivel(r: RelatorioPublicavel) {
  if (!r.disponivel) throw new Error("esperava relatório disponível");
  return r;
}

describe("montarRelatorioPublicavel", () => {
  it("mínimo provisório é 2", () => {
    expect(MIN_AVALIADORES_POR_RECORTE).toBe(2);
  });

  it("R1: um só avaliador além da própria pessoa → só autoavaliação e aviso", () => {
    const r = montarRelatorioPublicavel(
      { ...caso1(), n_avaliadores_outros: 1, grupos: [{ grupo: "pares", pct: 80, n: 1 }] },
      questionario,
    );
    expect(r).toEqual({
      versao: 1,
      disponivel: false,
      aviso: AVISO_INSUFICIENTE,
      autoavaliacao_pct: 70,
    });
  });

  it("R1: sem nenhuma resposta de outros (nota final nula) também fica indisponível", () => {
    const r = montarRelatorioPublicavel({ ...caso1(), nota_final_pct: null }, questionario);
    expect(r.disponivel).toBe(false);
  });

  it("R2 e R5: nota final e autoavaliação com 2 casas (caso 1: 71,33% e 70%)", () => {
    const r = disponivel(montarRelatorioPublicavel(caso1(), questionario));
    expect(r.nota_final_pct).toBe(71.33);
    expect(r.autoavaliacao_pct).toBe(70);
    expect(r.versao).toBe(1);
  });

  it("R3: competência respondida por um só avaliador além da pessoa fica indisponível", () => {
    const base = caso1();
    base.competencias[1] = { ...base.competencias[1], n_avaliadores_outros: 1 };
    const r = disponivel(montarRelatorioPublicavel(base, questionario));
    expect(r.competencias.find((c) => c.competencia_id === "c2")?.pct).toBeNull();
    expect(r.competencias.find((c) => c.competencia_id === "c1")?.pct).toBe(76);
  });

  it("R3: competência sem nenhum resultado aparece como indisponível, com o texto", () => {
    const base = caso1();
    base.competencias = base.competencias.filter((c) => c.competencia_id !== "c3");
    const r = disponivel(montarRelatorioPublicavel(base, questionario));
    expect(r.competencias.find((c) => c.competencia_id === "c3")).toEqual({
      competencia_id: "c3",
      secao_nome: "Comportamental",
      pergunta: "Direcionamentos das lideranças",
      pct: null,
    });
  });

  it("competências na ordem das seções e das perguntas, com o texto do questionário", () => {
    const r = disponivel(montarRelatorioPublicavel(caso1(), questionario));
    expect(r.competencias.map((c) => [c.secao_nome, c.pergunta, c.pct])).toEqual([
      ["Performance", "Cumpre prazos", 76],
      ["Performance", "Preza pela organização", 66.67],
      ["Comportamental", "Direcionamentos das lideranças", 80],
    ]);
  });

  it("R4: gestor único e pares com 2 → sem grupos separados, só 'Outros avaliadores' (caso 1: 72,5%)", () => {
    const r = disponivel(montarRelatorioPublicavel(caso1(), questionario));
    expect(r.grupos).toBeNull();
    expect(r.outros_avaliadores_pct).toBe(72.5);
  });

  it("R4: todos os grupos com respondentes têm 2 ou mais → grupos aparecem separados", () => {
    const base = caso1();
    base.grupos = [
      { grupo: "gestor", pct: 88, n: 2 },
      { grupo: "pares", pct: 65, n: 2 },
      { grupo: "liderados", pct: 70.456, n: 3 },
    ];
    const r = disponivel(montarRelatorioPublicavel(base, questionario));
    expect(r.grupos).toEqual([
      { grupo: "gestor", pct: 88 },
      { grupo: "pares", pct: 65 },
      { grupo: "liderados", pct: 70.46 },
    ]);
    expect(r.outros_avaliadores_pct).toBeNull();
  });

  it("R4: grupo sem respondentes não conta nem aparece", () => {
    const base = caso1();
    base.grupos = [
      { grupo: "gestor", pct: null, n: 0 },
      { grupo: "pares", pct: 65, n: 2 },
      { grupo: "liderados", pct: 75, n: 2 },
    ];
    const r = disponivel(montarRelatorioPublicavel(base, questionario));
    expect(r.grupos?.map((g) => g.grupo)).toEqual(["pares", "liderados"]);
  });

  it("R6: comentários de um só avaliador não aparecem", () => {
    const base = caso1();
    base.comentarios = { textos: ["Único comentário."], n_comentaristas: 1 };
    const r = disponivel(montarRelatorioPublicavel(base, questionario));
    expect(r.comentarios).toBeNull();
  });

  it("R6: com 2 ou mais, aparecem sem autor, sem vazios e em ordem neutra estável", () => {
    const base = caso1();
    base.comentarios = { textos: ["B texto", "   ", "A texto", "C texto"], n_comentaristas: 3 };
    const r = disponivel(montarRelatorioPublicavel(base, questionario));
    expect(r.comentarios).toEqual(ordenarComentarios(["A texto", "B texto", "C texto"]));
    expect(r.comentarios).toHaveLength(3);
    // A ordem não depende da ordem de chegada (que poderia revelar quem escreveu).
    expect(ordenarComentarios(["C texto", "A texto", "B texto"])).toEqual(r.comentarios);
  });

  it("R7: o relatório não tem contagens nem campos de avaliador individual", () => {
    for (const r of [
      montarRelatorioPublicavel(caso1(), questionario),
      montarRelatorioPublicavel({ ...caso1(), n_avaliadores_outros: 1 }, questionario),
    ]) {
      const json = JSON.stringify(r);
      expect(json).not.toMatch(/"n"|n_avaliadores|n_comentaristas|avaliador_id|atribuicao/);
    }
  });

  it("é pura: não altera o resultado recebido", () => {
    const base = caso1();
    const copia = structuredClone(base);
    montarRelatorioPublicavel(base, questionario);
    expect(base).toEqual(copia);
  });
});
