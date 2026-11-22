import { describe, expect, it } from "vitest";
import { decidirAcesso, type Sessao } from "./acesso";

const usuario = (papel: "colaborador" | "lider" | "gp"): Sessao => ({
  tipo: "ok",
  usuario: { id: "u1", nome: "Pessoa Teste", papel },
});

describe("decidirAcesso", () => {
  it("sem sessão vai para o login", () => {
    expect(decidirAcesso({ tipo: "sem-sessao" }, ["gp"])).toBe("sem-sessao");
  });
  it("sessão sem perfil não entra", () => {
    expect(decidirAcesso({ tipo: "sem-perfil", id: "u1" }, ["colaborador"])).toBe("sem-perfil");
  });
  it("colaborador e líder são negados em área da GP", () => {
    expect(decidirAcesso(usuario("colaborador"), ["gp"])).toBe("negado");
    expect(decidirAcesso(usuario("lider"), ["gp"])).toBe("negado");
  });
  it("GP é permitida em área da GP", () => {
    expect(decidirAcesso(usuario("gp"), ["gp"])).toBe("permitido");
  });
  it("todos os papéis entram onde todos são permitidos", () => {
    for (const p of ["colaborador", "lider", "gp"] as const) {
      expect(decidirAcesso(usuario(p), ["colaborador", "lider", "gp"])).toBe("permitido");
    }
  });
});
