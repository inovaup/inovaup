# InovaUp — Plano final do MVP demonstrável (4/12/2026)

Aprovado em 20/11/2026. Ele se baseia na auditoria de viabilidade (3 estimativas independentes, 3 auditorias adversariais e 1 consolidação) e nos ajustes pedidos pela equipe.

**Decisões aprovadas:**
- stack Next.js e Supabase;
- avaliação primeiro;
- 4/12 é a data do MVP demonstrável;
- GitHub gratuito;
- Davi e Daniel usam Windows;
- **conta do Claude compartilhada** (capacidade útil de **31 a 35 h por pessoa**);
- portões G1 a G3, contratos I1 a I4 e divisão de responsabilidades mantidos;
- nenhuma funcionalidade além das descritas aqui.

As tarefas detalhadas estão em [`TAREFAS.md`](TAREFAS.md). As decisões estão em [`decisoes.md`](decisoes.md). As regras estão em [`regras/`](regras/).

## 1. Veredito

4/12 é viável **só para esta versão mínima**:
- **Davi: 30,5 h e Daniel: 31 h (P50)**, dentro da faixa de 31 a 35 h;
- **no P80 (≈ 40 a 41 h), não cabe**: os portões G1 a G3 definem o que sai, sem tocar em segurança;
- o escopo anterior (avaliação e pesquisas completas, publicadas) é inviável. A auditoria estimou cerca de 283 h prováveis para a equipe, contra 88 h úteis.

O tempo de execução do Claude é pequeno: cerca de 4 h por pessoa no período. O gargalo é a validação humana e o limite da conta. Até 4/12, nada de workflows nem subagentes em paralelo; no máximo um subagente para gerar casos de teste.

## 2. Escopo mínimo da apresentação

Roda localmente, só com dados fictícios:

1. Entrar com contas fictícias. Três papéis: colaborador, líder e GP.
2. Pessoas e squads pré-carregados, numa listagem.
3. Ciclo pré-carregado:
   - questionário no formato da avaliação TESTE (Performance com N/A e 1 a 10; Comportamental com 1 a 10), **só competências, sem comportamentos**;
   - pesos dos grupos 1/2/2/2, pesos por competência e por seção;
   - **mapa "quem avalia quem" pré-carregado**. A importação por CSV fica para o MVP operacional.
4. O avaliador vê as suas pendências e responde numa **única página** com todas as seções, N/A e **um comentário por seção**.
5. A nota é calculada pela **fórmula provisória**, provada por testes (seção 3).
6. **Painel da GP, reduzido:**
   - **Fica:** botão "Abrir ciclo"; botão "Encerrar ciclo", que dispara o cálculo; botão "Liberar relatórios do ciclo", um só para todos; o contador "X de Y avaliações respondidas".
   - **Sai:** tabela por avaliador ou por avaliado, filtros, reabrir ciclo ou avaliação, reenvio, liberação individual, edição do ciclo na tela (a configuração vem da semente), exportação.
7. **Relatório individual, reduzido:**
   - **Fica:** nota final (%); nota por competência (%); "Sua autoavaliação" em separado; nota por grupo de avaliador só quando a regra da seção 5 permite; comentários reunidos, sem autor e sem grupo; o colaborador vê só o próprio e só depois da liberação; a GP abre o relatório de qualquer pessoa do ciclo, na mesma tela.
   - **Sai:** gráfico, média da organização, nota por seção, visão do líder sobre os liderados (até a GP responder a pergunta 5), PDF, comparação entre ciclos, devolutiva.

## 3. Fórmula de pontuação: observada × validada

| Parte da regra | Situação |
|---|---|
| Nota da competência; nota da seção = média ponderada pelos pesos das competências; nota final = média ponderada pelos pesos das seções | **Observada** no código do Impulse Up (análise com REA, função `calculateScores`) |
| % = nota ÷ valor máximo da escala da seção × 100; respostas N/A fora da conta | **Observada** (REA) |
| Pesos dos grupos 1/2/2/2 | **Observados** na avaliação TESTE (vídeo da GP). Os pesos da avaliação real não foram confirmados (pergunta 1 da GP) |
| Combinar os grupos: média de cada grupo, depois média ponderada só com os grupos presentes | **Inferida**: no Impulse Up essa conta é feita no servidor e não aparece no código |
| Calibração e ajustes de nota | **Desconhecido** (pergunta 4) |
| **Validada pela GP** | **Nenhuma parte ainda** |

Consequências:
- o cálculo entra como **"fórmula provisória"**, com pesos e mínimos parametrizados pela semente;
- [`regras/calculo-da-nota.md`](regras/calculo-da-nota.md) marca cada parte como observada, inferida ou validada;
- os testes descrevem o comportamento observado, e a demo diz que a regra será validada pela GP;
- **para o MVP operacional, a GP valida** a fórmula com um caso de referência tirado de um relatório real, sem passar os dados ao time.

## 4. Autenticação, papéis e HTTPS na demonstração

