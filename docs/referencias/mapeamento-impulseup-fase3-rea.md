# Mapeamento do Impulse Up — Fase 3 (análise do código com o REA)

Data: 20/11/2026
Método: o REA se conectou a uma janela do Chrome com perfil temporário, logada com o perfil de **consultor**. Ele capturou e exportou os 23 scripts carregados pelo aplicativo (cerca de 30 MB), que depois foram lidos de forma estática. Nenhum script foi executado, nenhuma resposta da API com dados de pessoas foi lida e nada foi clicado.
O uso do REA no Impulse Up foi liberado pela empresa, segundo o time.

Evidências do REA (sessão de 20/11/2026):
- `analyze_web_bundle`: ev_b81f799472c6ce4780b4383fe5c475f09aae40e7107f8c059d37fd797d545aab
- `inspect_web_page` (com o código-fonte): ev_6e175b3e3e435157fc8e41a8136dd4e49dc20894e5890fd69bd11fa740b583e2
- `export_web_scripts`: ev_8b804ad6d9ef71e96e9e1b49434ca85ec749dbe37e1f6d86164054e3e09e90d6

Legenda: **[observado]** = está no código; **[inferido]** = conclusão a partir do código, sem prova direta; **[desconhecido]** = roda no servidor e não aparece no código.

---

## 1. Estrutura do aplicativo

- [observado] Aplicativo Angular dividido em 20 pedaços (chunks). O pedaço `239` (14 MB) contém praticamente todo o painel, inclusive a área de administração. Ou seja, o código das telas de administrador chega até um consultor; quem bloqueia o acesso é o servidor.
- [observado] Sem source maps publicados. O código está minificado, mas os nomes dos campos e das funções foram preservados.
- [observado] **254 rotas** mapeadas. Principais áreas: avaliações (competência, experiência, eNPS, pulso, formulário, eficácia), pesquisas (formulário, pulso, eNPS, onboarding, desligamento, ações e iniciativas), resultados (N-Box, gráfico de distribuição, insights), feedback, PDI, reuniões e 1:1, Learning (cursos, trilhas, turmas, instrutores, certificados), gamificação, remuneração variável, plano de sucessão, organograma, cargos, integrações, créditos e plano de pagamento.
- [observado] Rotas de resposta por link com token (`review/:reviewerToken`, `survey/:surveyId`), consenso (`review-consensus`), indicação de avaliadores pelo próprio avaliado (`reviewer-indication`) e relatório em lote (`participant-report-batch`).

## 2. Cálculo da nota (o ponto mais importante)

### 2.1 Nota de um avaliador sobre um avaliado — [observado]
Função `calculateScores` do formulário de resposta (`main.js`). Ela só roda quando a opção "mostrar ao avaliador o resultado da sua avaliação" está ligada, mas revela a fórmula:

1. Descarta respostas vazias e respostas **"NA"** (não se aplica).
2. **Nota da competência** = média ponderada das respostas dos comportamentos daquela competência, usando o peso de cada comportamento (padrão 1). Se a competência não tem comportamentos, é a própria resposta.
3. **% da competência** = nota ÷ **valor máximo da escala da seção** × 100. Não subtrai o mínimo: numa escala de 1 a 10, a nota 1 vale 10%.
4. **Nota da seção** = média ponderada das competências pelo **peso da competência**.
5. **Nota final** = média ponderada das seções pelo **peso da seção**. O percentual final é a média ponderada dos percentuais das seções, o que permite misturar seções com escalas diferentes (ex.: 1 a 10 e 0 a 10).
6. Arredondamento pelas casas decimais configuradas; opcionalmente a nota vira um **conceito** por faixas (de X a Y = "conceito").

