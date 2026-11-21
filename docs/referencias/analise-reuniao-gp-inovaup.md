# InovaUp — Análise da reunião com Gestão de Pessoas

Fonte: transcrição da reunião com o diretor de Gestão de Pessoas e o gerente de Conexões de Pessoas, cruzada com o mapeamento do Impulse Up (fase 1).

> A transcrição automática tem muitos erros de reconhecimento de fala. Termos interpretados: "AAD/AD" = avaliação de desempenho; "push serve / Impulser / Ecosilve" = Impulse Up; "escuta editorial/escritorial" = escuta setorial; "pesquisa de postos dos treinantes" = pesquisa de pulso dos trainees; "pesquisa de curso" = provavelmente pesquisa de clima; "ciência da diversidade" = censo de diversidade. Validar com a equipe.

---

## 1. Contexto e motivação

- Custo atual: cerca de R$ 1.700 a 1.900 por mês, com previsão de subir para R$ 2.200.
- Limite de **97 usuários** no plano. A empresa já bate esse limite. A solução improvisada no ano passado foi desativar o login de um grupo (trainees ou consultores) enquanto o outro era avaliado.
- Decisão da reunião: o sistema será **só para uso interno**. Vender para fora exigiria um investimento em segurança da informação que a empresa não tem hoje.

## 2. O que a área usa hoje e com que frequência

| Processo | Módulo | Frequência | Privacidade |
|---|---|---|---|
| Avaliação de desempenho | Avaliações | Bimestral | Identificada, com relatório individual |
| Escuta setorial | Pesquisas | Bimestral | Anônima |
| Pesquisa de pulso dos trainees | Pesquisas | Semanal ou quinzenal | Anônima (com codinome) |
| Pesquisa de clima | Pesquisas | Não informado | Anônima |
| Censo de diversidade | Pesquisas | Semestral | Não informado |
| Votação de liderança / comitê | Pesquisas | Pontual | Não informado |
| Feedbacks | Feedbacks | Contínuo | Individual |

**Não usam:** PDI, Reuniões 1:1 e OKRs do Impulse Up (dá para cortar do MVP).

## 3. O que funciona bem no Impulse Up (manter)

1. **Construtor de pesquisas livre**, parecido com o Google Forms: a empresa cria perguntas e escalas do zero.
2. **Cálculo da avaliação de desempenho**: pesos por tipo de avaliador (autoavaliação, gestor, pares, liderados), configuráveis. É o motivo de não rodarem a avaliação no Google Forms.
3. **Relatório individual automático**: gráfico de notas, média por competência e, no final, a parte qualitativa com os comentários. É a base para montar o PDI de cada pessoa.
4. **Lembretes por WhatsApp** com contagem regressiva de prazo.
5. **Escolha de quem responde** cada pesquisa.

## 4. Dores levantadas (oportunidades para o InovaUp)

### Dor 1 — Montar quem avalia quem é 100% manual (a maior dor; automação na fase 2)
- Hoje, para cada pessoa avaliada, é preciso selecionar um por um: liderança direta, liderança de esquadra, liderança de projeto, pares de projeto, pares de esquadra, liderados. As relações mudam conforme o nível da pessoa.
- Isso é controlado numa **planilha paralela** e depois copiado à mão para o Impulse Up.
- Para saber quais projetos estão ativos, a GP precisa perguntar a cada gerente de projeto.

**Proposta InovaUp:**
- Cadastro único de **pessoas, squads (esquadras), contas, projetos e alocações** (quem é gerente e quem é consultor de cada projeto, em qual período).
- Ao criar uma avaliação, o sistema **gera automaticamente o mapa de "quem avalia quem"** a partir dessas alocações e de regras por nível (ex.: trainee é avaliado por X, consultor por Y).
- Tela de revisão para **marcar/desmarcar projetos** (ex.: projeto parado não entra) e ajustar pessoas antes de disparar.
- Opcional: ao criar a avaliação, **mensagem automática no Slack** para os gerentes confirmarem os projetos ativos.

### Dor 2 — Desconexão com os dados de projetos (fase 2)
- O Impulse Up não conversa com a base de projetos da empresa.

**Fonte confirmada:** os dados de projetos (andamento, gerente, consultores, alocação) ficam em painéis do **Monday**.

