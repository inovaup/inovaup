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

---

# MVP operacional, parte 1 (a partir de 5/12/2026)

**Escopo e ordem:** D-19 e D-20, o primeiro ciclo real. **Prazo máximo:** início de janeiro de 2027, se a P-07 (disponibilidade nas festas) e as respostas da GP saírem a tempo; se o escopo ficar pronto antes, a homologação com a GP é antecipada. Os códigos entre parênteses (A7, B1, C4…) são os achados da auditoria de 24/11.

**Fica para depois da homologação:** visibilidade das perguntas (A1), e-mail e lembretes (D3, P-09), comentário por competência (A4), pesos e mínimo pela tela (D2), média da organização e PDF (A6), visão do líder (A9) e as Etapas 2 e 4 da auditoria.

**Estimativa, revisada pelo Davi em 27/11:** Davi **57 / 83 h** e Daniel **53 / 79 h** (P50 / P80), já com revisões e integração. As horas do P50 ficam perto das cerca de 56 h que cada um tem de 5/12 a 18/12, mas a ordem das tarefas e as respostas da GP e da diretoria levam o GO3 a ~5/1; o P80 cabe até o início de janeiro (D-20), com as pausas de 24–25/12 e 31/12–1/1.

**Regra de revisão:** PR de código só é juntado depois do comentário de revisão do outro integrante (combinado em 26/11).

## Pré-requisitos

| Pré-requisito | Trava | Quem decide ou responde |
|---|---|---|
| P-10 decidida e registrada (D-21) | O1, O2 e O3 | Davi e Daniel |
| App de login do Google interno ao domínio (P-04, pergunta 13) | O2 | Diretor de GP |
| Perguntas 23 e 25 (cadastro antes do login; quem vira GP) | O3 | GP |
| Perguntas 2 e 20 (regras de quem avalia quem; títulos da planilha do mapa) | O6 e O7 | GP |
| Perguntas 1, 3, 14, 16, 17 e 18 (pesos, seções, mínimo, textos, prazo, abertura) | Conteúdo do primeiro ciclo | GP |
| Hospedagem (P-02) e se a homologação usa dados fictícios ou reais. Com login só pelo Google, quem testa entra com uma conta do domínio: para a homologação ser fictícia, a GP usa contas de teste do domínio criadas pelo superadministrador; senão vale o portão de dados reais (Supabase Pro, P-06) | O11 e O13 | Diretoria e diretor de GP |

## Resumo

| ID | Tarefa | Resp. | Revisor | P50 / P80 | Janela | Status |
|---|---|---|---|---|---|---|
| O1 | Pessoas como cadastro, "minha pessoa" e papéis (P-10) → contrato I1 v2 | Davi | Daniel | 16 / 22 | 5–11/12 | [ ] |
| O2 | Login pelo Google e sessão no servidor (S1) → contrato I2 v2 | Daniel | Davi | 6 / 10 | 7–13/12 | [ ] |
| O3 | Tela de pessoas: cadastro, importação e papéis | Daniel | Davi | 6 / 9 | 9–15/12 | [ ] |
| **GO1** | **Portão: login, cadastro e permissões verdes** | — | — | — | ~15/12 | [ ] |
| O4 | Ciclo e questionário pela tela, banco (A8 com A2, A3, A5 e C8) → contrato I3 v2 | Davi | Daniel | 13 / 18 | 12–18/12 | [ ] |
| O5 | Ciclo e questionário pela tela, telas | Daniel | Davi | 12 / 16 | 14–23/12 | [ ] |
| O6 | Mapa com as relações da EJ, banco (D1, D4) | Davi | Daniel | 8 / 12 | 19–23/12 | [ ] |
| O7 | Mapa: importar, duplicar e ajustar | Daniel | Davi | 6 / 10 | 21–28/12 | [ ] |
| **GO2** | **Portão: um ciclo montado pela tela, do questionário ao mapa** | — | — | — | ~28/12 | [ ] |
| O8 | Acompanhamento: pendências e reabrir (A7, B3) | Daniel / Davi | Davi / Daniel | 4 / 6 · 3 / 4 | 19–28/12 | [ ] |
| O9 | Experiência central: rascunho sozinho, Início e progresso (B1, C4, C6) | Daniel | Davi | 6 / 8 | 12–28/12 | [ ] |
| O10 | Segurança para publicar (B5: S3 e S11; mais S5 e S6) | Daniel / Davi | Davi / Daniel | 2 / 3 · 2 / 3,5 | até 30/12 | [ ] |
| O11 | Publicação do ambiente de homologação | Davi / Daniel | Daniel / Davi | 4 / 6 · 2 / 4 | 28/12–5/1 | [ ] |
| O12 | Fórmula validada pela GP | Davi | Daniel | 2 / 4 | quando a GP responder | [ ] |
| **GO3** | **Portão: pronto para homologar** | — | — | — | ~5/1 | [ ] |
| O13 | Homologação com a GP | Davi / Daniel | — | 3 / 4 cada | início de janeiro | [ ] |
| Cont. | Revisões e integração: cerca de 9 PRs do outro, migrações aplicadas no dev depois do merge, alinhamento diário | Davi / Daniel | — | 6 / 9 cada | contínuo | — |

