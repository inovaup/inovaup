/**
 * Testes do portão de executarCalculo() (I4): só a GP passa, e nada é lido
 * nem criado antes disso. A execução em si é testada em executar-ciclo.test.ts.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// O Next resolve "server-only" no build; o Vitest não o encontra, então é simulado aqui.
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/sessao", () => ({ requireRole: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({ falso: true })) }));
vi.mock("./executar-ciclo", () => ({ executarCiclo: vi.fn(async () => ({ avaliados: 2 })) }));

const { requireRole } = await import("@/lib/auth/sessao");
const { createClient } = await import("@supabase/supabase-js");
const { executarCiclo } = await import("./executar-ciclo");
const { montarRelatorioPublicavel } = await import("@/modules/avaliacao/relatorio/supressao");
const { executarCalculo } = await import("./executar");

describe("executarCalculo (I4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://supabase.falso.test");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("exige o papel GP antes de qualquer coisa", async () => {
    vi.mocked(requireRole).mockRejectedValueOnce(new Error("NEXT_REDIRECT /acesso-negado"));

    await expect(executarCalculo("ciclo-1")).rejects.toThrow("NEXT_REDIRECT");
    expect(requireRole).toHaveBeenCalledWith("gp");
    expect(createClient).not.toHaveBeenCalled();
    expect(executarCiclo).not.toHaveBeenCalled();
  });

  it("sem a configuração do Supabase, falha sem criar cliente", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

    await expect(executarCalculo("ciclo-1")).rejects.toThrow("Configuração do Supabase incompleta");
    expect(requireRole).toHaveBeenCalledWith("gp");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("depois do portão, executa o ciclo com a supressão da A7 e devolve o número de avaliados", async () => {
    // Valor falso, só para o teste: a chave real nunca é lida aqui.
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "chave-falsa-de-teste");

    await expect(executarCalculo("ciclo-1")).resolves.toEqual({ avaliados: 2 });
    expect(vi.mocked(requireRole).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(createClient).mock.invocationCallOrder[0],
    );
    expect(executarCiclo).toHaveBeenCalledWith({ falso: true }, "ciclo-1", montarRelatorioPublicavel);
  });
});
