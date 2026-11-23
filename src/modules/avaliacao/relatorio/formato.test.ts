import { describe, expect, it } from "vitest";
import { agruparPorSecao, formatarPct, lerRelatorio } from "./formato";

describe("formato do relatório", () => {
  it("formatarPct usa vírgula, 2 casas e 'indisponível' para nulo", () => {
    expect(formatarPct(71.33)).toBe("71,33%");
    expect(formatarPct(70)).toBe("70,00%");
    expect(formatarPct(null)).toBe("indisponível");
  });

  it("lerRelatorio aceita só a versão 1 com o formato esperado", () => {
    expect(lerRelatorio({ versao: 1, disponivel: false, aviso: "x", autoavaliacao_pct: null })).not.toBeNull();
    expect(lerRelatorio({ versao: 2, disponivel: false })).toBeNull();
    expect(lerRelatorio({ versao: 1, disponivel: true })).toBeNull(); // sem competências
    expect(lerRelatorio(null)).toBeNull();
    expect(lerRelatorio("texto")).toBeNull();
  });

  it("agruparPorSecao mantém a ordem e junta por seção", () => {
    const s = agruparPorSecao([
      { competencia_id: "1", secao_nome: "Performance", pergunta: "A", pct: 80 },
      { competencia_id: "2", secao_nome: "Performance", pergunta: "B", pct: null },
      { competencia_id: "3", secao_nome: "Comportamental", pergunta: "C", pct: 90 },
    ]);
    expect(s.map((x) => [x.nome, x.competencias.map((c) => c.pergunta)])).toEqual([
      ["Performance", ["A", "B"]],
      ["Comportamental", ["C"]],
    ]);
  });
});
