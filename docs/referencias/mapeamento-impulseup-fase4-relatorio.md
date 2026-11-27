# Mapeamento do Impulse Up — Fase 4 (relatório e aba "Minhas avaliações")

Data: 27/11/2026
Método: igual à fase 3. Um Chrome com perfil temporário e porta de depuração local, logado por um integrante do time com o perfil de **consultor**, na tela Avaliações. O REA copiou só os scripts do aplicativo, que foram lidos de forma estática. Nenhum script foi executado, nenhuma resposta da API foi lida, nenhum relatório foi aberto e nada foi clicado pelo Claude. A janela foi fechada e a captura apagada no fim.

Evidências do REA (sessão de 27/11/2026):
- `list_browser_targets`: ev_542685981eeac023bb468c6eba1a4fa6798efa392ab8b30b309b66aa67d16222
- `inspect_web_page` (com o código-fonte): ev_2db62b17fd8e9d260a3df9bff4d85f3ea6279130d87800d7499df44a18770ac8
- `export_web_scripts`: ev_20a15a5c210614f43cbee016c21d5b15f4c21cf4732c941b3b0d27cf2eabf0c3

Legenda: **[observado]** = está no código; **[inferido]** = conclusão a partir do código; **[desconhecido]** = roda no servidor e não aparece no código.

Mudança desde a fase 3: o painel agora está no pedaço `689` (14 MB) e o relatório no pedaço `468` (4,4 MB). Os nomes dos componentes abaixo são os nomes minificados desta versão.

---

## 1. A aba "Minhas avaliações" (`/dashboard/participant/appraisal`)

### 1.1 Estrutura — [observado]
- Rota `appraisal` → componente `GFe`, com `data: {who: "self", mode: "appraisal"}`. O mesmo componente serve a outros modos (`who`/`mode` montam a chave de tradução do título e da mensagem de lista vazia).
- **Duas abas** (`ui-page-tabs`): `APPRAISALS` ("Minhas avaliações") e `REPORTS` ("Resultados"/"Meus relatórios"). A aba pode vir pela URL: `?tab=REPORTS` (é assim que o "voltar" do relatório devolve a pessoa para a aba certa).
- A aba é só uma troca de bloco na mesma página (`ngSwitch`); não há rota nova.

### 1.2 Aba "Minhas avaliações" — [observado]
- Uma chamada: `GET /api/participant/appraisals/reviewer` → lista das avaliações **em que a pessoa é avaliadora** (inclusive a autoavaliação).
- Filtro de período no próprio navegador: Todas, Ano anterior, Últimos 12 meses (pela data de criação).
- Cada item é um `appraisal-card`. O destino do clique depende do status da resposta:

| Situação | Destino |
|---|---|
| `appraisalStatus = NEVER` (não iniciada) | `appraisal/:id/:token` (começa a responder) |
| `PARTIAL` (rascunho) | `reviewparticipantpartial/:token` (retoma) |
| `SEND` (enviada) | `reviewparticipant/:token` (vê o que respondeu) |
| `statusFinal = ClosedFinal` (encerrada) | `reviewparticipantclosed/:token` (só leitura) |
| Só indicação de avaliadores | `reviewer-indication/appraisal/:id/participant/:pid` |

- O cartão também mostra, conforme a configuração da avaliação: **indicar avaliadores** (o avaliado escolhe pares/clientes dentro de um prazo, com aprovação do gestor) e **consenso** (`review-consensus/:token`).
- **O acesso a cada formulário é por um token do avaliador** (`participantReviewerToken`), não pelo id da avaliação. É o mesmo token dos links por e-mail.

### 1.3 Aba "Meus relatórios" — [observado]
- Componente `self-appraisal-report-list`. Uma chamada: `GET /api/participant/report/self` → lista das avaliações **com relatório disponível para a pessoa**. Cada cartão mostra só o nome da avaliação e o botão "Relatório".
- Clique → `/dashboard/participant/reports-participant/:appraisalId`.
- Lista vazia → mensagem `APPRAISAL_REPORT.LIST.EMPTY_MESSAGE`.
- Do lado do gestor há a mesma lista para a equipe: `GET /api/participant/report/team` e `/api/participant/report/indirect-team`, rota `team/reports-participant/:id/:participanteSelecionado`.
- [inferido] Quem decide se o relatório entra na lista é o servidor (liberação/"envio de relatórios"). O código só recebe a lista pronta.

