# Segurança do MVP demonstrável

Estas regras valem desde o primeiro PR e **não se cortam para cumprir prazo**. Elas valem mesmo com dados fictícios, porque o mesmo código vai para o MVP operacional.

## Autenticação

- Supabase Auth com **e-mail e senha**.
- **"Allow new users to sign up" desligado** em todos os projetos.
- Contas **fictícias**, criadas só pelo script de semente (API admin com `email_confirm: true`), com e-mails no domínio reservado **`@demo.inovaup.test`**.
- Senhas aleatórias de 16 caracteres ou mais, guardadas só no `.env.local` de quem apresenta. Nunca em código, docs ou chat.
- **Não existe login de desenvolvimento que pule a autenticação.** Desenvolvimento e demo usam o mesmo mecanismo.
- Sem link mágico e sem envio de e-mail.
- Depois de 4/12, as contas fictícias são apagadas ou ganham senhas novas.
- O Google OAuth restrito ao domínio da empresa (verificado no servidor) entra no MVP operacional.

## Papéis

- Papéis: `colaborador`, `lider` e `gp`, na coluna `papel` da tabela `perfis`.
- O papel é **escrito só pela semente** (chave `service_role`). Não existe política de INSERT, UPDATE ou DELETE em `perfis` para usuários autenticados; cada pessoa só lê o próprio perfil e a GP lê todos.
- **Nunca usar `user_metadata`** para papel: o próprio usuário pode editá-lo.
- `requireRole()` lê o papel **do banco a cada requisição**, no servidor.
- Um teste prova que um usuário não consegue se promover.
- Na demo, o líder tem as mesmas permissões do colaborador e só aparece como avaliador do grupo gestor. A visão do líder sobre os liderados depende da pergunta 5 da GP.

## HTTPS e sessão

- A demo roda em `http://localhost`, **só no computador de quem apresenta**. Não abrir pela rede local, por túnel nem no celular.
- As chamadas ao Supabase são sempre HTTPS.
- Cookies de sessão `SameSite=Lax`, com `Secure` quando houver HTTPS. **Não** são `httpOnly`: é o padrão do `@supabase/ssr`, porque o login usa o cliente do navegador. Por isso não há HTML injetado nem script de terceiros nas telas. Cookie `httpOnly` (login por ação de servidor) e CSP ficam para depois de 4/12 (`revisao-seguranca-2-12.md`, S1).
- Ao publicar (MVP operacional): HTTPS da hospedagem, HSTS e cabeçalhos de segurança (CSP sem terceiros).

## Acesso a dados

| Dado | Colaborador / líder | GP | Como é garantido |
|---|---|---|---|
| Próprio perfil | Lê | Lê todos | RLS |
| Papel | Não altera | Não altera pela aplicação | Sem política de UPDATE; só a semente |
| Pessoas e squads | Não | Lê (listagem) | RLS + `requireRole('gp')` |
| Atribuições | Lê as próprias, como avaliador | Lê todas (mapa e status) | RLS |
| Respostas e comentários | Grava e lê só as próprias, com o ciclo aberto e a atribuição pendente | **Não lê** | RLS; só `calculo/executar.ts` (`service_role`) lê para calcular |
| Relatório publicável (`relatorios`) | Lê o próprio, depois da liberação | Lê todos | RLS |
| Abrir, encerrar ou liberar ciclo | Não | Sim | `requireRole('gp')` + RLS |
| Notas individuais de avaliadores | Nunca | Nunca | **Não são gravadas** |

Regras de uso da chave e de cache:
- **`service_role`** só pode aparecer no script de semente e em `src/modules/avaliacao/calculo/executar.ts` (`server-only`, chamado depois de `requireRole('gp')`). Fica em `.env.local`, nunca em `NEXT_PUBLIC_*`.
- **Cache Components desligado.** Nunca usar `use cache` em código com dados de pessoas.
- RLS ligada e **negando por padrão em todas as tabelas**. Funções `security definer` com `search_path` fixo.

<a id="protecao-contra-identificacao-indireta"></a>
## Proteção contra identificação indireta

