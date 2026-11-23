/**
 * Semente da demonstração: núcleo (F4) e ciclo de avaliação (A2).
 *
 * Uso: npm run seed
 *   Precisa no .env.local: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 *
 * - Idempotente: apaga as contas @demo.inovaup.test, os squads e o ciclo desta
 *   semente e recria tudo a partir de supabase/seed/nucleo.json e avaliacao.json.
 * - Contas criadas pela API admin, com o e-mail já confirmado. O papel vai
 *   para perfis.papel, nunca para user_metadata.
 * - Senhas: se a DEMO_SENHA_<CHAVE> já existe no .env.local, é reaproveitada
 *   (rodar de novo não troca as senhas de quem já tem); pessoa nova ganha uma
 *   senha aleatória de 24 caracteres. Ficam só no .env.local, entre
 *   marcadores, e nunca são impressas.
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
import type { GrupoAvaliador, StatusCiclo } from "../../src/contracts/avaliacao";

const DOMINIO_DEMO = "@demo.inovaup.test";
const INICIO_BLOCO = "# >>> semente do núcleo (gerado por npm run seed; não edite à mão)";
const FIM_BLOCO = "# <<< semente do núcleo";
const TAMANHO_MINIMO_SENHA = 16;

// --- Formato dos arquivos de dados -------------------------------------------

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

interface SecaoSemente {
  nome: string;
  escala_min: number;
  escala_max: number;
  permite_na: boolean;
  peso: number;
  competencias: string[];
}

interface AtribuicaoSemente {
  caso: string;
  avaliado: string;
  avaliador: string;
  grupo: GrupoAvaliador;
  /** Uma resposta por competência, na ordem das seções; "NA" = não se aplica. */
  respostas?: (number | "NA")[];
  /** Comentário por nome de seção. */
  comentarios?: Record<string, string>;
  /** Fica pendente para a demonstração ao vivo (sem respostas). */
  pendente?: boolean;
}