Resumo; o detalhe está em [`regras/seguranca-da-demo.md`](regras/seguranca-da-demo.md):
- **Autenticação:** Supabase Auth com e-mail e senha, **cadastro desligado**, contas fictícias criadas só pela semente (`@demo.inovaup.test`, senhas aleatórias de 16 caracteres ou mais). Sem "login de dev" e sem envio de e-mail.
- **Papéis:** a coluna `papel` em `perfis` é escrita só pela semente (`service_role`), sem política de UPDATE para usuários. Nunca guardar papel em `user_metadata`. `requireRole()` lê o banco a cada requisição. Um teste prova que ninguém consegue se promover.
- **HTTPS e sessão:** a demo roda em `http://localhost`, só no computador de quem apresenta. As chamadas ao Supabase são HTTPS. Cookies `httpOnly` e `SameSite=Lax`. A chave `service_role` fica só em `.env.local`. Ao publicar (MVP operacional): HTTPS com HSTS.

## 5. Proteção contra identificação indireta

Resumo; o detalhe está em [`regras/seguranca-da-demo.md`](regras/seguranca-da-demo.md):
- mínimo de **2 avaliadores por recorte** (provisório até a pergunta 7 da GP);
- se **qualquer grupo** além da autoavaliação tiver 1 respondente, **nenhum grupo aparece separado** (supressão complementar, para evitar a dedução por subtração);
- com menos de 2 avaliadores além da própria pessoa, só a autoavaliação aparece, com um aviso;
- comentários reunidos, sem autor e sem grupo, em ordem neutra;
- **nenhuma tela mostra a nota de um avaliador individual**.

## 6. Tarefas, portões e contratos

As tarefas estão em [`TAREFAS.md`](TAREFAS.md), com responsável, revisor, horas, dependências e critério de pronto.

| Portão | Data | O que precisa estar na `main` | Se falhar |
|---|---|---|---|
| **G1** | 24/11 à noite | Núcleo, login e CI verdes | Painel da GP só com os botões; resposta da demo com 1 seção |
| **G2** | 28/11 | Modelo e resposta gravando, com RLS testado | Relatório só com nota final e por competência |
| **G3** | 1/12 | Cálculo e relatório | Resultado semeado, declarado como tal, para mostrar o relatório |
| Congelamento | 2/12, 12h | Revisão de segurança concluída | O que não passar sai da demo |

| Contrato | Data | Entrega | Quem consome |
|---|---|---|---|
| **I1** | 23/11 | Núcleo (`src/contracts/core.ts` + migração) | Daniel |
| **I2** | 25/11 | `getCurrentUser()` e `requireRole()` | Davi |
| **I3** | 27/11 | Modelo da avaliação (`src/contracts/avaliacao.ts`) | Daniel |
| **I4** | 30/11 | `calcularResultado()` e resultados gravados | Daniel |

## 7. Tabela final de horas

| Responsável | Tarefas | P50 | P80* | Capacidade útil (conta compartilhada) |
|---|---|---|---|---|
| **Davi** | F1, F8, F3, F4, F6, A1, A2, A6, Q1, Q2 (correções), contínuas | **30,5 h** | ≈ 40 h | 31–35 h |
| **Daniel** | F1, F8, F2, F7, F3, F5, A5, A8, A7, Q2 (revisão), Q3, contínuas | **31 h** | ≈ 41,5 h | 31–35 h |

\*P80 total = P50 + 0,6 × a soma das margens das tarefas. No P80, os portões G1 a G3 aplicam os cortes.

## 8. Próximas datas e riscos

| Entrega | Escopo | Previsão |
|---|---|---|
| MVP operacional, parte 1: avaliação | Google OAuth restrito ao domínio, cadastro e importação de pessoas, importação do questionário e do mapa, regras de visibilidade, e-mail, homologação publicada e homologação com a GP, fórmula validada pela GP | ~18/12 (P80: início de janeiro) |
| MVP operacional, parte 2: pesquisas anônimas enxutas | Anonimato por desenho, público simples, rascunho local, dashboard com mínimo no servidor | ~22/1/2027 (P80) |
| Produção institucional | Supabase Pro com backup e teste de restauração, produção sem desenvolvedores, log de auditoria, retenção e base legal pela LGPD, OAuth interno, liberação assinada pelo diretor de GP, um ciclo em paralelo com o Impulse Up | fevereiro a março de 2027 |

Premissa: 4 h/dia, com pausa em 24–25/12 e 31/12–1/1.

**Riscos críticos para 4/12:**
1. **Conta do Claude compartilhada:** limite semanal (24% já usado em 20/11, renova em 24/11 às 02:00) e regra de um assento por pessoa no plano Team, que pode levar a suspensão. Mitigação: sem workflows nem subagentes em paralelo; conferir o uso antes de tarefas longas; segundo assento recomendado.
2. **Atraso da fundação** (Windows, sem Docker, Next.js recente): portão G1, modelo oficial `with-supabase`, Cache Components desligado.
3. **Integração entre as raias:** contratos I1 a I4 com dono e data, e tipos simulados até cada um.
4. **Segurança verificada tarde:** testes de permissão no mesmo PR; congelamento em 2/12; o que não passar sai da demo.
5. **Ausência de um dos dois:** não há folga; os portões já definem os cortes.

## 9. Estado do repositório

- Criado em 20/11/2026 com `git init` e **sem commit**. Na tarefa F1, o Daniel cria o repositório privado no GitHub, faz o primeiro commit e o push e convida o Davi.
- Conteúdo: `CLAUDE.md`, `.gitignore`, `.gitattributes`, `docs/` (este plano, tarefas, decisões, regras e referências sem dados pessoais).
- Ainda não há código: o projeto Next.js é criado na tarefa F2.