O Davi entrega os contratos antes das migrações: **I1 v2 até ~7/12** e **I3 v2 até ~14/12**, para a O2, a O3 e a O5 começarem contra os tipos. As janelas supõem a P-07 em aberto: se um dos dois estiver fora nas festas, as tarefas daquela semana andam.

## Detalhe das tarefas

### O1 — Pessoas como cadastro, "minha pessoa" e papéis (Davi 16 h) → contrato **I1 v2**
- **Construir** (decisões da P-10):
  - `perfis` ganha um id próprio e um campo `usuario_id`, vazio até o primeiro login e único; participações, atribuições e relatórios continuam apontando para `perfis`;
  - função "qual é a minha pessoa" (`security definer`, `search_path` vazio): devolve o perfil ligado ao usuário logado e **nada** para quem está `desligada` (`trainee` entra); as 9 regras de acesso e o `eh_gp()` passam por ela;
  - `cadastrar_pessoa` (só GP; papel só `colaborador` ou `lider`) e `definir_papel` (só GP; ninguém muda o próprio papel; trava contra o sistema ficar sem GP; registro de quem mudou, de quem, de/para e quando, legível pela GP);
  - função de uso único da primeira GP, no esquema `private` (que a API não expõe): só roda enquanto não existe GP, grava o registro e tem o `EXECUTE` revogado de `public`, `anon`, `authenticated` e `service_role`, porque no Postgres toda função nova pode ser executada por `PUBLIC`;
  - gancho Before User Created (função Postgres) e gatilho em `auth.users` que liga a conta ao perfil e recusa quem não está cadastrado; o gancho fica ligado no `config.toml` do CI;
  - a semente é reescrita: hoje ela apaga as contas e o `on delete cascade` leva os perfis junto; com o `usuario_id`, ela cadastra a pessoa e religa a conta; contrato I1 atualizado em PR `[CONTRATO]`.
- **Depende de** D-21 → **entrega:** I1 v2.
- **Pronto quando:** as verificações SQL do CI provam que o gancho recusa e-mail não cadastrado e pessoa desligada (com um JSON de exemplo); o gatilho liga e recusa (inserção direta em `auth.users`); a pessoa desligada não lê nem grava nada; ninguém muda o próprio papel; o sistema não fica sem GP; o cadastro não cria GP; a função da primeira GP não roda para nenhum papel da API nem quando já existe GP. Os testes de RLS anteriores continuam verdes.

### O2 — Login pelo Google e sessão no servidor (Daniel 6 h) → contrato **I2 v2**
- **Construir:**
  - login pelo Google, com a troca do código feita no servidor;
  - `getCurrentUser()` e `requireRole()` encontram a pessoa pelo `usuario_id`;
  - sessão em cookie `httpOnly` se o fluxo ficar todo no servidor (S1); conferir antes na documentação local do Next 16 e do `@supabase/ssr`;
  - login por e-mail e senha só nos projetos de desenvolvimento e demo, para as contas fictícias; na homologação e na produção, só o Google;
  - "Acesso negado" orienta quem não está cadastrado a procurar a GP.
