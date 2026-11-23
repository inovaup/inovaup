/**
 * Testes do cálculo (A6) com os casos de referência de
 * docs/regras/calculo-da-nota.md e as regras de entrada (só enviadas, sem N/A,
 * comentários reunidos, nenhuma nota individual).
 */
import { describe, expect, it } from "vitest";
import type { GrupoAvaliador, ResultadoCompleto } from "@/contracts/avaliacao";
import { calcularResultado, type DadosDoAvaliado } from "./calcular";

const AVALIADO = "pessoa-avaliada";
const PESOS_TESTE = [
  { grupo: "autoavaliacao", peso: 1 },
  { grupo: "gestor", peso: 2 },
  { grupo: "pares", peso: 2 },
  { grupo: "liderados", peso: 2 },
] satisfies DadosDoAvaliado["pesos_grupo"];

type Nota = number | "NA" | null;

interface Avaliador {
  id: string;
  grupo: GrupoAvaliador;
  /** Uma nota por competência, na ordem do questionário. */
  notas: Nota[];
  pendente?: boolean;
  comentarios?: string[];
}

/** Monta os dados de um avaliado a partir de uma tabela "avaliador x competência". */
function montar(
  secoes: { id: string; escala_max: number; peso?: number; competencias: { id: string; peso?: number }[] }[],
  avaliadores: Avaliador[],
): DadosDoAvaliado {
  const competencias = secoes.flatMap((s) =>
    s.competencias.map((c) => ({ id: c.id, secao_id: s.id, peso: c.peso ?? 1 })),
  );
  return {
    ciclo_id: "ciclo",
    avaliado_id: AVALIADO,
    secoes: secoes.map((s) => ({ id: s.id, escala_max: s.escala_max, peso: s.peso ?? 1 })),
    competencias,
    pesos_grupo: PESOS_TESTE,
    atribuicoes: avaliadores.map((a) => ({
      id: `atrib-${a.id}`,
      avaliado_id: AVALIADO,
      avaliador_id: a.grupo === "autoavaliacao" ? AVALIADO : a.id,
      grupo: a.grupo,
      status: a.pendente ? "pendente" : "enviada",
    })),
    respostas: avaliadores.flatMap((a) =>
      a.notas.map((nota, i) => ({
        atribuicao_id: `atrib-${a.id}`,
        competencia_id: competencias[i].id,
        valor: typeof nota === "number" ? nota : null,
        nao_se_aplica: nota === "NA",
      })),
    ),
    comentarios: avaliadores.flatMap((a) =>
      (a.comentarios ?? []).map((texto) => ({ atribuicao_id: `atrib-${a.id}`, texto })),
    ),
  };
}

const grupo = (r: ResultadoCompleto, g: string) => r.grupos.find((x) => x.grupo === g)!;
const competencia = (r: ResultadoCompleto, id: string) =>
  r.competencias.find((c) => c.competencia_id === id)!;