## 2. A página do relatório (`reports-participant/:id`)

### 2.1 Carregamento — [observado]
O invólucro (`xv`) faz duas chamadas:
1. `GET /api/appraisals/{id}/participant-user-report` → **o relatório inteiro, já calculado**;
2. `GET api/appraisals/{id}/configuration` → a configuração do relatório (ex.: mostrar N-Box ao avaliado).

Se a resposta não tiver `reportAvailableToReviewee = true`, mostra "sem dados". Depois passa tudo para um único componente compartilhado.

### 2.2 Um componente para todos os públicos — [observado]
`app-participant-appraisal-report` (pedaço `468`, cerca de 230 mil caracteres e **179 métodos**) é o mesmo para avaliado, gestor, administrador, geração em lote de PDF e acesso por link público com token. O público é escolhido por entradas: `isParticipantAccess`, `isManagerAccess`, `isAdminAccess`, `isBatchAccess`, `publicEndpoint`.

### 2.3 O que o servidor entrega — [observado pelos campos lidos no código]
O navegador **não calcula notas**; só formata e escolhe o que exibir. Campos usados:
- `participantData.sections[].competencies[]` com `scores` e `scoresPct` **por tipo de avaliador** (Autoavaliação, Gestor, Pares, Liderados, Clientes, Consenso), nota final da competência e nota "agrupada";
- `averagesByEvaluationType`, `radarChartData`/`radarChartDataPct` e `barChartData`/`barChartDataPct` (os gráficos chegam prontos);
- `comments` por competência, `qualitativeAnswers`, `freeTextFieldCompetencies`, `feedbackSections`;
- `diffSelfScore.scoreDiff` por competência (diferença entre autoavaliação e os outros);
- `namesManagerEvaluations`, `namesPeerEvaluations`, `namesReporteeEvaluations`, `namesClientEvaluations` (**nomes dos avaliadores por grupo**, exibidos quando a configuração permite);
- `showHighestReviewerScoreByCompetency` / `showLowestReviewerScoreByCompetency` (maior e menor nota de avaliador);
- `conceptReport` (faixas de nota → conceito), `reportMetrics`, `okrCycle`, `consensuFinalFeedbacks`, `orderReportDetail`, `decimalPlaces`, `showScoresAsPercentages`.

### 2.4 Regras de exibição — [observado]
Todas aplicadas **no navegador**, a partir de `reportConfiguration`:
- **Grupos ocultos:** `hideEvaluationTypes` (lista). Um grupo aparece se não estiver na lista; o consenso tem chave própria (`showConsensusScore`).
- **Comentários:** escondidos se não for administrador **e** (`hideComments` **ou** (é o avaliado **e** `hideCommentsForParticipant`)).
- **Competência aparece** se tiver gráfico (e o gráfico web não estiver desligado), respostas qualitativas, comentários, atributos, texto livre ou descrição. **Seção aparece** se alguma competência dela aparecer.
- **Resumo e detalhado:** `showSummaryResult`, `showDetailedResult` (ligados por padrão).
- **Ordem:** `orderReportDetail` = maior para menor (padrão), menor para maior ou ordem do formulário. Vale também para a tabela de diferença com a autoavaliação.
- **Conceitos:** a nota pode virar um rótulo por faixa ("de X a Y = conceito"), por avaliação, seção ou competência.

### 2.5 Conteúdo da aba "Relatório" — [observado]
Cabeçalho (nome, cargo, área, data de encerramento), nota final (geral e por tipo de avaliador), **gráfico radar** (competências × grupos, filtrável por seção), **gráfico de barras por competência**, tabela de competências por seção, **diferença com a autoavaliação** ("pontos fortes desconhecidos" e "pontos a desenvolver desconhecidos", comparando com os outros ou com o gestor), comentários, respostas abertas, média da equipe/organização para comparação, metas e OKRs quando ligados.

