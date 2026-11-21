# Cálculo da nota da avaliação — fórmula provisória

**Status: PROVISÓRIA.** Parte foi observada no Impulse Up, parte foi inferida e **nenhuma parte foi validada pela GP** até 20/11/2026. Não apresente esta fórmula como regra oficial da empresa.

## Origem de cada parte

| Parte | Situação | Fonte |
|---|---|---|
| Nota da seção = média ponderada das competências pelos pesos delas | **Observada** | Código do Impulse Up (função `calculateScores`, análise com REA) |
| Nota final = média ponderada das seções pelos pesos delas | **Observada** | Idem |
| % = nota ÷ **valor máximo** da escala da seção × 100 (não subtrai o mínimo) | **Observada** | Idem |
| Respostas N/A (e vazias) ficam fora da conta | **Observada** | Idem |
| Pesos dos grupos: autoavaliação 1, gestor 2, liderados 2, pares 2 | **Observados** na avaliação TESTE | Vídeo da GP; pesos da avaliação real **não confirmados** (pergunta 1) |
| Média de cada grupo, combinada pelos pesos **só dos grupos presentes** | **Inferida** | No Impulse Up é feita no servidor e não aparece no código |
| Combinar os grupos **por competência** (e não no fim) | **Escolha provisória** | Ver "Alternativa" abaixo |
| Calibração e ajustes manuais de nota | **Desconhecido**, fora do MVP | Pergunta 4 da GP |

O comportamento é observado; a regra de negócio ainda não foi validada.

## Algoritmo provisório

Entradas: seções do ciclo (escala mínima e máxima, `permite_na`, peso), competências (peso), pesos dos grupos e respostas das atribuições **enviadas** de um avaliado.

1. Considere só atribuições com status `enviada`.
2. Descarte respostas N/A e vazias.
3. **Média do grupo por competência:** `G(g, c)` = média simples das respostas dos avaliadores do grupo `g` para a competência `c`. Fica indefinida se ninguém do grupo respondeu.
4. **Nota combinada da competência:** `S(c) = Σ peso_g · G(g, c) / Σ peso_g`, somando só os grupos com `G(g, c)` definido.
5. **Nota da seção:** `Sec(s) = Σ peso_c · S(c) / Σ peso_c`, só com as competências com `S(c)` definido.
6. **% da seção:** `pct(s) = Sec(s) / escala_max(s) × 100`.
7. **Nota final (%):** `Σ peso_s · pct(s) / Σ peso_s`, só com as seções definidas.
8. **% da competência:** `S(c) / escala_max(seção de c) × 100`.
9. **Por grupo** (usado pela supressão do relatório): repetir os passos 5 a 7 usando `G(g, c)` no lugar de `S(c)`, gerando `pct_g`. Também calcular a **combinação dos grupos além da autoavaliação** ("outros avaliadores"). Contagem `n_g` = número de avaliadores do grupo com pelo menos uma resposta que não seja N/A.
10. Calcular sem arredondar; arredondar para 2 casas só na exibição.

**Alternativa (não escolhida):** combinar no fim, como média ponderada das notas finais de cada grupo. Ela dá resultado diferente quando os grupos não respondem às mesmas competências (N/A, visibilidade). A escolha final é da GP.

## Parâmetros da semente (provisórios)

- `pesos_grupo`: autoavaliação 1, gestor 2, pares 2, liderados 2.
- Pesos de seção e de competência: 1 (como na avaliação TESTE).
- Escalas: Performance de 1 a 10 com N/A; Comportamental de 1 a 10 sem N/A.

## Casos de referência (para os testes da A6)

**Caso 1: grupo ausente numa competência + N/A.** Uma seção de 1 a 10 com N/A, peso 1; competências C1 e C2, peso 1.

| Avaliador (grupo) | C1 | C2 |
|---|---|---|
| Própria pessoa (autoavaliação, peso 1) | 8 | 6 |
| Gestor (1 avaliador, peso 2) | 9 | N/A |
| Par 1 (pares, peso 2) | 7 | 8 |
| Par 2 (pares, peso 2) | 5 | 6 |

- `S(C1) = (1·8 + 2·9 + 2·6) / 5 = 7,6` → **76,00%**
- `S(C2) = (1·6 + 2·7) / 3 = 6,6667` → **66,67%**
- `Sec = (7,6 + 6,6667) / 2 = 7,1333` → **nota final 71,33%**
- Por grupo: autoavaliação 70,00%; gestor 90,00% (n = 1); pares 65,00% (n = 2); **outros avaliadores combinados 72,50%**.
- No relatório publicável, pela regra de supressão: nota final e por competência aparecem; **os grupos não aparecem separados**, porque o gestor tem n = 1; aparecem "Sua autoavaliação: 70,00%" e "Outros avaliadores (combinado): 72,50%". A nota por competência C2 aparece só se 2 ou mais avaliadores além da própria pessoa a responderam (aqui, 2 pares: aparece).

**Caso 2: escalas diferentes.**

| Seção | Escala | Peso | Respostas dos pares |
|---|---|---|---|
| A | 1 a 10 | 1 | 7 e 9 |
| B | 1 a 5 | 2 | 3 e 3 |

- A: `G = 8` → **80,00%**. B: `G = 3` → **60,00%**.
- Nota final: `(1·80 + 2·60) / 3` = **66,67%**.

**Caso 3: competência toda N/A e seção sem respostas.**
- Performance: C1 com respostas 8 e 6 → 7; C2 toda N/A → **excluída**. Performance = **70,00%**.
- Comportamental sem nenhuma resposta → **excluída** da nota final.
- Nota final: **70,00%**.

**Caso 4: um só avaliador além da própria pessoa.**
- O cálculo é feito normalmente.
- O relatório publicável mostra só "Sua autoavaliação" e o aviso de número insuficiente de avaliadores (ver `seguranca-da-demo.md`).

## Validação (exigida para o MVP operacional)

A GP confere, num ambiente sem acesso do time, se a nota do InovaUp bate com a de um relatório real do Impulse Up para o mesmo conjunto de respostas. O time recebe só "bate" ou "não bate" e, se não bater, a diferença em pontos percentuais por competência. Depois disso, este documento passa a marcar as partes como **validadas**.
