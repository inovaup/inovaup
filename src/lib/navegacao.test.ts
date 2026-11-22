import { describe, expect, it } from "vitest";
import { itensDoMenu } from "./navegacao";

describe("menu por papel", () => {
  it("colaborador e líder não veem Pessoas e squads", () => {
    for (const p of ["colaborador", "lider"] as const) {
      expect(itensDoMenu(p).map((i) => i.href)).toEqual(["/inicio"]);
    }
  });
  it("GP vê Início e Pessoas e squads", () => {
    expect(itensDoMenu("gp").map((i) => i.href)).toEqual(["/inicio", "/pessoas"]);
  });
});