### 2.6 Outras abas do relatório — [observado]
Montadas em `initTabs()`, cada uma por configuração: **Sucessão**, **Devolutiva do gestor** (com prazo; `GET api/appraisal/{id}/devolutive-report/{pessoa}`), **PDI** (adicionar ações a partir do relatório), **N-Box**, **Comentário de calibração**, **Parecer do RH** (só avaliação de experiência).

### 2.7 Outros recursos — [observado]
- **PDF gerado no navegador** (jsPDF, com imagens dos gráficos), inclusive em lote.
- **Calibração** pelo administrador na tela de análise: sobrescreve a nota do gestor por competência (`/api/item-score-overrides/competency`), guardando nota original, nova, autor, data e comentário.
- **Análise com IA** do relatório, ligada separadamente para avaliado e gestor.

### 2.8 Ponto de atenção de privacidade — [observado / desconhecido]
- [observado] As proteções de anonimato do Impulse Up que aparecem no código são **filtros de exibição**: grupo oculto, comentário oculto, nomes de avaliadores. O formato que o navegador sabe ler inclui notas por grupo, comentários e nomes.
- [observado na seção 2.9, num relatório real] Com as opções desligadas, o servidor **não remove** as contagens por grupo nem o identificador do autor de cada resposta aberta; os nomes vêm vazios. Não foi testado o caso de comentários ocultos (a opção estava desligada).
- [inferido] Na fase 1 já se viu a API mandar ao participante dados que a tela não mostra (e-mails de convidados numa pesquisa anônima). Então não dá para supor que "escondido na tela" significa "não enviado".
- [observado, busca limitada aos pedaços `468`, `689` e `main`] Não aparece regra de **mínimo de avaliadores por grupo** no relatório; os campos de mínimo (`minimumRespondents`, `minimumSurveyRespondents`, `belowMinimumRespondents`) são das pesquisas. [inferido] Com um gestor só, a nota "Gestor" é a nota daquela pessoa.
- [observado] Existe uma opção da organização, `adminRestrictViewScoreByReviewer`, que esconde uma coluna das tabelas de acompanhamento do administrador. [inferido] Pelo nome, por padrão o administrador vê a nota por avaliador. No InovaUp a GP nunca vê nota individual.

## 2.9 Conferência com um relatório real (de um integrante do time) — [observado]

Com autorização da própria pessoa, foi lido **o relatório de um integrante do time** (avaliação de desempenho, liberada manualmente). Um script local se conectou ao Chrome temporário, recarregou a página e guardou só as duas respostas do relatório (`participant-user-report` e uma de configuração); a captura foi apagada no fim. **Nenhuma nota, comentário ou nome foi copiado para este documento.** Os textos dos comentários não foram lidos.

**Estrutura da resposta.** Bate com o código da seção 2.3 e acrescenta:
- **contagem de avaliadores por grupo** (`countManagerEvaluations`, `countPeerEvaluations` etc.) e `reviewerCounts`, enviadas ao avaliado mesmo com "mostrar quantidade de avaliadores" desligado (`showNumberTypeReviewers = false`);
- **respostas abertas separadas por tipo de avaliador** (`feedbackSections[].items[].answers.ManagerEvaluations`, `.PeerEvaluations`…), e **cada resposta traz o `reviewerId` de quem escreveu**, além do texto original e do texto calibrado. Os nomes (`names*Evaluations`) vieram vazios, porque a opção estava desligada;
- **nota por grupo em cada competência e em cada seção**, a nota final, as notas originais e as calibradas (`scoreOverrideInfo`);
- a configuração inteira do relatório (cerca de 90 opções), inclusive as que não aparecem no vídeo (seção 2.10).