### 2.2 Combinação dos tipos de avaliador (pesos 1, 2, 2, 2) — [desconhecido]
- [observado] O relatório **não calcula**: ele só exibe `finalScore` e `finalScorePct` vindos do servidor. Existe um botão de **recalcular notas** que dispara um processamento assíncrono no servidor.
- [observado] Os pesos por tipo de avaliador (`evaluationTypeWeights`) podem ser definidos **por seção**, para Autoavaliação, Gestor, Liderados, Pares, Clientes e Consenso.
- [observado] Existe uma **configuração avançada de pesos** com 8 combinações pré-definidas ("somente autoavaliação", "autoavaliação e gestor", "autoavaliação, gestor, liderados e clientes" etc.), cada uma com seus pesos. Serve para quando uma pessoa não teve todos os tipos de avaliador.
- [inferido] Pelo modelo, a nota final provavelmente é a média dos avaliadores de cada tipo, combinada pela média ponderada com os pesos dos tipos que **existem** para aquela pessoa (os ausentes saem do denominador). Para confirmar: comparar um relatório real com essa conta.

### 2.3 Outras regras do formulário — [observado]
- "Não se aplica" pode ser permitido só para **alguns tipos de avaliador** (`allowNotApplicableEvaluationTypes`).
- Comentário pode ser **obrigatório nas notas extremas** da escala (`commentsMandatoryForExtremesScale`) e ter um **mínimo de palavras** (`minCommentWords`).
- Cada seção define se aparece no relatório **para gestores** e **para o avaliado** (`showInReportToManagers`, `showInReportToParticipants`).

## 3. Regras de visibilidade das perguntas — [observado]

Cada seção e cada competência ou comportamento tem dois blocos de regra:
- `visibility`, sobre **quem é avaliado**: tipos de avaliador, cargos, áreas, níveis e campos personalizados (custom1 a custom6 no código; até 25 no modelo de importação);
- `reviewerVisibility`, sobre **quem avalia**: os mesmos campos.

Lista vazia = sem restrição. É assim que "Gestão de projetos" aparece só para cargos de projetos.

## 4. Planilhas de importação (modelos em branco baixados do próprio site)

### 4.1 "Avaliados e Avaliadores ImpulseUP.xlsx" — o "quem avalia quem"
- **Uma linha por par avaliado–avaliador.** Para vários avaliadores, repete o avaliado em várias linhas.
- Colunas do avaliado: nome e e-mail (obrigatórios), cargo, área, nível, campos customizados 1 a 25, campos de data 1 a 4 e tipo de usuário (Interno/Externo).
- Colunas do avaliador: nome, e-mail, **Tipo do Avaliador** (Gestor, Liderados, Par, Cliente ou Fornecedor) e tipo de usuário.
- Coluna "Avaliado sem autoavaliação?" (Sim).
- A autoavaliação não precisa de linha própria: é criada automaticamente.

### 4.2 "Formulário de Avaliação ImpulseUP.xlsx" — o questionário
Uma linha por competência ou comportamento: peso da competência na seção, competência, descrição, visibilidade por áreas, cargos, níveis, custom 1 a 25 e tipos de avaliador (separados por ";"), peso do comportamento na competência, comportamento e as mesmas colunas de visibilidade para o comportamento.

### 4.3 "Formulario_de_pesquisa.xlsx" — pesquisas
Colunas: Seção, Questão, Tema, Opcional.

## 5. Exportações (para migrar o histórico) — [observado]

Tudo sai em **Excel (.xlsx)**:

| O que | Endereço da API | Arquivo |
|---|---|---|
| Resultados de uma avaliação | `api/appraisals/{id}/appraisal-results-export` | Resultados_Avaliacao.xlsx |
| N-Box | `api/appraisals/{id}/nine-box-export` | NineBox_Resultados.xlsx |
| Sucessão | `api/appraisals/{id}/user-sucession-export` | Resultados_da_sucessao.xlsx |
| Avaliados e avaliadores de uma avaliação | (botão da etapa 4) | Exportação de Avaliados e Avaliadores ImpulseUP.xlsx |
| Progresso da avaliação | (acompanhamento) | Resultados_Progresso_Avaliacao_Avaliado / _Avaliador.xlsx |
| Resultados de pesquisas | `/api/surveys/export-excel` (opção de uma questão por coluna) | Resultados_Pesquisa.xlsx |
| Mapa de calor de pesquisa | `/api/surveys/export-excel/heatmap` | Resultados_pesquisa_mapa_de_calor.xlsx |
| Pessoas | `api/current/organization/people/export-excel` | Exportação de usuários ImpulseUP.xlsx |
| Feedbacks | `/api/feedback/user/peoples/export-data` | — |
| PDI | `api/pdi/curent/organization/export-data` | — |

