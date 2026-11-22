# Aprendizado dirigido (F8)

Registro curto do que cada um aprendeu sobre branch, PR e revisão, rotas do App Router e RLS no Supabase. Cada um escreve só na própria seção, para não dar conflito.

## Daniel

- **Branch e PR:** cada tarefa nasce numa branch `feature/<ID>-<descricao>` a partir da `main` atualizada; a `main` só muda por pull request. Na F5, a branch ficou parada esperando a F4 e, antes de enviar, eu a atualizei com a `main` para entrar sem conflito.
- **Conflito:** duas branches que mudam linhas vizinhas do mesmo arquivo (como as linhas da F5 e da F6 no `TAREFAS.md`) não se juntam sozinhas; quem atualiza a branch resolve, e o CI precisa rodar de novo no commit novo.
- **Revisão:** o PR que toca SQL, RLS ou autenticação só entra com o comentário "revisado por" do outro. Na F5, o Davi achou um caso que eu não tinha visto (pessoa sem perfil voltando para o login) e a correção entrou no mesmo PR, antes do merge.
- **App Router:** cada pasta em `src/app/` com um `page.tsx` vira uma rota; pastas entre parênteses, como `(app)`, agrupam rotas com o mesmo `layout.tsx` sem mudar o endereço.
- **Proteção das páginas:** o layout não roda de novo a cada navegação, então cada página chama `requireRole()` no servidor; o menu escondido não protege nada sozinho.
- **RLS:** a regra de quem lê o quê fica no banco, não na tela. Com a sessão da própria GP, `/pessoas` traz as 4 pessoas; com a do colaborador, a mesma consulta traria só o próprio perfil.
- **Papel:** o papel vem da tabela `perfis`, escrita só pela semente; nunca de `user_metadata`, que o próprio usuário consegue editar.
- **Segredos:** o `.env.local` nunca vai para o Git; a chave `service_role` fica só no `.env.local` de quem roda a semente, nunca no repositório nem no chat; senhas não passam pelo chat.

## Davi

- **Branch e commits:** cada tarefa teve a sua branch (`feature/F4-nucleo`, `feature/F6-ci-hook`) com commits pequenos, um por etapa. Quando um arquivo compartilhado precisou mudar (`package.json` para o `npm run seed`), ele foi num PR separado, como pede o `CLAUDE.md`.
- **PR e revisão:** o PR só fica pronto com o template preenchido; na primeira vez a descrição ficou vazia e precisei editar. O Daniel revisou o nº 4 e pediu provas antes do merge (saída dos testes, cadastro desligado e como passei as senhas), e respondi tudo no próprio PR.
- **Conflito:** o PR nº 6 parou de rodar o CI porque mexia na linha vizinha da F5 no `TAREFAS.md`; trouxe a `main` para a branch, mantive as duas linhas e o CI voltou a rodar.
- **CI e hook:** o CI sobe um Supabase temporário a cada PR e testa as migrações do zero, sem tocar no banco de dev. Para provar que ele barra erro, abri um PR de rascunho com a RLS quebrada de propósito: ficou vermelho ("colaborador vê 3 perfis") e foi fechado sem merge. O hook de pre-push bloqueia push direto na `main`.
- **App Router:** cada pasta em `src/app/` com um `page.tsx` vira uma rota; vi isso rodando o site em `localhost:3000`, onde a GP abre `/pessoas` e o colaborador recebe "Acesso negado".
- **RLS:** a tabela começa negando tudo, e cada política libera só o necessário. Usuários só leem; quem grava `perfis` (inclusive o `papel`) é a semente, com a `service_role`. A função `eh_gp()` é `security definer` com `search_path` fixo, para a RLS consultar o papel sem cair em recursão.
- **Migrações:** são arquivos SQL novos, aplicados com `npx supabase db push --remote`; uma migração já aplicada nunca é editada, o ajuste vira outra migração.
- **Segredos:** a chave publicável pode ir para o navegador porque quem protege os dados é a RLS; a secreta fica só no `.env.local`, que o Git ignora. Senhas e chaves não vão para o chat, o GitHub nem o Claude.