O relatório publicável é montado por `montarRelatorioPublicavel()` (função pura, A7) **antes de ser gravado** pela execução do cálculo (A6). A supressão acontece no dado, não só na tela.

- **Mínimo:** `MIN_AVALIADORES_POR_RECORTE = 2`. É provisório até a GP responder a pergunta 7.
- **Avaliadores além da própria pessoa:** quem respondeu (com atribuição enviada e pelo menos uma resposta que não seja N/A) nos grupos gestor, pares e liderados.

| Regra | O que o relatório publica |
|---|---|
| R1 | Se os avaliadores além da própria pessoa forem **menos de 2**: só "Sua autoavaliação" (se houver) e o aviso "Resultado consolidado indisponível: número insuficiente de avaliadores para preservar o anonimato". Sem nota final, sem competências, sem grupos, sem comentários |
| R2 | Caso contrário: **nota final** (%) |
| R3 | **Nota por competência** só se pelo menos 2 avaliadores além da própria pessoa responderam (não N/A) **aquela** competência; senão, "indisponível" |
| R4 | **Grupos separados só se todos os grupos com respondentes (fora a autoavaliação) tiverem 2 ou mais.** Se qualquer um tiver 1, nenhum grupo aparece separado, e aparece só "Outros avaliadores (combinado)". Isso impede deduzir o grupo de 1 pessoa por subtração |
| R5 | **"Sua autoavaliação"** como um único percentual (não por competência) |
| R6 | **Comentários** só se pelo menos 2 avaliadores diferentes, além da própria pessoa, escreveram comentários. Lista única, sem autor e sem grupo, em ordem neutra (por hash do texto). Os comentários da autoavaliação não entram |
| R7 | **Nenhuma tela mostra a nota de um avaliador individual**, nem a da GP. A GP vê o mesmo relatório publicável e as contagens por grupo; o avaliado não vê contagens |

**Testes obrigatórios (A7):**
- R1 com um só avaliador;
- R4 com gestor único e pares com 2 ou mais (sem grupos separados);
- R4 com todos os grupos com 2 ou mais (grupos aparecem);
- R3 com uma competência respondida por um só avaliador;
- R6 com comentários de um só avaliador;
- o relatório não aparece antes da liberação;
- o colaborador não lê o relatório de outra pessoa.

## Dados

- Só dados fictícios. Nenhum nome, e-mail ou resposta real no repositório, no banco de demo ou nas conversas com o Claude.
- A transcrição da reunião, o vídeo e as planilhas da GP nunca entram no repositório (bloqueados no `.gitignore`).
- Nenhum analytics nem script de terceiros nas telas.

<a id="checklist-de-pr"></a>
## Checklist de PR

- [ ] Tabela nova com RLS ligada, negando por padrão, e políticas mínimas descritas no PR.
- [ ] Testes de permissão para cada política e ação nova (colaborador, líder, GP).
- [ ] Ações de servidor sensíveis chamam `requireRole()`.
- [ ] Nenhum uso de `service_role` fora da semente e de `calculo/executar.ts`.
- [ ] Nenhuma variável sensível com `NEXT_PUBLIC_`; nenhum segredo no diff.
- [ ] Papel nunca lido de `user_metadata`.
- [ ] Nenhum `use cache` em código com dados de pessoas.
- [ ] Só dados fictícios (`@demo.inovaup.test`).
- [ ] Mexeu no cálculo ou no relatório? As regras R1 a R7 continuam valendo, com testes.
- [ ] Migrações só novas (nunca editar uma já aplicada).
- [ ] Typecheck, lint e testes verdes; CI verde.

## Portão de dados reais (depois de 4/12, obrigatório)

- Supabase Pro com backup diário e um teste de restauração feito.
- Produção numa organização da GP e de Operações, **sem os desenvolvedores**.
- Google OAuth interno restrito ao domínio.
- Log de auditoria das ações da GP.
- Retenção e base legal definidas (LGPD).
- Fórmula da nota validada.
- Liberação assinada pelo diretor de Gestão de Pessoas.
