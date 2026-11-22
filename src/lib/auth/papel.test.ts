import { describe, expect, it } from "vitest";
import { ehPapel } from "./papel";

describe("ehPapel", () => {
  it("aceita só os três papéis", () => {
    expect(ehPapel("colaborador")).toBe(true);
    expect(ehPapel("lider")).toBe(true);
    expect(ehPapel("gp")).toBe(true);
  });
  it("rejeita qualquer outro valor", () => {
    for (const v of ["admin", "GP", "", null, undefined, 1]) expect(ehPapel(v)).toBe(false);
  });
});