interface DadosAvaliacao {
  ciclo: { nome: string; status: StatusCiclo };
  pesos_grupo: Record<GrupoAvaliador, number>;
  secoes: SecaoSemente[];
  atribuicoes: AtribuicaoSemente[];
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

const lerJson = <T>(nome: string): T =>
  JSON.parse(readFileSync(path.join(import.meta.dirname, nome), "utf8")) as T;

const nucleo = lerJson<DadosNucleo>("nucleo.json");
const avaliacao = lerJson<DadosAvaliacao>("avaliacao.json");

// --- Validação dos dados, antes de mexer no banco -----------------------------
const chaves = new Set(nucleo.pessoas.map((p) => p.chave));

for (const pessoa of nucleo.pessoas) {
  if (!pessoa.email.endsWith(DOMINIO_DEMO) || pessoa.email !== pessoa.email.toLowerCase()) {
    falhar(`e-mail fora do padrão fictício (${DOMINIO_DEMO}, minúsculas): ${pessoa.email}`);
  }
}

const competenciasEmOrdem = avaliacao.secoes.flatMap((s) =>
  s.competencias.map((pergunta) => ({ secao: s, pergunta })),
);
const nomesSecoes = new Set(avaliacao.secoes.map((s) => s.nome));

for (const a of avaliacao.atribuicoes) {
  const rotulo = `${a.avaliador} -> ${a.avaliado}`;
  if (!chaves.has(a.avaliado) || !chaves.has(a.avaliador)) {
    falhar(`pessoa desconhecida na atribuição ${rotulo}`);
  }
  if (a.pendente) {
    if (a.respostas || a.comentarios) falhar(`atribuição pendente com respostas: ${rotulo}`);
    continue;
  }
  if (!a.respostas || a.respostas.length !== competenciasEmOrdem.length) {
    falhar(`a atribuição ${rotulo} precisa de ${competenciasEmOrdem.length} respostas`);
  }
  a.respostas.forEach((r, i) => {
    const { secao, pergunta } = competenciasEmOrdem[i];
    if (r === "NA" ? !secao.permite_na : r < secao.escala_min || r > secao.escala_max) {
      falhar(`resposta inválida em ${rotulo}, "${pergunta}": ${r}`);
    }
  });
  for (const [secao, texto] of Object.entries(a.comentarios ?? {})) {
    if (!nomesSecoes.has(secao) || texto.length > 2000) {
      falhar(`comentário inválido em ${rotulo}, seção "${secao}"`);
    }
  }
}

const admin = createClient(url, chaveSecreta, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// --- 1) Apaga as contas fictícias (perfis, participações e atribuições vão junto)
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

// --- 2) Núcleo: contas, perfis, squads e participações ------------------------
async function criarNucleo(): Promise<{
  senhas: Map<string, string>;
  idDe: (chave: string) => string;
  reaproveitadas: number;
}> {
  const senhas = new Map<string, string>();
  const idDaPessoa = new Map<string, string>();
  let reaproveitadas = 0;

  for (const pessoa of nucleo.pessoas) {
    const anterior = process.env[`DEMO_SENHA_${pessoa.chave}`];
    const reaproveitar = anterior !== undefined && anterior.length >= TAMANHO_MINIMO_SENHA;
    const senha = reaproveitar ? anterior : randomBytes(18).toString("base64url"); // 24 caracteres
    if (reaproveitar) reaproveitadas++;

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
    if (!id) falhar(`pessoa desconhecida: ${chave}`);
    return id;
  };

  const { error: erroPerfis } = await admin.from("perfis").insert(
    nucleo.pessoas.map((p) => ({
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
    .insert(nucleo.squads.map((nome) => ({ nome })))
    .select("id, nome");
  if (erroSquads || !squads) falhar(`não consegui gravar os squads: ${erroSquads?.message}`);
  const idDoSquad = new Map(squads.map((s): [string, string] => [s.nome, s.id]));

  const { error: erroParticipacoes } = await admin.from("participacoes_squad").insert(
    nucleo.participacoes.map((p) => {
      const squadId = idDoSquad.get(p.squad);
      if (!squadId) falhar(`squad desconhecido em nucleo.json: ${p.squad}`);
      return { perfil_id: idDe(p.pessoa), squad_id: squadId, inicio: p.inicio, fim: p.fim };
    }),
  );
  if (erroParticipacoes) {
    falhar(`não consegui gravar as participações: ${erroParticipacoes.message}`);
  }

  return { senhas, idDe, reaproveitadas };
}

// --- 3) Ciclo de avaliação: questionário, pesos, mapa, respostas e comentários
async function criarCiclo(idDe: (chave: string) => string) {
  const { data: ciclo, error: erroCiclo } = await admin
    .from("ciclos")
    .insert({ nome: avaliacao.ciclo.nome, status: avaliacao.ciclo.status })
    .select("id")
    .single();
  if (erroCiclo || !ciclo) {
    falhar(`não consegui criar o ciclo (já existe outro aberto?): ${erroCiclo?.message}`);
  }

  const { error: erroPesos } = await admin.from("pesos_grupo").insert(
    Object.entries(avaliacao.pesos_grupo).map(([grupo, peso]) => ({
      ciclo_id: ciclo.id,
      grupo,
      peso,
    })),
  );
  if (erroPesos) falhar(`não consegui gravar os pesos dos grupos: ${erroPesos.message}`);

  // Seções e competências, guardando os ids na ordem do arquivo.
  const idDaSecao = new Map<string, string>();
  const idsCompetencias: string[] = [];
  for (const [i, secao] of avaliacao.secoes.entries()) {
    const { data: s, error: erroSecao } = await admin
      .from("secoes")
      .insert({
        ciclo_id: ciclo.id,
        nome: secao.nome,
        escala_min: secao.escala_min,
        escala_max: secao.escala_max,
        permite_na: secao.permite_na,
        peso: secao.peso,
        ordem: i + 1,
      })
      .select("id")
      .single();
    if (erroSecao || !s) falhar(`não consegui gravar a seção ${secao.nome}: ${erroSecao?.message}`);
    idDaSecao.set(secao.nome, s.id);

    const { data: comps, error: erroComps } = await admin
      .from("competencias")
      .insert(secao.competencias.map((pergunta, j) => ({ secao_id: s.id, pergunta, ordem: j + 1 })))
      .select("id, ordem");
    if (erroComps || !comps) {
      falhar(`não consegui gravar as competências de ${secao.nome}: ${erroComps?.message}`);
    }
    comps.sort((x, y) => x.ordem - y.ordem).forEach((c) => idsCompetencias.push(c.id));
  }

  // Atribuições (enviadas, com data, ou pendentes).
  const agora = new Date().toISOString();
  const { data: atribs, error: erroAtribs } = await admin
    .from("atribuicoes")
    .insert(
      avaliacao.atribuicoes.map((a) => ({
        ciclo_id: ciclo.id,
        avaliado_id: idDe(a.avaliado),
        avaliador_id: idDe(a.avaliador),
        grupo: a.grupo,
        status: a.pendente ? "pendente" : "enviada",
        enviada_em: a.pendente ? null : agora,
      })),
    )
    .select("id, avaliado_id, avaliador_id");
  if (erroAtribs || !atribs) falhar(`não consegui gravar as atribuições: ${erroAtribs?.message}`);
  const idDaAtribuicao = new Map(
    atribs.map((a): [string, string] => [`${a.avaliado_id}|${a.avaliador_id}`, a.id]),
  );

  const respostas: Record<string, unknown>[] = [];
  const comentarios: Record<string, unknown>[] = [];
  for (const a of avaliacao.atribuicoes) {
    if (a.pendente) continue;
    const atribuicaoId = idDaAtribuicao.get(`${idDe(a.avaliado)}|${idDe(a.avaliador)}`);
    if (!atribuicaoId) falhar(`atribuição não encontrada: ${a.avaliador} -> ${a.avaliado}`);
    (a.respostas ?? []).forEach((r, i) =>
      respostas.push({
        atribuicao_id: atribuicaoId,
        competencia_id: idsCompetencias[i],
        valor: r === "NA" ? null : r,
        nao_se_aplica: r === "NA",
      }),
    );
    for (const [secao, texto] of Object.entries(a.comentarios ?? {})) {
      comentarios.push({ atribuicao_id: atribuicaoId, secao_id: idDaSecao.get(secao), texto });
    }
  }

  const { error: erroRespostas } = await admin.from("respostas").insert(respostas);
  if (erroRespostas) falhar(`não consegui gravar as respostas: ${erroRespostas.message}`);
  if (comentarios.length > 0) {
    const { error: erroComentarios } = await admin.from("comentarios").insert(comentarios);
    if (erroComentarios) falhar(`não consegui gravar os comentários: ${erroComentarios.message}`);
  }

  return {
    atribuicoes: avaliacao.atribuicoes.length,
    pendentes: avaliacao.atribuicoes.filter((a) => a.pendente).length,
    respostas: respostas.length,
    comentarios: comentarios.length,
  };
}

// --- 4) Grava as senhas no .env.local, trocando só o bloco da semente ---------
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
const { error: erroApagarCiclo } = await admin
  .from("ciclos")
  .delete()
  .eq("nome", avaliacao.ciclo.nome);
if (erroApagarCiclo) falhar(`não consegui apagar o ciclo antigo: ${erroApagarCiclo.message}`);

const apagadas = await apagarContasDemo();

const { error: erroApagarSquads } = await admin.from("squads").delete().in("nome", nucleo.squads);
if (erroApagarSquads) falhar(`não consegui apagar os squads antigos: ${erroApagarSquads.message}`);

const { senhas, idDe, reaproveitadas } = await criarNucleo();
gravarSenhas(senhas);
const ciclo = await criarCiclo(idDe);

console.log(`Semente aplicada em ${new URL(url).host}`);
console.log(`  contas fictícias: ${apagadas} apagadas, ${nucleo.pessoas.length} criadas`);
console.log(
  `  senhas: ${reaproveitadas} reaproveitadas, ${nucleo.pessoas.length - reaproveitadas} novas ` +
    "(gravadas no .env.local como DEMO_SENHA_*, sem exibir aqui)",
);
console.log(`  squads: ${nucleo.squads.length}; participações: ${nucleo.participacoes.length}`);
console.log(
  `  ciclo "${avaliacao.ciclo.nome}" (${avaliacao.ciclo.status}): ` +
    `${ciclo.atribuicoes} atribuições (${ciclo.pendentes} pendentes), ` +
    `${ciclo.respostas} respostas, ${ciclo.comentarios} comentários`,
);
