/**
 * Testes de permissão do núcleo (F4), contra o banco de dev de quem roda
 * (no CI, contra o Supabase local). Entram de verdade com as contas
 * fictícias criadas por `npm run seed`, usando só a chave publicável.
 *
 * Precisa no .env.local: NEXT_PUBLIC_SUPABASE_URL,
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY e as DEMO_SENHA_* gravadas pela semente.
 * Sem isso, os testes são pulados na máquina local e FALHAM no CI.
 *
 * Testes que gravam dados só rodam no CI (D-16: banco de dev compartilhado).
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";
import type { ParticipacaoSquad, Perfil, Squad } from "@/contracts/core";
import dados from "../../../supabase/seed/nucleo.json";

const caminhoEnv = path.resolve(process.cwd(), ".env.local");
if (existsSync(caminhoEnv)) process.loadEnvFile(caminhoEnv);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const chavePublica = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const pessoas = Object.fromEntries(dados.pessoas.map((p) => [p.chave, p]));
const senhaDe = (chave: string): string => process.env[`DEMO_SENHA_${chave}`] ?? "";

const configurado =
  url !== "" && chavePublica !== "" && dados.pessoas.every((p) => senhaDe(p.chave) !== "");

if (!configurado) {
  const aviso =
    "Testes de RLS do núcleo sem configuração: preencha o .env.local e rode `npm run seed`.";
  if (process.env.CI) throw new Error(aviso);
  console.warn(`${aviso} Pulando.`);
}

// Colunas esperadas de cada tabela. O `satisfies` faz o TypeScript reclamar se
// faltar ou sobrar campo em relação aos tipos do contrato (src/contracts/core.ts).
const COLUNAS_PERFIL = {
  id: true,
  nome: true,
  email: true,
  area: true,
  cargo: true,
  nivel: true,
  papel: true,
  situacao: true,
  criado_em: true,
} satisfies Record<keyof Perfil, true>;

const COLUNAS_SQUAD = { id: true, nome: true, criado_em: true } satisfies Record<
  keyof Squad,
  true
>;

const COLUNAS_PARTICIPACAO = {
  id: true,
  perfil_id: true,
  squad_id: true,
  inicio: true,
  fim: true,
  criado_em: true,
} satisfies Record<keyof ParticipacaoSquad, true>;

const SEM_PERMISSAO = "42501"; // código do Postgres para "permission denied"

function clienteNovo(): SupabaseClient {
  return createClient(url, chavePublica, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function entrar(chave: string): Promise<SupabaseClient> {
  const cliente = clienteNovo();
  const { error } = await cliente.auth.signInWithPassword({
    email: pessoas[chave].email,
    password: senhaDe(chave),
  });
  if (error) throw new Error(`Login de ${chave} falhou: ${error.message}`);
  return cliente;
}

describe.skipIf(!configurado)("RLS do núcleo (F4)", { timeout: 30_000 }, () => {
  let anonimo: SupabaseClient;
  let colaborador: SupabaseClient;
  let lider: SupabaseClient;
  let gp: SupabaseClient;

  beforeAll(async () => {
    anonimo = clienteNovo();
    [colaborador, lider, gp] = await Promise.all([
      entrar("COLABORADOR1"),
      entrar("LIDER"),
      entrar("GP"),
    ]);
  }, 30_000);

  describe("visitante sem login", () => {
    it("não lê perfis, squads nem participações", async () => {
      for (const tabela of ["perfis", "squads", "participacoes_squad"]) {
        const { data, error } = await anonimo.from(tabela).select("id");
        expect(error?.code, tabela).toBe(SEM_PERMISSAO);
        expect(data, tabela).toBeNull();
      }
    });

    it("não executa eh_gp()", async () => {
      const { data, error } = await anonimo.rpc("eh_gp");
      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });
  });

  describe("colaborador", () => {
    it("lê só o próprio perfil", async () => {
      const { data, error } = await colaborador.from("perfis").select("email, papel");
      expect(error).toBeNull();
      expect(data).toEqual([{ email: pessoas.COLABORADOR1.email, papel: "colaborador" }]);
    });

    it("não lê o perfil de outra pessoa", async () => {
      for (const chave of ["GP", "LIDER", "COLABORADOR2"]) {
        const { data, error } = await colaborador
          .from("perfis")
          .select("id")
          .eq("email", pessoas[chave].email);
        expect(error).toBeNull();
        expect(data, chave).toEqual([]);
      }
    });

    it("não altera o próprio papel", async () => {
      const { error } = await colaborador
        .from("perfis")
        .update({ papel: "gp" })
        .eq("email", pessoas.COLABORADOR1.email);
      expect(error?.code).toBe(SEM_PERMISSAO);

      const { data } = await colaborador.from("perfis").select("papel").single();
      expect(data?.papel).toBe("colaborador");
    });

    it("não cria nem apaga perfis", async () => {
      const criar = await colaborador.from("perfis").insert({
        id: crypto.randomUUID(),
        nome: "Intruso",
        email: "intruso@demo.inovaup.test",
      });
      expect(criar.error?.code).toBe(SEM_PERMISSAO);

      const apagar = await colaborador
        .from("perfis")
        .delete()
        .eq("email", pessoas.COLABORADOR1.email);
      expect(apagar.error?.code).toBe(SEM_PERMISSAO);
    });

    it("não vê squads nem participações, nem as próprias", async () => {
      for (const tabela of ["squads", "participacoes_squad"]) {
        const { data, error } = await colaborador.from(tabela).select("id");
        expect(error, tabela).toBeNull();
        expect(data, tabela).toEqual([]);
      }
    });

    it("eh_gp() é false", async () => {
      const { data, error } = await colaborador.rpc("eh_gp");
      expect(error).toBeNull();
      expect(data).toBe(false);
    });

    // Grava (e desfaz) dados: pela D-16, só roda no CI, nunca no banco de dev compartilhado.
    it.runIf(Boolean(process.env.CI))("não vira GP escrevendo papel no próprio user_metadata", async () => {
      // O Supabase deixa qualquer usuário editar o próprio user_metadata.
      // Por isso o papel vem só de perfis.papel: isto não pode dar acesso de GP.
      const { error: erroMetadata } = await colaborador.auth.updateUser({ data: { papel: "gp" } });
      expect(erroMetadata).toBeNull();
      await colaborador.auth.refreshSession(); // token novo, já com o metadata alterado

      try {
        const { data: ehGp } = await colaborador.rpc("eh_gp");
        expect(ehGp).toBe(false);

        const { data: perfis } = await colaborador.from("perfis").select("id");
        expect(perfis).toHaveLength(1);
      } finally {
        await colaborador.auth.updateUser({ data: { papel: null } });
      }
    });
  });

  describe("líder (na demo, mesmas permissões do colaborador)", () => {
    it("lê só o próprio perfil", async () => {
      const { data, error } = await lider.from("perfis").select("email");
      expect(error).toBeNull();
      expect(data).toEqual([{ email: pessoas.LIDER.email }]);
    });

    it("não vê squads", async () => {
      const { data, error } = await lider.from("squads").select("id");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("não altera o próprio papel", async () => {
      const { error } = await lider
        .from("perfis")
        .update({ papel: "gp" })
        .eq("email", pessoas.LIDER.email);
      expect(error?.code).toBe(SEM_PERMISSAO);
    });
  });

  describe("GP", () => {
    it("lê todos os perfis", async () => {
      const { data, error } = await gp.from("perfis").select("email");
      expect(error).toBeNull();
      const emails = (data ?? []).map((p) => p.email);
      for (const pessoa of dados.pessoas) expect(emails).toContain(pessoa.email);
    });

    it("lê todos os squads e participações", async () => {
      const squads = await gp.from("squads").select("nome");
      expect(squads.error).toBeNull();
      const nomes = (squads.data ?? []).map((s) => s.nome);
      for (const nome of dados.squads) expect(nomes).toContain(nome);

      const participacoes = await gp.from("participacoes_squad").select("id");
      expect(participacoes.error).toBeNull();
      expect((participacoes.data ?? []).length).toBeGreaterThanOrEqual(dados.participacoes.length);
    });

    it("eh_gp() é true", async () => {
      const { data, error } = await gp.rpc("eh_gp");
      expect(error).toBeNull();
      expect(data).toBe(true);
    });

    it("também não altera papéis pela aplicação", async () => {
      const { error } = await gp
        .from("perfis")
        .update({ papel: "colaborador" })
        .eq("email", pessoas.LIDER.email);
      expect(error?.code).toBe(SEM_PERMISSAO);
    });
  });

  describe("contrato I1 (src/contracts/core.ts)", () => {
    it("as colunas das tabelas batem com os tipos do contrato", async () => {
      const casos = [
        ["perfis", COLUNAS_PERFIL],
        ["squads", COLUNAS_SQUAD],
        ["participacoes_squad", COLUNAS_PARTICIPACAO],
      ] as const;
      for (const [tabela, colunas] of casos) {
        const { data, error } = await gp.from(tabela).select("*").limit(1).single();
        expect(error, tabela).toBeNull();
        expect(Object.keys(data ?? {}).sort(), tabela).toEqual(Object.keys(colunas).sort());
      }
    });
  });
});
