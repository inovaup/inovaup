// Regras de acesso PURAS (sem banco nem Next.js), para poderem ser testadas.
// Quem usa: src/lib/auth/sessao.ts (getCurrentUser e requireRole).
import type { Papel } from "@/contracts/core";

export type UsuarioAtual = {
  id: string;
  nome: string;
  papel: Papel;
};

/** Resultado da leitura da sessão no servidor. */
export type Sessao =
  | { tipo: "sem-sessao" }
  | { tipo: "sem-perfil"; id: string }
  | { tipo: "ok"; usuario: UsuarioAtual };

export type DecisaoDeAcesso = "sem-sessao" | "sem-perfil" | "negado" | "permitido";

export function decidirAcesso(
  sessao: Sessao,
  papeisPermitidos: readonly Papel[],
): DecisaoDeAcesso {
  if (sessao.tipo === "sem-sessao") return "sem-sessao";
  if (sessao.tipo === "sem-perfil") return "sem-perfil";
  return papeisPermitidos.includes(sessao.usuario.papel) ? "permitido" : "negado";
}