describe("calcularResultado (A6), casos de referência", () => {
  it("caso 1: grupo ausente numa competência e N/A", () => {
    const r = calcularResultado(
      montar(
        [{ id: "S1", escala_max: 10, competencias: [{ id: "C1" }, { id: "C2" }] }],
        [
          { id: "auto", grupo: "autoavaliacao", notas: [8, 6] },
          { id: "gestor", grupo: "gestor", notas: [9, "NA"] },
          { id: "par1", grupo: "pares", notas: [7, 8] },
          { id: "par2", grupo: "pares", notas: [5, 6] },
        ],
      ),
    );

    expect(competencia(r, "C1").pct).toBeCloseTo(76, 6);
    expect(competencia(r, "C2").pct).toBeCloseTo(200 / 3, 6); // 66,67%
    expect(r.nota_final_pct).toBeCloseTo(214 / 3, 6); // 71,33%
    expect(r.autoavaliacao_pct).toBeCloseTo(70, 6);
    expect(grupo(r, "gestor")).toEqual({ grupo: "gestor", pct: expect.closeTo(90, 6), n: 1 });
    expect(grupo(r, "pares")).toEqual({ grupo: "pares", pct: expect.closeTo(65, 6), n: 2 });
    expect(grupo(r, "liderados")).toEqual({ grupo: "liderados", pct: null, n: 0 });
    expect(r.outros_avaliadores.pct).toBeCloseTo(72.5, 6);
    expect(r.outros_avaliadores.n).toBe(3);
    expect(r.n_avaliadores_outros).toBe(3);
    // R3: C2 teve só os 2 pares (o gestor marcou N/A).
    expect(competencia(r, "C1").n_avaliadores_outros).toBe(3);
    expect(competencia(r, "C2").n_avaliadores_outros).toBe(2);
  });

  it("caso 2: escalas diferentes e seções com pesos diferentes", () => {
    const r = calcularResultado(
      montar(
        [
          { id: "A", escala_max: 10, peso: 1, competencias: [{ id: "CA" }] },
          { id: "B", escala_max: 5, peso: 2, competencias: [{ id: "CB" }] },
        ],
        [
          { id: "par1", grupo: "pares", notas: [7, 3] },
          { id: "par2", grupo: "pares", notas: [9, 3] },
        ],
      ),
    );

    expect(competencia(r, "CA").pct).toBeCloseTo(80, 6);
    expect(competencia(r, "CB").pct).toBeCloseTo(60, 6);
    expect(r.nota_final_pct).toBeCloseTo(200 / 3, 6); // 66,67%
    expect(r.autoavaliacao_pct).toBeNull();
  });

  it("caso 3: competência toda N/A e seção sem respostas ficam fora", () => {
    const r = calcularResultado(
      montar(
        [
          { id: "Performance", escala_max: 10, competencias: [{ id: "C1" }, { id: "C2" }] },
          { id: "Comportamental", escala_max: 10, competencias: [{ id: "C3" }] },
        ],
        [
          { id: "par1", grupo: "pares", notas: [8, "NA", null] },
          { id: "par2", grupo: "pares", notas: [6, "NA", null] },
        ],
      ),
    );

    expect(competencia(r, "C1").pct).toBeCloseTo(70, 6);
    expect(competencia(r, "C2")).toMatchObject({ pct: null, n_avaliadores_outros: 0 });
    expect(competencia(r, "C3")).toMatchObject({ pct: null, n_avaliadores_outros: 0 });
    expect(r.nota_final_pct).toBeCloseTo(70, 6);
  });

  it("caso 4: um só avaliador além da própria pessoa, calculado normalmente", () => {
    const r = calcularResultado(
      montar(
        [{ id: "S1", escala_max: 10, competencias: [{ id: "C1" }] }],
        [
          { id: "auto", grupo: "autoavaliacao", notas: [9] },
          { id: "par1", grupo: "pares", notas: [7] },
        ],
      ),
    );

    expect(r.n_avaliadores_outros).toBe(1);
    expect(r.outros_avaliadores).toEqual({ pct: expect.closeTo(70, 6), n: 1 });
    // (1·9 + 2·7) / 3 = 7,6667
    expect(r.nota_final_pct).toBeCloseTo(230 / 3, 6);
    expect(r.autoavaliacao_pct).toBeCloseTo(90, 6);
  });
});