**Proposta InovaUp — integração com o Monday (somente leitura):**
- **Como:** a API do Monday (GraphQL) lê os painéis de projetos com um token de uma conta de integração dedicada, só com permissão de leitura nesses painéis.
- **O que é lido:** nome do projeto, status (em andamento, parado, encerrado), gerente(s), consultores, esquadra/frente e datas.
- **Ligação com as pessoas:** a maioria dos consultores entra no Monday como **convidado com e-mail pessoal**, então o e-mail corporativo não serve de chave. Solução:
  - cada pessoa do InovaUp guarda o **ID de usuário do Monday** (número fixo, que não muda mesmo que a pessoa troque de e-mail);
  - **vínculo feito uma única vez** numa tela de "Conectar pessoas": o InovaUp lista os usuários do Monday, sugere o par pelo nome e, quando houver, pelo e-mail corporativo; a GP confirma;
  - pessoas novas são vinculadas na entrada (onboarding), e quem estiver sem vínculo aparece como alerta ao criar uma avaliação;
  - o InovaUp **não precisa guardar o e-mail pessoal** (menos dado pessoal armazenado, melhor para a LGPD).
- **Sincronização:** periódica (ex.: 1x por dia) e também sob demanda no botão "Criar avaliação".
- **Congelar a foto:** ao criar uma avaliação, o InovaUp guarda as alocações daquele momento. Mudanças posteriores no Monday não alteram uma avaliação em andamento.
- **Regra de elegibilidade:** projeto com status "em andamento" entra pré-marcado, "parado" entra desmarcado, e a GP ajusta.

**Estrutura observada no Monday (acesso de consultor convidado, 19/11/2026):**

A empresa tem dois tipos de quadro relevantes para o InovaUp:

- **Contas** (ALFA, BETA, DELTA): reúnem os **projetos de clientes** da consultoria. Correspondem à "liderança de projeto" e aos "pares de projeto" da avaliação.
- **Squads** (áreas internas): Núcleo de Inovação, Institucional, Comercial, Pessoas etc. Correspondem à "liderança de esquadra" e aos "pares de esquadra" da avaliação. Só os quadros do Núcleo de Inovação foram vistos, porque o perfil usado faz parte dele.

Os outros quadros vistos (SalesOps, PDL e o PDI pessoal) não entram na integração.

**1) Quadros das contas (projetos)**

| Conceito | Como aparece no Monday |
|---|---|
| Conta | Um quadro por conta (ALFA, BETA, DELTA) |
| Projeto | Um **grupo** dentro do quadro da conta |
| Sprint/etapa do projeto | Uma **linha** (item) dentro do grupo |
| Gerente | Coluna de pessoas **"Gerente"** (por sprint) |
| Consultores | Coluna de pessoas **"Consultoria"** (por sprint) |
| Andamento da sprint | Coluna de status "Status" (valores vistos: Backlog, Em progresso, Concluído) |
| Projeto ativo | Coluna de caixa de seleção **"Projeto está Ativo? (Marque apenas uma vez)"** |
| Datas | Coluna de cronograma "Cronograma" |

Colunas comuns aos três quadros: Sprint, Status, Cronograma, Consultoria, Gerente, Attendance, Entregas, Alexandria, Controle de tempo, Escopo, Planejado, Feito, Projeto está Ativo?.

Diferenças entre os quadros das contas (precisam ser padronizadas ou tratadas na integração):
- ALFA usa "Tipo de **Entrega**" e "Espelho"; BETA e DELTA usam "Tipo de **Etapa**" e "Etapas Referência".
- ALFA tem colunas extras: Google Calendar event, Fórmula, OPE.
- DELTA tem uma coluna "Conectar quadros" (liga a outro quadro que o perfil de consultor não vê; pode ser um quadro central de projetos).
- O texto da coluna "Projeto está Ativo?" muda entre maiúsculas e minúsculas de um quadro para outro.

**2) Quadros da squad (exemplo: Núcleo de Inovação)**

| Conceito | Como aparece no Monday |
|---|---|
| Squad | Um quadro **por ciclo**: "[26.2.1] Núcleo de Inovação", "[26.2.2] Núcleo de Inovação". Também existe "Operações do Núcleo 2026.2", com a mesma estrutura |
| Frente/operação da squad | Um **grupo** (ex.: "Operação ...") |
| Tarefa/sprint | Uma **linha** (item) |
| Membros | Coluna de pessoas **"Membros"** |
| Liderança | Coluna de pessoas **"Liderança"** |
| Andamento | Coluna "Status" (valores vistos: Não iniciado, Em progresso, Finalizado) |
| Datas | Coluna "Prazo" |