Estas exportações só funcionam com o perfil de administrador; a migração deve ser feita pela GP.

## 6. Opções de relatório que o vídeo não mostrou — [observado, nomes do código]

Ocultar comentários para o avaliado ou para o gestor; ocultar respostas abertas para o gestor; ocultar a nota final no cabeçalho do relatório; mostrar a maior e a menor nota de avaliador por competência; mostrar a quantidade de avaliadores por tipo; consenso visível só depois de liberado; gestor pode destravar o relatório; gestor pode definir os avaliadores dos liderados; avaliado pode indicar os próprios avaliadores (pares, clientes); resposta fora do prazo; transferência da avaliação entre gestores; análise do relatório com IA para gestor e avaliado; envio do relatório só para pessoas selecionadas; N-Box visível para gestor e avaliado.

## 7. Cruzamento com o vídeo da GP (fase 2)

O vídeo mostra **os valores configurados** (dados). O código mostra **o que cada configuração faz** (lógica). Um completa o outro:

| O que o vídeo mostrou | O que o código explica |
|---|---|
| Pesos por tipo de avaliador: autoavaliação 1, gestor 2, liderados 2, pares 2 | Os pesos podem ser diferentes em cada seção; a combinação é feita no servidor |
| "Configuração avançada de pesos" desligada | Serve para dar pesos próprios a cada combinação de avaliadores que a pessoa teve (8 combinações, como "só autoavaliação e gestor") |
| Peso da competência na seção = 1; ícone de peso também na seção | Três níveis de peso: comportamento na competência, competência na seção e seção na nota final |
| "Calcular resultado final em porcentagem", 2 casas decimais | Porcentagem = nota ÷ máximo da escala × 100; média das seções em porcentagem |
| Escalas: Performance com N/A e 1 a 10; Comportamental 1 a 10 | N/A sai da conta; na escala de 1 a 10 a nota mínima vale 10% |
| Caixa "Exibir para avaliador resultado final da sua avaliação" (desmarcada) | É exatamente essa opção que liga a função `calculateScores`, de onde saiu a fórmula |
| Regras de visibilidade com contadores (23, 21, 5, 2, 22) | O contador é o número de regras; as regras valem para quem é avaliado e para quem avalia e podem usar campos personalizados |
| Filtros de avaliados por Curso, Squad e Leva | No modelo de importação, esses atributos entram como "Campo Customizado" |
| "Definição automática de avaliadores" | O código ainda permite que o gestor defina os avaliadores dos liderados e que o avaliado indique os próprios avaliadores |
| Importação de participantes na etapa Avaliados | Modelo "Avaliados e Avaliadores ImpulseUP.xlsx": uma linha por par avaliado–avaliador |
| Itens do menu de relatório não abertos (comentários, consenso, envio, N-Box) | Nomes das opções na seção 6 |
| Analytics com "Calibrados pelo N-Box" e "Pontuação calibrada do gestor" | Existe ajuste de nota por calibração (`item-score-overrides`). **Se a empresa calibra notas, o relatório real pode ter notas diferentes da conta pura**, o que importa na comparação de notas |
| Botões do acompanhamento (exportar, reenviar etc.) | Exportações em Excel do progresso por avaliado e por avaliador |

O que nenhum dos dois responde: se os valores da avaliação TESTE são os mesmos da avaliação real do bimestre, e como o servidor combina os tipos de avaliador.

## 8. Limitações

- Só os pedaços carregados na sessão foram capturados; 7 pedaços pequenos (`73, 333, 690, 725, 816, 872, 955`) não vieram.
- Os textos em português ficam num arquivo de tradução que não foi capturado; os nomes acima são os nomes internos do código.
- Tudo o que roda no servidor (combinação dos pesos por tipo, recálculo, regras de acesso) não aparece no código.
