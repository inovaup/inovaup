# Mapeamento do Impulse Up — Fase 1 (perfil Consultor)

Data: 19/11/2026
Acesso usado: perfil **Consultor** (visão de participante). Telas de administrador e de gestor não foram vistas.
Nenhum dado pessoal de colaboradores foi registrado neste documento.

---

## 1. Módulos visíveis no menu

| Módulo | Rota | O que o participante faz |
|---|---|---|
| Início | `/dashboard/participant/home` | Painel dos últimos 30 dias: ações pendentes (ex.: avaliação com prazo), resumo de feedbacks, resumo do PDI, próxima reunião, atalhos (novo feedback, solicitar feedback, nova reunião) |
| Avaliações | `/dashboard/participant/appraisal` | Lista de avaliações de desempenho com status (Não iniciada / Respondida) e situação (Aberta / Encerrada), data de criação e prazo. Abas "Minhas avaliações" e "Meus relatórios" |
| Pesquisas | `/dashboard/participant/survey` | Lista de pesquisas (clima, pulso, escuta setorial) com status; visualizar instruções e as próprias respostas |
| PDI | `/dashboard/participant/pdi` | Plano de Desenvolvimento Individual: lista de ações de desenvolvimento, botão "Nova ação" |
| Feedbacks | `/dashboard/participant/feedback` | Abas Recebidos / Enviados / Solicitações recebidas / Solicitações enviadas; contadores por tipo (Positivo, Orientação, Melhoria) |
| Reuniões | `/dashboard/participant/meeting` | Reuniões 1:1 "Com minha liderança" e "Outras reuniões", filtro por tipo, **sincronizar com agenda**, agendar reunião |
| Metas e OKRs | `/okr/participant/...` | Visão em **Lista** (por metas/objetivos ou por responsável, filtro por ciclo) e em **Árvore** (gráfico de alinhamento entre objetivos, visualização compacta ou completa) |

Outros elementos globais: link para central de suporte, troca de organização (um usuário pode pertencer a várias), agentes de IA ("Iuppy" e um chat de IA), chat de atendimento, termo de aceite, campanhas de atualização cadastral.

---

## 2. Detalhes por módulo

### Avaliações de desempenho
- Ciclos recorrentes (ex.: bimestrais) e avaliações específicas por grupo (ex.: trainees por área).
- Ciclo de vida: criada → aberta (com prazo) → respondida → encerrada.
- Participante responde e depois só visualiza; há relatórios individuais ("Meus relatórios").

### Pesquisas (clima / pulso)
Campos do modelo de pesquisa observados na estrutura da API:
- **Privacidade:** anônima ou identificada (`surveyPrivacyType`).
- **Tipo:** formulário (`surveyType: FORM`) — podem existir outros tipos.
- **Exige login** ou não.
- **Prazo** em dias para encerrar (`daysToClose`).
- **Permitir participantes não convidados** (link aberto).
- **Termo de aceite** opcional com texto próprio.
- **Notificações:** lembretes 1 e 3 dias antes; canais **e-mail, SMS e WhatsApp**.
- **Disparo:** envio, reenvio (relaunch) para quem não respondeu, data de encerramento.
- **Versionamento** e vínculo com a pesquisa original (para pesquisas recorrentes).
- **Arquivamento**.
- Instruções em texto rico (HTML).
- Formulário dividido em **seções/etapas**, com barra de progresso, navegação Anterior/Próximo, **salvamento automático** e retomada de onde parou.
- Após encerrar, respostas ficam somente leitura.

**Gap observado no uso real:** para acompanhar a evolução de uma mesma pessoa em pesquisas de pulso anônimas, a empresa pede que cada pessoa invente um "codinome". Ou seja, a ferramenta não oferece **anonimato com continuidade** (pseudônimo automático). Boa oportunidade para o sistema interno.

### Feedback
- Tipos: Positivo, Orientação, Melhoria.
- Enviar feedback espontâneo ou **solicitar** feedback a alguém.
- Controle de "não visualizados" e compartilhamento.

### PDI
- Ações de desenvolvimento com status: Concluída, Em andamento, Atrasada.
- Contador de ações concluídas no ano.

### Reuniões 1:1
- Reunião com a liderança direta (o sistema conhece o gestor de cada pessoa).
- Integração com agenda externa.

### Metas e OKRs
- Ciclos de OKR.
- Objetivos e metas com responsável.
- Alinhamento hierárquico (árvore) entre objetivos.

---

## 3. Arquitetura técnica observada

- **Front-end:** aplicação Angular (bundles `runtime`/`polyfills`/`main` com hash, componentes `ngx-*`). O módulo de OKR é uma aplicação separada (`/okr/`, com API própria em `/okr/api/`).
- **Multi-tenant por subdomínio:** cada empresa tem `<empresa>.impulseup.com`.
- **Login centralizado (SSO)** em `id.impulseup.com`; um usuário pode ter várias organizações.
- **API REST** organizada por módulo: `/api/survey/...`, `/api/meeting/...`, `/api/feedback/...`, `/api/insight/appraisal/...`, `/api/ai/...`, `/api/audit/...`.
- **IDs UUID** em todas as entidades.
- **Feature flags por organização** (ex.: módulo de feedback habilitado ou não).
- **Atributos personalizados** de pessoa e organização (campos customizáveis).
- **Cores e logo por organização** (white label simples).
- **Internacionalização** (arquivo de traduções pt-BR, lista de idiomas).
- **Infraestrutura:** AWS (S3 para arquivos), Cloudflare.
- **Terceiros:** chat de atendimento (Hyperflow), ferramentas de analytics e marketing (Google Analytics, Mixpanel, Microsoft Clarity, HubSpot, Beamer).

---

## 4. Ponto de atenção de privacidade

Na visualização de uma pesquisa **anônima** encerrada, a resposta da API enviada ao navegador de um participante comum inclui a lista de e-mails de todos os convidados (registro de notificações). Isso não aparece na tela, mas fica acessível a qualquer participante. Lições para o sistema interno:
- a API deve devolver só o que aquele perfil precisa ver;
- em pesquisas anônimas, nunca expor quem foi convidado ou quem respondeu para participantes.

Vale considerar reportar isso ao fornecedor.

---

## 5. O que não foi coberto (precisa de outro acesso)

- Criação e configuração de pesquisas e avaliações (construtor de formulário, tipos de pergunta, escalas, critérios de público).
- Relatórios e dashboards de resultados (clima, eNPS, mapas de calor, comparativos).
- Configuração de avaliação (autoavaliação, 90°/180°/360°, competências, nine-box, calibração).
- Gestão de pessoas, departamentos, cargos e hierarquia.
- Visão de gestor (liderados, reuniões e PDI da equipe).
- Configuração de OKRs (criação de ciclos, check-ins de progresso).
- Integrações e permissões.

Próximos caminhos sugeridos: central de ajuda pública do Impulse Up, ambiente de demonstração com o fornecedor, ou descrição das telas pelo diretor de pessoas.
