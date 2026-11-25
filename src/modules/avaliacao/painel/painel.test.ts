import { describe, expect, it, vi } from "vitest";

// O componente importa as ações de servidor; aqui só interessa a regra dos botões.
vi.mock("./acoes", () => ({
  abrirCiclo: vi.fn(),
  encerrarCiclo: vi.fn(),
  calcularRelatorios: vi.fn(),
  liberarRelatorios: vi.fn(),
}));

const { acoesDoEstado, confirmacaoDeEncerrar } = await import("./acoes-do-ciclo");
const { contarPorCiclo } = await import("./dados");

describe("botões do painel por estado do ciclo", () => {
  const rotulos = (status: "rascunho" | "aberto" | "encerrado", liberados = false) =>
    acoesDoEstado(status, liberados).map((a) => a.rotulo);

  it("rascunho: só abrir", () => {
    expect(rotulos("rascunho")).toEqual(["Abrir ciclo"]);
  });
  it("aberto: só encerrar (com confirmação)", () => {
    expect(rotulos("aberto")).toEqual(["Encerrar ciclo"]);
    expect(acoesDoEstado("aberto", false)[0].confirmacao).toBeTruthy();
  });
  it("encerrado e não liberado: liberar (com confirmação) ou calcular de novo", () => {
    expect(rotulos("encerrado")).toEqual(["Liberar relatórios do ciclo", "Calcular relatórios"]);
    expect(acoesDoEstado("encerrado", false)[0].confirmacao).toBeTruthy();
  });
  it("liberado: nenhum botão (sem reabertura nem recálculo)", () => {
    expect(rotulos("encerrado", true)).toEqual([]);
  });
});

describe("confirmação de encerrar diz quantas faltam (E0, B2)", () => {
  it("várias, uma ou nenhuma pendente", () => {
    expect(confirmacaoDeEncerrar(12, 14)).toMatch(/^Faltam 2 de 14 avaliações\. Ninguém mais poderá responder/);
    expect(confirmacaoDeEncerrar(13, 14)).toMatch(/^Falta 1 de 14 avaliações\./);
    expect(confirmacaoDeEncerrar(14, 14)).toMatch(/^Todas as avaliações foram respondidas \(14 de 14\)\./);
  });
  it("o botão de encerrar usa o contador do painel", () => {
    expect(acoesDoEstado("aberto", false, { enviadas: 12, total: 14 })[0].confirmacao).toContain(
      "Faltam 2 de 14 avaliações.",
    );
  });
});

describe("contador X de Y", () => {
  it("conta enviadas e total por ciclo, só pelo status", () => {
    const c = contarPorCiclo([
      { ciclo_id: "a", status: "enviada" },
      { ciclo_id: "a", status: "pendente" },
      { ciclo_id: "a", status: "enviada" },
      { ciclo_id: "b", status: "pendente" },
    ]);
    expect(c.get("a")).toEqual({ enviadas: 2, total: 3 });
    expect(c.get("b")).toEqual({ enviadas: 0, total: 1 });
  });
});
