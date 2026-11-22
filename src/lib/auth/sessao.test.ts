import { beforeEach, describe, expect, it, vi } from "vitest";

// Simula o Supabase, o redirect do Next e o cache do React (fora do servidor do Next).
let claimsSub: string | undefined;
let perfil: { id: string; nome: string; papel: string } | null;

vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  cache: <T,>(fn: T) => fn,
}));
vi.mock("next/navigation", () => ({
  redirect: (destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  },
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getClaims: async () => ({ data: claimsSub ? { claims: { sub: claimsSub } } : null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: perfil, error: null }) }),
      }),
    }),
  }),
}));

const { getCurrentUser, requireRole } = await import("./sessao");

describe("requireRole e getCurrentUser", () => {
  beforeEach(() => {
    claimsSub = undefined;
    perfil = null;
  });

  it("sem sessão: redireciona para o login", async () => {
    await expect(requireRole("gp")).rejects.toThrow("REDIRECT:/auth/login");
    expect(await getCurrentUser()).toBeNull();
  });

  it("sessão sem perfil: acesso negado", async () => {
    claimsSub = "u1";
    await expect(requireRole("colaborador")).rejects.toThrow("REDIRECT:/acesso-negado");
  });

  it("papel desconhecido no banco: acesso negado", async () => {
    claimsSub = "u1";
    perfil = { id: "u1", nome: "Pessoa Teste", papel: "admin" };
    await expect(requireRole("gp")).rejects.toThrow("REDIRECT:/acesso-negado");
    expect(await getCurrentUser()).toBeNull();
  });

  it("colaborador recebe acesso negado em página e ação da GP", async () => {
    claimsSub = "u1";
    perfil = { id: "u1", nome: "Pessoa Teste", papel: "colaborador" };
    await expect(requireRole("gp")).rejects.toThrow("REDIRECT:/acesso-negado");
  });

  it("GP entra e recebe o usuário lido do banco", async () => {
    claimsSub = "u2";
    perfil = { id: "u2", nome: "Pessoa GP", papel: "gp" };
    await expect(requireRole("gp")).resolves.toEqual({ id: "u2", nome: "Pessoa GP", papel: "gp" });
  });
});