describe("calcularResultado (A6), regras de entrada", () => {
  const umaSecao = [{ id: "S1", escala_max: 10, competencias: [{ id: "C1" }, { id: "C2" }] }];

  it("ignora as atribuições pendentes, com rascunho e comentário", () => {
    const r = calcularResultado(
      montar(umaSecao, [
        { id: "par1", grupo: "pares", notas: [6, 6] },
        { id: "par2", grupo: "pares", notas: [10, 10], pendente: true, comentarios: ["Rascunho."] },
      ]),
    );

    expect(r.nota_final_pct).toBeCloseTo(60, 6);
    expect(grupo(r, "pares").n).toBe(1);
    expect(r.comentarios).toEqual({ textos: [], n_comentaristas: 0 });
  });

  it("ignora respostas vazias, e quem só marcou N/A não conta como avaliador", () => {
    const r = calcularResultado(
      montar(umaSecao, [
        { id: "par1", grupo: "pares", notas: [8, null] },
        { id: "par2", grupo: "pares", notas: ["NA", "NA"] },
      ]),
    );

    expect(competencia(r, "C1").pct).toBeCloseTo(80, 6);
    expect(competencia(r, "C2").pct).toBeNull();
    expect(r.n_avaliadores_outros).toBe(1);
    expect(grupo(r, "pares").n).toBe(1);
  });

  it("respeita os pesos das competências", () => {
    const r = calcularResultado(
      montar(
        [{ id: "S1", escala_max: 10, competencias: [{ id: "C1", peso: 3 }, { id: "C2", peso: 1 }] }],
        [{ id: "par1", grupo: "pares", notas: [10, 2] }],
      ),
    );

    // (3·10 + 1·2) / 4 = 8
    expect(r.nota_final_pct).toBeCloseTo(80, 6);
  });

  it("reúne os comentários dos outros: sem a autoavaliação, sem vazios, contando cada avaliador uma vez", () => {
    const r = calcularResultado(
      montar(umaSecao, [
        { id: "auto", grupo: "autoavaliacao", notas: [8, 8], comentarios: ["Sobre mim."] },
        { id: "gestor", grupo: "gestor", notas: [8, 8], comentarios: ["  Bom trabalho. ", "Organizado."] },
        { id: "par1", grupo: "pares", notas: [8, 8], comentarios: ["   ", ""] },
        { id: "par2", grupo: "pares", notas: [8, 8], comentarios: ["Ajuda o time."] },
      ]),
    );

    expect(r.comentarios.textos.sort()).toEqual(["Ajuda o time.", "Bom trabalho.", "Organizado."]);
    expect(r.comentarios.n_comentaristas).toBe(2);
  });

  it("sem nenhuma avaliação enviada, devolve tudo nulo e as contagens zeradas", () => {
    const r = calcularResultado(
      montar(umaSecao, [
        { id: "auto", grupo: "autoavaliacao", notas: [null, null], pendente: true },
        { id: "par1", grupo: "pares", notas: [null, null], pendente: true },
      ]),
    );

    expect(r).toEqual({
      ciclo_id: "ciclo",
      avaliado_id: AVALIADO,
      nota_final_pct: null,
      competencias: [
        { competencia_id: "C1", secao_id: "S1", pct: null, n_avaliadores_outros: 0 },
        { competencia_id: "C2", secao_id: "S1", pct: null, n_avaliadores_outros: 0 },
      ],
      grupos: [
        { grupo: "gestor", pct: null, n: 0 },
        { grupo: "pares", pct: null, n: 0 },
        { grupo: "liderados", pct: null, n: 0 },
      ],
      outros_avaliadores: { pct: null, n: 0 },
      autoavaliacao_pct: null,
      n_avaliadores_outros: 0,
      comentarios: { textos: [], n_comentaristas: 0 },
    });
  });

  it("ignora atribuições de outra pessoa avaliada", () => {
    const dados = montar(umaSecao, [{ id: "par1", grupo: "pares", notas: [6, 6] }]);
    dados.atribuicoes.push({
      id: "atrib-de-outra",
      avaliado_id: "outra-pessoa",
      avaliador_id: "par9",
      grupo: "pares",
      status: "enviada",
    });
    dados.respostas.push({
      atribuicao_id: "atrib-de-outra",
      competencia_id: "C1",
      valor: 10,
      nao_se_aplica: false,
    });

    const r = calcularResultado(dados);
    expect(r.nota_final_pct).toBeCloseTo(60, 6);
    expect(r.n_avaliadores_outros).toBe(1);
  });

  it("falha se um grupo com respostas não tiver peso no ciclo", () => {
    const dados = montar(umaSecao, [{ id: "lid1", grupo: "liderados", notas: [8, 8] }]);
    dados.pesos_grupo = dados.pesos_grupo.filter((p) => p.grupo !== "liderados");
    expect(() => calcularResultado(dados)).toThrow('"liderados"');
  });

  it("não devolve nota individual: nenhum id de avaliador nem de atribuição no resultado", () => {
    const dados = montar(umaSecao, [
      { id: "auto", grupo: "autoavaliacao", notas: [8, 6], comentarios: ["Eu."] },
      { id: "gestor-unico", grupo: "gestor", notas: [3, 4], comentarios: ["Texto."] },
      { id: "par1", grupo: "pares", notas: [7, 8] },
      { id: "par2", grupo: "pares", notas: [5, 6] },
    ]);
    const json = JSON.stringify(calcularResultado(dados));

    for (const a of dados.atribuicoes) {
      expect(json).not.toContain(a.id);
      if (a.avaliador_id !== AVALIADO) expect(json).not.toContain(a.avaliador_id);
    }
    expect(Object.keys(JSON.parse(json)).sort()).toEqual([
      "autoavaliacao_pct",
      "avaliado_id",
      "ciclo_id",
      "comentarios",
      "competencias",
      "grupos",
      "n_avaliadores_outros",
      "nota_final_pct",
      "outros_avaliadores",
    ]);
  });
});
