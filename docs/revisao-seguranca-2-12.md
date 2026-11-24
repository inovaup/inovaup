# Revisão de segurança do MVP demonstrável (Q2)

- **Feita em:** 23/11/2026, sobre a `main` em `adf68d9` (depois da Q1). Congelamento do código: **2/12 às 12h**.
- **Escopo:** o código todo (`src/`, `supabase/`, `.github/`), a configuração dos projetos Supabase de dev e demo e o histórico do repositório, contra o checklist de PR e as regras de [`regras/seguranca-da-demo.md`](regras/seguranca-da-demo.md).
- **Revisão:** Daniel, com o Claude Code (sem subagentes). **Correções:** Davi na raia dele, Daniel na dele.
- **Critério de pronto da Q2:** nenhum achado grave aberto. O que não passar sai da demo.

## Resultado

**Nenhum achado grave.** O MVP pode ser demonstrado como está. Há dois achados médios (um corrigido nesta revisão, na documentação; o outro é decisão da equipe) e alguns baixos: dois entram na preparação da demo (S12 e S13, no roteiro) e os outros ficam para depois de 4/12.

## O que foi verificado e está certo

| Item | Como foi verificado |
|---|---|
| RLS ligada e negando por padrão em todas as 11 tabelas | Verificações SQL do núcleo e da avaliação no CI e no projeto demo ("OK"); consulta ao catálogo do demo |
| `service_role` só na semente e em `calculo/executar.ts` | `git grep` e a guarda automática (`guarda-service-role.test.ts`) |
| Nenhum segredo no repositório nem no histórico | Busca por chaves `sb_secret_`, `sb_publishable_`, JWT e `DEMO_SENHA_*` com valor em todo o `git log`: nada; nenhum `.env` versionado além do `.env.example` |
| Só a URL e a chave publicável como `NEXT_PUBLIC_` | `git grep` |
| Papel lido de `perfis` a cada requisição, nunca de `user_metadata` | Código de `src/lib/auth/sessao.ts`; teste de RLS que tenta virar GP pelo `user_metadata` |
| Cadastro desligado nos dois projetos | API de configurações do Auth (`disable_signup = true`) no dev e no demo |
| Toda página da área logada chama `requireRole()`; as da GP com `"gp"` | `rotas.test.ts` |
| As 6 ações de servidor chamam `requireRole()` antes de tudo e validam a entrada | Leitura do código (`resposta/acoes.ts`, `painel/acoes.ts`) e testes das ações |
| Ninguém lê respostas ou comentários de outra pessoa, nem a GP; avaliado não vê quem o avalia | Verificação SQL da A1 e testes pela API da A2 e da Q1 |
| Relatório só depois da liberação, cada um só o próprio; ninguém grava relatório pela API | Testes pela API da Q1 (no CI) e ensaio no demo |
| Supressão R1 a R7 aplicada antes de gravar; nenhuma nota individual gravada | Testes da A7 (com os casos da semente), ciclo completo no CI (Q1) e conferência no banco do demo |
| Nenhum `use cache`; Cache Components desligado | `next.config.ts` e `git grep` |
| Nenhum HTML injetado, `eval` ou script de terceiros/analytics | `git grep` |
| Proxy sem redirecionamento aberto | O redirecionamento vai sempre para `/auth/login`, sem parâmetro vindo da URL |
| Erros sem detalhe interno para o usuário | Login com mensagem genérica; ações devolvem mensagens genéricas e só repassam as mensagens das funções da A1 feitas para a pessoa |
| Dependências sem vulnerabilidade conhecida | `npm audit`: 0 vulnerabilidades (com e sem dependências de desenvolvimento) |
| CI com permissão mínima | `permissions: contents: read`; testes que gravam só rodam com CI e Supabase local (trava da Q1) |

## Achados

