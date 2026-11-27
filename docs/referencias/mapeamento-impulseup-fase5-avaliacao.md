# Mapeamento do Impulse Up — Fase 5, rodada 1 (resposta, devolutiva, líder, indicação e histórico)

Data: 27/11/2026
Método: skill `reverse-engineer-anything` (REA). Chrome com perfil temporário e porta de depuração local, logado por um integrante do time com o perfil de **consultor**. O REA capturou e exportou os scripts, fez a análise de JavaScript e tirou os prints; o código foi lido de forma estática. Para os prints, os campos de texto livre foram desfocados antes, e as telas abertas foram só desse integrante. Um print pegou a tela de escolha de avaliados, com nomes de colegas (sem notas); ele foi apagado na hora e nenhum nome foi anotado. A janela, os scripts e os prints foram apagados no fim.

**Nenhuma nota, nome ou texto de pessoa foi copiado para este documento.**

Evidências do REA (sessão de 27/11/2026):
- `list_browser_targets`: ev_0bbe58705eea0b10371dd4e5abee1e58496f423d4302e943c896cb4642f55a40
- `inspect_web_page` (scripts): ev_4601c45dfc306f285da66ded0a3f18cd084c75ae26428f4669b95b60476ac24a
- `export_web_scripts`: ev_439cc2a984c82f65422769bdf6b339126d4386d6bac3da78c6b7f0de339cc6e6
- `analyze_javascript_application`, pedaço `689`: ev_80b0412e2a5a4325c409b5936e19842f8af3670d5152ac8dd88b0e6d4ec2fd36 (**não interpretado**: 14 MB, `parse_status: failed`, sem motivo detalhado)
- `analyze_javascript_application`, `main.js`: ev_47e9e211f76efe487d5c9e2b14057dc687eb5c0c0878f7ade6dfa7c5729c933d (738 módulos; a análise semântica esgotou 8 GB de memória, os fatos estáticos ficaram)
- `capture_web_screenshot`: ev_50c9f3bc93081f6862bcff502eed361a4bbf3657d04a8438f84e17b019805e8d (lista) e ev_cd94411235a635e60bd74b87a578069d414f2909ecf6c4e17a83229e9f44220c (pergunta)

**Limite do REA nesta rodada:** o grafo do REA não indexa os textos dos templates do Angular nem as chamadas `HttpClient`, e o pedaço `689` não foi interpretado. Por isso o desenho das telas, os endereços e as regras foram lidos diretamente no código exportado.

Legenda: **[observado]** = no código ou na tela; **[inferido]** = conclusão a partir deles; **[desconhecido]** = roda no servidor.

Mudança de versão: o Impulse Up publicou uma versão nova em 27/11 (pedaço `689.ca87…`). Os nomes minificados mudaram em relação à fase 4.

---

## 1. Tela de responder a avaliação

### 1.1 Estrutura — [observado]
- Quatro rotas usam o mesmo componente `appraisal-form` (no `main.js`, cerca de 110 métodos): `appraisal/:id/:token` (começar), `reviewparticipantpartial/:token` (rascunho), `reviewparticipant/:token` (enviada) e `reviewparticipantclosed/:token` (encerrada, só leitura).
- **O acesso é pelo token do avaliador**, nos endereços `api/public/reviewer/{token}/…`. O mesmo token serve ao link do e-mail. Há uma verificação "é o mesmo usuário logado?" (`same-user-logged`) e um redirecionamento para o login (`check-redirect-login`).
- **Não existe cartão separado de autoavaliação.** Cada avaliação aparece uma vez na lista; "Visualizar avaliação" abre o formulário com todas as pessoas que aquela pessoa avalia, a própria pessoa inclusive.

### 1.2 Fluxo — [observado]
1. **Instruções** (aba "Instruções", texto rico configurado pela GP).
2. **Seleção de pessoas para avaliar:** lista agrupada por tipo, do ponto de vista de quem avalia ("Autoavaliação", "Gestores", "Seus pares"…), com nome, cargo, **status da resposta** e **status da avaliação** de cada pessoa, e "Selecionar todos". A pessoa escolhe quem vai avaliar agora.
3. **Uma competência por tela, com todas as pessoas escolhidas embaixo**, agrupadas por tipo ("Autoavaliação (1)"…). Cada pessoa tem a sua linha de escala. Assim se avalia "Cumpre prazos" para cinco colegas de uma vez, comparando entre eles.
   - Cabeçalho: nome da avaliação, "Avaliador: …" e "Prazo para responder: data e hora".
   - **Barra de progresso com uma bolinha por pergunta**, colorida pelo estado (respondida, parcial, não respondida) e clicável para pular (`goToItem`, menu "ir para").
   - "Seção: nome", "1. Competência" e a pergunta completa ("De 1 a 10, o quanto…").
   - Escala da seção. Na avaliação vista, **10 estrelas de 1 a 10**.
   - Link "Histórico da avaliação" por pessoa.
   - Botões Anterior e Próximo.
