/**
 * Contrato I4 (A6): calcula e grava os relatórios publicáveis de um ciclo.
 *
 * Uso (A8, ação de servidor da GP): depois de encerrar_ciclo(), chame
 * `await executarCalculo(cicloId)`. Se falhar, pode chamar de novo enquanto o
 * ciclo estiver encerrado e os relatórios não tiverem sido liberados.
 *
 * Único lugar do app com a chave service_role (a outra é a semente): ela lê
 * as respostas e comentários, que nenhum usuário lê pela API, e grava em
 * `relatorios`. Por isso:
 * - `server-only`: o build falha se algum componente do navegador importar isto;
 * - sem "use server": não vira endpoint; só é chamado por código do servidor;
 * - confere requireRole("gp") de novo, perto do dado, mesmo que a ação já confira;
 * - não usa o createClient() de src/lib/supabase/server.ts de propósito: aquele
 *   é o cliente da sessão do usuário, com RLS. Este é o cliente sem sessão da
 *   service_role, previsto em CLAUDE.md, e não sai desta função.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth/sessao";
import { executarCiclo } from "./executar-ciclo";
import { montarRelatorioPublicavel } from "@/modules/avaliacao/relatorio/supressao";

export async function executarCalculo(cicloId: string): Promise<{ avaliados: number }> {
  await requireRole("gp");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) {
    throw new Error("Configuração do Supabase incompleta no servidor (.env.local)");
  }

  const admin = createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return executarCiclo(admin, cicloId, montarRelatorioPublicavel);
}
