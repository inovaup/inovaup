# Requisitos v1 (19–20/11/2026) com a classificação do MVP demonstrável

Versão de referência dos requisitos levantados no doc "InovaUp — Requisitos do MVP" do claude.ai, com a classificação aprovada em 20/11/2026.

**Legenda:**
- **D**: obrigatório para o MVP demonstrável (4/12);
- **O**: MVP operacional;
- **P**: produção institucional;
- **X**: descartado ou fase 2.

A prioridade original (P1/P2) fica entre parênteses.

## Requisitos funcionais

| ID | Requisito | Classe |
|---|---|---|
| RF-01 | Login com a conta Google da empresa; contas de fora do domínio não entram (P1) | **O**. Na demo: contas fictícias com senha e cadastro desligado |
| RF-02 | Perfis colaborador, líder e GP (P1) | **D**. Atribuídos só pela semente |
| RF-03 | Pessoa "desligada" perde o acesso na hora, sem apagar o histórico (P1) | O |
| RF-04 | Cadastro de pessoas: nome, e-mail, área, cargo, nível, curso, leva, squad, líder direto, situação; sem limite de usuários (P1) | **D** (semente + listagem) / O (cadastro na tela) |
| RF-05 | Importação de pessoas por CSV (P1) | O |
| RF-06 | Squads com liderança; squads cíclicas por edição, como o Núcleo de Inovação (P1) | **D** (semente; edição = período) / O (gestão de edições) |
| RF-07 | Cadastro simples de projetos (P2) | X |
| RF-08 | Construtor de pesquisa com seções (P1) | O |
| RF-09 | Tipos de pergunta: escala por seção, aberta, múltipla escolha, eNPS, tema, comentário (P1) | O (enxuto) |
| RF-10 | Pesquisa anônima ou identificada, imutável depois da 1ª resposta (P1) | O (só anônima no início) |
| RF-11 | Pseudônimo automático ligando edições (P1) | P. Depois de decidir quem guarda a chave |
| RF-12 | Público: todos os ativos, grupos por critério, lista fixa (P1) | O (público simples) |
| RF-13 | Prazo de encerramento; respostas só leitura depois (P1) | O |
| RF-14 | Salvamento automático (P1) | O (rascunho só no aparelho) |
| RF-15 | Duplicar a pesquisa para a próxima edição (P1) | O |
| RF-16 | Instruções e termo de aceite (P2) | O |
| RF-17 | Modelos prontos de pesquisa (P2) | X |
| RF-18 | Ciclo de avaliação com seções e escala por seção (P1) | **D** (pré-carregado) / O (importação e edição) |
| RF-19 | Tipos de relação agrupados em 4 grupos de peso (P1) | **D** |
| RF-20 | Pesos por grupo, competência e seção, e cálculo da nota (P1) | **D** (fórmula provisória) / O (validada pela GP) |
| RF-21 | Montar "quem avalia quem" na tela (P1) | O |
| RF-22 | Importar o mapa (planilha da GP e formato do Impulse Up) (P1) | O. Na demo, mapa pré-carregado |
| RF-23 | Duplicar o mapa do ciclo anterior (P1) | O |
| RF-24 | Tela de revisão antes do disparo (P1) | O |
| RF-25 | Relatório individual: nota final, competências, tipos, comentários sem autor, média da organização (P1) | **D** (reduzido, com supressão) / O (completo) |
| RF-26 | A GP libera o relatório (P1) | **D** (liberação do ciclo inteiro) |
| RF-27 | Relatório em PDF (P2) | X |
| RF-28 | Avaliações específicas por grupo (P2) | X |
| RF-29 | Dashboard por pesquisa (P1) | O |
| RF-30 | Mínimo de respostas por recorte, configurável (P1) | O (pesquisas). Para a avaliação, ver D-13 |
| RF-31 | Evolução entre edições (P1) | O |
| RF-32 | Visão geral do ciclo de avaliação (P1) | **D** (contador "X de Y") / O (completa) |
| RF-33 | Exportar respostas (P1) | O |
| RF-34 | E-mail de convite (P1) | O |
| RF-35 | Lembretes automáticos (P1) | O |
| RF-36 | Tela inicial com pendências (P1) | **D** (pendências do avaliador) |
| RF-37 | Regras de visibilidade por pergunta (P1) | O |
| RF-38 | Devolutiva do gestor (P2) | X (fase 2) |
| RF-39 | **Novo:** tela de resposta da avaliação pelo avaliador | **D** |

## Requisitos não funcionais

| ID | Requisito | Classe |
|---|---|---|
| RNF-01 | A API devolve só o que o perfil pode ver | **D** |
| RNF-02 | Anonimato real nas pesquisas. **Texto a corrigir:** o pseudônimo com chave pode ser revertido por quem guarda a chave (P-05) | O (com as pesquisas) |
| RNF-03 | **Revisto (D-13):** comentários sem autor e sem grupo; supressão de grupos com 1 avaliador e supressão complementar | **D** |
| RNF-04 | HTTPS, criptografia em repouso, backup diário | **D** (HTTPS e criptografia) / P (backup) |
| RNF-05 | Log de auditoria das ações da GP | P |
| RNF-06 | Sem analytics de terceiros nas telas | **D** |
| RNF-07 | Política de retenção | P |
| RNF-08 | Português; computador e celular | **D** (português) / O (celular) |
| RNF-09 | Cada tela abre em menos de 2 s | O |
| RNF-10 | Custo de infraestrutura bem abaixo do Impulse Up | P |
| RNF-11 | Responsável técnico definido | P |
| RNF-12 | Ambientes separados; desenvolvedores sem dados reais | **D** (só dados fictícios) / P (produção sem desenvolvedores) |
