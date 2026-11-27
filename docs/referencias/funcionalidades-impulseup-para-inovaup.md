# Avaliação de desempenho: funcionalidades do Impulse Up e o que levar ao InovaUp

Data: 27/11/2026
Base: mapeamentos do Impulse Up, fases 1 a 5 (`mapeamento-impulseup-fase*.md`), comparados com o InovaUp na `main` (`4ca469d`) e com a lista "depois de 4/12" do `PLANO_MVP_DEMONSTRAVEL.md`. Sem dados de pessoas.

**Esta lista é uma proposta.** Pela regra do `CLAUDE.md`, nada aqui entra antes da demo de 4/12, e cada item novo só vira tarefa depois de registrado no plano, revisado pelo outro integrante e, quando indicado, respondido pela GP. A ordem do MVP operacional, parte 1 (D-19 e D-20), não muda.

## Como ler

| Marca | Significado |
|---|---|
| ✅ | O InovaUp já tem |
| 📋 | Já está na lista "depois de 4/12" ou no plano (com o ID) |
| 🆕 | Nova: útil e ainda não planejada |
| ❓ | Depende de uma resposta da GP (número em `perguntas-pendentes-gp.md`) |
| ⛔ | Não trazer: fere o piso de segurança ou está fora do escopo |

Tamanho (estimativa sem revisão): **P** = até 4 h, **M** = 4 a 12 h, **G** = mais de 12 h.
IDs da auditoria de 24/11 aparecem como "aud." (ex.: aud. A7) para não confundir com as tarefas A1 a A8 do MVP.

---

## 1. Ciclo e questionário

| # | Funcionalidade no Impulse Up | Fonte | InovaUp | Marca | Tam. | Observação |
|---|---|---|---|---|---|---|
| 1.1 | Criar a avaliação pela tela (configurações, formulário, relatório, avaliados) e partir de um modelo | F2 | Só pela semente | 📋 aud. A8 | — | D-19: criação do ciclo e do questionário pela tela |
| 1.2 | Texto de introdução e instruções da avaliação | F2, F5 | Não | 📋 aud. A8 | — | Na migração única do A8 |
| 1.3 | Prazo e data de abertura | F2, F5 | Não | 📋 aud. A8 | — | Idem |
| 1.4 | Seções com escala própria, N/A por seção e pesos de seção, competência e grupo | F2, F3 | Sim | ✅ | — | Fórmula conferida com um relatório real (F4) |
| 1.5 | Título e pergunta completa da competência ("De 1 a 10, o quanto…") | F4, F5 | Só a pergunta | 📋 aud. A8 | — | "Descrição da competência" no A8 |
| 1.6 | **Perguntas abertas** separadas (ex.: "Feedback de melhoria"), com texto explicativo | F4 | Só comentário por seção | 🆕 ❓3 | M | Depende do questionário real |
| 1.7 | Regras de visibilidade das perguntas por cargo, área, nível e tipo de avaliador | F2, F3 | Não | 📋 aud. A1 ❓3a | — | Depois das regras da GP |
| 1.8 | Importar o questionário por planilha | F3 | Não | 📋 Plano (MVP op. parte 1) | — | "Importação do questionário e do mapa" |
| 1.9 | Conceitos por faixa de nota ("de X a Y = conceito") | F3, F4 | Não | 🆕 ❓ | P | Desligado na avaliação real; só se a GP quiser |
| 1.10 | Pré-visualizar e testar o formulário | F2, F5 | Não | 🆕 | P | Útil para a GP conferir antes de abrir |
| 1.11 | Comportamentos dentro da competência, com peso | F3 | Não (decisão da A1) | ⛔ | — | A avaliação real usa peso 1; não vale a complexidade agora |
| 1.12 | Avaliações separadas por público (ex.: trainees por gerência) e avaliação de experiência | F5 | Vários ciclos são possíveis | ❓18 | — | Entender o uso antes de desenhar |

## 2. Quem avalia quem

| # | Funcionalidade no Impulse Up | Fonte | InovaUp | Marca | Tam. | Observação |
|---|---|---|---|---|---|---|
| 2.1 | Tipos de avaliador: autoavaliação, gestor, pares, liderados | F2 | Sim | ✅ | — | Clientes e fornecedores: a EJ não usa |
| 2.2 | Montar o mapa a partir das relações (gestor, pares, liderados) | F2 | Só pela semente | 📋 aud. D1 ❓2 | — | O InovaUp usa as relações da EJ (squad, projeto), o que o Impulse Up não faz |
| 2.3 | Várias lideranças no grupo "Gestor" | F4, F5 | O modelo permite | ✅ ❓2a | — | Falta o critério da GP |
| 2.4 | Importar e exportar o "quem avalia quem" por planilha (uma linha por par) | F3 | Não | 📋 Plano (MVP op. parte 1) | — | Importação do mapa |
| 2.5 | Avaliado sem autoavaliação | F3 | Não | 🆕 | P | Uma opção por atribuição no mapa |
| 2.6 | Indicação de avaliadores pelo avaliado, com aprovação do líder | F5 | Não | 🆕 ❓2b | G | Só se a EJ usar |
| 2.7 | Transferir as avaliações de quem saiu da EJ | F5 | Não | 🆕 ❓19 | M | — |

