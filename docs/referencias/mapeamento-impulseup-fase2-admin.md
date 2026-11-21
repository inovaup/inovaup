# Mapeamento do Impulse Up — Fase 2 (telas de administrador)

Data: 20/11/2026
Fonte: vídeo de cerca de 5 minutos gravado pela diretoria de Gestão de Pessoas com o perfil de administrador. Analisado quadro a quadro, sem áudio.
Nenhum dado pessoal foi registrado aqui: nomes, e-mails, resultados e respostas que apareceram no vídeo foram ignorados de propósito.

A maior parte da avaliação mostrada é a "TESTE". É preciso confirmar com a GP se as configurações dela são iguais às da avaliação real do bimestre, principalmente os pesos.

---

## 1. Menu de administrador

| Menu | Itens |
|---|---|
| Dashboard | — |
| IAp | Agentes de IA |
| Avaliações | Avaliações de competência, Avaliações de experiência, Analytics, N-Box, Gráfico de distribuição, Insights (beta), Sucessão |
| Pesquisas | Pesquisas, Pulso, eNPS, Onboarding, Desligamento, Plano de ações |
| Learning | — |
| Feedbacks | Visão geral, Notificações, Configurações |
| PDI, Reuniões, Ações e iniciativas, Gamificação | Não abertos |
| Integrações, Planos e compras | Não abertos |

Rodapé do menu: créditos, créditos de IA e **usuários ativos 94 de 97**, o que confirma que a empresa está no limite do plano.

---

## 2. Avaliação de competência

Criação em quatro etapas: **Configurações → Formulário → Relatórios → Avaliados**. Também dá para começar a partir de um modelo pronto.

### 2.1 Configurações
- Título e texto de introdução para os avaliadores (texto rico).
- **Tipos de avaliador:** Autoavaliação, Gestor(a), Liderados, Pares, Clientes ou fornecedores. A empresa usa os quatro primeiros.
- Data de encerramento única. Existe uma opção de encerramento diferente por tipo de avaliador.
- Lembretes de encerramento: X dias antes do prazo (3 e 1 dia), uma vez ao dia ou três vezes ao dia.

### 2.2 Formulário
- O formulário é dividido em **seções**, cada uma com sua escala e a opção de comentário em cada competência.
- Seções da avaliação vista: **Performance**, **Comportamental**, **Processos - Lideranças**, **Processos - Analista** e **Questões abertas**.
- Escalas: Performance usa **N/A e 1 a 10** (permite "não se aplica"); Comportamental usa **1 a 10**, sem N/A.
- Cada competência tem um título e uma pergunta. Exemplos da seção Performance: Cumpre prazos, Preza pela organização, Faz entregas de qualidade, Gestão de projetos, Liderança e uma competência de resolução de problemas. Na Comportamental: Apoio e reconhecimento por parte das lideranças, Direcionamentos das lideranças.
- **Peso da competência dentro da seção** (todas com peso 1 na avaliação vista). As seções também têm peso.
- **Regras de visibilidade por competência**, um ponto muito importante:
  - **Por avaliado:** a pergunta só aparece quando a pessoa avaliada é de certas áreas, cargos ou níveis. Exemplo: "Cumpre prazos" vale para 23 cargos; "Gestão de projetos", só para 2.
  - **Por avaliador:** a pergunta só aparece para certos tipos de avaliador (ex.: só gestor e autoavaliação) ou certas áreas, cargos e níveis.
- Há botões de "Testar" o formulário e "Validar com IA".
- Cargos cadastrados (usados nas regras): Consultor, Consultor(a) Especialista, Customer Experience, Diretor(a) Presidente, diretorias (Gestão de Pessoas, Mercado, Operações, Projetos), gerências (Comercial, Financeiro, Captação, Conexões, Desenvolvimento, Eventos, Marketing de Conteúdo, Marketing de Estratégia, Performance Institucional, Produtos, Projetos, Relacionamento Institucional) e Head de Projetos.

### 2.3 Relatórios (configuração)
| Item | Configuração vista |
|---|---|
| Casas decimais | 2 |
| Resultado final | Exibido em **porcentagem**; mostra tabela do resultado final **por tipo de avaliador** |
| Cálculo do resultado final | **Porcentagem** (a outra opção é pontuação) |
| Competências | Exibidas em porcentagem, resultado resumido e detalhado, da maior para a menor nota |
| **Pesos por tipo de avaliador** | **Autoavaliação 1, Gestor 2, Liderados 2, Pares 2.** A "configuração avançada de pesos" está desligada |
| Médias | Mostra a média de todos os avaliados da organização para comparação |
| Relatório em PDF | Logo, título e texto da primeira página |
| Devolutivas | O gestor faz uma devolutiva com prazo e lembretes (3 e 1 dia); ela entra no PDF; campos opcionais: título, comentário do avaliado, confirmação de recebimento |
| Outros itens do menu (não abertos) | Exibição de outras informações, Exibição de comentários, Inteligência Artificial, Acompanhamento, Consenso, Envio de relatórios, N-Box e calibração, Métricas externas |

