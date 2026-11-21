# InovaUp — regras para o Claude Code (Davi e Daniel)

InovaUp é o sistema interno de gestão de pessoas da Empresa Júnior ADM UFBA, que vai substituir o Impulse Up. **Fase atual:** implementação do **MVP demonstrável de 4/12/2026**, com o planejamento aprovado em 20/11/2026.

## Fonte de verdade

- **Este repositório é a fonte de verdade.** Antes de qualquer tarefa, leia:
  1. `docs/TAREFAS.md` (o que fazer, responsável, critério de pronto);
  2. `docs/PLANO_MVP_DEMONSTRAVEL.md` (escopo, cortes, portões, contratos);
  3. `docs/regras/seguranca-da-demo.md` e `docs/regras/calculo-da-nota.md`;
  4. `docs/decisoes.md`.
- **O Claude do Davi não sabe o que o Claude do Daniel fez, e vice-versa.** Antes de começar, rode `git pull` na `main`, leia `git log --oneline -20` e os PRs abertos. Não confie no histórico da conversa.
- Uma decisão nova só vale depois de registrada em `docs/decisoes.md`, num PR revisado pelo outro.
- **Não implemente nada fora de `docs/TAREFAS.md`.** Pedido novo vai para a lista "depois de 4/12" do plano.

## Raias e donos de pasta

| Pasta / arquivo | Dono | Regra para o outro |
|---|---|---|
| `supabase/` (`migrations/`, `seed/`, `config.toml`; criados na F4) | **Davi** | Só o Davi cria migrações; o Daniel pede por issue ou PR avisado |
| `src/contracts/core.ts`, `src/contracts/avaliacao.ts` | **Davi** | Mudança de contrato só pelo dono, em PR avisado |
| `src/modules/nucleo/`, `src/modules/avaliacao/dados/`, `src/modules/avaliacao/calculo/` | **Davi** | — |
| `src/lib/supabase/` (`client.ts`, `server.ts` e `proxy.ts`, vindos do modelo), `src/lib/auth/` (criado na F5), `src/proxy.ts` | **Daniel** | `getCurrentUser()` e `requireRole()` são o contrato I2. **Não crie outro cliente Supabase:** use `createClient()` de `src/lib/supabase/server.ts` (servidor) ou de `client.ts` (navegador) |
| `src/app/` (rotas, `layout.tsx`, `auth/`, a área provisória `protected/`), `src/components/` (formulários de login e menu), `src/modules/avaliacao/resposta/`, `relatorio/`, `painel/` | **Daniel** | — |
| `src/components/ui/` (componentes do `shadcn/ui`) | Compartilhado | Componente novo com `npx shadcn@latest add <nome>`, num PR avisado; não editar os existentes sem combinar |
| `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `components.json`, `vitest.config.ts`, `.env.example`, `.github/` | Quem precisar, **num PR só para isso, avisado** | O outro atualiza a branch depois do merge |
| `docs/`, `CLAUDE.md`, `HANDOFF_DAVI.md`, `README.md` | Ambos | Sempre por PR |

## Projeto instalado (F2, 21/11/2026)

- Next.js **16.4.6** (App Router, código em `src/`), React 19.3.1, `@supabase/ssr` 0.12.7, `@supabase/supabase-js` 2.119.2, Tailwind 3.4, `shadcn/ui` (estilo new-york), TypeScript 5.9, ESLint 9, Vitest 5.1. Node 22 ou mais novo. As versões são fixas; não troque sem um PR avisado.
- `@/*` aponta para `src/*` (no `tsconfig.json` e no `vitest.config.ts`).
- `src/proxy.ts` mantém a sessão do Supabase. No Next.js 16, ele substitui o antigo `middleware.ts`.
- As telas de `src/app/auth/` vieram do modelo, em inglês. A F5 remove o cadastro (`sign-up` e `sign-up-success`), traduz o login e cria `src/lib/auth/`.
- **Comandos:** `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`.
- **Testes:** `src/**/*.test.ts` ou `tests/**/*.test.ts`.
- **Variáveis:** copie `.env.example` para `.env.local`, que nunca vai para o Git.

**Contratos entre as raias** (até a data, quem consome usa tipos simulados):
- **I1**, 23/11: núcleo (Davi → Daniel);
- **I2**, 25/11: sessão e papel (Daniel → Davi);
- **I3**, 27/11: avaliação (Davi → Daniel);
- **I4**, 30/11: cálculo e resultados (Davi → Daniel).

## Como trabalhar em cada tarefa

1. Use o **modo de plano**: leia a tarefa (ID) em `docs/TAREFAS.md` e proponha o plano antes de escrever código.
2. Crie a branch `feature/<ID>-<descricao-curta>` (ou `fix/...`) a partir da `main` atualizada.
3. Implemente **só nos arquivos da raia do responsável**.
4. Rode `npm run typecheck`, `npm run lint` e `npm test`. Tudo verde.
5. Escreva os **testes de permissão no mesmo PR** de cada tabela, consulta ou ação de servidor.
6. Faça commits pequenos e descritivos, em português.
7. Abra o PR com o checklist do template. **Nunca faça push direto na `main`.**
8. O outro integrante revisa todo PR que toca SQL, RLS, autenticação, ações de servidor ou variáveis de ambiente.
9. Depois do merge, os dois rodam `git pull` na `main`.

**Proibido:**
- alterar uma migração já aplicada (crie uma nova);
- editar arquivos da raia do outro sem PR avisado;
- criar tabelas ou tipos duplicados;
- adicionar dependências sem PR próprio;
- usar dados reais de pessoas.

## Piso de segurança (não se corta para cumprir prazo)

- **RLS ligada e negando por padrão em todas as tabelas**; dados sensíveis lidos só no servidor; `requireRole()` em toda leitura e escrita sensível.
- **Papel** (`colaborador`, `lider`, `gp`) fica na tabela `perfis`, escrito **só pela semente com a chave `service_role`**. Não existe política de UPDATE de `papel` para usuários. **Nunca guarde papel em `user_metadata`.**
- **Cadastro desligado** no Supabase. Contas fictícias só pela semente. **Não existe login que pule a autenticação.**
- A chave **`service_role`** só pode ser usada em dois lugares:
  1. no script de semente;
  2. no módulo `server-only` `src/modules/avaliacao/calculo/executar.ts`, chamado só depois de `requireRole('gp')`.

  Ela fica em `.env.local` (no `.gitignore`). Nunca em `NEXT_PUBLIC_*`, nunca em outro módulo, nunca no repositório. Todo o resto usa a sessão do usuário com RLS.
- **Notas individuais e respostas brutas nunca ficam legíveis para o avaliado nem para a GP.** Só o relatório já suprimido é gravado (`relatorios`).
- **Cache Components desligado.** Nunca use `use cache` em código que lida com dados de pessoas.
- **Proteção contra identificação indireta** no relatório (detalhes em `docs/regras/seguranca-da-demo.md`):
  - mínimo de 2 avaliadores por recorte;
  - se algum grupo tiver 1 respondente, nenhum grupo aparece separado;
  - comentários sem autor e sem grupo;
  - nenhuma tela mostra a nota de um avaliador individual.
- Nada de analytics nem scripts de terceiros. Só dados fictícios, com e-mails em `@demo.inovaup.test`.
- A demo roda em `http://localhost`, só no computador de quem apresenta.