**Consequência para o anonimato.** O que o Impulse Up "esconde" ou "não mostra" chega mesmo assim ao navegador do avaliado: quantos avaliaram por grupo, a nota de cada grupo (com um avaliador só, é a nota daquela pessoa) e um identificador que permite juntar as respostas abertas de um mesmo autor. Isso confirma a inferência da seção 2.8. O InovaUp não deve repetir esse modelo (D-13).

**Teste da fórmula.** Comparação feita com os números do servidor; só as diferenças foram anotadas:

| Hipótese | Diferença máxima |
|---|---|
| Nota da competência = média dos grupos **presentes**, ponderada pelos pesos dos grupos | **0** (19 competências, inclusive 6 com grupo ausente) |
| % da competência e da seção = nota ÷ máximo da escala × 100 | **0** |
| Nota da seção = média das competências pelo peso da competência | **0** |
| Média do grupo na seção = média das competências do grupo | **0** |
| Nota final (%) = média das seções em %, pelo peso da seção | **0** |
| Alternativa: combinar os grupos só no fim (média de cada grupo, depois pesos) | 1,26 ponto percentual (descartada) |

Ou seja, **a "escolha provisória" do InovaUp (combinar por competência) é a que o Impulse Up usa**, pelo menos neste relatório. Nenhuma competência estava calibrada, então a calibração não interferiu. Limites: um relatório só, uma escala só (1 a 10, sem N/A visível nos números), sem liderados nem clientes. O campo `AVG_SCORE` não se explica pelas notas da pessoa; [inferido] é a **média da organização** por competência (`showCompetencyAverages = true`).

### 2.10 Configuração da avaliação real — [observado]

Valores de configuração (opções da empresa, não dados de pessoas):
- **Pesos dos grupos:** autoavaliação 1, gestor 2, pares 2, liderados 2 (clientes e consenso 1). **São os mesmos da TESTE**, o que responde em parte a pergunta 1 da GP (vale para esta avaliação).
- Três seções de escala 1 a 10, peso 1 cada; competências com peso 1.
- Liberação do relatório **manual** (`reportReleaseMode = MANUAL`); envio por e-mail desligado; o gestor atual pode abrir o relatório do liderado e acompanhar os liderados.
- Comentários visíveis ao avaliado (`hideComments` e `hideCommentsForParticipant` desligados); nenhum grupo oculto; nomes de avaliadores desligados; quantidade de avaliadores desligada (na tela).
- **Agrupamento de notas e de comentários** (`scoreGroupingOptions`, `commentGroupingOptions`) **desligado**. Existe a opção de juntar gestor, pares e liderados num grupo só "apenas se houver menos de N" (`onlyIfLessThan`), que é a proteção de anonimato do Impulse Up, mas a empresa não usa.
- Média da organização ligada; gráficos ligados; ordem da maior para a menor nota; 2 casas decimais; nota final em porcentagem com tabela por tipo de avaliador.
- Diferença com a autoavaliação, maior e menor nota de avaliador, N-Box e consenso: **desligados**. Análise com IA ligada para avaliado e gestor. Devolutiva do gestor incluída no relatório.

### 2.11 Como a tela do relatório é montada — [observado no código e na tela]

Fonte: leitura do desenho da tela no pedaço `468` (o grafo do REA não indexa os textos dos templates do Angular, então a leitura foi direta) e prints recortados do relatório desse integrante, com a autorização da pessoa. **Antes dos prints, todos os blocos de comentário foram desfocados**, e cada recorte foi conferido para não encostar em nenhum deles. Os prints foram apagados; nenhum número foi anotado.

Evidências do REA desta etapa: `inspect_web_page` ev_3de9c1fea9f5151207855a620af275d6ccd39a8154b7117f94c5ccab10620b7e; `export_web_scripts` ev_59320c3e5c89689fd29456101e2135c7d541c131b32b0e0f25f8a1911fbae61a; `analyze_javascript_application` (pedaço `468`) ev_d839800a3615bc76c187cf9f9c95122555050eaaca2bb5c4a882d62b6a541f6b.

