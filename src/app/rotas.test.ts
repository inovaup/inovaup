import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const APP = path.resolve(__dirname);

function paginas(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const p = path.join(dir, nome);
    if (statSync(p).isDirectory()) return paginas(p);
    return nome === "page.tsx" ? [p] : [];
  });
}

describe("rotas", () => {
  it("não existe cadastro nem fluxo por e-mail", () => {
    for (const r of ["auth/sign-up", "auth/sign-up-success", "auth/forgot-password", "auth/update-password", "auth/confirm"]) {
      expect(existsSync(path.join(APP, r)), r).toBe(false);
    }
  });

  it("toda página da área autenticada chama requireRole()", () => {
    const lista = paginas(path.join(APP, "(app)"));
    expect(lista.length).toBeGreaterThan(0);
    for (const p of lista) expect(readFileSync(p, "utf8"), p).toContain("requireRole(");
  });

  it("Pessoas e squads é só da GP", () => {
    const fonte = readFileSync(path.join(APP, "(app)", "pessoas", "page.tsx"), "utf8");
    expect(fonte).toContain('requireRole("gp")');
  });
});
