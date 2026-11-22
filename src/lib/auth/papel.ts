// Validação do papel lido de `perfis.papel`. Os papéis vêm do contrato I1
// (src/contracts/core.ts, dono: Davi); aqui só checamos o valor em tempo de execução.
import { PAPEIS, type Papel } from "@/contracts/core";

export function ehPapel(valor: unknown): valor is Papel {
  return typeof valor === "string" && (PAPEIS as readonly string[]).includes(valor);
}
