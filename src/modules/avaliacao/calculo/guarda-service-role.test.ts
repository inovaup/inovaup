/**
 * Guarda do piso de segurança (CLAUDE.md): a chave service_role só pode ser
 * usada na semente e em calculo/executar.ts. Falha se o nome da variável
 * aparecer em qualquer outro arquivo de código do repositório.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const VARIAVEL = "SUPABASE_SERVICE_ROLE_KEY";

const PERMITIDOS = new Set([
  "supabase/seed/seed.ts", // a semente
  "src/modules/avaliacao/calculo/executar.ts", // o cálculo (I4)
  "src/modules/avaliacao/calculo/executar.test.ts", // só um valor falso, no teste do portão
  "src/modules/avaliacao/calculo/guarda-service-role.test.ts", // esta guarda
]);

/** Arquivos de código do repositório (versionados ou novos), sem node_modules nem .next. */
function arquivosDeCodigo(): string[] {
  const saida = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
    encoding: "utf8",
  });
  return saida
    .split("\n")
    .map((linha) => linha.trim())
    .filter((arquivo) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(arquivo));
}

describe("guarda da chave service_role", () => {
  const arquivos = arquivosDeCodigo();
  const conteudo = (arquivo: string) => {
    try {
      return readFileSync(arquivo, "utf8");
    } catch {
      return ""; // apagado na árvore de trabalho, ainda não no commit
    }
  };

  it("encontra os arquivos de código", () => {
    expect(arquivos).toContain("src/modules/avaliacao/calculo/executar.ts");
  });

  it(`${VARIAVEL} só aparece na semente e em calculo/executar.ts`, () => {
    const fora = arquivos.filter((a) => !PERMITIDOS.has(a) && conteudo(a).includes(VARIAVEL));
    expect(fora).toEqual([]);
  });

  it("nenhuma chave secreta escrita no código nem exposta como NEXT_PUBLIC_", () => {
    const suspeitos = arquivos.filter((a) => {
      const texto = conteudo(a);
      return /sb_secret_[A-Za-z0-9]/.test(texto) || /NEXT_PUBLIC_\w*(SERVICE_ROLE|SECRET)/.test(texto);
    });
    expect(suspeitos).toEqual([]);
  });
});
