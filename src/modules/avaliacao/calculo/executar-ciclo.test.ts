/**
 * Testes da execução do cálculo (A6, I4) com um cliente falso do Supabase,
 * em memória: não acessa banco nenhum.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { RelatorioPublicavel, ResultadoCompleto } from "@/contracts/avaliacao";
import { executarCiclo, type MontarRelatorio, type QuestionarioDoCiclo } from "./executar-ciclo";
import { montarRelatorioPublicavel } from "@/modules/avaliacao/relatorio/supressao";

type Linha = Record<string, unknown>;
type Tabelas = Record<string, Linha[]>;

/**
 * Cliente falso com só o que executarCiclo usa: select, eq, in, order, range,
 * maybeSingle e upsert. `maxLinhas` imita o limite de linhas por consulta do Supabase.
 */
function clienteFalso(tabelas: Tabelas, { maxLinhas = 1000, erroAoGravar = "" } = {}) {
  const gravacoes: { tabela: string; linhas: Linha[]; opcoes: unknown }[] = [];

  function consulta(tabela: string) {
    let linhas = [...(tabelas[tabela] ?? [])];
    let colunas: string[] = [];
    let faixa: [number, number] = [0, Infinity];

    const projetar = (l: Linha) => {
      for (const c of colunas) if (!(c in l)) throw new Error(`coluna ${tabela}.${c} não existe`);
      return Object.fromEntries(colunas.map((c) => [c, l[c]]));
    };
    const resultado = () => {
      const [de, ate] = faixa;
      const pagina = linhas.slice(de, Math.min(ate + 1, de + maxLinhas));
      return { data: pagina.map(projetar), error: null };
    };

    const construtor = {
      select(lista: string) {
        colunas = lista.split(",").map((c) => c.trim());
        return construtor;
      },
      eq(coluna: string, valor: unknown) {
        linhas = linhas.filter((l) => l[coluna] === valor);
        return construtor;
      },
      in(coluna: string, valores: unknown[]) {
        linhas = linhas.filter((l) => valores.includes(l[coluna]));
        return construtor;
      },
      order(coluna: string) {
        linhas.sort((a, b) => String(a[coluna]).localeCompare(String(b[coluna])));
        return construtor;
      },
      range(de: number, ate: number) {
        faixa = [de, ate];
        return construtor;
      },
      maybeSingle() {
        return Promise.resolve({ data: linhas[0] ? projetar(linhas[0]) : null, error: null });
      },
      upsert(novas: Linha[], opcoes: unknown) {
        if (erroAoGravar) return Promise.resolve({ error: { message: erroAoGravar } });
        gravacoes.push({ tabela, linhas: novas, opcoes });
        return Promise.resolve({ error: null });
      },
      then<R>(ok: (r: ReturnType<typeof resultado>) => R, falha?: (e: unknown) => R) {
        return Promise.resolve().then(resultado).then(ok, falha);
      },
    };
    return construtor;
  }

  return { cliente: { from: consulta } as unknown as SupabaseClient, gravacoes };
}

/**
 * Um ciclo com 3 pessoas avaliadas:
 * - "ana": caso 1 de calculo-da-nota.md (nota final 71,33%);
 * - "bia": só a autoavaliação enviada e uma avaliação pendente;
 * - "caio": só atribuições pendentes (como o Consultor Três se ninguém responder na demo).
 */
