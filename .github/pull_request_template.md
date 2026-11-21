## Tarefa

<!-- ID da tarefa em docs/TAREFAS.md (ex.: F4, A1). Um PR = uma tarefa. -->
Tarefa:

## O que mudou

-

## Como testar

<!-- Comandos e passos na tela. Só com dados fictícios. -->
-

## Contratos (I1 a I4)

- [ ] Não altera nenhum contrato
- [ ] Altera um contrato: o título começa com `[CONTRATO]` e o outro integrante foi avisado

## Checklist de segurança

Regras em [`docs/regras/seguranca-da-demo.md`](../docs/regras/seguranca-da-demo.md).

- [ ] Tabela nova com RLS ligada, negando por padrão, e políticas mínimas descritas neste PR
- [ ] Testes de permissão para cada política e ação nova (colaborador, líder, GP)
- [ ] Ações de servidor sensíveis chamam `requireRole()`
- [ ] Nenhum uso de `service_role` fora da semente e de `calculo/executar.ts`
- [ ] Nenhuma variável sensível com `NEXT_PUBLIC_`; nenhum segredo no diff
- [ ] Papel nunca lido de `user_metadata`
- [ ] Nenhum `use cache` em código com dados de pessoas
- [ ] Só dados fictícios (`@demo.inovaup.test`)
- [ ] Mexeu no cálculo ou no relatório? As regras R1 a R7 continuam valendo, com testes
- [ ] Migrações só novas (nunca editar uma já aplicada)
- [ ] `npm run typecheck`, `npm run lint` e `npm test` verdes

## Revisão

- [ ] Toca SQL, RLS, autenticação, ações de servidor ou variáveis: **revisão obrigatória do outro integrante** (comentário "revisado por <nome>"; com a conta compartilhada, o botão de aprovar não aparece)
- [ ] Mexe só em arquivos da minha raia (ou em arquivos compartilhados, com aviso)
- [ ] Status da tarefa atualizado em `docs/TAREFAS.md`
