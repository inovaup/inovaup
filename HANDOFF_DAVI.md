# HANDOFF — contexto do InovaUp para o Davi e o Claude Code dele

Preparado em 20/11/2026, a partir da sessão de planejamento do Daniel. Use este arquivo para começar **sem repetir pesquisas, auditorias ou planejamento**.

**Hierarquia de fontes:**
1. o código e o Git do repositório;
2. [`CLAUDE.md`](CLAUDE.md);
3. os documentos em [`docs/`](docs/);
4. este arquivo, que é um resumo.

Se houver divergência, vale o que estiver mais acima nessa lista. Registre a divergência e avise o Daniel.

**Legenda:**
- **[Confirmado]**: fato verificado (pelos usuários, pelo vídeo da GP ou pelo código do Impulse Up);
- **[Aprovado]**: decisão aprovada pela equipe;
- **[Premissa]**: suposição usada no plano até haver resposta;
- **[Pendente]**: questão em aberto.

---

## 1. Visão geral do InovaUp

- **O que é** [Confirmado]: sistema **interno** de gestão de pessoas da Empresa Júnior ADM UFBA, para substituir o **Impulse Up** (SaaS). Não será vendido, porque a empresa não tem estrutura de segurança para isso.
- **Por que** [Confirmado]:
  - o Impulse Up custa cerca de R$ 1.700 a 2.200 por mês e tem limite de 97 usuários, já atingido (a GP chegou a desativar logins);
  - o mapa de "quem avalia quem" é montado à mão numa planilha paralela;
  - os relatórios de pesquisas anônimas são montados à mão;
  - nas pesquisas de pulso, a continuidade do anonimato depende de "codinomes" inventados pelos trainees.
- **Processos da Gestão de Pessoas (GP)** [Confirmado]:
  - avaliação de desempenho bimestral, identificada, com pesos por tipo de avaliador e relatório individual;
  - escuta setorial bimestral, anônima;
  - pulso dos trainees semanal ou quinzenal, anônimo;
  - pesquisa de clima;
  - censo de diversidade semestral;
  - votações;
  - feedbacks.
  - **Não usam** PDI, reuniões 1:1 nem OKRs do Impulse Up.
- **Equipe** [Confirmado]:
  - **Davi** e **Daniel**, cerca de 4 h por dia cada, inclusive nos fins de semana;
  - nenhum dos dois domina React, Next.js ou TypeScript: **o Claude Code escreve o código, eles dirigem, testam pela tela e revisam**;
  - os dois usam Windows, sem Docker.

## 2. Objetivo e escopo do MVP de 04/12

**[Aprovado]** 4/12/2026 é a data do **MVP demonstrável**: sistema navegável, fluxo central da **avaliação de desempenho ponta a ponta**, **só com dados fictícios** e **demo local** (`localhost`).

**Incluído:**
1. Login com contas fictícias (colaborador, líder e GP).
2. Pessoas e squads pré-carregados, numa listagem.
3. Ciclo pré-carregado: questionário no formato da avaliação "TESTE" do Impulse Up, com pesos e com o **mapa "quem avalia quem" pré-carregado**.
4. Pendências do avaliador e resposta numa página única.
5. Cálculo da nota pela **fórmula provisória**.
6. **Painel da GP reduzido:** abrir ciclo, encerrar ciclo (dispara o cálculo), liberar relatórios do ciclo e o contador "X de Y respondidas".
7. **Relatório individual reduzido**, com supressão contra identificação indireta.

**Adiado para o MVP operacional:** pesquisas anônimas, Google OAuth, telas de cadastro e importação de pessoas, importação do questionário e do mapa, regras de visibilidade das perguntas, e-mail e lembretes, exportações, publicação na nuvem, média da organização e evolução entre edições.

**Adiado para a produção institucional:** pseudônimo das pesquisas, log de auditoria, backups, retenção e LGPD formal, produção sem acesso dos desenvolvedores.

**Descartado ou fase 2:** projetos, PDF, avaliações por grupo, devolutiva, modelos prontos, integração com o Monday, feedbacks, OKRs e 1:1.

Detalhes: [`docs/PLANO_MVP_DEMONSTRAVEL.md`](docs/PLANO_MVP_DEMONSTRAVEL.md) e [`docs/referencias/requisitos-v1.md`](docs/referencias/requisitos-v1.md).