## 3. Responder a avaliação

| # | Funcionalidade no Impulse Up | Fonte | InovaUp | Marca | Tam. | Observação |
|---|---|---|---|---|---|---|
| 3.1 | Lista "Minhas avaliações" com status | F1, F4 | Sim ("Pendentes" e "Enviadas") | ✅ | — | — |
| 3.2 | Filtro por período e data na lista | F4 | Não | 📋 aud. C8 + 🆕 | P | C8 = data de envio; o filtro é novo |
| 3.3 | Escolher quem avaliar agora, agrupado por tipo, com status | F5 | Lista simples | 🆕 | P | Agrupar a lista por grupo |
| 3.4 | **Uma competência por tela, várias pessoas lado a lado** | F5 | Uma pessoa por página | 🆕 ❓17 | G | Mudança grande de tela; ouvir os membros |
| 3.5 | Salvamento automático | F5 | Botão "Salvar rascunho" | 📋 aud. B1 | — | Já na parte 1 (D-20) |
| 3.6 | Barra de progresso por pergunta, clicável | F5 | Não | 📋 aud. C6 | — | Já na parte 1 (D-20) |
| 3.7 | Conferência de pendências antes de enviar | F5 | Sim (pendências por seção) | ✅ | — | — |
| 3.8 | Comentário por competência, obrigatório em nota extrema, com mínimo de palavras | F3, F5 | Comentário por seção, opcional | 🆕 ❓16 | M | Comentário obrigatório aumenta texto identificável |
| 3.9 | Corrigir depois de enviar, até encerrar | F5 | Enviar é final | 📋 aud. A7 ❓16 | — | "Reabrir com o ciclo aberto" (D-19) |
| 3.10 | Responder depois do prazo | F5 | O ciclo fechado trava | 🆕 ❓16 | P | — |
| 3.11 | Início com as pendências | F1 | Não | 📋 aud. C4 | — | Já na parte 1 (D-20) |
| 3.12 | Responder por link com token, sem login | F3, F5 | Login obrigatório | ⛔ | — | O InovaUp exige login (mais seguro) |
| 3.13 | Assistente de IA no formulário | F5 | Não | ⛔ | — | Fora do escopo; dados de pessoas para terceiros |

## 4. Acompanhamento e administração (GP)

| # | Funcionalidade no Impulse Up | Fonte | InovaUp | Marca | Tam. | Observação |
|---|---|---|---|---|---|---|
| 4.1 | Abrir, encerrar e liberar o ciclo | F2 | Sim (painel) | ✅ | — | — |
| 4.2 | Progresso geral ("X de Y") | F2 | Sim | ✅ 📋 aud. B3 | — | B3 corrige o limite de 1.000 linhas |
| 4.3 | Progresso por avaliado e por avaliador, por área, com filtros | F2 | Não | 📋 aud. A7 + 🆕 | M | aud. A7 = pendências por avaliador (só status); filtros são novos |
| 4.4 | Reabrir a avaliação de uma pessoa | F2 | Não | 📋 aud. A7 | — | Antes do primeiro ciclo real (D-19) |
| 4.5 | Lembretes e reenvio (e-mail, WhatsApp, SMS) | F1, F2 | Não | 📋 aud. D3 ❓20 | — | Depende da P-09 |
| 4.6 | Liberação individual dos relatórios | F3 | Liberação do ciclo inteiro | 🆕 ❓19 | P | — |
| 4.7 | Contagens por grupo para a GP | — | Não | 📋 aud. B8 | — | Tela só da GP |
| 4.8 | Exportar resultados e progresso em planilha | F3 | Não | 🆕 | M | Só o relatório já suprimido e status, nunca respostas |

## 5. Relatório

