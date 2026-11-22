// Camada de acesso à sessão (contrato I2). Use SEMPRE estas funções no servidor:
// em toda página e em toda ação de servidor sensível, perto do dado.
// O papel é lido do banco (tabela `perfis`) a cada requisição, nunca de user_metadata.
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { decidirAcesso, type Sessao, type UsuarioAtual } from "./acesso";
import type { Papel } from "@/contracts/core";
import { ehPapel } from "./papel";

/** Lê a sessão e o perfil. Memorizado por requisição (React `cache`, não é o "use cache"). */
const obterSessao = cache(async (): Promise<Sessao> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return { tipo: "sem-sessao" };

  const { data: perfil, error } = await supabase
    .from("perfis")
    .select("id, nome, papel")
    .eq("id", id)
    .maybeSingle();

  // Sem perfil, perfil ilegível pela RLS ou papel desconhecido: não entra.
  if (error || !perfil || !ehPapel(perfil.papel)) {
    return { tipo: "sem-perfil", id };
  }
  return {
    tipo: "ok",
    usuario: { id: perfil.id, nome: perfil.nome, papel: perfil.papel },
  };
});

/** Usuário logado com perfil válido, ou `null`. */
export async function getCurrentUser(): Promise<UsuarioAtual | null> {
  const sessao = await obterSessao();
  return sessao.tipo === "ok" ? sessao.usuario : null;
}

/**
 * Exige um dos papéis. Sem sessão: vai para o login. Sem perfil ou papel errado:
 * vai para /acesso-negado. Chame fora de blocos try/catch (o redirect lança um erro).
 */
export async function requireRole(...papeis: Papel[]): Promise<UsuarioAtual> {
  const sessao = await obterSessao();
  const decisao = decidirAcesso(sessao, papeis);
  if (decisao === "sem-sessao") redirect("/auth/login");
  if (decisao !== "permitido" || sessao.tipo !== "ok") redirect("/acesso-negado");
  return sessao.usuario;
}