## 3. Arquitetura e stack

**[Aprovado]**
- **Aplicação:** Next.js (App Router) com TypeScript, Tailwind e `shadcn/ui`, num único repositório, organizado por módulos (`src/modules/...`).
- **Banco, login e regras de acesso:** Supabase (Postgres, Auth com e-mail e senha na demo, RLS), região São Paulo.
- **Migrações:** SQL pela Supabase CLI via `npx supabase`, sem ORM. Tipos em `src/contracts/`.
- **Testes:** Vitest, inclusive testes de RLS. No CI (GitHub Actions), o Supabase local roda no runner.
- **Base do projeto:** modelo oficial `create-next-app -e with-supabase`, com **Cache Components desligado**.
- **Sem hospedagem até 4/12** (Vercel depois).

**[Confirmado]** As versões ainda não estão definidas, porque o projeto Next.js ainda não foi criado (é a tarefa F2 do Daniel). Uma geração anterior, já apagada, tinha criado Next.js 16.4.6 com Cache Components ligado. Por isso a regra de desligar.

## 4. Estado atual do repositório

Verificado em 20/11/2026, à noite:

| Item | Estado |
|---|---|
| Git | `main`, **sem nenhum commit** e **sem remoto**. O Daniel publica no GitHub privado e convida o Davi na tarefa F1 |
| Código, `package.json`, `src/`, `node_modules/` | **Não existem** |
| `supabase/`, migrações, tabelas, RLS, autenticação | **Não existem** |
| Tarefas concluídas, parciais ou iniciadas | **Nenhuma.** Todas as tarefas de [`docs/TAREFAS.md`](docs/TAREFAS.md) estão por fazer |
| Problemas conhecidos | Nenhum de código. Riscos na seção 17 |

Arquivos e para que servem:

| Arquivo | Finalidade |
|---|---|
| `CLAUDE.md` | Regras para as duas instâncias do Claude: fonte de verdade, raias, piso de segurança, uso da conta |
| `HANDOFF_DAVI.md` | Este arquivo |
| `.gitignore`, `.gitattributes` | Bloqueiam segredos (`.env*`), vídeos e transcrição; padronizam o fim de linha (LF) |
| `docs/PLANO_MVP_DEMONSTRAVEL.md` | Plano aprovado: veredito, escopo, fórmula, autenticação, supressão, portões, contratos, horas, datas e riscos |
| `docs/TAREFAS.md` | Todas as tarefas: responsável, revisor, horas, dependências, critério de pronto e texto base para pedir ao Claude |
| `docs/decisoes.md` | Decisões aprovadas (D-01 a D-15) e pendentes (P-01 a P-07) |
| `docs/regras/calculo-da-nota.md` | Fórmula provisória e 4 casos de referência para os testes |
| `docs/regras/seguranca-da-demo.md` | Autenticação, papéis, HTTPS, matriz de acesso, regras de supressão R1 a R7 e checklist de PR |
| `docs/referencias/` | Levantamentos: reunião com a GP, mapeamento do Impulse Up (fases 1 a 3), perguntas pendentes à GP, requisitos v1 classificados |

## 5. Decisões técnicas aprovadas

Resumo de [`docs/decisoes.md`](docs/decisoes.md):
- **D-01:** solução própria, só interna.
- **D-02:** Next.js e Supabase, na região São Paulo.
- **D-03:** 4/12 é o MVP demonstrável.
- **D-04:** a avaliação vem antes das pesquisas.
- **D-05:** Monday na fase 2.
- **D-06:** GitHub gratuito; proteção da `main` por convenção, hook e CI.
- **D-07:** Windows, sem Docker.
- **D-08:** conta do Claude compartilhada (risco crítico).
- **D-09:** demo local.
- **D-10:** e-mail e senha na demo; Google OAuth depois.
- **D-11:** dados sensíveis só no servidor; RLS negando por padrão; uso restrito da `service_role`.
- **D-12:** fórmula provisória.
- **D-13:** supressão contra identificação indireta.
- **D-14:** Cache Components desligado.
- **D-15:** o repositório é a fonte de verdade.

## 6. Decisões pendentes

