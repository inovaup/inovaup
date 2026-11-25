import { describe, expect, it } from "vitest";
import { itemAtivo, itensDoMenu } from "./navegacao";

describe("menu por papel", () => {
  it("colaborador e líder veem Início, Avaliações e Meu relatório, sem Painel da GP nem Pessoas e squads", () => {
    for (const p of ["colaborador", "lider"] as const) {
      expect(itensDoMenu(p).map((i) => i.href)).toEqual(["/inicio", "/avaliacoes", "/relatorio"]);
    }
  });
  it("GP vê Início, Avaliações, Painel da GP e Pessoas e squads", () => {
    expect(itensDoMenu("gp").map((i) => i.href)).toEqual(["/inicio", "/avaliacoes", "/painel", "/pessoas"]);
  });
});

describe("página atual no menu", () => {
  it("marca a própria rota e as sub-rotas", () => {
    expect(itemAtivo("/inicio", "/inicio")).toBe(true);
    expect(itemAtivo("/avaliacoes/abc", "/avaliacoes")).toBe(true);
    expect(itemAtivo("/painel/relatorios/c1/p1", "/painel")).toBe(true);
  });
  it("não marca outra rota nem uma que só começa com as mesmas letras", () => {
    expect(itemAtivo("/inicio", "/avaliacoes")).toBe(false);
    expect(itemAtivo("/painelx", "/painel")).toBe(false);
    expect(itemAtivo("/relatorio", "/relatorios")).toBe(false);
  });
});
