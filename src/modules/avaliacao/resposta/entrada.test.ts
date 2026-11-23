import { describe, expect, it } from "vitest";
import { ehUuid, validarEntrada } from "./entrada";

const A = "11111111-1111-4111-8111-111111111111";
const C = "22222222-2222-4222-8222-222222222222";
const S = "33333333-3333-4333-8333-333333333333";

const valida = {
  atribuicaoId: A,
  respostas: [{ competencia_id: C, valor: 8, nao_se_aplica: false }],
  comentarios: [{ secao_id: S, texto: "ok" }],
};

describe("validarEntrada", () => {
  it("aceita o formato certo e descarta campos extras", () => {
    const r = validarEntrada({
      ...valida,
      respostas: [{ ...valida.respostas[0], atribuicao_id: "outra", status: "enviada" }],
    });
    expect(r?.respostas[0]).toEqual({ competencia_id: C, valor: 8, nao_se_aplica: false });
  });

  it("recusa id que não é uuid", () => {
    expect(validarEntrada({ ...valida, atribuicaoId: "1 or 1=1" })).toBeNull();
    expect(validarEntrada({ ...valida, respostas: [{ ...valida.respostas[0], competencia_id: "x" }] })).toBeNull();
  });

  it("recusa valor não inteiro e valor junto com N/A", () => {
    expect(validarEntrada({ ...valida, respostas: [{ competencia_id: C, valor: 7.5, nao_se_aplica: false }] })).toBeNull();
    expect(validarEntrada({ ...valida, respostas: [{ competencia_id: C, valor: "8", nao_se_aplica: false }] })).toBeNull();
    expect(validarEntrada({ ...valida, respostas: [{ competencia_id: C, valor: 8, nao_se_aplica: true }] })).toBeNull();
  });

  it("recusa comentário acima de 2.000 caracteres", () => {
    expect(validarEntrada({ ...valida, comentarios: [{ secao_id: S, texto: "a".repeat(2001) }] })).toBeNull();
    expect(validarEntrada({ ...valida, comentarios: [{ secao_id: S, texto: "a".repeat(2000) }] })).not.toBeNull();
  });

  it("recusa listas enormes ou formatos estranhos", () => {
    expect(validarEntrada(null)).toBeNull();
    expect(validarEntrada({ ...valida, respostas: "x" })).toBeNull();
    expect(validarEntrada({ ...valida, respostas: Array(201).fill(valida.respostas[0]) })).toBeNull();
  });

  it("ehUuid", () => {
    expect(ehUuid(A)).toBe(true);
    expect(ehUuid("abc")).toBe(false);
    expect(ehUuid(1)).toBe(false);
  });
});