- **Depende de** O1 e do app do Google (P-04) → **entrega:** I2 v2.
- **Pronto quando:** no projeto de desenvolvimento, uma conta Google cadastrada entra, uma não cadastrada é recusada e uma desligada cai em "Acesso negado"; os testes de sessão e o `rotas.test.ts` continuam verdes.

### O3 — Tela de pessoas: cadastro, importação e papéis (Daniel 6 h)
- **Construir:** `/pessoas` deixa de ser só leitura: cadastrar e editar pessoa (nome, e-mail, área, cargo, nível, situação); importar planilha com prévia antes de gravar; mudar papel por `definir_papel`, com o registro visível. Tornar alguém GP só por essa função. Tudo só para a GP.
- **Depende de** O1 e das perguntas 23 e 25 → **entrega:** tela.
- **Pronto quando:** os testes das ações provam `requireRole("gp")`, entrada validada e que uma planilha com linha inválida não grava nada; colaborador e líder não acessam.

### GO1 — Portão: login, cadastro e permissões (~15/12)
- **Pronto quando:** O1 a O3 juntados com o CI verde, e um teste no projeto de desenvolvimento: a GP cadastra uma pessoa, ela entra pelo Google, e o papel muda com registro.

### O4 — Ciclo e questionário pela tela, banco (Davi 13 h) → contrato **I3 v2**
- **Construir** (uma migração só):
  - `ciclos` ganha prazo, texto de introdução e data de abertura (preenchida ao abrir); `competencias` ganha descrição;
  - a GP grava ciclos, seções, competências e pesos enquanto o ciclo está em rascunho, e nada depois de aberto (trava no banco);
  - criar o ciclo já insere os pesos 1/2/2/2;
  - `abrir_ciclo()` passa a exigir questionário e mapa completos, além de GP e rascunho, e grava a data de abertura;
  - importação do questionário por planilha.
- **Depende de** O1 → **entrega:** I3 v2.
- **Pronto quando:** as verificações SQL provam que a GP grava em rascunho e não grava depois de aberto, que colaborador e líder não gravam e que um ciclo incompleto não abre; os testes da Q1 continuam verdes.

### O5 — Ciclo e questionário pela tela, telas (Daniel 12 h)
- **Construir:** criar e editar o ciclo (nome, prazo, introdução), as seções e as competências com descrição, ou importar o questionário; mostrar o que falta quando o banco recusa abrir um ciclo incompleto. O formulário de resposta mostra a introdução, o prazo e a descrição de cada competência. Lista, painel e relatório mostram prazo, data de abertura e data de envio (C8).
- **Depende de** O4 → **entrega:** telas.
- **Pronto quando:** uma GP fictícia monta um ciclo completo pela tela no projeto de desenvolvimento; os testes das ações passam; a semente da demo continua funcionando.

### O6 — Mapa com as relações da EJ, banco (Davi 8 h)
- **Construir:** as atribuições guardam a relação da EJ (liderança direta, de esquadra e de projeto; pares de projeto e de esquadra; liderados), além do grupo de peso; importação do mapa no formato da planilha da GP (pergunta 20), validando cada linha e devolvendo os erros, que a O7 mostra; duplicar o mapa do ciclo anterior; só pessoas que não estão desligadas (D4); a GP grava o mapa só com o ciclo em rascunho.
- **Depende de** O4 e das perguntas 2 e 20 → **entrega:** contrato do mapa no I3 v2.
- **Pronto quando:** as verificações SQL provam a trava do rascunho, a recusa de pessoa desligada e a duplicação sem repetir atribuições.

### O7 — Mapa: importar, duplicar e ajustar (Daniel 6 h)
- **Construir:** importar a planilha com prévia e erro por linha; duplicar o mapa do ciclo anterior; ajustar pessoa a pessoa; antes de abrir, mostrar à GP quantos avaliadores cada pessoa terá por grupo.
- **Depende de** O6 → **entrega:** tela.
- **Pronto quando:** os testes das ações passam e uma planilha com erro não grava nada.

### GO2 — Portão: um ciclo montado pela tela (~28/12)
- **Pronto quando:** no projeto de desenvolvimento, a GP fictícia cria o ciclo, importa o questionário e o mapa e abre o ciclo; os avaliadores respondem; o cálculo e o relatório saem como hoje.

