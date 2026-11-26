# Tarefas do MVP demonstrável (até 4/12/2026)

As horas são **humanas**, em P50 / P80. "IA" é o tempo de execução do Claude. A capacidade útil com a conta compartilhada é de 31 a 35 h por pessoa. Regras gerais em [`../CLAUDE.md`](../CLAUDE.md).

**Como pedir cada tarefa ao Claude** (texto base; troque `<ID>`):

> Leia o CLAUDE.md e a tarefa `<ID>` em docs/TAREFAS.md. Entre em modo de plano e proponha os passos antes de escrever código. Implemente só nos arquivos da minha raia, com os testes de permissão no mesmo PR. Rode typecheck, lint e testes e abra o PR com o checklist.

## Resumo

| ID | Tarefa | Resp. | Revisor | P50 / P80 | Janela | Status |
|---|---|---|---|---|---|---|
| F1 | Ambiente Windows e repositório | Davi / Daniel | — | 2 / 3 · 1,5 / 2,5 | 21/11 | [x] |
| F8 | Aprendizado dirigido | Davi / Daniel | — | 1,5 / 2,5 cada | 21–22/11 | [x] |
| F2 | Projeto base Next.js + Supabase | Daniel | Davi | 2,5 / 4 | 22/11 | [x] |
| F7 | Completar o CLAUDE.md e template de PR | Daniel | Davi | 1 / 2 | 22/11 | [x] |
| F3 | Projetos Supabase (dev e demo) | Davi / Daniel | — | 0,5 / 1 · 1 / 2 | 22/11 | [x] |
| F4 | Núcleo, RLS e semente (I1) | Davi | Daniel | 4 / 6 | 22–23/11 | [x] |
| F6 | CI e hook de pre-push | Davi | Daniel | 3 / 5 | 23–24/11 | [x] |
| F5 | Login, sessão, papéis, menu e listagem (I2) | Daniel | Davi | 4 / 6 | 23–25/11 | [x] |
| **G1** | **Portão: núcleo, login e CI verdes** | — | — | — | 24/11 | [x] |
| A1 | Modelo da avaliação (I3) | Davi | Daniel | 5 / 7,5 | 25–27/11 | [x] |
| A2 | Semente do ciclo de demonstração | Davi | Daniel | 2 / 3 | 27/11 | [x] |
| A5 | Pendências e tela de resposta | Daniel | Davi | 4 / 6,5 | 26–28/11 | [x] |
| A8 | Painel da GP reduzido | Daniel | Davi | 1 / 2 | 28–29/11 | [x] |
| **G2** | **Portão: modelo e resposta gravando, RLS testado** | — | — | — | 28/11 | [x] |
| A6 | Fórmula provisória e execução do cálculo (I4) | Davi | Daniel | 4,5 / 6,5 | 28–30/11 | [x] |
| A7 | Supressão e relatório reduzido | Daniel | Davi | 4 / 6 | 30/11–1/12 | [x] |
| **G3** | **Portão: cálculo e relatório** | — | — | — | 1/12 | [x] |
| Q1 | Lacunas de permissão | Davi | Daniel | 1,5 / 2,5 | 1–2/12 | [x] |
| E0 | Refinamento antes do congelamento (D-17): C2, C3, B2 e legenda do C6 | Daniel | Davi | 4 / 5 | até 1/12 | [x] |
| Q2 | Revisão de segurança e correções; congelamento às 12h | Daniel / Davi | — | 2 / 3 · 1,5 / 3 | 2/12 | [x] |
| Q3 | Demo: migrações e semente no projeto demo, roteiro, ensaio | Daniel | Davi | 2 / 3 | 3/12 | [ ] |
| Cont. | Revisão de PRs sensíveis, integração diária, coordenação com a GP | Davi / Daniel | — | 5 / 7 · 6,5 / 9 | diário | — |

**Totais (P50):** Davi **30,5 h** · Daniel **31 h**. No P80 (≈ 40 e ≈ 41,5 h), os portões aplicam os cortes. A E0 (D-17), aprovada em 24/11, soma 4 h ao Daniel fora desse total.

## Detalhe das tarefas

### F1 — Ambiente Windows e repositório (Davi 2 h; Daniel 1,5 h · IA 5 min)
- **Construir:**
  - os dois instalam Node.js LTS, Git for Windows, VS Code e Claude Code, e configuram `git config user.name` e `user.email`;
  - **Daniel:** cria o repositório **privado** no GitHub, faz o primeiro commit com o conteúdo atual (`CLAUDE.md`, `docs/`, `.gitignore`, `.gitattributes`), faz o push da `main` e convida o Davi como colaborador;
  - **Davi:** aceita o convite e clona;
  - os dois rodam `git config core.hooksPath .githooks` depois da F6.