Fórmula provável, a confirmar com um relatório real: média das notas de cada tipo de avaliador → média ponderada pelos pesos dos tipos (1, 2, 2, 2) e das competências → convertida em porcentagem da escala. Respostas N/A ficam fora da média.

### 2.4 Avaliados
- Adicionar avaliados com filtros: nome ou e-mail, **Área, Cargo, Nível, Curso, Squad e Leva**.
- **Definição automática de avaliadores**, a partir só do gestor cadastrado de cada pessoa:
  - o gestor avalia os liderados (padrão);
  - opção "liderados avaliarão gestores";
  - opção "pares avaliarão uns aos outros" (pares = pessoas com o mesmo gestor).
- Ajuste manual por pessoa, em abas: **Gestor, Pares, Liderados, Autoavaliação**.
- Ao editar os dados de uma pessoa, dá para escolher se a mudança vale para toda a plataforma ou só para aquela avaliação.
- Botões: indicação de avaliadores, importação e exportação por planilha e envio da avaliação.

**Conclusão importante:** o Impulse Up só conhece **4 grupos de avaliador**. As relações que a empresa usa (liderança direta, de esquadra e de projeto; pares de projeto e de esquadra; liderados) são encaixadas à mão nesses quatro grupos. E a regra automática dele entende "pares" como "mesmo gestor", não como "mesmo projeto ou squad". Por isso a GP monta tudo na planilha paralela.

### 2.5 Acompanhamento
- Abas Avaliadores e Avaliados; filtros por status, avaliador, gestor, área, cargo e nível.
- Progresso geral, progresso por área e encerramento.
- Ações: notificar gestores, encerrar ou reabrir por avaliador, reenviar avaliações e exportar.

### 2.6 Analytics
- Escolha da avaliação, modo de exibição (resultados finais), agrupamento (por avaliado) e opções de calibração (N-Box e pontuação calibrada pelo gestor).

---

## 3. Pesquisas

Criação em quatro etapas: **Configurações → Formulário → Participantes → Envio**. Também dá para começar de um modelo.

- **Configurações:** título, instruções (texto rico), termo de aceite opcional, tipo **Anônima, Confidencial ou Identificada**, exigir login (sim ou não).
- **Formulário:** seções com descrição; escala por seção (a pesquisa de pulso usa **0 a 10** com rótulos nas pontas, como "Muito ruim" e "Excelente"); comentário opcional por questão; **tema** em cada questão (ex.: "Período Trainee", "GE"); questão fechada, questão aberta e banco de "modelos de questões".
- **Participantes:** grupos dinâmicos por critério, lista fixa, "adicionar todos os usuários ativos" e "permitir participantes não convidados".
- **Envio:** enviar agora ou agendar; dias para responder; notificações por e-mail, SMS e WhatsApp; lembretes 3 e 1 dia antes do fim.
- **Análise de resultados:** permitir que gestores vejam os resultados da própria equipe (e das equipes indiretas), ocultar comentários e respostas abertas para gestores e **quantidade mínima de respondentes** para liberar o resultado ao gestor.
- Pesquisas existentes confirmam o uso: pesquisas de pulso do período trainee, canal de votação do comitê e escutas setoriais por área.

---

## 4. Feedbacks

- Visão geral com totais por tipo (Positivo, Orientação, Melhoria), visualização por feedback ou por colaborador e exportação.
- Novo feedback: para quem, data, tipo, texto (com botão "Gerar feedback" por IA), **observações internas visíveis só ao administrador** e anexo.

---

## 5. Cadastro de pessoas (atributos vistos)

Nome, e-mail, **Área** (ex.: Consultoria, Projetos, Mercado, Operações, Gestão de Pessoas), **Cargo**, **Nível**, **Curso** (graduação), **Squad**, **Leva** (turma de entrada, ex.: 2025.1, 2025.2, 2026.1), **Gestor** e tipo de usuário. Na avaliação de teste, as colunas Nível e Squad estavam vazias.

---

## 6. O que o vídeo não mostrou

- Configuração da avaliação **real** do bimestre (pesos podem ser diferentes da TESTE).
- Conteúdo das seções Processos - Lideranças, Processos - Analista e Questões abertas.
- Telas de Envio de relatórios (quem vê o relatório e quando), Exibição de comentários, Consenso e N-Box.
- Avaliações de experiência, PDI, Reuniões, Learning, Gamificação e Integrações.
