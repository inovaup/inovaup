import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Simula a sessão (requireRole), o Supabase e o cache do Next.
let logado = true;
let erroUpsert: { code: string; message: string } | null = null;
let erroRpc: { code: string; message: string } | null = null;
const chamadas: { tipo: string; tabela?: string; linhas?: unknown; opcoes?: unknown; args?: unknown }[] = [];

vi.mock("@/lib/auth/sessao", () => ({
  requireRole: async () => {
    if (!logado) throw new Error("REDIRECT:/auth/login");
    return { id: "u1", nome: "Teste", papel: "colaborador" };
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (tabela: string) => ({
      upsert: async (linhas: unknown, opcoes: unknown) => {
        chamadas.push({ tipo: "upsert", tabela, linhas, opcoes });
        return { error: erroUpsert };
      },
    }),
    rpc: async (nome: string, args: unknown) => {
      chamadas.push({ tipo: "rpc", tabela: nome, args });
      return { error: erroRpc };
    },
  }),
}));

const { enviarAvaliacao, salvarRascunho } = await import("./acoes");

const A = "11111111-1111-4111-8111-111111111111";
const C = "22222222-2222-4222-8222-222222222222";
const S = "33333333-3333-4333-8333-333333333333";
const entrada = {
  atribuicaoId: A,
  respostas: [{ competencia_id: C, valor: 8, nao_se_aplica: false }],
  comentarios: [{ secao_id: S, texto: "ok" }],
};

describe("ações da resposta", () => {
  beforeEach(() => {
    logado = true;
    erroUpsert = null;
    erroRpc = null;
    chamadas.length = 0;
  });

  it("sem sessão: redireciona e não grava nada", async () => {
    logado = false;
    await expect(salvarRascunho(entrada)).rejects.toThrow("REDIRECT:/auth/login");
    await expect(enviarAvaliacao(entrada)).rejects.toThrow("REDIRECT:/auth/login");
    expect(chamadas).toEqual([]);
  });

  it("entrada inválida: não grava nada", async () => {
    const r = await salvarRascunho({ ...entrada, atribuicaoId: "x" });
    expect(r.ok).toBe(false);
    expect(chamadas).toEqual([]);
  });

  it("salva com upsert nas chaves combinadas, só na atribuição pedida", async () => {
    const r = await salvarRascunho(entrada);
    expect(r).toEqual({ ok: true });
    expect(chamadas).toEqual([
      {
        tipo: "upsert",
        tabela: "respostas",
        linhas: [{ atribuicao_id: A, competencia_id: C, valor: 8, nao_se_aplica: false }],
        opcoes: { onConflict: "atribuicao_id,competencia_id" },
      },
      {
        tipo: "upsert",
        tabela: "comentarios",
        linhas: [{ atribuicao_id: A, secao_id: S, texto: "ok" }],
        opcoes: { onConflict: "atribuicao_id,secao_id" },
      },
    ]);
  });

  it("se a RLS recusar (outro avaliador, ciclo fechado ou já enviada): erro genérico e não envia", async () => {
    erroUpsert = { code: "42501", message: "new row violates row-level security policy" };
    const r = await enviarAvaliacao(entrada);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).not.toContain("row-level");
    expect(chamadas.some((c) => c.tipo === "rpc")).toBe(false);
  });

  it("enviar: salva e chama enviar_atribuicao com o id", async () => {
    const r = await enviarAvaliacao(entrada);
    expect(r).toEqual({ ok: true });
    expect(chamadas.at(-1)).toEqual({ tipo: "rpc", tabela: "enviar_atribuicao", args: { p_atribuicao_id: A } });
  });

  it("enviar: mostra a mensagem do banco só quando é para a pessoa", async () => {
    erroRpc = { code: "P0001", message: "Faltam 2 competência(s) sem resposta" };
    expect(await enviarAvaliacao(entrada)).toEqual({ ok: false, erro: "Faltam 2 competência(s) sem resposta" });
    erroRpc = { code: "42501", message: "Atribuição não encontrada" };
    expect(await enviarAvaliacao(entrada)).toEqual({ ok: false, erro: "Não foi possível enviar a avaliação." });
  });

  it("nunca usa a service_role (só a sessão do usuário)", () => {
    for (const arquivo of ["acoes.ts", "dados.ts"]) {
      const fonte = readFileSync(path.join(__dirname, arquivo), "utf8");
      // A chave só é lida pelo nome da variável; o comentário "nunca usa a service_role" pode ficar.
      expect(fonte, arquivo).not.toMatch(/SERVICE_ROLE_KEY|@supabase\/supabase-js/);
      expect(fonte, arquivo).toContain('from "@/lib/supabase/server"');
    }
  });
});