- **Como o Claude executa:** guia a instalação e diagnostica erros. Não instala nada sem você confirmar.
- **Depende de** — → **entrega:** repositório clonado nos dois computadores.
- **Pronto quando:** os dois fazem `git pull` sem erro e abrem o Claude Code na pasta.

### F8 — Aprendizado dirigido (1,5 h cada · IA 15 min)
- **Construir:** uma sessão guiada pelo Claude sobre branch, PR e revisão; rotas do App Router; RLS no Supabase. Cada um registra 5 a 10 linhas em `docs/aprendizado.md`.
- **Depende de** F1 → **entrega:** um PR de cada um juntado na `main`.
- **Pronto quando:** os dois fizeram o fluxo completo de branch, PR, revisão do outro e merge.

### F2 — Projeto base (Daniel 2,5 h · IA 15 min)
- **Construir:**
  - projeto gerado com `npx create-next-app@latest -e with-supabase`;
  - como a pasta já tem arquivos, gerar numa pasta temporária e mover para a raiz, mesclando o `.gitignore`;
  - Tailwind e `shadcn/ui` do próprio modelo;
  - **Cache Components desligado** no `next.config`;
  - pastas `src/modules/` e `src/contracts/` (conforme o `CLAUDE.md`);
  - scripts `typecheck`, `lint` e `test` (Vitest);
  - `.env.example` só com os nomes das variáveis.
- **Depende de** F1 → **entrega:** esqueleto na `main`.
- **Pronto quando:** `npm run build`, `npm run lint` e `npm run typecheck` passam, e a página de login do modelo abre em `http://localhost:3000`.