function cicloDeTeste(status = "encerrado", relatorios_liberados = false): Tabelas {
  const atribuicoes: Linha[] = [];
  const respostas: Linha[] = [];
  const comentarios: Linha[] = [];
  const avaliar = (
    avaliado: string,
    avaliador: string,
    grupo: string,
    notas: (number | "NA")[] | null,
    comentario?: string,
  ) => {
    const id = `atrib-${avaliador}-${avaliado}`;
    atribuicoes.push({
      id,
      ciclo_id: "ciclo-1",
      avaliado_id: avaliado,
      avaliador_id: avaliador,
      grupo,
      status: notas ? "enviada" : "pendente",
    });
    notas?.forEach((n, i) =>
      respostas.push({
        id: `resp-${id}-${i}`,
        atribuicao_id: id,
        competencia_id: ["C1", "C2"][i],
        valor: n === "NA" ? null : n,
        nao_se_aplica: n === "NA",
      }),
    );
    if (comentario) {
      comentarios.push({ id: `coment-${id}`, atribuicao_id: id, secao_id: "S1", texto: comentario });
    }
  };

  avaliar("ana", "ana", "autoavaliacao", [8, 6], "Sobre mim.");
  avaliar("ana", "gestor", "gestor", [9, "NA"], "Entrega bem.");
  avaliar("ana", "par1", "pares", [7, 8]);
  avaliar("ana", "par2", "pares", [5, 6], "Ajuda o time.");
  avaliar("bia", "bia", "autoavaliacao", [9, 9]);
  avaliar("bia", "par1", "pares", null);
  avaliar("caio", "caio", "autoavaliacao", null);
  avaliar("caio", "par2", "pares", null);

  return {
    ciclos: [
      { id: "ciclo-1", nome: "Ciclo de teste", status, relatorios_liberados },
      { id: "ciclo-2", nome: "Outro ciclo", status: "encerrado", relatorios_liberados: false },
    ],
    secoes: [
      { id: "S1", ciclo_id: "ciclo-1", nome: "Performance", escala_min: 1, escala_max: 10, permite_na: true, peso: "1", ordem: 1 },
      { id: "S9", ciclo_id: "ciclo-2", nome: "De outro ciclo", escala_min: 1, escala_max: 10, permite_na: false, peso: "1", ordem: 1 },
    ],
    competencias: [
      { id: "C1", secao_id: "S1", pergunta: "Cumpre prazos", peso: "1", ordem: 1 },
      { id: "C2", secao_id: "S1", pergunta: "Liderança", peso: "1", ordem: 2 },
      { id: "C9", secao_id: "S9", pergunta: "De outro ciclo", peso: "1", ordem: 1 },
    ],
    pesos_grupo: [
      { ciclo_id: "ciclo-1", grupo: "autoavaliacao", peso: "1" },
      { ciclo_id: "ciclo-1", grupo: "gestor", peso: "2" },
      { ciclo_id: "ciclo-1", grupo: "pares", peso: "2" },
      { ciclo_id: "ciclo-1", grupo: "liderados", peso: "2" },
    ],
    atribuicoes,
    respostas,
    comentarios,
    relatorios: [],
  };
}

/** Guarda o que a função de montar recebeu e devolve o relatório da A7. */
function montarEspiao() {
  const chamadas: { resultado: ResultadoCompleto; questionario: QuestionarioDoCiclo }[] = [];
  const montar: MontarRelatorio = (resultado, questionario) => {
    chamadas.push({ resultado, questionario });
    return montarRelatorioPublicavel(resultado, questionario);
  };
  const de = (avaliado: string) => chamadas.find((c) => c.resultado.avaliado_id === avaliado)!;
  return { montar, chamadas, de };
}

