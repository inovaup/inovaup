import { describe, expect, it } from "vitest";
import { itensDoMenu } from "./navegacao";

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