### F7 — Completar o CLAUDE.md e template de PR (Daniel 1 h · IA 10 min)
- **Construir:** atualizar o `CLAUDE.md` com os caminhos reais criados na F2 e criar `.github/pull_request_template.md` com o checklist de [`regras/seguranca-da-demo.md`](regras/seguranca-da-demo.md#checklist-de-pr).
- **Depende de** F2 → **entrega:** PR de documentação.
- **Pronto quando:** revisado e juntado pelo Davi.

### F3 — Projetos Supabase (Davi 0,5 h; Daniel 1 h · IA 5 min)
- **Construir:**
  - **Atualizado em 21/11 (D-16):** 1 projeto de desenvolvimento **compartilhado** pelos dois e 1 projeto **demo**, na região São Paulo (limite gratuito: 2 projetos por pessoa dona ou administradora);
  - as mesmas chaves do projeto compartilhado vão no `.env.local` dos dois computadores, nunca no repositório nem no chat;
  - em todos: **"Allow new users to sign up" desligado**;
  - URL e chaves em `.env.local`.
- **Depende de** F1 → **entrega:** bancos criados.
- **Pronto quando:** o app conecta ao banco e uma tentativa de cadastro pela API é recusada.

### F4 — Núcleo, RLS e semente (Davi 4 h · IA 20 min) → contrato **I1** (23/11)
- **Construir:**
  - migração com `perfis` (1:1 com `auth.users`: nome, e-mail fictício, área, cargo, nível, `papel` enum `colaborador|lider|gp`, situação), `squads` e `participacoes_squad` (perfil, squad, início, fim; as edições do Núcleo são períodos);
  - **RLS ligada e negando por padrão**: cada pessoa lê o próprio perfil; a GP lê todos; **nenhuma política de INSERT, UPDATE ou DELETE para usuários**;
  - função `eh_gp()` (`security definer`, `search_path` fixo);
  - script `npm run seed` com contas fictícias (API admin, `email_confirm: true`, `@demo.inovaup.test`, senhas aleatórias de 16 caracteres ou mais, gravadas no `.env.local`);
  - tipos em `src/contracts/core.ts`.
- **Depende de** F3 → **entrega:** I1.
- **Pronto quando:** a migração é aplicada no banco de dev e os testes provam que o colaborador não lê perfis alheios, não altera o próprio `papel` e que a GP lê todos.

### F6 — CI e hook de pre-push (Davi 3 h · IA 20 min)
- **Construir:**
  - `.github/workflows/ci.yml`: `npm ci`, typecheck, lint, Supabase CLI no runner (`supabase start`, migrações e semente de teste), Vitest com os testes de RLS;
  - `.githooks/pre-push`, que bloqueia push na `main`.
- **Depende de** F2, F4 → **entrega:** CI em todo PR.
- **Pronto quando:** um PR com RLS quebrada de propósito fica vermelho e um `git push origin main` local é bloqueado.

### F5 — Login, sessão, papéis, menu e listagem (Daniel 4 h · IA 30 min) → contrato **I2** (25/11)
- **Construir:**
  - login por e-mail e senha (do modelo), logout e sessão com `@supabase/ssr`;
  - remover a página e o fluxo de cadastro do modelo;
  - em `src/lib/auth/`: `getCurrentUser()` (id, nome, papel lido de `perfis`) e `requireRole(...papeis)`, que lê o banco a cada requisição;
  - menu por papel;
  - página **Pessoas e squads** (só leitura, GP), com a listagem do escopo.
- **Depende de** F2, I1 → **entrega:** I2.
- **Pronto quando:** os testes provam que um usuário sem sessão é redirecionado, que o colaborador recebe acesso negado na página e nas ações da GP e que não existe rota de cadastro.

### A1 — Modelo da avaliação (Davi 5 h · IA 30 min) → contrato **I3** (27/11)
- **Construir:**
  - migração com:
    - `ciclos` (status `rascunho|aberto|encerrado`, `relatorios_liberados`);
    - `secoes` (escala mínima e máxima, `permite_na`, peso, ordem);
    - `competencias` (pergunta, peso, ordem; **sem comportamentos**);
    - `pesos_grupo` (`autoavaliacao|gestor|pares|liderados`);
    - `atribuicoes` (avaliado, avaliador, grupo, status `pendente|enviada`);
    - `respostas` (valor ou N/A);
    - `comentarios` (por seção);
    - `relatorios` (só conteúdo publicável, gravado pela A6);
  - **RLS:**
    - o avaliador lê as próprias atribuições e grava respostas e comentários só nas próprias, com o ciclo aberto e a atribuição pendente;
    - **ninguém lê respostas ou comentários de outros, nem a GP**;
    - a GP lê atribuições (mapa e status) e ciclos;
    - `relatorios`: o avaliado lê o próprio só com `relatorios_liberados`; a GP lê todos;
  - tipos em `src/contracts/avaliacao.ts`, incluindo `ResultadoCompleto` e `RelatorioPublicavel`.
- **Depende de** I1, I2 → **entrega:** I3.
- **Pronto quando:** os testes de permissão de cada regra acima passam no CI.

### A2 — Semente do ciclo de demonstração (Davi 2 h · IA 10 min)
- **Construir:**
  - questionário no formato TESTE: seção Performance (N/A e 1 a 10; Cumpre prazos, Preza pela organização, Faz entregas de qualidade, Gestão de projetos, Liderança) e seção Comportamental (1 a 10; Apoio e reconhecimento por parte das lideranças, Direcionamentos das lideranças);
  - pesos dos grupos 1/2/2/2;
  - 12 a 15 pessoas fictícias;
  - mapa com **um caso com 2 ou mais respondentes por grupo**, **um caso com gestor único** (aciona a supressão complementar) e **um caso com só 1 avaliador além da própria pessoa**;
  - respostas pré-preenchidas, deixando 2 atribuições pendentes para a demonstração ao vivo.
- **Depende de** A1 → **entrega:** dados da demo.
- **Pronto quando:** `npm run seed` recria tudo do zero (idempotente).

### A5 — Pendências e tela de resposta (Daniel 4 h · IA 30 min)
- **Construir:** lista de pendências do avaliador e uma página única com todas as seções: escala, opção N/A quando a seção permite, um comentário por seção, salvar e enviar. Depois de enviada, a atribuição fica só para leitura.
- **Como o Claude executa:** com tipos simulados até o I3 (27/11) e depois com os reais.
- **Depende de** I2, I3 → **entrega:** fluxo de resposta.
- **Pronto quando:** a resposta enviada fica gravada e os testes provam que outro avaliador não a lê nem a altera.

### A8 — Painel da GP reduzido (Daniel 1 h · IA 15 min)
- **Construir:** botões "Abrir ciclo", "Encerrar ciclo" (chama a execução do cálculo da A6) e "Liberar relatórios do ciclo", mais o contador "X de Y avaliações respondidas". **Sem:** tabelas por pessoa, filtros, reabertura, reenvio, liberação individual, edição do ciclo, exportação.
- **Depende de** I3, I4 → **entrega:** painel.
- **Pronto quando:** os testes provam que só a GP acessa e que encerrar dispara o cálculo.

### A6 — Fórmula provisória e execução do cálculo (Davi 4,5 h · IA 20 min) → contrato **I4** (30/11)
- **Construir:**
  - `calcularResultado()` em `src/modules/avaliacao/calculo/`: **função pura**, conforme [`regras/calculo-da-nota.md`](regras/calculo-da-nota.md), devolvendo `ResultadoCompleto` (nota final, por competência, por grupo, com contagens e comentários reunidos);
  - `executar.ts` (`server-only`, único uso da `service_role` além da semente): lê as respostas do ciclo, calcula, chama `montarRelatorioPublicavel()` (A7) e grava **só** o resultado em `relatorios`;
  - até a A7 existir, um stub que grava "indisponível" para todos (nunca dados sem supressão).
- **Depende de** A1 → **entrega:** I4.
- **Pronto quando:** os casos de referência do documento passam (N/A, escalas diferentes, grupo ausente) e nenhuma nota individual é gravada.

### A7 — Supressão e relatório reduzido (Daniel 4 h · IA 30 min)
- **Construir:**
  - `montarRelatorioPublicavel()`, **função pura**, em `src/modules/avaliacao/relatorio/supressao.ts`, com as regras de [`regras/seguranca-da-demo.md`](regras/seguranca-da-demo.md#protecao-contra-identificacao-indireta);
  - página do relatório: nota final %, por competência %, "Sua autoavaliação", grupos só quando a regra permite e comentários reunidos;
  - o colaborador vê só o próprio, depois da liberação; a GP abre qualquer pessoa do ciclo.
  - **Sem:** gráfico, média da organização, nota por seção, visão do líder, PDF.
- **Depende de** I4 → **entrega:** relatório.
- **Pronto quando:** os testes de cada regra de supressão passam (grupo com 1, subtração, um só avaliador, comentários) e nada aparece antes da liberação.

### Q1 — Lacunas de permissão (Davi 1,5 h · IA 15 min)
- **Construir:** testes faltantes por papel: relatório alheio, respostas alheias, painel da GP, troca de papel, acesso antes da liberação. Pode usar **um** subagente para gerar os casos, e o Davi revisa.
- **Depende de** A5, A7, A8 → **entrega:** suíte no CI.
- **Pronto quando:** tudo verde no CI.

### E0 — Refinamento antes do congelamento (Daniel 4 h · IA 30 min) → D-17
- **Construir** (itens da auditoria de 24/11; só tela, sem banco e sem regra de negócio):
  - **C2:** `loading.tsx`, `error.tsx` e `not-found.tsx` na área logada, em português e com caminho de volta;
  - **C3:** o item do menu da página atual fica marcado (`aria-current`); ícones e menu de celular ficam para depois de 4/12;
  - **B2:** a confirmação de "Encerrar ciclo" mostra quantas avaliações faltam ("Faltam N de Y"), com o número que o painel já calcula;
  - **C6, só a legenda:** "1 = menor nota, 10 = maior nota" uma vez por seção, não em cada competência.
- **Depende de** D-17 → **entrega:** um PR na raia do Daniel, revisado pelo Davi.
- **Pronto quando:** o PR está juntado até 1/12; typecheck, lint e testes verdes; o ensaio no demo dá os mesmos números do roteiro (83,45%, 76,17% e a Colaboradora Dois só com a autoavaliação) e o "Acesso negado" do `/painel` para quem não é GP. Se algo quebrar, o PR é desfeito: a demo não depende desses itens.
- **Feita em 25/11:** PR #24 juntado. Ensaio no demo, depois da semente: confirmação "Faltam 2 de 17" com o ciclo aberto e "Todas as avaliações foram respondidas (17 de 17)" antes de encerrar; Líder 83,45%, Colaborador Um 76,17% (só combinado), Colaboradora Dois só com a autoavaliação; "Acesso negado" no `/painel` para o Líder; tela "Carregando…" em português. "Página não encontrada", menu marcado e legenda da escala conferidos antes, no banco de desenvolvimento. PR #24 revisado pelo Davi depois do merge, em 26/11, sem achados.

### Q2 — Revisão de segurança (Daniel 2 h revisão; Davi 1,5 h correções · IA 15 min)
- **Construir:** `/security-review` mais o checklist de PR aplicado ao código todo. **Congelamento às 12h de 2/12.**
- **Depende de** Q1 → **entrega:** registro da revisão em `docs/revisao-seguranca-2-12.md`.
- **Pronto quando:** nenhum achado grave aberto. O que não passar sai da demo.

### Q3 — Demonstração (Daniel 2 h)
- **Construir:** aplicar as migrações e a semente no projeto **demo**, escrever o roteiro com os três casos da A2 e ensaiar duas vezes, gravando o vídeo reserva no ensaio.
- **Depende de** Q2 → **entrega:** demo pronta.
- **Pronto quando:** o ensaio cronometrado roda sem erro.

### Contínuas
- **Davi 5 h** (revisões 3,5 h; integração 1,5 h) e **Daniel 6,5 h** (revisões 3,5 h; integração 2 h; coordenação com a GP 1 h).
- Revisão obrigatória de todo PR que toca SQL, RLS, autenticação, ações de servidor ou variáveis.
- 10 a 15 minutos de alinhamento por dia: o que foi feito, o que trava e marcar o status acima.
