# Perguntas pendentes — para responder com a área de Gestão de Pessoas

Registrado em 20/11/2026 e atualizado em 27/11/2026, depois das fases 4 e 5 do mapeamento do Impulse Up. Responder junto com o Diretor de Gestão de Pessoas.
As marcadas com 🚨 travam o primeiro ciclo real no InovaUp (MVP operacional, D-20).

**A numeração de 1 a 13 não muda**, porque o repositório cita essas perguntas pelo número (por exemplo, "pergunta 7" no `supressao.ts`). As perguntas novas começam no 14; os detalhes novos das antigas entram como subitens (2a, 3a…).

Onde aparece "**Já vimos no Impulse Up**", é o que está configurado hoje (visto no código e na configuração de uma avaliação real, sem dados de pessoas). A pergunta é se isso deve continuar assim no InovaUp.

## Avaliação de desempenho

1. 🚨 **Pesos:** os pesos valem para todas as avaliações (bimestrais e de trainees)? Algum peso muda por seção?
   - Já vimos no Impulse Up: numa avaliação real, autoavaliação 1, gestor 2, pares 2, liderados 2, e seções e competências com peso 1 (iguais aos da avaliação TESTE). A fórmula do InovaUp bateu exatamente com esse relatório real.
   - Resposta:
2. 🚨 **Quem avalia quem:** quais são as regras para cada nível (trainee, consultor, gerente, diretor)? Quem entra como liderança direta, liderança de esquadra, liderança de projeto, pares e liderados?
   - **2a.** O grupo "Gestores" de um consultor tem várias lideranças de áreas diferentes. Qual é o critério para entrar nesse grupo? Todas as lideranças contam igual dentro dele?
   - **2b.** Vocês usam a **indicação de avaliadores** pelo próprio avaliado, com aprovação do líder? (Não aparece nos cartões de um consultor.)
   - Resposta:
3. 🚨 **Perguntas que faltam:** podem nos passar o questionário completo das avaliações em uso (seções, competências, perguntas e perguntas abertas)? O modelo "Formulário de Avaliação ImpulseUP.xlsx" exportado já serve; é o questionário, sem respostas.
   - Já vimos no Impulse Up: a avaliação real tem três seções (entre elas "Cultural" e "Comportamental"), 19 competências na escala de 1 a 10 e perguntas abertas como "Feedback de melhoria". É diferente da avaliação TESTE do vídeo ("Processos - Lideranças", "Processos - Analista").
   - **3a.** Quem responde cada seção? Num relatório real, a seção "Comportamental" só teve a autoavaliação.
   - Resposta:
4. 🚨 **Calibração:** vocês ajustam notas por calibração (N-Box ou "pontuação calibrada do gestor")? Se sim, em que momento?
   - Já vimos no Impulse Up: a opção de mostrar os resultados calibrados está ligada; N-Box desligado.
   - Resposta:
5. **Quem vê o relatório:** só a GP, o próprio avaliado, o líder? A partir de quando?
   - Já vimos no Impulse Up: a GP libera os relatórios manualmente, e o líder atual pode abrir o relatório dos liderados e acompanhá-los. Pelo código, o acompanhamento mostra ao líder os avaliadores de cada liderado e o status de cada um.
   - **5a.** O que o líder pode ver no InovaUp: as notas dos liderados, a comparação entre eles, **quem ainda não avaliou o liderado (pelo nome)** ou só o progresso?
   - Resposta:
6. Vocês usam a **devolutiva do gestor** ou o **consenso**? Os líderes realmente fazem a devolutiva pelo sistema?
   - Já vimos no Impulse Up: "incluir devolutiva do gestor" ligado (o líder escreve um texto e marca "feita" dentro de um prazo, e o avaliado confirma que recebeu); consenso desligado.
   - Resposta:

## Pesquisas

7. **Mínimo de respostas** para mostrar o resultado de um recorte (por squad ou nível): 5 ou 3?
   - Resposta:
8. Vocês usam o tipo de pesquisa **"Confidencial"** (além de anônima e identificada)?
   - Resposta:

## Dados, acesso e LGPD

9. **Retenção:** por quanto tempo guardar respostas e relatórios de pessoas desligadas?
   - Resposta:
10. **Administradores:** quem terá o perfil de administrador (GP) no InovaUp?
    - Resposta:
11. **Migração do histórico:** de quais ciclos e pesquisas vocês querem trazer o histórico do Impulse Up? A ideia é que a própria GP exporte do Impulse Up e importe no InovaUp, sem que o time de desenvolvimento veja os dados. Para construir o importador, precisamos só da **linha de títulos das colunas** de cada exportação (sem nenhum dado).
    - Resposta:

## Infraestrutura (Diretor de Gestão de Pessoas)

12. 🚨 **Domínio de e-mail:** autorizar e fazer a configuração de DNS para o InovaUp enviar e-mails com o endereço da empresa sem cair no spam (as instruções serão enviadas quando o serviço de e-mail estiver criado).
    - Resposta:
13. 🚨 **Login com Google:** autorizar a criação do app de login no Google Cloud da conta institucional (tela de consentimento interna, só para o domínio da empresa).
    - Resposta:

## Avaliação de desempenho — perguntas novas (27/11/2026)

14. 🚨 **Seção respondida só pela autoavaliação:** hoje ela entra na nota final com o mesmo peso das outras seções, então nessa seção a nota é só a autoavaliação. É intencional? (O InovaUp faz igual por enquanto.)
    - Resposta:
15. **Comentários no relatório:** hoje o Impulse Up mostra cada comentário com o grupo de quem escreveu ("Gestor(a): …"), o que identifica o autor quando ele é o único do grupo. No InovaUp a proposta é **mostrar sem grupo e só quando 2 ou mais pessoas comentaram**. Concordam?
    - Resposta:
16. **Regras do formulário:** querem estas regras no InovaUp?
    - comentário **obrigatório quando a nota é extrema** (por exemplo, 1 ou 10), com mínimo de palavras;
    - **responder depois do prazo** (no Impulse Up é permitido por padrão);
    - **corrigir depois de enviar**, até a GP encerrar.
    - Resposta:
17. **Formato do formulário:** preferem responder **uma pessoa por vez** (todas as perguntas, como no InovaUp hoje) ou **uma pergunta por vez para várias pessoas** (como no Impulse Up)? Vale ouvir alguns membros.
    - Resposta:
18. **Avaliações dos trainees:** como funcionam as avaliações por gerência ("[TRAINEES 26.1] … GE de …")? Mesmo questionário, mesmos pesos e o mesmo ciclo bimestral? Vocês usam a "avaliação de experiência"?
    - Resposta:
19. **Liberação e reabertura:** liberam todos os relatórios de uma vez? Precisam reabrir a avaliação de uma pessoa, reenviar ou transferir a avaliação de quem saiu da EJ?
    - Resposta:
20. **Lembretes:** quais lembretes vocês usam (antes do prazo, devolutiva pendente) e por qual canal (e-mail, WhatsApp)?
    - Resposta:
21. **Média da organização e histórico:** querem manter a "média da organização" no relatório? Quem deve ver o histórico de uma pessoa entre ciclos (ela mesma, o líder, só a GP)? (Hoje o histórico não aparece para consultor.)
    - Resposta:
