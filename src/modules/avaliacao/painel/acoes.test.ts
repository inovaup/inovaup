import { beforeEach, describe, expect, it, vi } from "vitest";

// Simula a sessão, o Supabase, o cálculo (I4) e o Next.
let papelLogado: "gp" | "colaborador" | null = "gp";
let erroRpc: Record<string, { code: string; message: string }> = {};
let calculoFalha = false;
const chamadas: string[] = [];

vi.mock("@/lib/auth/sessao", () => ({
  requireRole: async (...papeis: string[]) => {
    chamadas.push(`requireRole:${papeis.join(",")}`);
    if (!papelLogado) throw new Error("REDIRECT:/auth/login");
    if (!papeis.includes(papelLogado)) throw new Error("REDIRECT:/acesso-negado");
    return { id: "u", nome: "GP", papel: papelLogado };
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  unstable_rethrow: (erro: unknown) => {
    if (erro instanceof Error && erro.message.startsWith("REDIRECT:")) throw erro;
  },
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    rpc: async (nome: string) => {
      chamadas.push(`rpc:${nome}`);
      return { error: erroRpc[nome] ?? null };
    },
  }),
}));
vi.mock("@/modules/avaliacao/calculo/executar", () => ({
  executarCalculo: async () => {
    chamadas.push("executarCalculo");
    if (calculoFalha) throw new Error("falha no banco");
    return { avaliados: 5 };
  },
}));

const { abrirCiclo, calcularRelatorios, encerrarCiclo, liberarRelatorios } = await import("./acoes");

const CICLO = "11111111-1111-4111-8111-111111111111";

describe("ações do painel da GP (A8)", () => {
  beforeEach(() => {
    papelLogado = "gp";
    erroRpc = {};
    calculoFalha = false;
    chamadas.length = 0;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("só a GP: colaborador e visitante são redirecionados e nada é chamado", async () => {
    for (const papel of ["colaborador", null] as const) {
      papelLogado = papel;
      for (const acao of [abrirCiclo, encerrarCiclo, calcularRelatorios, liberarRelatorios]) {
        await expect(acao(CICLO)).rejects.toThrow("REDIRECT:");
      }
    }
    expect(chamadas.filter((c) => !c.startsWith("requireRole"))).toEqual([]);
    expect(new Set(chamadas)).toEqual(new Set(["requireRole:gp"]));
  });

  it("id inválido não chega ao banco", async () => {
    expect(await encerrarCiclo("1; drop table ciclos")).toEqual({ ok: false, erro: "Ciclo inválido." });
    expect(chamadas).toEqual(["requireRole:gp"]);
  });

  it("encerrar fecha o ciclo e em seguida dispara o cálculo", async () => {
    const r = await encerrarCiclo(CICLO);
    expect(r).toEqual({ ok: true, mensagem: "Ciclo encerrado. Relatórios calculados para 5 pessoa(s)." });
    expect(chamadas).toEqual(["requireRole:gp", "rpc:encerrar_ciclo", "executarCalculo"]);
  });

  it("se o banco recusa o encerramento, o cálculo não roda", async () => {
    erroRpc.encerrar_ciclo = { code: "P0001", message: "Só um ciclo aberto pode ser encerrado" };
    expect(await encerrarCiclo(CICLO)).toEqual({ ok: false, erro: "Só um ciclo aberto pode ser encerrado" });
    expect(chamadas).not.toContain("executarCalculo");
  });

  it("se o cálculo falha depois de encerrar, avisa e orienta a calcular de novo, sem vazar o erro", async () => {
    calculoFalha = true;
    const r = await encerrarCiclo(CICLO);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.erro).toContain("Calcular relatórios");
      expect(r.erro).not.toContain("falha no banco");
    }
  });

  it("calcular de novo chama só o cálculo", async () => {
    expect(await calcularRelatorios(CICLO)).toEqual({ ok: true, mensagem: "Relatórios calculados para 5 pessoa(s)." });
    expect(chamadas).toEqual(["requireRole:gp", "executarCalculo"]);
  });

  it("abrir e liberar usam as funções da A1; erro de permissão vira mensagem genérica", async () => {
    expect((await abrirCiclo(CICLO)).ok).toBe(true);
    expect((await liberarRelatorios(CICLO)).ok).toBe(true);
    expect(chamadas).toContain("rpc:abrir_ciclo");
    expect(chamadas).toContain("rpc:liberar_relatorios");

    erroRpc.liberar_relatorios = { code: "42501", message: "Só a GP pode liberar relatórios" };
    expect(await liberarRelatorios(CICLO)).toEqual({ ok: false, erro: "Não foi possível liberar os relatórios." });
  });
});
