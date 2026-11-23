import { beforeEach, describe, expect, it, vi } from "vitest";

// Confere que a leitura do "Meu relatório" filtra pela própria pessoa e usa a
// sessão do usuário (a RLS faz o resto: só depois da liberação).
const filtros: [string, string, unknown][] = [];

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (tabela: string) => {
      const consulta = {
        select: () => consulta,
        eq: (coluna: string, valor: unknown) => {
          filtros.push([tabela, coluna, valor]);
          return consulta;
        },
        in: () => consulta,
        order: async () => ({ data: [], error: null }),
        then: (ok: (v: unknown) => void) => ok({ data: [], error: null }),
      };
      return consulta;
    },
  }),
}));

const { listarMeusRelatorios } = await import("./dados");

describe("Meu relatório", () => {
  beforeEach(() => {
    filtros.length = 0;
  });

  it("lê só os relatórios em que a pessoa é a avaliada", async () => {
    expect(await listarMeusRelatorios("pessoa-1")).toEqual([]);
    expect(filtros).toEqual([["relatorios", "avaliado_id", "pessoa-1"]]);
  });
});
