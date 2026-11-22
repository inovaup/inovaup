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

<!-- O Davi escreve aqui, de 5 a 10 linhas. -->
