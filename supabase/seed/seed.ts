/**
 * Semente do núcleo (F4): contas fictícias, squads e participações.
 *
 * Uso: npm run seed
 *   Precisa no .env.local: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 *
 * - Idempotente: apaga as contas @demo.inovaup.test e os squads desta semente
 *   e recria tudo a partir de supabase/seed/nucleo.json.
 * - Contas criadas pela API admin, com o e-mail já confirmado. O papel vai
 *   para perfis.papel, nunca para user_metadata.
 * - Senhas aleatórias de 24 caracteres, gravadas só no .env.local, entre
 *   marcadores (DEMO_SENHA_<CHAVE>). Nunca são impressas.
 * - É um dos dois únicos lugares que podem usar a chave service_role
 *   (o outro é src/modules/avaliacao/calculo/executar.ts).
 *
 * Roda direto no Node (22.18 ou mais novo), que entende TypeScript sem instalar nada.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Papel, SituacaoPessoa } from "../../src/contracts/core";

const DOMINIO_DEMO = "@demo.inovaup.test";
const INICIO_BLOCO = "# >>> semente do núcleo (gerado por npm run seed; não edite à mão)";
const FIM_BLOCO = "# <<< semente do núcleo";

interface PessoaSemente {
  chave: string;
  nome: string;
  email: string;
  area: string | null;
  cargo: string | null;
  nivel: string | null;
  papel: Papel;
  situacao: SituacaoPessoa;
}

interface ParticipacaoSemente {
  pessoa: string;
  squad: string;
  inicio: string;
  fim: string | null;
}

interface DadosNucleo {
  pessoas: PessoaSemente[];
  squads: string[];
  participacoes: ParticipacaoSemente[];
}

function falhar(mensagem: string): never {
  console.error(`\nSemente interrompida: ${mensagem}`);
  process.exit(1);
}

// --- Configuração -------------------------------------------------------------
const raiz = path.resolve(import.meta.dirname, "..", "..");
const caminhoEnv = path.join(raiz, ".env.local");

if (!existsSync(caminhoEnv)) {
  falhar("não encontrei o .env.local na raiz do projeto (copie o .env.example).");
}
process.loadEnvFile(caminhoEnv);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chaveSecreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !chaveSecreta) {
  falhar("preencha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.");
}

const dados = JSON.parse(
  readFileSync(path.join(import.meta.dirname, "nucleo.json"), "utf8"),
) as DadosNucleo;

for (const pessoa of dados.pessoas) {
  if (!pessoa.email.endsWith(DOMINIO_DEMO) || pessoa.email !== pessoa.email.toLowerCase()) {
    falhar(`e-mail fora do padrão fictício (${DOMINIO_DEMO}, minúsculas): ${pessoa.email}`);
  }
}

const admin = createClient(url, chaveSecreta, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// --- 1) Apaga as contas fictícias (perfis e participações vão junto, em cascata)
async function apagarContasDemo(): Promise<number> {
  const ids: string[] = [];
  const porPagina = 200;
  for (let pagina = 1; ; pagina++) {
    const { data, error } = await admin.auth.admin.listUsers({ page: pagina, perPage: porPagina });
    if (error) falhar(`não consegui listar as contas: ${error.message}`);
    for (const usuario of data.users) {
      if (usuario.email?.toLowerCase().endsWith(DOMINIO_DEMO)) ids.push(usuario.id);
    }
    if (data.users.length < porPagina) break;
  }
  for (const id of ids) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) falhar(`não consegui apagar a conta ${id}: ${error.message}`);
  }
  return ids.length;
}

// --- 2) Cria as contas, os perfis, os squads e as participações ---------------
async function criarTudo(): Promise<Map<string, string>> {
  const senhas = new Map<string, string>();
  const idDaPessoa = new Map<string, string>();

  for (const pessoa of dados.pessoas) {
    const senha = randomBytes(18).toString("base64url"); // 24 caracteres
    const { data, error } = await admin.auth.admin.createUser({
      email: pessoa.email,
      password: senha,
      email_confirm: true,
    });
    if (error || !data.user) falhar(`não consegui criar ${pessoa.email}: ${error?.message}`);
    senhas.set(pessoa.chave, senha);
    idDaPessoa.set(pessoa.chave, data.user.id);
  }

  const idDe = (chave: string): string => {
    const id = idDaPessoa.get(chave);
    if (!id) falhar(`pessoa desconhecida em nucleo.json: ${chave}`);
    return id;
  };

  const { error: erroPerfis } = await admin.from("perfis").insert(
    dados.pessoas.map((p) => ({
      id: idDe(p.chave),
      nome: p.nome,
      email: p.email,
      area: p.area,
      cargo: p.cargo,
      nivel: p.nivel,
      papel: p.papel,
      situacao: p.situacao,
    })),
  );
  if (erroPerfis) falhar(`não consegui gravar os perfis: ${erroPerfis.message}`);

  const { data: squads, error: erroSquads } = await admin
    .from("squads")
    .insert(dados.squads.map((nome) => ({ nome })))
    .select("id, nome");
  if (erroSquads || !squads) falhar(`não consegui gravar os squads: ${erroSquads?.message}`);
  const idDoSquad = new Map(squads.map((s): [string, string] => [s.nome, s.id]));

  const { error: erroParticipacoes } = await admin.from("participacoes_squad").insert(
    dados.participacoes.map((p) => {
      const squadId = idDoSquad.get(p.squad);
      if (!squadId) falhar(`squad desconhecido em nucleo.json: ${p.squad}`);
      return { perfil_id: idDe(p.pessoa), squad_id: squadId, inicio: p.inicio, fim: p.fim };
    }),
  );
  if (erroParticipacoes) {
    falhar(`não consegui gravar as participações: ${erroParticipacoes.message}`);
  }

  return senhas;
}

// --- 3) Grava as senhas no .env.local, trocando só o bloco da semente ---------
function gravarSenhas(senhas: Map<string, string>): void {
  const atual = readFileSync(caminhoEnv, "utf8").replace(/\r\n/g, "\n");
  const bloco = [
    INICIO_BLOCO,
    ...[...senhas].map(([chave, senha]) => `DEMO_SENHA_${chave}=${senha}`),
    FIM_BLOCO,
  ].join("\n");

  const inicio = atual.indexOf(INICIO_BLOCO);
  const fim = atual.indexOf(FIM_BLOCO);
  const novo =
    inicio !== -1 && fim > inicio
      ? atual.slice(0, inicio) + bloco + atual.slice(fim + FIM_BLOCO.length)
      : `${atual.replace(/\n*$/, "")}\n\n${bloco}\n`;

  writeFileSync(caminhoEnv, novo, "utf8");
}

// --- Execução -----------------------------------------------------------------
const apagadas = await apagarContasDemo();

const { error: erroApagarSquads } = await admin.from("squads").delete().in("nome", dados.squads);
if (erroApagarSquads) falhar(`não consegui apagar os squads antigos: ${erroApagarSquads.message}`);

const senhas = await criarTudo();
gravarSenhas(senhas);

console.log(`Semente do núcleo aplicada em ${new URL(url).host}`);
console.log(`  contas fictícias: ${apagadas} apagadas, ${dados.pessoas.length} criadas`);
console.log(`  squads: ${dados.squads.length}; participações: ${dados.participacoes.length}`);
console.log("  senhas gravadas no .env.local (DEMO_SENHA_*), sem exibir aqui");
