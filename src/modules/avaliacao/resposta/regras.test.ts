import { describe, expect, it } from "vitest";
import {
  LIMITE_COMENTARIO,
  alternarNaoSeAplica,
  comentarioTemConteudo,
  competenciaRespondida,
  escolherValor,
  opcoesDaEscala,
  pendenciasDaSecao,
  respostaValida,
} from "./regras";
import type { SecaoQuestionario } from "./tipos-simulados";

const performance: SecaoQuestionario = {
  id: "s1",
  nome: "Performance",
  escala_min: 1,
  escala_max: 10,
  permite_na: true,
  ordem: 1,
  competencias: [
    { id: "c2", pergunta: "Preza pela organização", ordem: 2 },
    { id: "c1", pergunta: "Cumpre prazos", ordem: 1 },
  ],
};
const comportamental: SecaoQuestionario = { ...performance, id: "s2", permite_na: false };

describe("opcoesDaEscala", () => {
  it("lista de min a max", () => {
    expect(opcoesDaEscala(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(opcoesDaEscala(1, 10)).toHaveLength(10);
  });
  it("escala inválida não gera opções", () => {
    expect(opcoesDaEscala(5, 1)).toEqual([]);
    expect(opcoesDaEscala(1.5, 3)).toEqual([]);
  });
});

describe("respostaValida", () => {
  it("vazia é válida (rascunho)", () => {
    expect(respostaValida({ valor: null, nao_se_aplica: false }, performance)).toBe(true);
  });
  it("valor dentro da escala", () => {
    expect(respostaValida({ valor: 1, nao_se_aplica: false }, performance)).toBe(true);
    expect(respostaValida({ valor: 10, nao_se_aplica: false }, performance)).toBe(true);
  });
  it("valor fora da escala ou não inteiro", () => {
    expect(respostaValida({ valor: 0, nao_se_aplica: false }, performance)).toBe(false);
    expect(respostaValida({ valor: 11, nao_se_aplica: false }, performance)).toBe(false);
    expect(respostaValida({ valor: 7.5, nao_se_aplica: false }, performance)).toBe(false);
  });
  it("N/A só quando a seção permite, e nunca junto com valor", () => {
    expect(respostaValida({ valor: null, nao_se_aplica: true }, performance)).toBe(true);
    expect(respostaValida({ valor: null, nao_se_aplica: true }, comportamental)).toBe(false);
    expect(respostaValida({ valor: 5, nao_se_aplica: true }, performance)).toBe(false);
  });
});

describe("competenciaRespondida e pendenciasDaSecao", () => {
  it("valor ou N/A permitido contam como respondida", () => {
    expect(competenciaRespondida({ valor: 8, nao_se_aplica: false }, performance)).toBe(true);
    expect(competenciaRespondida({ valor: null, nao_se_aplica: true }, performance)).toBe(true);
    expect(competenciaRespondida({ valor: null, nao_se_aplica: true }, comportamental)).toBe(false);
    expect(competenciaRespondida(undefined, performance)).toBe(false);
  });
  it("lista o que falta, na ordem da seção", () => {
    expect(pendenciasDaSecao(performance, {})).toEqual(["c1", "c2"]);
    expect(pendenciasDaSecao(performance, { c1: escolherValor(9) })).toEqual(["c2"]);
    expect(
      pendenciasDaSecao(performance, { c1: escolherValor(9), c2: alternarNaoSeAplica(true) }),
    ).toEqual([]);
  });
});

describe("comentário", () => {
  it("só espaços não conta (R6)", () => {
    expect(comentarioTemConteudo("   \n ")).toBe(false);
    expect(comentarioTemConteudo(" ok ")).toBe(true);
  });
  it("limite combinado com o Davi", () => {
    expect(LIMITE_COMENTARIO).toBe(2000);
  });
});

describe("escolherValor e alternarNaoSeAplica", () => {
  it("escolher valor desmarca o N/A; marcar N/A limpa o valor", () => {
    expect(escolherValor(7)).toEqual({ valor: 7, nao_se_aplica: false });
    expect(alternarNaoSeAplica(true)).toEqual({ valor: null, nao_se_aplica: true });
    expect(alternarNaoSeAplica(false)).toEqual({ valor: null, nao_se_aplica: false });
  });
});
