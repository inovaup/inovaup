# Decisões do projeto

Registro curto. Uma decisão nova ou mudada entra aqui por PR revisado pelo outro integrante.

## Aprovadas

| ID | Decisão | Data | Observação |
|---|---|---|---|
| D-01 | Construir uma solução própria (InovaUp), só para uso interno, no lugar do Impulse Up | 19/11/2026 | Decisão da diretoria |
| D-02 | Stack: Next.js + TypeScript + Tailwind + `shadcn/ui`; Supabase (Postgres, Auth, RLS), região São Paulo | 20/11/2026 | Supabase escolhido em vez do Neon por trazer autenticação e RLS integradas |
| D-03 | 4/12 = **MVP demonstrável** (dados fictícios, fluxo da avaliação ponta a ponta); o escopo anterior era inviável | 20/11/2026 | Auditoria de viabilidade |
| D-04 | **Avaliação de desempenho primeiro**; pesquisas anônimas no MVP operacional | 20/11/2026 | — |
| D-05 | Integração com o Monday e automação de "quem avalia quem" na fase 2 | 19/11/2026 | — |
| D-06 | GitHub em contas pessoais, plano gratuito; repositório privado; proteção da `main` por convenção, hook de pre-push e CI | 20/11/2026 | Proteção automática exige GitHub Pro (alternativa: Student Developer Pack) |
| D-07 | Os dois desenvolvem no Windows, sem Docker local; Supabase local só no CI | 20/11/2026 | — |
| D-08 | **Conta do Claude compartilhada** entre Davi e Daniel | 20/11/2026 | **Risco crítico:** limite semanal e regra de um assento por pessoa do plano Team. Até 4/12, sem workflows nem subagentes em paralelo |
| D-09 | Demo local (`localhost`) com o projeto Supabase de demo; sem hospedagem até 4/12 | 20/11/2026 | Vercel Hobby proíbe uso não pessoal e commits de colaboradores em repositório privado |
| D-10 | Na demo, contas fictícias com e-mail e senha e cadastro desligado; Google OAuth no MVP operacional | 20/11/2026 | Ver `regras/seguranca-da-demo.md` |
| D-11 | Dados sensíveis só no servidor; RLS negando por padrão; `service_role` só na semente e em `calculo/executar.ts` | 20/11/2026 | — |
| D-12 | Fórmula da nota **provisória** (observada e inferida), parametrizada; validação da GP exigida para o MVP operacional | 20/11/2026 | Ver `regras/calculo-da-nota.md` |
| D-13 | Supressão contra identificação indireta (mínimo de 2, supressão complementar de grupos), aplicada antes de gravar o relatório | 20/11/2026 | Substitui o antigo RNF-03 ("avisar quando o grupo tem uma pessoa") |
| D-14 | Cache Components do Next.js desligado | 20/11/2026 | Evita misturar dados de usuários em cache |
| D-15 | Este repositório é a fonte de verdade; os docs antigos do claude.ai ficam como referência | 20/11/2026 | — |
| D-16 | Um projeto Supabase de **desenvolvimento compartilhado** pelos dois e um projeto de **demo** (opção 1), por causa do limite de 2 projetos gratuitos por pessoa | 21/11/2026 | Só o Davi aplica migrações no banco compartilhado; ninguém apaga ou altera dados que o outro esteja usando; testes que gravam dados rodam no Supabase local do CI |
| D-17 | **Refinamento antes do congelamento** (Etapa 0 da auditoria de 24/11): só C2 (telas de erro, 404 e carregamento em português), C3 (página atual marcada no menu), B2 ("faltam N" ao encerrar o ciclo) e a legenda da escala uma vez por seção (parte do C6). Só tela: sem banco e sem regra de negócio | 24/11/2026 | Condições do Davi: PR juntado até 1/12; ensaio no demo com os mesmos números do roteiro e o "Acesso negado" do `/painel`; se algo quebrar, o PR é desfeito, porque a demo não depende desses itens. Tarefa E0 em `TAREFAS.md` |
| D-18 | Etapas 1 e 2 da auditoria (experiência central; identidade e acabamento) entram na lista "depois de 4/12" do plano, sem data | 24/11/2026 | B3, B5, B6 e B8 se juntam aos itens que já estavam na lista. C7: o mesmo texto genérico ao lado de todo "indisponível". B7 mexe em arquivos de configuração: PR próprio, avisado |
| D-19 | **Ordem do MVP operacional, parte 1:** login pelo Google e cadastro de pessoas ativas; criação do ciclo e do questionário pela tela (A8), com prazo, descrição da competência, introdução e data de abertura do ciclo na mesma migração; mapa com as relações da EJ (D1); reabrir avaliação (A7) e segurança para publicar (B5) antes do primeiro ciclo real; visibilidade das perguntas (A1) depois das regras da GP | 24/11/2026 | Reabrir só com o ciclo aberto, antes de qualquer cálculo: se desse para recalcular depois de encerrar, a GP veria, comparando os dois relatórios, a nota de quem mudou. A data é a D-20; o e-mail é a P-09; o cadastro de pessoas e quem vira GP é a D-21 |
| D-20 | **MVP operacional, parte 1, no início de janeiro de 2027** (o P80 do plano), em vez de ~18/12, **mantendo o escopo do primeiro ciclo real**: login pelo Google e pessoas ativas, A8 com a migração única, D1, A7 e B5 (D-19), mais B1, C4 e C6 da Etapa 1 | 25/11/2026 | Proposta do Davi; fecha a P-08. **Janeiro é o prazo máximo, não a meta:** como o MVP demonstrável ficou pronto antes de 4/12, a equipe trabalha para entregar antes e antecipa a homologação com a GP se o escopo ficar pronto. Terminar antes não pode pular a P-10, o B5 nem a homologação. De 5/12 a 18/12 há cerca de 112 h; as tarefas O1 a O13 do `TAREFAS.md`, com revisões e integração, somam 110 h no P50 e 162 h no P80 para os dois (revisão do Davi em 27/11). O resto das Etapas 1 a 3 fica para depois da homologação. O prazo vale se a P-07 (disponibilidade nas festas) e as respostas da GP (P-03) saírem a tempo; se não, a data é revista |
| D-21 | **Cadastro de pessoas e papéis no MVP operacional** (fecha a P-10): `perfis` vira o cadastro, com id próprio e um `usuario_id` ligado no primeiro login; conta nova só pelo Google e só para quem a GP cadastrou (gancho Before User Created e gatilho em `auth.users`, com o cadastro geral ligado e o login por e-mail desligado na homologação e na produção); as regras de acesso passam por uma função "qual é a minha pessoa", que não devolve quem está `desligada`; papéis só por `definir_papel` (só GP, com registro, ninguém muda o próprio, o sistema nunca fica sem GP); o cadastro só cria `colaborador` ou `lider`; a primeira GP nasce por uma função de uso único no esquema `private`, com o `EXECUTE` revogado de `public`, `anon`, `authenticated` e `service_role`, rodada no painel com a assinatura do diretor de GP | 27/11/2026 | Proposta do Daniel com os ajustes do Davi (documento da P-10, versão 2; decisões marcadas em 27/11). A `service_role` continua só na semente e no cálculo. Implementação nas tarefas O1 a O3; novo texto do piso de segurança no `CLAUDE.md` |