**Ordem dos blocos na aba "Relatório"** (cada um com a sua condição):
1. Filtro "Todas as seções" e **gráfico radar** (só com mais de uma seção e com o gráfico web ligado).
2. Quantidade de avaliadores por tipo (desligado nesta avaliação).
3. **Resumo por seção:** uma tabela por seção.
4. Metas/OKR e métricas externas (quando houver).
5. Diferença com a autoavaliação (desligado nesta avaliação).
6. **"Resultados por tipo de avaliador":** tabela com a nota final.
7. **Resultado detalhado:** uma ficha por competência.
8. Comentário final do consenso (quando houver).
9. **Perguntas abertas.**

**Gráficos.** Feitos com **Chart.js** (diretiva `baseChart` sobre `<canvas>`).
- **Radar:** um eixo por competência (19), escala de 0 a 100 em %, uma linha por série (Autoavaliação, Gestor, Pares, Média da organização e Resultado final), com legenda embaixo. O filtro por seção corta o radar para as competências daquela seção. Com 2 competências ou menos, vira gráfico de barras.
- **Barras por competência:** barras horizontais de 0 a 100, uma por série, com cores fixas por grupo. Ficam dentro da ficha da competência.

**Notas por pergunta.**
- **Tabela de cada seção** ("Seção: nome"): uma linha por competência, **em ordem da maior para a menor nota final**, e colunas Autoavaliação, Gestor, Pares, Média da organização e **Resultado final** (destacado em roxo). A última linha é "Resultado da seção". **As colunas variam por seção:** só aparecem os grupos que responderam aquela seção. Numa seção respondida só pela autoavaliação, a tabela tem só "Autoavaliação", e o resultado final da seção é a própria autoavaliação, que entra na nota final.
- **"Resultados por tipo de avaliador":** uma linha com a média de cada grupo, a média da organização e o "Resultado final da avaliação".
- **Ficha da competência** (no detalhado): "1.1. Nome", a pergunta completa ("De 1 a 10, …"), o gráfico de barras e, quando houver, os comentários daquela competência.

**Como os feedbacks são mostrados.**
- Cada comentário é uma **citação com o grupo de quem escreveu em destaque na frente**, no singular: "Gestor(a): …", "Par: …", "Autoavaliação: …" (chave `APPRAISAL_REPORT.EVALUATION_TYPE_SING.<grupo>`). Vale para os comentários das competências, para as respostas qualitativas e para as perguntas abertas.
- **Perguntas abertas** (no fim): título da pergunta (ex.: "Feedback de melhoria"), uma caixa com a explicação da pergunta e uma citação por resposta, agrupadas por tipo de avaliador. O texto é quebrado em parágrafos.
- Sem autor nominal (os nomes estão desligados), mas **o avaliado sempre vê de qual grupo veio cada comentário**. Com um gestor só, o comentário "Gestor(a)" tem autor conhecido.
- Na tela de análise, o administrador tem um link para **reescrever (calibrar) o texto de um comentário**, guardando o original.

## 3. Comparação com o InovaUp (estado em 27/11/2026)

| Tema | Impulse Up | InovaUp hoje |
|---|---|---|
| Lista de avaliações | `/participant/appraisal`, aba "Minhas avaliações" | `/avaliacoes`, "Pendentes" e "Enviadas ou encerradas" |
| Lista de relatórios | Aba "Meus relatórios" na mesma página | Página separada `/relatorio`, com os relatórios em sequência |
| Acesso ao formulário | Token do avaliador | Id da atribuição + RLS |
| Rascunho | Sim (`PARTIAL`) | Não (B1 na lista "depois de 4/12") |
| Onde a nota é calculada | Servidor, a cada pedido ou recálculo | `executar.ts`, uma vez, depois que a GP encerra |
| Proteção de anonimato | Filtros na tela, configuráveis | **No dado, antes de gravar** (D-13): mínimo de 2, supressão complementar, comentários sem autor; o avaliado só lê `relatorios` |
| Liberação | `reportAvailableToReviewee` | `relatorios_liberados` + RLS (antes da liberação a linha nem chega) |
| Gráficos, PDF, ordem por nota | Sim | Não (C7, A6 na lista "depois de 4/12") |
| Visão do gestor | Sim (equipe direta e indireta) | Não; GP vê todos |
| Devolutiva, PDI, N-Box, sucessão, calibração, IA, conceitos | Sim | Não |