### O8 — Acompanhamento: pendências e reabrir (Daniel 4 h; Davi 3 h)
- **Construir:**
  - **Daniel:** lista de pendências por avaliador e por avaliado, só com o status, nunca com respostas; contador contado no banco por ciclo com o `count` do Supabase, sem migração (B3; se precisar de função ou view, essa parte passa para o Davi, +1 h); ciclo sem atribuições não mostra "0 de 0" na confirmação de encerrar;
  - **Davi:** função de reabrir uma avaliação enviada, só com o ciclo aberto e antes de qualquer cálculo; **Daniel:** o botão, com confirmação.
- **Depende de** GO2 → **entrega:** acompanhamento.
- **Pronto quando:** os testes provam que a GP vê só o status; reabrir é recusado com o ciclo encerrado ou depois de um cálculo; a avaliação reaberta volta como pendente para o avaliador.

### O9 — Experiência central (Daniel 6 h)
- **Construir:** rascunho salvo sozinho alguns segundos depois da última mudança, com aviso ao sair com alterações pendentes (B1); o salvamento automático nunca concorre com o "Enviar" (observação do Davi em 26/11); Início com as pendências e o prazo e, para a GP, o ciclo aberto e o progresso (C4); progresso por seção e escala que caiba no celular (C6).
- **Depende de** O5, para o prazo → **entrega:** telas.
- **Pronto quando:** os testes das regras novas passam e o roteiro da demo é atualizado.

### O10 — Segurança para publicar (Daniel 2 h; Davi 2 h)
- **Construir:**
  - **Daniel:** cabeçalhos de segurança (CSP, `frame-ancestors`, sem `X-Powered-By`) no `next.config.ts`, em PR próprio e avisado (S3). O S1 entra na O2;
  - **Davi:** migração que revoga o `EXECUTE` de `public.rls_auto_enable()` de `public`, `anon` e `authenticated` (revogar só de `anon` não basta, porque `PUBLIC` também executa); a função é do Supabase e pode não existir no Supabase local do CI, então a migração confere antes se ela existe (S11);
  - **Davi:** semente do dev com senhas novas (S5) e ações do GitHub fixadas por hash, em PR próprio de `.github/` (S6).
- **Depende de** — → **entrega:** achados S1, S3, S5, S6 e S11 da Q2 fechados.
- **Pronto quando:** o verificador do Supabase não acusa mais o S11 e os cabeçalhos aparecem nas respostas do app.

### O11 — Publicação do ambiente de homologação (Davi 4 h; Daniel 2 h)
- **Construir:** o projeto Supabase de homologação com as migrações, o gancho ligado e o login por e-mail desligado; a hospedagem decidida na P-02, com as variáveis só no provedor; a primeira GP criada pela função de uso único, com a assinatura do diretor de GP.
- **Depende de** GO2, O10, P-02 e da decisão sobre dados na homologação → **entrega:** endereço de homologação.
- **Pronto quando:** só contas do domínio cadastradas entram; o `service_role` não aparece no navegador nem no repositório; a revisão de segurança da Q2 é refeita no ambiente publicado.

### O12 — Fórmula validada pela GP (Davi 2 h)
- **Construir:** comparar a conta do InovaUp com um relatório do Impulse Up que a GP fornecer sem nomes (pergunta 1 e um caso de referência); ajustar os parâmetros se preciso e registrar a validação em `regras/calculo-da-nota.md`.
- **Depende de** respostas da GP → **entrega:** fórmula validada.
- **Pronto quando:** o caso de referência dá o mesmo resultado, com 2 casas.

### GO3 — Portão: pronto para homologar (~5/1)
- **Pronto quando:** O8 a O12 juntados e o ambiente de homologação publicado.

### O13 — Homologação com a GP (Davi e Daniel 3 h cada)
- **Construir:** a GP monta e roda um ciclo de teste no ambiente publicado, do cadastro ao relatório; a equipe registra os ajustes e decide com a GP o que entra antes do primeiro ciclo real.
- **Depende de** GO3 → **entrega:** homologação registrada.
- **Pronto quando:** a GP aprova, ou a lista de ajustes tem dono e data.
