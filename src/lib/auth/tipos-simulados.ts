// TIPOS SIMULADOS, temporários (regra dos contratos no CLAUDE.md).
// O dono do contrato I1 (núcleo) é o Davi: quando `src/contracts/core.ts` for juntado
// na main, troque estes tipos pelos de lá e apague este arquivo.
// Premissas, conforme docs/TAREFAS.md (F4): tabela `perfis` 1:1 com auth.users,
// com as colunas `id`, `nome` e `papel` (enum colaborador | lider | gp).

export const PAPEIS = ["colaborador", "lider", "gp"] as const;

export type Papel = (typeof PAPEIS)[number];

export function ehPapel(valor: unknown): valor is Papel {
  return typeof valor === "string" && (PAPEIS as readonly string[]).includes(valor);
}