## Fórmula da nota

É **provisória**: em parte observada no Impulse Up, em parte inferida, e ainda não validada pela GP (`docs/regras/calculo-da-nota.md`). Não a apresente como regra oficial.

## Uso da conta do Claude (compartilhada entre os dois)

- **Até 4/12, não use workflows, ultracode nem subagentes em paralelo.** Exceção: um subagente para gerar casos de teste.
- Uma tarefa por vez. Antes de tarefas longas, confira o uso da conta.
- Se o limite acabar, a pessoa passa a revisar PRs, testar pela tela ou atualizar a documentação.

## Convenções

- Interface e documentação em português. Nomes de domínio em português sem acento (`perfis`, `avaliacoes`, `calcularResultado`). Os helpers de autenticação seguem o padrão em inglês (`getCurrentUser`, `requireRole`).
- Tabelas e colunas em `snake_case`; componentes React em `PascalCase`.
- **Next.js 16:** as APIs podem ser mais novas que o conhecimento do modelo. **Antes de usar rotas, `proxy`, cache ou server actions, leia a documentação local** em `node_modules/next/dist/docs/` (pastas `01-app/` e `03-architecture/`).
- Ambiente: Windows, sem Docker local. Os testes de RLS rodam contra o banco de dev de cada um e, no CI, contra o Supabase local do GitHub Actions.
