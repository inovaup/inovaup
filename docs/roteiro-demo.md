# Roteiro da demonstração do InovaUp (4/12/2026)

Tarefa Q3. Demonstração do **MVP demonstrável**: o fluxo da avaliação de desempenho de ponta a ponta, com **dados fictícios**, no projeto Supabase **demo**, rodando só no computador de quem apresenta, em `http://127.0.0.1` (D-09).

- **Duração:** cerca de 10 minutos de demonstração, mais perguntas.
- **Quem apresenta:** Daniel (tela) e Davi (explica dados, cálculo e segurança quando perguntarem).
- **Regra de ouro:** só contas `@demo.inovaup.test`. Nenhum nome, e-mail ou resposta real na tela.
- **Não dizer** que a nota é a fórmula oficial: ela é **provisória** e depende da validação da GP (`regras/calculo-da-nota.md`).

## 1. Preparação (na véspera, 3/12)

1. `git checkout main` e `git pull`; `npm install`; `npx next telemetry disable` (desliga a telemetria do Next.js neste computador; revisão S13).
2. Trocar para o projeto demo (as configurações ficam fora do Git):
   - guardar o `.env.local` do dev como `.env.dev.local`;
   - copiar o `.env.demo.local` para `.env.local`.
3. Rodar a semente no demo para o ciclo voltar a ficar **aberto**, com as 2 pendentes: `npm run seed`. A saída deve mostrar "senhas: 14 reaproveitadas" e "17 atribuições (2 pendentes)".
4. Subir o app **só neste computador**: `npx next dev -H 127.0.0.1` e abrir `http://127.0.0.1:3000`. Conferir que as linhas "Local" e "Network" do terminal mostram **`127.0.0.1`**, e não um IP da rede (como `192.168…` ou `172.…`); senão, qualquer pessoa no mesmo Wi-Fi abriria a tela de login (revisão S12). Testado em 24/11: com `-H 127.0.0.1`, o servidor só aceita conexões deste computador.
5. Entrar uma vez com cada conta usada abaixo (as senhas são as `DEMO_SENHA_*` do `.env.local`, só neste computador) e sair. Toda vez que a semente roda, ela recria as contas: quem estava logado precisa sair e entrar de novo.
6. **Ensaio cronometrado nº 1**, seguindo a seção 3. Depois, rodar a semente de novo.
7. **Ensaio cronometrado nº 2, gravando a tela** (vídeo reserva). Depois, rodar a semente de novo.
8. Conferir que o projeto demo não está pausado (painel do Supabase: "Healthy").

## 2. No dia, 30 minutos antes

- Computador na tomada, notificações desligadas, zoom do navegador em 125% para a plateia ler.
- `npx next dev -H 127.0.0.1` rodando (a linha "Network" do terminal mostra `127.0.0.1`); `http://127.0.0.1:3000` aberto.
- **Duas janelas de navegador**, para não ficar trocando de login:
  - **janela normal:** a **GP** (`gp@demo.inovaup.test`), já logada, no **Painel da GP**;
  - **janela anônima:** para as contas de colaborador e líder.
- O vídeo reserva aberto num player, minimizado.
- As senhas das contas: só no `.env.local` deste computador. **Nunca** num slide, no chat ou na tela.

## 3. Roteiro (cerca de 10 minutos)

### 0:00 — O problema (1 min)

- A empresa usa o Impulse Up para avaliação de desempenho e pesquisas. Segundo a área de Gestão de Pessoas, o custo mensal é alto, o plano bate o limite de usuários e o "quem avalia quem" ainda é montado numa planilha à parte (confirmar os números com a GP antes de citar).
- O InovaUp é a alternativa interna. Hoje mostramos o primeiro passo: **a avaliação de desempenho completa**, do questionário ao relatório, protegendo o anonimato de quem avalia.

### 1:00 — Login e papéis (1 min)

Janela anônima, **Colaborador Um** (`colaborador1@demo.inovaup.test`):
- Não existe cadastro aberto: as contas são criadas pela Gestão de Pessoas.
- O menu do colaborador tem só **Início, Avaliações e Meu relatório**.
- Digitar `/painel` na barra de endereço → **"Acesso negado"**. O papel vem do banco, não da tela: esconder o menu não é a proteção, cada página confere.

### 2:00 — Responder uma avaliação (2 min)

Ainda como Colaborador Um → **Avaliações** → **Consultor Demo Três** (como par) → **Responder**:
- todas as seções numa página; escala de 1 a 10; "Não se aplica" só onde a seção permite;
- responder algumas competências → **Salvar rascunho** → recarregar a página: as respostas voltam;
- **Enviar** incompleto → o sistema mostra o que falta;
- completar (pode marcar "Não se aplica" em Liderança), escrever um comentário curto → **Enviar avaliação** → **Confirmar envio**;
- a avaliação vai para "Enviadas" e passa a ser só leitura.
- Fala: "Ninguém lê esta resposta individual: nem o Consultor Três, nem a GP."

