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

## Pendentes

| ID | Pendência | Quem decide | Até quando |
|---|---|---|---|
| P-01 | Segundo assento do Claude (recomendado) | Dono da conta Team | O quanto antes |
| P-02 | Hospedagem do MVP operacional (Vercel Pro, cerca de US$ 20 por autor de commit por mês, ou outra) | Diretoria | Antes de ~18/12 |
| P-03 | As 13 perguntas da GP (pesos reais, quem avalia quem, seções Processos, calibração, quem vê o relatório, mínimo de respostas, retenção, administradores, migração, DNS, OAuth) | Diretoria de GP | Ideal até 25/11; não bloqueiam a demo |
| P-04 | Confirmar o Google Workspace e o superadministrador; app OAuth interno | Diretor de GP | Antes do MVP operacional |
| P-05 | Quem guarda a chave do pseudônimo das pesquisas (e o novo texto do RNF-02) | Diretoria de GP | Antes das pesquisas |
| P-06 | Orçamento dos planos pagos (Supabase Pro no portão de dados reais) | Diretoria | Antes da produção |
| P-07 | Disponibilidade de Davi e Daniel nas festas de fim de ano | Davi e Daniel | Até 4/12 |