[Pendente]
- **P-01:** segundo assento do Claude (recomendado).
- **P-02:** hospedagem do MVP operacional.
- **P-03:** as perguntas à GP (21 desde 27/11) ([`docs/referencias/perguntas-pendentes-gp.md`](docs/referencias/perguntas-pendentes-gp.md)). Elas **não bloqueiam a demo**.
- **P-04:** Google Workspace e app OAuth interno.
- **P-05:** quem guarda a chave do pseudônimo.
- **P-06:** orçamento dos planos pagos.
- **P-07:** disponibilidade nas festas de fim de ano.

[Premissas da demo, até as respostas da GP]
- pesos da avaliação TESTE;
- mínimo de 2 avaliadores por recorte;
- o líder com as mesmas permissões do colaborador;
- só a GP e o próprio avaliado veem o relatório.

## 7. Regras de negócio da avaliação

- **Estrutura:**
  - **ciclo** (status `rascunho → aberto → encerrado`, flag `relatorios_liberados`);
  - **seções**, cada uma com escala mínima e máxima, `permite_na` e peso;
  - **competências**, com peso e **sem comportamentos** no MVP;
  - **pesos dos grupos** (autoavaliação, gestor, pares, liderados);
  - **atribuições** (avaliado, avaliador, grupo, status `pendente → enviada`);
  - **respostas** (valor ou N/A) e **comentários** (um por seção);
  - **relatórios** (só o conteúdo publicável).
- **Questionário da demo** [Confirmado, avaliação TESTE]:
  - seção **Performance**, com N/A e de 1 a 10: Cumpre prazos, Preza pela organização, Faz entregas de qualidade, Gestão de projetos, Liderança;
  - seção **Comportamental**, de 1 a 10: Apoio e reconhecimento por parte das lideranças, Direcionamentos das lideranças;
  - pesos dos grupos 1 / 2 / 2 / 2.
- **Fórmula provisória.** Detalhe e casos de teste em [`docs/regras/calculo-da-nota.md`](docs/regras/calculo-da-nota.md):
  - **[Confirmado no código do Impulse Up]** média ponderada das competências na seção e das seções na nota final; % = nota ÷ **máximo** da escala × 100; N/A fora da conta;
  - **[Inferido]** média de cada grupo, combinada pelos pesos só dos grupos presentes (escolha provisória: combinar por competência);
  - **nenhuma parte foi validada pela GP.** Não apresentar como regra oficial.
