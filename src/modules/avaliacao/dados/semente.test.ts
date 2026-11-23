/**
 * Confere os dados da semente da demonstração (A2) contra as regras da tarefa
 * e o que foi combinado com o Daniel. Não acessa banco: lê só os JSON.
 */
import { describe, expect, it } from "vitest";
import nucleo from "../../../../supabase/seed/nucleo.json";
import avaliacao from "../../../../supabase/seed/avaliacao.json";

type Atribuicao = (typeof avaliacao.atribuicoes)[number] & {
  respostas?: (number | string)[];
  comentarios?: Record<string, string>;
  pendente?: boolean;
};

const atribuicoes = avaliacao.atribuicoes as Atribuicao[];
const enviadas = atribuicoes.filter((a) => !a.pendente);
const pendentes = atribuicoes.filter((a) => a.pendente);
const competencias = avaliacao.secoes.flatMap((s) => s.competencias.map(() => s));

/** Enviadas de um caso, sem a autoavaliação. */
const outrosDo = (caso: string) =>
  enviadas.filter((a) => a.caso === caso && a.grupo !== "autoavaliacao");
const contarGrupo = (caso: string, grupo: string) =>
  outrosDo(caso).filter((a) => a.grupo === grupo).length;
const comentaristas = (caso: string) =>
  outrosDo(caso).filter((a) =>
    Object.values(a.comentarios ?? {}).some((t) => t.trim() !== ""),
  ).length;

describe("semente da demonstração (A2)", () => {
  it("tem de 12 a 15 pessoas fictícias", () => {
    expect(nucleo.pessoas.length).toBeGreaterThanOrEqual(12);
    expect(nucleo.pessoas.length).toBeLessThanOrEqual(15);
    for (const p of nucleo.pessoas) expect(p.email).toMatch(/@demo\.inovaup\.test$/);
  });

  it("usa o questionário TESTE com pesos 1/2/2/2", () => {
    const [performance, comportamental] = avaliacao.secoes;
    expect(performance).toMatchObject({ nome: "Performance", escala_min: 1, escala_max: 10, permite_na: true });
    expect(performance.competencias).toEqual([
      "Cumpre prazos",
      "Preza pela organização",
      "Faz entregas de qualidade",
      "Gestão de projetos",
      "Liderança",
    ]);
    expect(comportamental).toMatchObject({ nome: "Comportamental", escala_min: 1, escala_max: 10, permite_na: false });
    expect(comportamental.competencias).toEqual([
      "Apoio e reconhecimento por parte das lideranças",
      "Direcionamentos das lideranças",
    ]);
    expect(avaliacao.pesos_grupo).toEqual({ autoavaliacao: 1, gestor: 2, pares: 2, liderados: 2 });
    expect(avaliacao.ciclo.status).toBe("aberto");
  });

  it("monta um mapa válido: pessoas conhecidas, autoavaliação coerente, sem par repetido", () => {
    const chaves = new Set(nucleo.pessoas.map((p) => p.chave));
    const pares = new Set<string>();
    for (const a of atribuicoes) {
      expect(chaves.has(a.avaliado), a.avaliado).toBe(true);
      expect(chaves.has(a.avaliador), a.avaliador).toBe(true);
      expect(a.grupo === "autoavaliacao").toBe(a.avaliado === a.avaliador);
      const par = `${a.avaliador}->${a.avaliado}`;
      expect(pares.has(par), par).toBe(false);
      pares.add(par);
    }
    expect(atribuicoes.some((a) => a.avaliado === "GP")).toBe(false);
  });

  it("tem respostas completas e válidas em toda atribuição enviada", () => {
    for (const a of enviadas) {
      expect(a.respostas, `${a.avaliador}->${a.avaliado}`).toHaveLength(competencias.length);
      a.respostas?.forEach((r, i) => {
        const secao = competencias[i];
        if (r === "NA") expect(secao.permite_na).toBe(true);
        else {
          expect(r).toBeGreaterThanOrEqual(secao.escala_min);
          expect(r).toBeLessThanOrEqual(secao.escala_max);
        }
      });
    }
  });

  it("os três casos têm a autoavaliação enviada", () => {
    for (const caso of ["A", "B", "C"]) {
      expect(enviadas.some((a) => a.caso === caso && a.grupo === "autoavaliacao"), caso).toBe(true);
    }
  });

  it("caso A: 2 ou mais respondentes em cada grupo, comentários de 2 ou mais e uma competência com um só respondente", () => {
    for (const grupo of ["gestor", "pares", "liderados"]) {
      expect(contarGrupo("A", grupo), grupo).toBeGreaterThanOrEqual(2);
    }
    expect(comentaristas("A")).toBeGreaterThanOrEqual(2);
    const respondentesPorCompetencia = competencias.map(
      (_, i) => outrosDo("A").filter((a) => a.respostas?.[i] !== "NA").length,
    );
    expect(respondentesPorCompetencia).toContain(1); // R3: aparece como "indisponível"
  });

  it("caso B: gestor único (supressão complementar) e um só comentarista (R6)", () => {
    expect(contarGrupo("B", "gestor")).toBe(1);
    expect(contarGrupo("B", "pares")).toBeGreaterThanOrEqual(2);
    expect(comentaristas("B")).toBe(1);
  });

  it("caso C: só 1 avaliador além da própria pessoa (R1)", () => {
    expect(outrosDo("C")).toHaveLength(1);
  });

  it("2 atribuições pendentes para a demo, com o Colaborador Um e o Líder", () => {
    expect(pendentes).toHaveLength(2);
    expect(pendentes.map((a) => a.avaliador).sort()).toEqual(["COLABORADOR1", "LIDER"]);
    for (const a of pendentes) expect(a.respostas).toBeUndefined();
  });

  it("o avaliado das pendentes sai de 1 avaliador (indisponível) para 3 depois da demo", () => {
    const avaliado = pendentes[0].avaliado;
    expect(pendentes.every((a) => a.avaliado === avaliado)).toBe(true);
    const antes = enviadas.filter((a) => a.avaliado === avaliado && a.grupo !== "autoavaliacao");
    expect(antes).toHaveLength(1);
    expect(antes.length + pendentes.length).toBeGreaterThanOrEqual(2);
    expect(enviadas.some((a) => a.avaliado === avaliado && a.grupo === "autoavaliacao")).toBe(true);
  });
});