4. **Tela final:** o servidor confere as respostas (`verifyItems`) e devolve quem está completo e quem tem pendência, com a lista das perguntas pendentes por pessoa.
5. **Enviar:** manda todas. O servidor responde quem foi enviado e quem não foi; existe o "envio parcial" (só as completas seguem).
6. **Encerrar:** depois de enviada, a avaliação de uma pessoa ainda pode ser **encerrada** individualmente ou todas de uma vez (`reviews/{id}/close`, `close-all`). Encerrada fica só leitura. [inferido] Enviar e encerrar são passos diferentes: entre os dois, dá para corrigir.

### 1.3 Regras do formulário — [observado]
- **Salva sozinho a cada Anterior/Próximo** (`update-review-answers`). Nota fora da escala não é salva e gera um aviso.
- **Nota obrigatória**. N/A só quando a seção permite.
- **Comentário obrigatório** quando a pergunta exige, **ou quando a nota é extrema** (valores marcados como extremos na escala). Exige um **mínimo de palavras**, 3 por padrão.
- **Resposta depois do prazo:** permitida por padrão (`allowLateResponse`). Se a avaliação não permitir, o formulário trava quando o prazo acaba.
- Opção "mostrar ao avaliador o resultado que a pessoa está recebendo" (desligada na avaliação real).
- Uma pessoa pode **transferir** as avaliações que tem para responder (`onAllReviewsTransferred`).
- **Assistente de IA** opcional ao lado do formulário, que sugere e valida comentários.
- Modo de visualização e simulação para a GP testar o formulário (`isPreview`, `simulationParameters`).

## 2. Devolutiva do gestor — [observado no código]

- Componente `manager-feedback-form` (pedaço `468`). Endereços: `api/appraisal/{id}/devolutive`, `…/current/manager/has-enabled-devolutive` e `…/devolutive-report/{pessoa}`.
- **Dois lados, cada um configurável:**
  - **Líder** (`managerOptions`): escreve um texto de devolutiva (editor de texto rico) e/ou marca a pergunta de confirmação ("devolutiva feita"). O sistema avisa se o texto foi preenchido mas a devolutiva não foi marcada como feita.
  - **Avaliado** (`participantOptions`): texto e/ou confirmação de recebimento, com opções de resposta personalizáveis.
- **Salva sozinho** depois de 1 s parado, se o texto tiver pelo menos 3 palavras. Guarda as datas de alteração e de confirmação.
- **Prazo** da devolutiva, em dias, com lembretes. Depois do prazo, fica só leitura.
- A GP **libera** a devolutiva (`change-devolutive-status`), com aviso por e-mail, WhatsApp, SMS ou Slack. Há opção de avisar o líder quando o avaliado confirma, e um indicador "devolutivas respondidas" no acompanhamento.
- A devolutiva entra no relatório e no PDF. O texto pode ser sugerido por IA.
- Na avaliação real, "incluir devolutiva do gestor" está ligado. [observado na tela] No relatório analisado **não aparece aba de devolutiva**; os textos dos gestores estão nas respostas abertas. [inferido] A aba só aparece quando há devolutiva preenchida e liberada para a pessoa.

## 3. Visão do líder — [observado no código]

Na avaliação real, "o gestor atual pode abrir o relatório" e "o gestor pode acompanhar os liderados" estão ligados (fase 4).
- **Relatórios da equipe** (`team/reports-participant/:id`): uma chamada (`participant-report-person-manager`) traz os dados de **todos os liderados**. O líder vê uma tabela comparativa (notas finais e por competência/seção, filtrável por pessoa) e abre o relatório de cada um, com a devolutiva.
- **Acompanhamento de um liderado** (`team/monitoring-participant/:id`, chamada `progress-old`): a lista de **avaliadores daquele liderado**, com o progresso e o status de cada um ("avaliações pendentes"). [inferido] O líder vê quem ainda não avaliou o liderado, pelo nome, mas não as respostas.
- **Meu time** (`team/my-team`): a lista de liderados, com navegação para a equipe indireta (líder do líder).
- Itens da equipe também entram no menu: devolutivas da equipe (`team_devolutive`) e a própria (`own_devolutive`).

## 4. Indicação de avaliadores — [observado no código]