describe("executarCiclo (A6, I4)", () => {
  it("grava um relatório para cada avaliado, inclusive quem só tem pendentes", async () => {
    const { cliente, gravacoes } = clienteFalso(cicloDeTeste());
    const espiao = montarEspiao();

    const retorno = await executarCiclo(cliente, "ciclo-1", espiao.montar);

    expect(retorno).toEqual({ avaliados: 3 });
    expect(gravacoes).toHaveLength(1);
    expect(gravacoes[0].tabela).toBe("relatorios");
    expect(gravacoes[0].opcoes).toEqual({ onConflict: "ciclo_id,avaliado_id" });
    expect(gravacoes[0].linhas.map((l) => l.avaliado_id).sort()).toEqual(["ana", "bia", "caio"]);
  });

  it("grava só o relatório publicável: nenhuma nota individual nem o resultado completo", async () => {
    const { cliente, gravacoes } = clienteFalso(cicloDeTeste());

    await executarCiclo(cliente, "ciclo-1", montarRelatorioPublicavel);

    for (const linha of gravacoes[0].linhas) {
      expect(Object.keys(linha).sort()).toEqual(["avaliado_id", "ciclo_id", "conteudo", "gerado_em"]);
      expect(linha.ciclo_id).toBe("ciclo-1");
      const conteudo = linha.conteudo as RelatorioPublicavel;
      expect(conteudo.versao).toBe(1);
      // R7: nada de contagens nem de ids de avaliador ou atribuição no que é gravado.
      expect(JSON.stringify(conteudo)).not.toMatch(/"n"|n_avaliadores|n_comentaristas|avaliador_id|atribuicao/);
    }
  });

  it("calcula com os dados do ciclo certo e passa o questionário para a montagem", async () => {
    const { cliente } = clienteFalso(cicloDeTeste());
    const espiao = montarEspiao();

    await executarCiclo(cliente, "ciclo-1", espiao.montar);

    const ana = espiao.de("ana").resultado;
    expect(ana.nota_final_pct).toBeCloseTo(214 / 3, 6); // caso 1: 71,33%
    expect(ana.autoavaliacao_pct).toBeCloseTo(70, 6);
    expect(ana.comentarios.n_comentaristas).toBe(2); // gestor e par2; sem a autoavaliação

    expect(espiao.de("bia").resultado).toMatchObject({
      autoavaliacao_pct: 90,
      n_avaliadores_outros: 0,
      nota_final_pct: 90,
    });
    expect(espiao.de("caio").resultado).toMatchObject({ nota_final_pct: null, n_avaliadores_outros: 0 });

    expect(espiao.de("ana").questionario).toEqual({
      secoes: [{ id: "S1", nome: "Performance", ordem: 1 }],
      competencias: [
        { id: "C1", secao_id: "S1", pergunta: "Cumpre prazos", ordem: 1 },
        { id: "C2", secao_id: "S1", pergunta: "Liderança", ordem: 2 },
      ],
    });
  });

  it("lê tudo mesmo quando o Supabase devolve poucas linhas por consulta", async () => {
    const normal = montarEspiao();
    await executarCiclo(clienteFalso(cicloDeTeste()).cliente, "ciclo-1", normal.montar);

    const paginado = montarEspiao();
    const { cliente } = clienteFalso(cicloDeTeste(), { maxLinhas: 2 });
    expect(await executarCiclo(cliente, "ciclo-1", paginado.montar)).toEqual({ avaliados: 3 });

    for (const avaliado of ["ana", "bia", "caio"]) {
      expect(paginado.de(avaliado).resultado, avaliado).toEqual(normal.de(avaliado).resultado);
    }
  });

  it("pode rodar de novo enquanto os relatórios não forem liberados", async () => {
    const { cliente, gravacoes } = clienteFalso(cicloDeTeste());

    await executarCiclo(cliente, "ciclo-1", montarRelatorioPublicavel);
    await executarCiclo(cliente, "ciclo-1", montarRelatorioPublicavel);

    expect(gravacoes).toHaveLength(2);
    expect(gravacoes[1].opcoes).toEqual({ onConflict: "ciclo_id,avaliado_id" });
  });

  it.each([
    ["aberto", false, "encerrado"],
    ["rascunho", false, "encerrado"],
    ["encerrado", true, "já foram liberados"],
  ])("recusa ciclo %s (liberado: %s) sem gravar nada", async (status, liberado, mensagem) => {
    const { cliente, gravacoes } = clienteFalso(cicloDeTeste(status, liberado));
    const montar = vi.fn(montarRelatorioPublicavel);

    await expect(executarCiclo(cliente, "ciclo-1", montar)).rejects.toThrow(mensagem);
    expect(montar).not.toHaveBeenCalled();
    expect(gravacoes).toEqual([]);
  });

  it("recusa ciclo que não existe", async () => {
    const { cliente, gravacoes } = clienteFalso(cicloDeTeste());
    await expect(executarCiclo(cliente, "nao-existe", montarRelatorioPublicavel)).rejects.toThrow(
      "Ciclo não encontrado",
    );
    expect(gravacoes).toEqual([]);
  });

  it("avisa quando a gravação falha", async () => {
    const { cliente } = clienteFalso(cicloDeTeste(), { erroAoGravar: "sem conexão" });
    await expect(executarCiclo(cliente, "ciclo-1", montarRelatorioPublicavel)).rejects.toThrow(
      "Falha ao gravar os relatórios: sem conexão",
    );
  });
});