Outras colunas: Nome do sprint, Entregas, Importância, Valor/Impacto (há mais colunas à direita que não foram lidas). Visualizações: Quadro principal, Gantt, Kanban e Volume de trabalho.

Pontos de atenção:
- **O Núcleo de Inovação é a única squad cíclica:** a composição muda a cada 3 meses. O código "[26.2.1]" significa semestre 2026.2, 1ª edição; "[26.2.2]" é a 2ª edição do mesmo semestre. Cada edição tem um quadro novo, e uma mesma pessoa pode participar de várias edições seguidas.
- "Operações do Núcleo 2026.2" também é do Núcleo e tem a mesma estrutura.
- O InovaUp precisa saber qual quadro vale em cada período, seja por uma tela onde a GP cadastra o quadro da edição, seja reconhecendo o padrão de nome "[AA.S.N] Nome da squad". Ao criar uma avaliação, vale a edição do Núcleo vigente no período avaliado (a foto congelada da Dor 2).
- **Status com nomes diferentes dos das contas** (Finalizado × Concluído, Não iniciado × Backlog). A integração traduz os dois para um status único.
- **As outras squads** (Institucional, Comercial, Pessoas...) usam o mesmo modelo de quadro: demandas como itens, com responsáveis e status. O Núcleo é o mais detalhado, mas a integração serve para todas.

**Impactos para a integração:**
1. O InovaUp lê **dois grupos de quadros**: os quadros das **contas** (cada grupo é um projeto) e os quadros das **squads** (o quadro inteiro é a squad).
2. Equipe de um projeto = **união das pessoas** das colunas "Gerente" e "Consultoria" em todas as sprints do grupo. Bônus: isso mostra quem atuou em cada fase, o que resolve o caso do consultor que só participou de uma frente.
3. Equipe de uma squad = pessoas das colunas "Membros" e "Liderança" no quadro do ciclo. A "liderança de esquadra" vem da coluna "Liderança".
4. Com isso, o mapa de "quem avalia quem" sai quase completo: liderança e pares de projeto vêm das contas; liderança e pares de esquadra vêm das squads.
5. Projeto ativo: usar a caixa "Projeto está Ativo?" combinada com o status das sprints (ex.: alguma sprint em progresso no período).
6. As colunas devem ser identificadas pelo **ID da coluna**, não pelo nome, porque os nomes variam entre quadros. Uma tela de configuração no InovaUp diz, para cada quadro, qual coluna é gerente, consultores, membros, liderança e status.
7. Alguns grupos das contas parecem ser de **prospecção** (fase comercial) e não de projeto em execução. É preciso uma regra para diferenciar.

**Pré-requisitos a verificar nos painéis do Monday:**
1. ~~Mesma estrutura de colunas?~~ Parcialmente: a base é igual dentro de cada tipo de quadro, mas há nomes diferentes (ver acima).
2. ~~Colunas do tipo "Pessoas"?~~ Sim: "Gerente" e "Consultoria" nas contas; "Membros" e "Liderança" nas squads.
3. Os valores de status são padronizados? Contas: Backlog, Em progresso, Concluído. Squads: Não iniciado, Em progresso, Finalizado. Confirmar com um gerente.
4. ~~Existem outras squads?~~ Sim: Institucional, Comercial, Pessoas e outras, todas com o mesmo modelo de quadro. Só o Núcleo de Inovação muda a cada 3 meses.
5. O que o quadro ligado por "Conectar quadros" no DELTA contém?
6. Como diferenciar um grupo de prospecção de um projeto em execução?
7. ~~Qual quadro do Núcleo é a referência?~~ Todos são do Núcleo. "[26.2.1]" e "[26.2.2]" são as edições trimestrais do semestre 2026.2.
8. O plano do Monday da empresa permite uso da API? (todos os planos permitem, com limites de consumo)

### Dor 3 — Feedback que deveria ser privado aparece para a liderança
- Um feedback enviado para um liderado fica visível para o gestor cadastrado dele. A solução improvisada foi apagar o vínculo de gestor da pessoa.

**Proposta InovaUp:** quem envia escolhe a **visibilidade** de cada feedback (só a pessoa / pessoa + liderança / GP).

### Dor 4 — Sem dashboards; relatórios montados à mão
- Resultados de pesquisas anônimas saem em planilha.
- O relatório da escuta setorial é montado manualmente pela GP.