## 4. Dá para fazer no InovaUp?

Sim, a maior parte. A regra de ouro: **tudo que for acrescentado ao relatório passa pela supressão (`montarRelatorioPublicavel`) e entra no `RelatorioPublicavel`**. Não copiar o modelo do Impulse Up de esconder na tela.

| Recurso | Viável? | Tamanho | Observação |
|---|---|---|---|
| Abas "Minhas avaliações" / "Meus relatórios" na mesma página (`?aba=relatorios`) | Sim | Pequeno, só tela | Reusa `listarMeusRelatorios`; cada relatório numa página própria `/relatorio/[cicloId]` |
| Filtro por período na lista | Sim | Pequeno | Depende da data de abertura do ciclo (migração do A8) |
| Competências da maior para a menor nota | Sim | Pequeno | Já é o A6 da lista |
| Barras por competência (CSS/SVG, sem biblioteca) | Sim | Pequeno a médio | Já é o C7; o mesmo texto genérico em todo "indisponível" |
| PDF | Sim | Pequeno a médio | Folha de impressão (`@media print`) e "Salvar como PDF" do navegador, sem dependência nova |
| Diferença com a autoavaliação por competência | Sim, com cuidado | Médio | Precisa da autoavaliação e dos "outros combinados" por competência numa **versão 2** do `RelatorioPublicavel` (contrato do Davi), só onde houver 2 ou mais outros |
| Configuração do relatório por ciclo (ocultar grupos, ocultar comentários, casas decimais, conceitos) | Sim | Médio | Colunas no ciclo; aplicadas **na supressão**, nunca só na tela |
| Visão do líder (relatórios da equipe) | Sim | Médio | Depende da pergunta 5 da GP (quem vê o relatório) e de uma política de RLS nova |
| Devolutiva do gestor (texto, prazo, ciência do avaliado) | Sim | Grande | Tabelas e telas novas; fase 2 |
| Média da organização para comparação | Talvez | Pequeno | Agregado de todos; decidir com a GP se ciclos pequenos expõem alguém |
| Gráfico radar por grupo | Só parcial | Médio | Grupos separados só quando o R4 permite; senão "você × outros" |
| Tabela por seção (competências × colunas) com "Resultado da seção" | Sim, adaptada | Pequeno a médio | Colunas "Sua autoavaliação", "Outros avaliadores" e "Resultado final" (grupos separados só quando o R4 permite); nota por seção exige guardar `secoes` no `RelatorioPublicavel` v2 |
| Comentário com o grupo do autor ("Gestor(a): …") | **Não recomendado** | — | O R6 do InovaUp manda comentários sem autor e sem grupo; mostrar o grupo identifica quem é único no grupo |
| Maior e menor nota de avaliador; nomes dos avaliadores por grupo | **Não recomendado** | — | Fere o piso de segurança (nenhuma tela mostra nota de avaliador individual) |
| N-Box, sucessão, calibração, PDI, IA, OKR | Fora do escopo | Grande | Módulos próprios; a calibração depende da pergunta 4 da GP |

**Prazo:** pela regra do `CLAUDE.md`, nada disso entra antes da demo de 4/12. Os itens viram candidatos da lista "depois de 4/12"; as abas, a ordem, as barras e o PDF cabem na Etapa 1/2 sem banco novo. A diferença com a autoavaliação e a configuração por ciclo mexem no contrato e no banco (raia do Davi).

## 5. Limitações

- Só os pedaços carregados na tela de Avaliações foram capturados. Telas que carregam pedaços próprios (consenso, indicação de avaliadores) não foram lidas a fundo.
- Os textos em português ficam num arquivo de tradução não capturado; os rótulos acima vêm dos nomes das chaves.
- Tudo o que roda no servidor (quem entra na lista de relatórios, combinação dos grupos, se os campos ocultos são removidos antes do envio) continua desconhecido.