- **Supressão** (R1 a R7, em [`docs/regras/seguranca-da-demo.md`](docs/regras/seguranca-da-demo.md#protecao-contra-identificacao-indireta)):
  - mínimo de 2 avaliadores além da própria pessoa;
  - se algum grupo tiver 1 respondente, nenhum grupo aparece separado ("Outros avaliadores (combinado)");
  - competência só com 2 ou mais respondentes;
  - comentários reunidos, sem autor e sem grupo, só com 2 ou mais comentaristas;
  - **nenhuma nota individual é gravada nem exibida.**

## 8. Segurança e privacidade

O piso é inegociável; detalhe em [`docs/regras/seguranca-da-demo.md`](docs/regras/seguranca-da-demo.md):
- **RLS ligada e negando por padrão em todas as tabelas**, e `requireRole()` em toda leitura e escrita sensível no servidor.
- **Papel** (`colaborador`, `lider`, `gp`) em `perfis.papel`, escrito **só pela semente**. Não existe política de UPDATE para usuários. **Nunca usar `user_metadata`.**
- **Cadastro desligado** no Supabase. Contas fictícias só pela semente (`@demo.inovaup.test`). **Não existe login que pule a autenticação.**
- **`service_role`** só na semente e em `src/modules/avaliacao/calculo/executar.ts` (`server-only`, depois de `requireRole('gp')`). Fica em `.env.local`, nunca em `NEXT_PUBLIC_*`.
- **Respostas e comentários:** só o próprio avaliador lê. **Nem a GP lê.** O cálculo lê pela `service_role` e grava só o relatório já suprimido.
- **Cache Components desligado.** Sem analytics de terceiros. Demo em `http://localhost`, só no computador de quem apresenta.
- **Privacidade e LGPD** [Confirmado]:
  - **os desenvolvedores nunca veem dados reais de pessoas**; só dados fictícios no repositório, nos bancos de desenvolvimento e de demo e nas conversas com o Claude;
  - a transcrição da reunião, o vídeo da GP e as planilhas reais nunca entram no repositório;
  - o censo de diversidade envolve dados pessoais sensíveis (fora do MVP).
- **Portão de dados reais** (depois de 4/12): Supabase Pro com backup e teste de restauração, produção sem os desenvolvedores, OAuth interno, log de auditoria, retenção e base legal, fórmula validada e liberação assinada pelo diretor de GP.

## 9. Requisitos relevantes para 4/12

Classificação completa em [`docs/referencias/requisitos-v1.md`](docs/referencias/requisitos-v1.md):
- **Funcionais:** RF-02 (perfis), RF-04 (pessoas: semente e listagem), RF-06 (squads: semente), RF-18 (ciclo com seções, pré-carregado), RF-19 (4 grupos de peso), RF-20 (pesos e cálculo provisório), RF-25 (relatório reduzido), RF-26 (liberação), RF-32 (contador do ciclo), RF-36 (pendências do avaliador) e RF-39 (resposta do avaliador).
- **Não funcionais:** RNF-01 (a API devolve só o permitido), RNF-03 revisto (supressão), RNF-04 (HTTPS e criptografia), RNF-06 (sem analytics), RNF-08 (português) e RNF-12 (só dados fictícios).

## 10. Divisão de responsabilidades

- **Davi, raia de dados:** núcleo (perfis, pessoas, squads), RLS e semente, CI e hook, modelo da avaliação, semente do ciclo, fórmula e execução do cálculo, testes de permissão e correções de segurança.
- **Daniel, raia da aplicação:** repositório no GitHub, projeto base, `CLAUDE.md` e template de PR, login, sessão e papéis, menu e listagem, tela de resposta, painel da GP, supressão e relatório, revisão de segurança, demo.

**Quem pode modificar o quê:**

| Pasta / arquivo | Dono | Para o outro |
|---|---|---|
| `supabase/migrations/`, `supabase/seed/` | **Davi** | O Daniel só por PR avisado (ex.: a função de leitura do relatório, se precisar) |
| `src/contracts/core.ts`, `src/contracts/avaliacao.ts` | **Davi** | Mudança só pelo dono |
| `src/modules/nucleo/`, `src/modules/avaliacao/dados/`, `src/modules/avaliacao/calculo/` | **Davi** | — |
| `src/lib/auth/`, `src/lib/supabase/` | **Daniel** | — |
| `src/app/` (rotas, layout, menu), `src/modules/avaliacao/resposta/`, `relatorio/`, `painel/` | **Daniel** | — |
| **Compartilhados:** `package.json`, `package-lock.json`, `next.config.*`, `.github/` | Quem precisar, **num PR só para isso, avisado ao outro** | O outro atualiza a branch depois do merge |
| `docs/`, `CLAUDE.md`, este arquivo | Ambos | Sempre por PR |

**O Davi não deve sobrescrever, duplicar nem reconstruir o trabalho do Daniel.** Em especial:
- não recriar o projeto Next.js;
- não mexer em autenticação, layout ou menu;
- não criar outro cliente do Supabase em `src/lib/`.

## 11. Contratos de integração

| Contrato | Data | Dono → consumidor | Conteúdo |
|---|---|---|---|
| **I1** | 23/11 | Davi → Daniel | Migração do núcleo + `src/contracts/core.ts` (tipos `Perfil`, `Papel`, `Squad`, participação) + função `eh_gp()` |
| **I2** | 25/11 | Daniel → Davi | `getCurrentUser()` (id, nome e papel lidos de `perfis`) e `requireRole(...papeis)`, em `src/lib/auth/` |
| **I3** | 27/11 | Davi → Daniel | Migração da avaliação + `src/contracts/avaliacao.ts` (incluindo `ResultadoCompleto` e `RelatorioPublicavel`) |
| **I4** | 30/11 | Davi → Daniel | `calcularResultado()` (função pura) + `executar.ts`, que grava em `relatorios` o resultado de `montarRelatorioPublicavel()` (função pura do Daniel, A7) |

**Tipos simulados enquanto um contrato não chega:**
- quem consome cria um mock **dentro da própria pasta** (ex.: `src/modules/avaliacao/resposta/__mocks__/avaliacao.ts`), com a mesma forma combinada, e troca pelo import real quando o contrato for juntado;
- **nunca criar nem editar o arquivo de contrato do outro.**

Casos do Davi:
- até o I2, os testes de RLS usam login direto do supabase-js com as contas fictícias, sem depender dos helpers do Daniel;
- na A6, até a A7 existir, `executar.ts` usa um stub de `montarRelatorioPublicavel()` que grava **"indisponível"** para todos, **nunca dados sem supressão**.

**Mudou um contrato depois de publicado?** Abrir PR com o título `[CONTRATO]`, avisar o outro e esperar a revisão dele.

## 12. Cronograma e dependências

| Janela | Davi | Daniel |
|---|---|---|
| 21/11 | F1 ambiente, F8 aprendizado | F1 ambiente + **criar o repositório no GitHub, primeiro commit, convidar o Davi**; F8 |
| 22/11 | F3 banco de dev; início da F4 | F2 projeto base; F7 template de PR; F3 dev e demo |
| 22–23/11 | **F4 núcleo → I1** | F5 login e papéis (com I1) |
| 23–24/11 | F6 CI e hook | F5 → **I2** (25/11) |
| **24/11** | **Portão G1:** núcleo, login e CI verdes na `main` | — |
| 25–27/11 | **A1 modelo da avaliação → I3** | A5 tela de resposta (com mock até o I3) |
| 27/11 | A2 semente do ciclo | A5 |
| **28/11** | **Portão G2:** modelo e resposta gravando, com RLS testado | A8 painel (28–29/11) |
| 28–30/11 | **A6 cálculo → I4** | — |
| 30/11–1/12 | Q1 lacunas de permissão (1–2/12) | A7 supressão e relatório |
| **1/12** | **Portão G3:** cálculo e relatório | — |
| **2/12, 12h** | Q2: correções; **congelamento** | Q2: revisão de segurança |
| 3/12 | Apoio ao ensaio | Q3: demo (migrações e semente no projeto demo, roteiro, ensaio) |
| **4/12** | **Apresentação** | **Apresentação** |

**Se um portão falhar:**
- G1: o painel fica só com os botões, e a resposta da demo usa 1 seção;
- G2: o relatório mostra só a nota final e a nota por competência;
- G3: resultado semeado, declarado como tal.

**Datas seguintes:** avaliação operacional por volta de 18/12; pesquisas por volta de 22/1/2027; produção institucional em fevereiro ou março de 2027.

## 13. Tarefas específicas do Davi

Horas humanas P50 / P80. Total P50 de **30,5 h**, para uma capacidade de 31 a 35 h. Critérios completos em [`docs/TAREFAS.md`](docs/TAREFAS.md).

| ID | Tarefa | Depende de | P50 / P80 | Pronto quando |
|---|---|---|---|---|
| F1 | Ambiente: Node LTS, Git, VS Code, Claude Code; aceitar o convite e clonar | Daniel publicar o repositório | 2 / 3 | `git pull` funciona e o Claude Code abre na pasta |
| F8 | Aprendizado dirigido (Git e PR, App Router, RLS) | F1 | 1,5 / 2,5 | PR de teste juntado |
| F3 | Projeto Supabase de dev (região São Paulo, cadastro desligado, chaves em `.env.local`) | F1 | 0,5 / 1 | Conecta; cadastro recusado |
| F4 | Núcleo: `perfis` (com `papel`), `squads`, `participacoes_squad`; RLS; `eh_gp()`; semente com contas fictícias; `src/contracts/core.ts` | F3 (e F2 para a semente em TS) | 4 / 6 | Testes: colaborador não lê perfis alheios nem muda o próprio papel; a GP lê todos |
| F6 | CI (typecheck, lint, Vitest, Supabase local no Actions) + `.githooks/pre-push` | F2, F4 | 3 / 5 | PR com RLS quebrada fica vermelho; push na `main` é bloqueado |
| A1 | Modelo da avaliação + RLS + testes + `src/contracts/avaliacao.ts` | I1, I2 | 5 / 7,5 | Testes de cada regra de acesso verdes |
| A2 | Semente do ciclo (questionário TESTE, 12 a 15 pessoas, mapa com os casos de supressão, 2 atribuições pendentes) | A1 | 2 / 3 | `npm run seed` recria tudo do zero |
| A6 | `calcularResultado()` + `executar.ts` (stub da supressão até a A7) | A1 | 4,5 / 6,5 | Os 4 casos de referência passam; nada individual é gravado |
| Q1 | Lacunas de permissão (no máximo 1 subagente para gerar os casos) | A5, A7, A8 | 1,5 / 2,5 | Tudo verde no CI |
| Q2 | Correções da revisão de segurança | Q2 do Daniel | 1,5 / 3 | Nenhum achado grave aberto |
| Cont. | Revisar os PRs sensíveis do Daniel (3,5 h) e integração diária (1,5 h) | — | 5 / 7 | — |

## 14. Tarefas específicas do Daniel

Total P50 de **31 h**. O Davi revisa os PRs sensíveis delas.
- **F1:** ambiente, repositório no GitHub e convite. 1,5 h.
- **F8:** aprendizado dirigido. 1,5 h.
- **F2:** projeto base `with-supabase`, Cache Components desligado. 2,5 h.
- **F7:** completar o `CLAUDE.md` e criar o template de PR. 1 h.
- **F3:** projetos de dev e demo. 1 h.
- **F5:** login, sessão, `getCurrentUser()` e `requireRole()`, menu e listagem; é o contrato **I2**. 4 h.
- **A5:** pendências e resposta. 4 h.
- **A8:** painel reduzido. 1 h.
- **A7:** `montarRelatorioPublicavel()` e relatório. 4 h.
- **Q2:** revisão de segurança. 2 h.
- **Q3:** demo. 2 h.
- **Contínuas:** 6,5 h.

## 15. Convenções de Git e colaboração

- **GitHub Flow:** a `main` é estável. Para cada tarefa, uma branch `feature/<ID>-<descricao>` (ou `fix/...`) a partir da `main` atualizada.
- **Nunca fazer push na `main`.** O hook `.githooks/pre-push` (F6) bloqueia. Ative com `git config core.hooksPath .githooks`.
- PR pequeno, com o checklist de segurança. **O outro revisa todo PR que toca SQL, RLS, autenticação, ações de servidor ou variáveis.** CI verde antes de juntar.
- **Migrações:** só novas; nunca editar uma já aplicada. Só o Davi cria, com o Daniel por PR avisado.
- **Arquivos compartilhados** (`package.json`, lockfile, `next.config.*`, `.github/`): um PR só para isso, avisado ao outro. Conflito no lockfile: aceitar a versão da `main` e rodar `npm install` de novo.
- **Toda manhã:** `git switch main && git pull`, depois atualizar a sua branch (`git merge main` ou `git rebase main`).
- **Comunicação:**
  - 10 a 15 minutos de alinhamento por dia: o que foi feito, o que trava, o que vem a seguir;
  - o status das tarefas é marcado em [`docs/TAREFAS.md`](docs/TAREFAS.md), num PR;
  - decisões novas entram em [`docs/decisoes.md`](docs/decisoes.md);
  - mudança de contrato em PR com `[CONTRATO]` no título.

## 16. Instruções para o Claude Code

- **O Claude do Davi não sabe o que o Claude do Daniel fez.** Antes de cada tarefa:
  - `git pull`;
  - `git log --oneline -20`;
  - ler os PRs abertos;
  - reler [`CLAUDE.md`](CLAUDE.md) e a tarefa em [`docs/TAREFAS.md`](docs/TAREFAS.md).
- **Modo de plano primeiro:** propor os passos e só implementar depois da confirmação do Davi.
- **Uma tarefa por vez**, só nos arquivos da raia do Davi, com **testes de permissão no mesmo PR**. Rodar typecheck, lint e testes.
- **Conta do Claude compartilhada com o Daniel:**
  - **até 4/12, não usar workflows, ultracode nem subagentes em paralelo** (exceção: um subagente para gerar casos de teste na Q1);
  - conferir o uso antes de tarefas longas;
  - se o limite acabar, revisar PRs, testar ou documentar.
- **Next.js:** conferir a versão instalada e, se existir, ler a documentação local em `node_modules/next/dist/docs` antes de usar uma API.
- **Proibido:**
  - inventar credenciais;
  - colocar segredos em arquivos versionados ou na conversa;
  - usar dados reais de pessoas;
  - recriar o que já existe na raia do Daniel;
  - implementar o que não está em [`docs/TAREFAS.md`](docs/TAREFAS.md).

## 17. Riscos conhecidos

1. **Conta do Claude compartilhada.** O limite semanal acaba no meio das semanas (24% já gastos em 20/11; renova toda segunda às 02:00), e a regra de um assento por pessoa do plano Team pode levar a suspensão. Mitigação: as regras da seção 16; segundo assento recomendado.
2. **Fundação atrasar** (iniciantes, Windows, sem Docker, Next.js recente). Portão G1; modelo oficial; Cache Components desligado.
3. **Integração entre as raias.** Contratos I1 a I4 com data; mocks na própria pasta; PRs juntados todo dia.
4. **Segurança verificada tarde.** Testes no mesmo PR; congelamento em 2/12; o que não passar sai da demo.
5. **Ausência de um dos dois.** Não há folga; os portões definem os cortes.
6. **Limite gratuito do Supabase:** 2 projetos ativos por pessoa dona ou administradora, e pausa depois de uma semana sem uso. O Davi usa 1 projeto de dev na organização pessoal dele.

## 18. Próxima ação recomendada para o Davi

1. **Já, sem depender de ninguém:**
   - **F1** (instalar Node.js LTS, Git, VS Code e Claude Code; configurar `git config user.name` e `user.email` com a sua identidade);
   - **F3** (criar o projeto Supabase de dev em São Paulo, desligar "Allow new users to sign up" e guardar URL e chaves só em `.env.local`).
2. **Assim que o Daniel publicar o repositório e convidar você:** aceitar, clonar e fazer a **F8**.
3. **Primeira tarefa de código: F4 (núcleo).**
   - Pode começar **em paralelo com a F2 do Daniel**, só em `supabase/` (`npx supabase init`, migração do núcleo, RLS, `eh_gp()`) e aplicando no seu banco de dev.
   - O script de semente em TS e o `src/contracts/core.ts` dependem do `package.json` e do `src/` criados pela F2. Faça essa parte depois que a F2 for juntada na `main` (prevista para 22/11).
   - Se a semente precisar de uma dependência que o modelo não traz (ex.: `tsx` para rodar TypeScript), peça ao Daniel para incluí-la na F2 ou abra um PR só de dependências, avisado.
   - **Entrega o I1 até 23/11.**

---

## PRIMEIRA SESSÃO DO DAVI

Instruções para o Claude Code do Davi, na primeira vez que abrir o repositório:

1. **Leia o [`CLAUDE.md`](CLAUDE.md)** inteiro.
2. **Leia este `HANDOFF_DAVI.md`** inteiro e depois [`docs/TAREFAS.md`](docs/TAREFAS.md), [`docs/regras/seguranca-da-demo.md`](docs/regras/seguranca-da-demo.md) e [`docs/regras/calculo-da-nota.md`](docs/regras/calculo-da-nota.md).
3. **Inspecione o repositório e o Git:** `git status`, `git log --oneline -30`, `git branch -a`, os PRs abertos e a estrutura de pastas. Verifique se existem `package.json`, `src/`, `supabase/`, `.github/` e `.githooks/`.
4. **Compare o estado real com o planejamento.** Para cada tarefa do Davi e do Daniel, diga se está concluída (o código existe, os testes passam, está na `main`), parcial ou não iniciada. **Não considere nada concluído só porque aparece no plano.** Aponte divergências com este handoff.
5. **Identifique a primeira tarefa independente do Davi**, ainda não feita e cujas dependências já estão na `main`. A ordem esperada é F1, F3, F4 (parte de `supabase/`), F4 (semente e contrato, depois da F2), F6 e A1.
6. **Apresente um plano curto:** arquivos que vai criar ou alterar (todos na raia do Davi), testes de permissão, comandos e critério de pronto da tarefa.
7. **Só comece a implementar depois de confirmar que não há conflito com a raia do Daniel:**
   - nenhum arquivo da tabela da seção 10 que pertença a ele;
   - nenhum PR aberto do Daniel tocando os mesmos arquivos;
   - nenhum arquivo compartilhado sem aviso;
   - e com a confirmação do Davi.