- Rota `reviewer-indication/appraisal/:id/participant/:pid` (componente `participant-reviewer-indication`). Só abre se for a própria pessoa (`…/validate`, `sameUserLogged`).
- Configuração (`REVIEWER_DEFINITION.MODAL_CONFIGURATION`):
  - o avaliado **indica** pares e clientes (e, se permitido, liderados), com **quantidade mínima e máxima por tipo**;
  - **aprovação do líder** (obrigatória ou não), em fluxo **sequencial ou simultâneo**, com data de início e prazo de aprovação; o líder pode **acrescentar** avaliadores na aprovação;
  - o líder pode **definir os avaliadores dos liderados**;
  - opções para esconder do avaliado quem foi indicado e as indicações feitas pelo líder;
  - **indicação aleatória** (`indication/randomic`), notificações e exportação do status das indicações.
- [desconhecido] Se a EJ usa. Nos cartões de avaliação desse consultor não aparece o botão de indicação.

## 5. Histórico entre ciclos — [observado no código; não visível ao consultor]

- No perfil da pessoa (componente `participant-information`, usado em "Meu perfil" e em "Meu time"), há um bloco de resultados: lista das avaliações disponíveis da pessoa (`participant-one-page/…/appraisals/available`), escolha de uma ou várias e um relatório combinado (`participant-one-page/profile/report`). Há também análise, N-Box e sucessão.
- O modo muda conforme quem vê: participante, líder ou administrador (`requestMode`).
- [observado na tela] **No perfil desse consultor o bloco não aparece.** [inferido] Está liberado só para líder e administrador, ou desligado para participantes nesta empresa.

## 6. Outras observações das telas — [observado]

- Lista "Minhas avaliações": avaliações bimestrais ("5º bimestre de 2026 (Setembro e Outubro)") e **avaliações próprias dos trainees por gerência** ("[TRAINEES 26.1] Avaliação de Desempenho - GE de …"). Cada cartão tem os selos "Respondida" e "Encerrada", a data de criação e "Visualizar avaliação".
- Na seleção de pessoas, o grupo "Gestores" do ponto de vista de um consultor tem **várias lideranças** (gerentes de áreas diferentes). Isso confirma que a EJ põe várias lideranças no mesmo grupo (fases 2 e 4).

## 7. Comparação com o InovaUp

| Tema | Impulse Up | InovaUp hoje | Útil trazer? |
|---|---|---|---|
| Unidade do formulário | Uma competência por tela, várias pessoas lado a lado | Uma pessoa por página, todas as seções | **Sim, como opção**: avaliar a mesma competência para vários colegas ajuda a comparar e cansa menos. Grande mudança de tela |
| Escolher quem avaliar agora | Sim, agrupado por tipo, com status | Lista "Pendentes" e "Enviadas" | Sim (pequeno): agrupar a lista por grupo |
| Salvamento | Automático a cada passo | Botão "Salvar rascunho" | **Sim** (já é o B1) |
| Barra de progresso clicável | Sim, por pergunta | Não | Sim (já é o C6) |
| Comentário | Por competência; obrigatório em nota extrema e com mínimo de palavras | Por seção, opcional | Sim, configurável por ciclo. **Atenção:** comentário obrigatório na nota extrema aumenta texto identificável |
| Enviar e encerrar | Separados; envio parcial | Enviar é final | Talvez: o A7 (reabrir com o ciclo aberto) já cobre a correção |
| Resposta depois do prazo | Permitida por padrão | O ciclo fechado trava | Decidir com a GP |
| Link por token sem login | Sim | Não (login obrigatório) | **Não**: o InovaUp exige login, mais seguro |
| Transferir avaliação para outra pessoa | Sim | Não | Talvez (GP) |
| Devolutiva do gestor | Texto e confirmação, prazo, liberação pela GP | Não | **Sim, fase 2** (ligada na avaliação real) |
| Visão do líder | Tabela da equipe, relatório de cada liderado, quem ainda não avaliou | Não | Sim, depende da pergunta 5 da GP. **Não mostrar nomes de quem falta avaliar sem decisão da GP** |
| Indicação de avaliadores | Completa, com aprovação | Não | Só se a EJ usar (GP) |
| Histórico entre ciclos | No perfil (líder e administrador) | Não | Sim, depois de haver mais de um ciclo no InovaUp |
| IA no formulário e no relatório | Sim | Não | Fora de escopo |

## 8. Limitações

- Telas vistas só com o perfil de consultor e só as desse integrante. A visão do líder, a devolutiva preenchida, a indicação e o histórico foram vistos só pelo código.
- O pedaço `689` não foi interpretado pelo REA; a análise do `main.js` ficou parcial na parte semântica.
- O que roda no servidor (quem pode ver o quê na visão do líder, regras de envio parcial, prazos) continua desconhecido.