| ID | Gravidade | Achado | Decisão | Responsável | Situação |
|---|---|---|---|---|---|
| S1 | Médio | **Os cookies de sessão não são `httpOnly`.** O padrão do `@supabase/ssr` é `httpOnly: false`, porque o login usa o cliente do navegador. O plano (seção 4) e a `seguranca-da-demo.md` afirmavam o contrário. Risco: um XSS poderia ler a sessão. Mitigações atuais: React escapa todo texto, não há HTML injetado nem script de terceiros, e a demo roda em `localhost` | Para 4/12: aceito, e a documentação foi corrigida nesta revisão. Depois de 4/12: login por ação de servidor com cookies `httpOnly`, mais CSP | Daniel | Doc corrigida; código depois de 4/12 |
| S2 | Médio (processo) | **O repositório está público**, embora a D-06 diga privado. Verificado que não há segredos nem dados reais em nenhum commit, mas a documentação e a arquitetura ficam expostas | Decidir a visibilidade (e a proteção da `main`) antes do MVP operacional e antes de qualquer dado real. Atenção: no GitHub Free, a proteção da `main` só existe em repositório público (observação do Davi) | Davi e Daniel | Aberto, não bloqueia a demo |
| S3 | Baixo | Sem cabeçalhos de segurança (CSP, `frame-ancestors`), e o `X-Powered-By: Next.js` está ligado | Irrelevante em `localhost`; configurar ao publicar | Daniel | Depois de 4/12 |
| S4 | Baixo | O login da CLI do Supabase no computador do Daniel dá acesso de gestão aos projetos da organização | Rodar `npx supabase@3.2.0 logout` depois da demo; não deixar o computador desbloqueado | Daniel | Depois da Q3 |
| S5 | Baixo | As senhas fictícias de 4 contas do **dev** passaram pelo chat do Claude (e uma saída de comando). As do demo não passaram | Rodar a semente no dev depois de 4/12, com senhas novas | Davi | Depois de 4/12 |
| S6 | Baixo | Ações do GitHub fixadas por versão (`@v5`), não por hash | Fixar por hash ao endurecer o CI | Davi | Depois de 4/12 |
| S7 | Baixo | Senha mínima do Auth no padrão (6 caracteres). As contas da demo têm 24 e o cadastro está desligado | No MVP operacional o login será pelo Google | — | Sem ação para 4/12 |
| S8 | Informativo | A R7 prevê que a GP veja as contagens por grupo; elas ficaram fora do relatório gravado (o avaliado lê a linha inteira) e hoje a GP não as vê em lugar nenhum | Tela só da GP, depois de 4/12 | Daniel | Depois de 4/12 |
| S9 | Informativo | O projeto demo não tem o histórico de migrações do Supabase (aplicadas pela API, por falta de IPv6) | Migração nova no demo só pelo mesmo caminho, avisando antes | Daniel | Registrado |
| S10 | Informativo | Um comentário pode identificar o autor pelo conteúdo ou pelo estilo, mesmo sem nome e em ordem neutra | O campo já avisa "Comentários aparecem sem autor"; orientar os avaliadores no MVP operacional | GP | Depois de 4/12 |
| S11 | Baixo | O verificador de segurança do Supabase acusa que `anon` pode executar `public.rls_auto_enable()`. A função é do próprio Supabase (a opção "ligar a RLS sozinha em tabela nova", um gatilho de eventos do banco), não das nossas migrações, e função de gatilho de eventos não pode ser chamada pela API | Revogar o `EXECUTE` numa migração depois de 4/12. Conferir também no demo, que foi criado com essa opção | Davi | Depois de 4/12 |
| S12 | Baixo | O `npm run dev` escuta na rede local: qualquer pessoa no mesmo Wi-Fi abre a tela de login pelo IP do computador | Na demo, rodar `npx next dev -H 127.0.0.1` e conferir que a linha "Network" do terminal mostra `127.0.0.1`, não um IP da rede (no roteiro; testado em 24/11) | Daniel | Na Q3 |
| S13 | Baixo | A telemetria do Next.js está ligada no computador da apresentação | Rodar `npx next telemetry disable` na preparação (no roteiro) | Daniel | Na Q3 |

As funções `security definer` que o verificador do Supabase lista são intencionais: conferem o papel ou o dono por dentro e estão testadas na verificação SQL e na Q1. A proteção contra senhas vazadas do Auth só existe no plano pago. (Verificador rodado pelo Davi no dev.)

## Correções feitas nesta revisão

- `docs/PLANO_MVP_DEMONSTRAVEL.md`, seção 4, e `docs/regras/seguranca-da-demo.md`: a frase sobre os cookies agora diz o que de fato acontece (S1).
- `docs/PLANO_MVP_DEMONSTRAVEL.md`, seção 10: os achados para depois de 4/12 entraram na lista.