## Pendentes

| ID | Pendência | Quem decide | Até quando |
|---|---|---|---|
| P-01 | Segundo assento do Claude (recomendado) | Dono da conta Team | O quanto antes |
| P-02 | Hospedagem do MVP operacional (Vercel Pro, cerca de US$ 20 por autor de commit por mês, ou outra) | Diretoria | Antes do MVP operacional, parte 1 (início de janeiro, D-20) |
| P-03 | As 13 perguntas da GP (pesos reais, quem avalia quem, seções Processos, calibração, quem vê o relatório, mínimo de respostas, retenção, administradores, migração, DNS, OAuth) | Diretoria de GP | Ideal até 25/11; não bloqueiam a demo |
| P-04 | Confirmar o Google Workspace e o superadministrador; app OAuth interno | Diretor de GP | Antes do MVP operacional |
| P-05 | Quem guarda a chave do pseudônimo das pesquisas (e o novo texto do RNF-02) | Diretoria de GP | Antes das pesquisas |
| P-06 | Orçamento dos planos pagos (Supabase Pro no portão de dados reais) | Diretoria | Antes da produção |
| P-07 | Disponibilidade de Davi e Daniel nas festas de fim de ano | Davi e Daniel | Até 4/12 |
| P-09 | Serviço de e-mail dos lembretes (D3): qual serviço, onde fica a chave e a base legal, porque o e-mail das pessoas vai para um terceiro | Davi, Daniel e diretoria | Antes de implementar os lembretes |
