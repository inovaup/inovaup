/**
 * Fluxo da avaliação pela API (A1/A2), com login real das contas fictícias e
 * só a chave publicável, do jeito que as telas usam o contrato I3.
 *
 * - Leituras: rodam no banco de dev compartilhado e no CI (precisam do ciclo da
 *   semente, `npm run seed`).
 * - Gravações (rascunho, envio): só no CI, contra o Supabase local (D-16).
 *
 * Sem configuração ou sem o ciclo da semente: pula na máquina local e FALHA no CI.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";
import type { MinhaAtribuicao } from "@/contracts/avaliacao";
import nucleo from "../../../../supabase/seed/nucleo.json";
import avaliacao from "../../../../supabase/seed/avaliacao.json";

const caminhoEnv = path.resolve(process.cwd(), ".env.local");
if (existsSync(caminhoEnv)) process.loadEnvFile(caminhoEnv);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const chavePublica = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const pessoas = Object.fromEntries(nucleo.pessoas.map((p) => [p.chave, p]));
const senhaDe = (chave: string): string => process.env[`DEMO_SENHA_${chave}`] ?? "";
const CONTAS = ["GP", "LIDER", "COLABORADOR1", "COLABORADOR2"];
const NO_CI = Boolean(process.env.CI);
const SEM_PERMISSAO = "42501";

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

// Configurado e com o ciclo da semente no banco?
let pronto = url !== "" && chavePublica !== "" && CONTAS.every((c) => senhaDe(c) !== "");
let cicloId = "";
if (pronto) {
  const gp = await entrar("GP");
  const { data } = await gp.from("ciclos").select("id").eq("nome", avaliacao.ciclo.nome);
  cicloId = data?.[0]?.id ?? "";
  pronto = cicloId !== "";
}
if (!pronto) {
  const aviso = "Fluxo da avaliação sem configuração ou sem o ciclo da semente: rode `npm run seed`.";
  if (NO_CI) throw new Error(aviso);
  console.warn(`${aviso} Pulando.`);
}

const totalAtribuicoes = avaliacao.atribuicoes.length;
const totalCompetencias = avaliacao.secoes.reduce((n, s) => n + s.competencias.length, 0);

describe.skipIf(!pronto)("fluxo da avaliação pela API (I3)", { timeout: 30_000 }, () => {
  let gp: SupabaseClient;
  let lider: SupabaseClient;
  let colaborador1: SupabaseClient;
  let colaborador2: SupabaseClient;
  let atribuicaoDemo: MinhaAtribuicao;
  let competenciasEmOrdem: string[];

  beforeAll(async () => {
    [gp, lider, colaborador1, colaborador2] = await Promise.all(CONTAS.map(entrar));

    const { data, error } = await colaborador1.rpc("minhas_atribuicoes");
    if (error) throw new Error(error.message);
    const linha = (data as MinhaAtribuicao[]).find(
      (a) => a.ciclo_id === cicloId && a.avaliado_nome === pessoas.CONSULTOR3.nome,
    );
    if (!linha) throw new Error("Atribuição da demo (Colaborador Um -> Consultor Três) não encontrada");
    atribuicaoDemo = linha;

    const { data: secoes } = await colaborador1
      .from("secoes")
      .select("id, ordem")
      .eq("ciclo_id", cicloId)
      .order("ordem");
    const { data: comps } = await colaborador1
      .from("competencias")
      .select("id, secao_id, ordem")
      .in("secao_id", (secoes ?? []).map((s) => s.id));
    const ordemDaSecao = new Map((secoes ?? []).map((s): [string, number] => [s.id, s.ordem]));
    competenciasEmOrdem = (comps ?? [])
      .sort((a, b) => ordemDaSecao.get(a.secao_id)! - ordemDaSecao.get(b.secao_id)! || a.ordem - b.ordem)
      .map((c) => c.id);
  }, 30_000);

  describe("leituras", () => {
    it("o avaliador vê a atribuição da demo, com só o nome do avaliado", () => {
      expect(atribuicaoDemo).toMatchObject({
        avaliado_nome: pessoas.CONSULTOR3.nome,
        grupo: "pares",
      });
      expect(["pendente", "enviada"]).toContain(atribuicaoDemo.status);
      expect(["aberto", "encerrado"]).toContain(atribuicaoDemo.ciclo_status);
      expect(Object.keys(atribuicaoDemo).sort()).toEqual(
        ["atribuicao_id", "avaliado_nome", "ciclo_id", "ciclo_nome", "ciclo_status", "grupo", "status"],
      );
    });

    it("o avaliador lê o questionário do ciclo (2 seções, 7 competências)", async () => {
      const { data: secoes } = await lider.from("secoes").select("id").eq("ciclo_id", cicloId);
      expect(secoes).toHaveLength(avaliacao.secoes.length);
      expect(competenciasEmOrdem).toHaveLength(totalCompetencias);
    });

    it("o avaliado não vê quem o avalia (caso C: só a própria autoavaliação)", async () => {
      const { data: perfil } = await colaborador2.from("perfis").select("id").single();
      const { data, error } = await colaborador2
        .from("atribuicoes")
        .select("avaliador_id, grupo")
        .eq("ciclo_id", cicloId);
      expect(error).toBeNull();
      expect(data).toEqual([{ avaliador_id: perfil?.id, grupo: "autoavaliacao" }]);
    });

    it("a GP lê o mapa todo, mas nenhuma resposta nem comentário", async () => {
      const { count } = await gp
        .from("atribuicoes")
        .select("id", { count: "exact", head: true })
        .eq("ciclo_id", cicloId);
      expect(count).toBe(totalAtribuicoes);

      const respostas = await gp.from("respostas").select("id");
      expect(respostas.error).toBeNull();
      expect(respostas.data).toEqual([]);
      const comentarios = await gp.from("comentarios").select("id");
      expect(comentarios.error).toBeNull();
      expect(comentarios.data).toEqual([]);
    });
  });

  // Gravam dados: só no CI (D-16). Rodam em sequência.
  describe.runIf(NO_CI)("gravações (só no CI)", () => {
    it("o avaliador salva o rascunho com upsert e regrava", async () => {
      const linhas = competenciasEmOrdem.map((id, i) => ({
        atribuicao_id: atribuicaoDemo.atribuicao_id,
        competencia_id: id,
        valor: i === 4 ? null : 7,
        nao_se_aplica: i === 4, // "Liderança" (Performance permite N/A)
      }));
      const primeiro = await colaborador1
        .from("respostas")
        .upsert(linhas, { onConflict: "atribuicao_id,competencia_id" });
      expect(primeiro.error).toBeNull();

      const segundo = await colaborador1
        .from("respostas")
        .upsert([{ ...linhas[0], valor: 9 }], { onConflict: "atribuicao_id,competencia_id" });
      expect(segundo.error).toBeNull();

      const comentario = await colaborador1.from("comentarios").upsert(
        [{ atribuicao_id: atribuicaoDemo.atribuicao_id, secao_id: (await secaoPerformance()).id, texto: "Bom par." }],
        { onConflict: "atribuicao_id,secao_id" },
      );
      expect(comentario.error).toBeNull();

      const { data } = await colaborador1
        .from("respostas")
        .select("competencia_id, valor")
        .eq("atribuicao_id", atribuicaoDemo.atribuicao_id);
      expect(data).toHaveLength(totalCompetencias);
      expect(data?.find((r) => r.competencia_id === competenciasEmOrdem[0])?.valor).toBe(9);
    });

    it("outro avaliador não lê nem altera a resposta do primeiro", async () => {
      const ler = await lider
        .from("respostas")
        .select("id")
        .eq("atribuicao_id", atribuicaoDemo.atribuicao_id);
      expect(ler.error).toBeNull();
      expect(ler.data).toEqual([]);

      const alterar = await lider
        .from("respostas")
        .update({ valor: 1 })
        .eq("atribuicao_id", atribuicaoDemo.atribuicao_id)
        .select("id");
      expect(alterar.data ?? []).toEqual([]);

      const invadir = await lider.from("respostas").upsert(
        [{ atribuicao_id: atribuicaoDemo.atribuicao_id, competencia_id: competenciasEmOrdem[0], valor: 1 }],
        { onConflict: "atribuicao_id,competencia_id" },
      );
      expect(invadir.error?.code).toBe(SEM_PERMISSAO);

      const comentarios = await lider
        .from("comentarios")
        .select("id")
        .eq("atribuicao_id", atribuicaoDemo.atribuicao_id);
      expect(comentarios.data).toEqual([]);

      const { data } = await colaborador1
        .from("respostas")
        .select("valor")
        .eq("atribuicao_id", atribuicaoDemo.atribuicao_id)
        .eq("competencia_id", competenciasEmOrdem[0])
        .single();
      expect(data?.valor).toBe(9);
    });

    it("depois de enviar, nada muda e não dá para enviar de novo", async () => {
      const enviar = await colaborador1.rpc("enviar_atribuicao", {
        p_atribuicao_id: atribuicaoDemo.atribuicao_id,
      });
      expect(enviar.error).toBeNull();

      const alterar = await colaborador1
        .from("respostas")
        .update({ valor: 1 })
        .eq("atribuicao_id", atribuicaoDemo.atribuicao_id)
        .select("id");
      expect(alterar.data ?? []).toEqual([]);

      const deNovo = await colaborador1.rpc("enviar_atribuicao", {
        p_atribuicao_id: atribuicaoDemo.atribuicao_id,
      });
      expect(deNovo.error?.message).toContain("já foi enviada");

      const { data } = await colaborador1.rpc("minhas_atribuicoes");
      const linha = (data as MinhaAtribuicao[]).find(
        (a) => a.atribuicao_id === atribuicaoDemo.atribuicao_id,
      );
      expect(linha?.status).toBe("enviada");
    });
  });

  async function secaoPerformance(): Promise<{ id: string }> {
    const { data } = await colaborador1
      .from("secoes")
      .select("id")
      .eq("ciclo_id", cicloId)
      .eq("nome", "Performance")
      .single();
    if (!data) throw new Error("Seção Performance não encontrada");
    return data;
  }
});