**Proposta InovaUp:** dashboards nativos por pesquisa (médias por pergunta e dimensão, evolução entre edições, recorte por setor respeitando um número mínimo de respostas para preservar o anonimato) e geração automática do relatório da escuta setorial.

### Dor 5 — Limite de usuários
**Proposta InovaUp:** sem limite. Basta ter status de pessoa (ativa, trainee, desligada) em vez de desativar logins.

### Dor 6 — PDI desconectado da avaliação
**Proposta InovaUp (fase 2):** a partir do resultado da avaliação, sugerir à GP ações de PDI por competência com nota baixa (trilhas de desenvolvimento).

### Dor 7 — Anonimato com continuidade (vista no mapeamento)
- Nas pesquisas de pulso, cada pessoa inventa um "codinome" para que a GP acompanhe a evolução sem identificar ninguém.

**Proposta InovaUp:** pseudônimo automático por pesquisa recorrente. O sistema liga as respostas da mesma pessoa entre edições sem guardar quem é.

### Dor 8 — Privacidade da API (vista no mapeamento)
- No Impulse Up, a API de uma pesquisa anônima entrega a qualquer participante a lista de e-mails de todos os convidados.

**Proposta InovaUp:** regra de projeto: cada perfil recebe da API só o que pode ver.

## 5. Escopo sugerido para o MVP

Prioridade definida na reunião: **avaliações e pesquisas**.

**MVP (substitui o Impulse Up no que é crítico):**
1. Login (de preferência com a conta Google da empresa) e perfis: colaborador, gestor, GP/admin.
2. Cadastro **manual** de pessoas e squads (projetos são opcionais nesta fase).
3. Construtor de pesquisas (perguntas, escalas, seções), anônima ou identificada, com pseudônimo automático.
4. Avaliação de desempenho com pesos configuráveis e relatório individual. O "quem avalia quem" é montado **à mão dentro do InovaUp**, mas sem o retrabalho de hoje:
   - **importar a planilha** que a GP já usa (pessoa avaliada, avaliador, tipo de relação);
   - **duplicar o mapa da avaliação anterior** e só ajustar o que mudou;
   - selecionar avaliadores por tipo de relação (liderança direta, liderança de esquadra, liderança de projeto, par de projeto, par de esquadra, liderado).
5. Dashboards de resultados das pesquisas.
6. Lembretes por e-mail (WhatsApp numa fase seguinte).

**Fase 2:**
- **Integração com o Monday** e **geração automática de "quem avalia quem"** (Dores 1 e 2), deixada para depois do MVP por decisão do time em 19/11/2026. Para não precisar refazer nada:
  - o MVP já guarda o "quem avalia quem" com o **tipo de relação**. Na fase 2, a integração só preenche automaticamente o que hoje é preenchido à mão;
  - o cadastro de pessoas já reserva um campo para o **ID de usuário do Monday**.
- Feedbacks com controle de visibilidade.
- Integração com Slack e WhatsApp.
- Sugestão de PDI a partir da avaliação.
- Relatório automático da escuta setorial.

**Fora do escopo:** reuniões 1:1 e OKRs (não são usados).

## 6. Pontos de atenção

- **Segurança e LGPD**: avaliações e pesquisas de clima são dados sensíveis. Mesmo para uso interno é preciso ter controle de acesso por perfil, registro de quem viu o quê, backup e criptografia. É bom ter um responsável definido.
- **Expectativa sobre a engenharia reversa**: na reunião apareceu a ideia de "pegar todo o código" do Impulse Up. Num site isso não é possível, porque a lógica do servidor (cálculos, regras) não fica exposta. Dá para mapear funcionalidades, telas e o formato dos dados e então construir o InovaUp do zero. Isso também é o caminho certo do ponto de vista legal.
- **Migração do histórico**: verificar a exportação dos dados de avaliações e pesquisas do Impulse Up antes de cancelar o contrato.
- **Fórmulas de cálculo**: pedir à GP a configuração atual de pesos e cálculos da avaliação, que só aparece para o administrador.

## 7. Perguntas em aberto para a GP

1. ~~Onde ficam hoje os dados de projetos e alocações?~~ Respondido: Monday. Ver pré-requisitos na Dor 2.
2. Quais são exatamente as regras de "quem avalia quem" por nível (trainee, consultor, gerente, diretor)?
3. Quais são os pesos e fórmulas usados na avaliação de desempenho?
4. Quais escalas e tipos de pergunta vocês usam nas pesquisas?
5. A empresa usa Slack e Google Workspace como ferramentas oficiais?
