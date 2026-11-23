/**
 * Fluxo da avaliação pela API (A1/A2/Q1), com login real das contas fictícias
 * e só a chave publicável, do jeito que as telas usam o contrato I3.
 *
 * - Leituras: rodam no banco de dev compartilhado e no CI (precisam do ciclo da
 *   semente, `npm run seed`).
 * - Gravações (rascunho, envio, fim do ciclo): só no CI, contra o Supabase
 *   local (D-16). Com CI ligado e URL que não seja local, o arquivo falha antes
 *   de qualquer consulta.
 *
 * Sem configuração ou sem o ciclo da semente: pula na máquina local e FALHA no CI.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { MinhaAtribuicao, RelatorioPublicavel } from "@/contracts/avaliacao";
import { executarCalculo } from "@/modules/avaliacao/calculo/executar";
import nucleo from "../../../../supabase/seed/nucleo.json";
import avaliacao from "../../../../supabase/seed/avaliacao.json";

// O fim do ciclo chama o executarCalculo de verdade (I4), como o botão da GP.
// Ele é server-only e confere requireRole("gp") pelos cookies do Next; aqui os
// dois são simulados. A chave secreta é lida só dentro do executar.ts.
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/sessao", () => ({
  requireRole: vi.fn(async () => ({ id: "gp-de-teste", nome: "GP", papel: "gp" })),
}));

const caminhoEnv = path.resolve(process.cwd(), ".env.local");
if (existsSync(caminhoEnv)) process.loadEnvFile(caminhoEnv);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const chavePublica = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const pessoas = Object.fromEntries(nucleo.pessoas.map((p) => [p.chave, p]));
const senhaDe = (chave: string): string => process.env[`DEMO_SENHA_${chave}`] ?? "";
const CONTAS = ["GP", "LIDER", "COLABORADOR1", "COLABORADOR2"];
const NO_CI = Boolean(process.env.CI);
const SEM_PERMISSAO = "42501";

// Trava das gravações: CI ligado E Supabase local. Nunca o banco de dev compartilhado.
const BANCO_LOCAL = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/.test(url);
if (NO_CI && !BANCO_LOCAL) {
  throw new Error("Com CI ligado, estes testes gravam: só rodam contra o Supabase local (127.0.0.1).");
}
const GRAVA = NO_CI && BANCO_LOCAL;

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
const avaliadosDaSemente = new Set(avaliacao.atribuicoes.map((a) => a.avaliado));

describe.skipIf(!pronto)("fluxo da avaliação pela API (I3)", { timeout: 30_000 }, () => {
  let gp: SupabaseClient;
  let lider: SupabaseClient;
  let colaborador1: SupabaseClient;
  let colaborador2: SupabaseClient;
  let atribuicaoDemo: MinhaAtribuicao;
  let competenciasEmOrdem: string[];
  /** id do perfil de cada pessoa da semente, pela chave (lido pela GP). */
  const idDe = new Map<string, string>();

  beforeAll(async () => {
    [gp, lider, colaborador1, colaborador2] = await Promise.all(CONTAS.map(entrar));

    const { data: perfis } = await gp.from("perfis").select("id, email");
    for (const p of nucleo.pessoas) {
      const perfil = (perfis ?? []).find((x) => x.email === p.email);
      if (perfil) idDe.set(p.chave, perfil.id);
    }

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

    it("cada pessoa vê só as atribuições em que é a avaliadora, nunca quem a avalia", async () => {
      const casos = [
        ["LIDER", lider],
        ["COLABORADOR1", colaborador1],
        ["COLABORADOR2", colaborador2],
      ] as const;
      for (const [chave, cliente] of casos) {
        const { data, error } = await cliente
          .from("atribuicoes")
          .select("avaliador_id, avaliado_id")
          .eq("ciclo_id", cicloId);
        expect(error, chave).toBeNull();
        const esperadas = avaliacao.atribuicoes.filter((a) => a.avaliador === chave).length;
        expect(data, chave).toHaveLength(esperadas);
        for (const linha of data ?? []) expect(linha.avaliador_id, chave).toBe(idDe.get(chave));
      }
    });

    it("o avaliado não lê as respostas nem os comentários sobre ele (caso B)", async () => {
      // A GP enxerga o mapa: quais atribuições avaliam o Colaborador Um (sem a dele).
      const { data: sobreEle } = await gp
        .from("atribuicoes")
        .select("id")
        .eq("ciclo_id", cicloId)
        .eq("avaliado_id", idDe.get("COLABORADOR1")!)
        .neq("grupo", "autoavaliacao");
      const ids = (sobreEle ?? []).map((a) => a.id);
      expect(ids.length).toBeGreaterThanOrEqual(3); // Líder e dois pares, todos enviados

      for (const tabela of ["respostas", "comentarios"]) {
        const { data, error } = await colaborador1.from(tabela).select("id").in("atribuicao_id", ids);
        expect(error, tabela).toBeNull();
        expect(data, tabela).toEqual([]);
      }
      // Não é um teste vazio: ele lê as próprias respostas (a autoavaliação enviada).
      const proprias = await colaborador1.from("respostas").select("id");
      expect(proprias.data?.length ?? 0).toBeGreaterThanOrEqual(totalCompetencias);
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

  // Gravam dados: só no CI, no Supabase local (D-16). Rodam em sequência.
  describe.runIf(GRAVA)("gravações (só no CI)", () => {
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

    it("colaborador e líder não abrem, não encerram nem liberam o ciclo (funções da GP)", async () => {
      for (const [quem, cliente] of [["colaborador", colaborador1], ["líder", lider]] as const) {
        for (const funcao of ["abrir_ciclo", "encerrar_ciclo", "liberar_relatorios"]) {
          const { error } = await cliente.rpc(funcao, { p_ciclo_id: cicloId });
          expect(error?.code, `${quem}: ${funcao}`).toBe(SEM_PERMISSAO);
        }
      }
      const { data } = await gp.from("ciclos").select("status, relatorios_liberados").eq("id", cicloId).single();
      expect(data).toEqual({ status: "aberto", relatorios_liberados: false });
    });
  });

  // Fim do ciclo, como no painel da GP (A8): encerrar, calcular (I4), liberar.
  // Só no CI, depois das gravações acima (o arquivo roda em sequência).
  describe.runIf(GRAVA)("fim do ciclo: cálculo, liberação e relatórios (só no CI)", () => {
    const relatorioDe = async (chave: string): Promise<RelatorioPublicavel> => {
      const { data, error } = await gp
        .from("relatorios")
        .select("conteudo")
        .eq("ciclo_id", cicloId)
        .eq("avaliado_id", idDe.get(chave)!)
        .single();
      if (error || !data) throw new Error(`Relatório de ${chave} não encontrado`);
      return data.conteudo as RelatorioPublicavel;
    };

    it("a GP encerra e o cálculo grava um relatório para cada avaliado", async () => {
      const encerrar = await gp.rpc("encerrar_ciclo", { p_ciclo_id: cicloId });
      expect(encerrar.error).toBeNull();

      const { avaliados } = await executarCalculo(cicloId);
      expect(avaliados).toBe(avaliadosDaSemente.size);
    });

    it("antes da liberação: a GP lê todos os relatórios e nenhum avaliado lê nem o próprio", async () => {
      const daGp = await gp.from("relatorios").select("avaliado_id").eq("ciclo_id", cicloId);
      expect(daGp.error).toBeNull();
      expect(new Set(daGp.data?.map((r) => r.avaliado_id))).toEqual(
        new Set([...avaliadosDaSemente].map((chave) => idDe.get(chave))),
      );

      for (const [chave, cliente] of [["COLABORADOR1", colaborador1], ["LIDER", lider], ["COLABORADOR2", colaborador2]] as const) {
        const { data, error } = await cliente.from("relatorios").select("avaliado_id").eq("ciclo_id", cicloId);
        expect(error, chave).toBeNull();
        expect(data, chave).toEqual([]);
      }
    });

    it("ninguém grava, altera nem apaga relatórios pela API, nem a GP nem o avaliado", async () => {
      for (const [quem, cliente] of [["GP", gp], ["avaliado", colaborador1]] as const) {
        const inserir = await cliente
          .from("relatorios")
          .insert({ ciclo_id: cicloId, avaliado_id: idDe.get("COLABORADOR1"), conteudo: {} });
        expect(inserir.error?.code, `${quem}: insert`).toBe(SEM_PERMISSAO);

        const alterar = await cliente.from("relatorios").update({ conteudo: {} }).eq("ciclo_id", cicloId);
        expect(alterar.error?.code, `${quem}: update`).toBe(SEM_PERMISSAO);

        const apagar = await cliente.from("relatorios").delete().eq("ciclo_id", cicloId);
        expect(apagar.error?.code, `${quem}: delete`).toBe(SEM_PERMISSAO);
      }
      expect((await relatorioDe("COLABORADOR1")).versao).toBe(1);
    });

    it("depois da liberação, o avaliado lê só o próprio relatório, nunca o de outra pessoa", async () => {
      const liberar = await gp.rpc("liberar_relatorios", { p_ciclo_id: cicloId });
      expect(liberar.error).toBeNull();

      const meus = await colaborador1.from("relatorios").select("avaliado_id").eq("ciclo_id", cicloId);
      expect(meus.error).toBeNull();
      expect(meus.data).toEqual([{ avaliado_id: idDe.get("COLABORADOR1") }]);

      const doLider = await colaborador1
        .from("relatorios")
        .select("avaliado_id")
        .eq("avaliado_id", idDe.get("LIDER")!);
      expect(doLider.data).toEqual([]);
    });

    it("o que foi gravado segue a supressão nos casos A, B e C, sem contagens nem avaliadores (R7)", async () => {
      const casoA = await relatorioDe("LIDER");
      expect(casoA.disponivel).toBe(true);
      if (casoA.disponivel) {
        expect(casoA.grupos?.map((g) => g.grupo)).toEqual(["gestor", "pares", "liderados"]);
        expect(casoA.comentarios).toHaveLength(3);
      }

      const casoB = await relatorioDe("COLABORADOR1");
      expect(casoB.disponivel).toBe(true);
      if (casoB.disponivel) {
        expect(casoB.grupos).toBeNull();
        expect(casoB.outros_avaliadores_pct).not.toBeNull();
        expect(casoB.comentarios).toBeNull();
      }

      expect((await relatorioDe("COLABORADOR2")).disponivel).toBe(false);

      for (const chave of avaliadosDaSemente) {
        const json = JSON.stringify(await relatorioDe(chave));
        expect(json, chave).not.toMatch(/"n"|n_avaliadores|n_comentaristas|avaliador_id|atribuicao/);
      }
    });

    it("depois da liberação, o cálculo não roda de novo", async () => {
      await expect(executarCalculo(cicloId)).rejects.toThrow("já foram liberados");
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