### 4:00 — A segunda resposta (30 s)

Sair → entrar como **Líder** (`lider@demo.inovaup.test`) → **Avaliações** → **Consultor Demo Três** (como gestor) → responder rápido → enviar. (Se o tempo apertar, mostrar só que existe a pendência e enviar sem comentar cada campo.)

### 4:30 — Painel da GP (1 min)

Janela normal, **GP**:
- **Painel da GP**: "**17 de 17** avaliações respondidas". A GP vê só quantas foram respondidas, nunca o que foi respondido.
- **Encerrar ciclo**: a confirmação avisa quantas faltam; aqui, "Todas as avaliações foram respondidas (17 de 17)" (se faltasse alguma, diria "Faltam N de 17"). → **Confirmar**: o ciclo fecha e o cálculo roda na hora ("Relatórios calculados para 4 pessoa(s)").

### 5:30 — Os relatórios e a regra de anonimato (2 min)

**Ver relatórios do ciclo**. Mostrar, nesta ordem:

| Pessoa | O que aparece | O que explicar |
|---|---|---|
| **Líder Demo** (caso A) | Nota final **83,45%**; Gestor(a), Pares e Liderados **separados**; "Liderança" **indisponível**; 3 comentários | Cada grupo teve 2 ou mais avaliadores, então pode aparecer separado. "Liderança" só teve 1 avaliador além dele: fica indisponível |
| **Colaborador Demo Um** (caso B) | Nota final **76,17%**; só "**Outros avaliadores (combinado)**"; "Gestão de projetos" e "Liderança" **indisponíveis** (todos marcaram N/A); comentários indisponíveis | Ele tem **um único gestor**. Se os grupos aparecessem separados, daria para descobrir a nota do gestor. Por isso nenhum grupo aparece separado |
| **Colaboradora Demo Dois** (caso C) | Só a **autoavaliação** e o aviso "Resultado consolidado indisponível…" | Só 1 pessoa a avaliou além dela mesma: mostrar a média seria mostrar a nota daquela pessoa |
| **Consultor Demo Três** | **Disponível**, com o resultado das duas respostas de agora há pouco | Antes da demo ele tinha 1 avaliador e o relatório estaria indisponível; com as 2 respostas ao vivo, passou o mínimo |

- Fala: "A supressão acontece **antes** de gravar. O banco nunca guarda a nota de um avaliador individual, nem para a GP."
- Fala: "Os percentuais usam uma **fórmula provisória**, observada no Impulse Up. A GP ainda vai validar."

### 7:30 — Liberação (1 min)

- Voltar ao **Painel da GP** → **Liberar relatórios do ciclo** → **Confirmar**. Não dá para desfazer.
- Janela anônima → sair → entrar como **Líder** → **Meu relatório**: ele vê o próprio relatório, igual ao que a GP conferiu, com "Sua autoavaliação". Não vê o de mais ninguém.

### 8:30 — Próximos passos (1 min)

- **MVP operacional (~18/12):** login com a conta Google da empresa, cadastro e importação das pessoas, questionário e mapa "quem avalia quem" importados, e-mail, versão publicada e a **fórmula validada pela GP**.
- **Pesquisas anônimas (~22/1/2027).**
- **Produção (fevereiro a março de 2027):** backup, LGPD, um ciclo em paralelo com o Impulse Up antes de trocar.
- Precisamos da GP para: as 13 perguntas pendentes (pesos reais, quem avalia quem, mínimo de respostas, retenção…) e um caso de referência para validar a fórmula.

## 4. Se algo der errado

| Problema | O que fazer |
|---|---|
| A internet cai ou o Supabase não responde | Trocar para o **vídeo reserva** e narrar por cima |
| Login falha | Conferir se o `.env.local` é o do **demo** (`.env.demo.local` copiado); entrar de novo |
| "Acesso negado" logo depois de rodar a semente | A semente recria as contas: **Sair** e entrar de novo |
| "Encerrar ciclo" mostra que o cálculo falhou | Clicar em **Calcular relatórios** (pode rodar de novo até liberar) |
| O ciclo já aparece encerrado ou liberado | Esqueceram de rodar a semente: `npm run seed` (com o `.env.local` do demo) e recarregar |
| Pergunta sobre um caso que não está no roteiro | Responder em palavras; não improvisar dados na tela |

## 5. Depois da demonstração

1. Parar o servidor (Ctrl+C no terminal do `npx next dev`).
2. Voltar ao dev: copiar o `.env.local` de volta para `.env.demo.local` (para guardar as senhas da demo) e renomear o `.env.dev.local` para `.env.local`.
3. Anotar as perguntas e os pedidos da plateia na lista "depois de 4/12" do plano.