| # | Funcionalidade no Impulse Up | Fonte | InovaUp | Marca | Tam. | Observação |
|---|---|---|---|---|---|---|
| 5.1 | Nota final, por competência, autoavaliação, grupos e comentários | F4 | Sim, com supressão | ✅ | — | Mais seguro que o Impulse Up (protege no dado) |
| 5.2 | Juntar grupos quando há poucos avaliadores | F4 | Sim (R4) | ✅ | — | No Impulse Up existe, mas está desligado |
| 5.3 | Abas "Minhas avaliações" e "Meus relatórios"; uma página por relatório | F4 | Páginas separadas | 🆕 | P | Só tela |
| 5.4 | Competências da maior para a menor nota | F4 | Ordem do questionário | 📋 aud. A6 | — | — |
| 5.5 | Barras por competência | F4 | Não | 📋 aud. C7 | — | Com o mesmo texto genérico em todo "indisponível" |
| 5.6 | Tabela por seção com "Resultado da seção" | F4 | Não | 🆕 | M | Relatório versão 2: colunas você, outros e final |
| 5.7 | Comparação com a autoavaliação ("pontos cegos") | F4 | Não | 🆕 | M | Relatório versão 2, só com 2 ou mais outros |
| 5.8 | Gráfico radar | F4 | Não | 🆕 | M | Depois das barras; precisa de biblioteca (PR próprio) |
| 5.9 | PDF do relatório | F2, F4 | Não | 🆕 | P | Impressão do navegador, sem dependência |
| 5.10 | Média da organização por competência | F2, F4 | Não | 🆕 ❓21 | P | Calculada no ciclo |
| 5.11 | Maior e menor nota de avaliador; nomes dos avaliadores; comentário com o grupo do autor; contagem por grupo para o avaliado | F4 | Não | ⛔ ❓15 | — | Identifica quem avaliou |
| 5.12 | Análise do relatório com IA | F4 | Não | ⛔ | — | Fora do escopo |

## 6. Depois da avaliação

| # | Funcionalidade no Impulse Up | Fonte | InovaUp | Marca | Tam. | Observação |
|---|---|---|---|---|---|---|
| 6.1 | **Devolutiva do gestor** (texto e "feita", prazo, confirmação do avaliado, liberação pela GP) | F2, F5 | Não | 🆕 ❓6 | G | Ligada na avaliação real |
| 6.2 | **Visão do líder** (tabela da equipe, relatório dos liderados, acompanhamento) | F4, F5 | Não | 🆕 ❓5, 5a | G | Não mostrar quem falta avaliar, pelo nome, sem decisão da GP |
| 6.3 | Histórico da pessoa entre ciclos | F5 | Não | 🆕 ❓21 | M | Faz sentido a partir do segundo ciclo no InovaUp |
| 6.4 | Migração do histórico do Impulse Up | F3 | Não | 📋 Plano (produção) ❓11 | — | A GP exporta e importa; o time vê só os títulos das colunas |
| 6.5 | Calibração de notas | F3 | Não | ❓4 | — | Se usarem, muda a validação da fórmula |
| 6.6 | Consenso, N-Box, sucessão, PDI, metas e OKR | F1 a F5 | Não | ⛔ | — | Desligados na avaliação real ou fora do escopo |

---

## Resumo

| Marca | Itens |
|---|---|
| ✅ Já tem | 1.4, 2.1, 2.3, 3.1, 3.7, 4.1, 4.2, 5.1, 5.2 |
| 📋 Já planejado | 1.1, 1.2, 1.3, 1.5, 1.7, 1.8, 2.2, 2.4, 3.5, 3.6, 3.9, 3.11, 4.4, 4.5, 4.7, 5.4, 5.5, 6.4 (e parte de 3.2 e 4.3) |
| 🆕 Novas sem depender da GP | 1.10, 2.5, 3.2 (filtro), 3.3, 4.3 (filtros), 4.8, 5.3, 5.6, 5.7, 5.8, 5.9 |
| 🆕 Novas que dependem da GP | 1.6, 1.9, 2.6, 2.7, 3.4, 3.8, 3.10, 4.6, 5.10, 6.1, 6.2, 6.3 |
| ❓ Só decisão da GP | 1.12, 6.5 |
| ⛔ Não trazer | 1.11, 3.12, 3.13, 5.11, 5.12, 6.6 |

## Proposta de ordem (para discutir no PR)

1. **MVP operacional, parte 1 (sem mudança):** o que já está em D-19 e D-20.
2. **Logo depois, só tela (Daniel), sem depender da GP:** 5.3 (abas), 3.3 (lista agrupada), 3.2 (filtro), 5.9 (PDF), 1.10 (pré-visualizar). Junto com os itens 📋 da Etapa 1 e 2 (aud. A6, C7, C8).
3. **Relatório versão 2 (Davi e Daniel):** 5.6, 5.7 e depois 5.8, com uma decisão nova no `decisoes.md` (muda o contrato e o cálculo).
4. **Depois das respostas da GP:** 1.6 e 3.8 (perguntas abertas e regras de comentário), 3.4 (formato do formulário), 5.10, 4.6, 2.5.
5. **Fase 2:** 6.1 (devolutiva), 6.2 (visão do líder), 6.3 (histórico), 2.6 (indicação), 4.8 (exportação).

## O que vai no PR

- Esta lista em `docs/referencias/`.
- Os mapeamentos das fases 4 e 5 em `docs/referencias/` (as fases 1 a 3 já estão lá).
- A cópia de `perguntas-pendentes-gp.md` atualizada (21 perguntas; a numeração 1 a 13 não muda).
- Na lista "depois de 4/12" do plano: uma linha apontando para esta lista, sem mudar a ordem da parte 1.
