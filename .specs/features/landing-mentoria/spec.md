# Landing Page de Mentoria Specification

## Problem Statement

O mentor (pessoa física autônoma) vende mentoria de carreira tech informalmente, sem uma forma própria de divulgar os planos e cobrar automaticamente. Hoje não existe página, nem cobrança online, nem um processo repetível para registrar quem pagou e liberar acesso à trilha (Google Classroom) e ao grupo de WhatsApp de vagas. Isso trava a escala do negócio e cria risco de erro manual (esquecer de cobrar, de liberar acesso ou de remover acesso expirado).

## Goals

- [ ] Visitante consegue entender os dois planos e pagar (Pix ou cartão) sem sair da página, exceto pelo checkout hospedado do Asaas
- [ ] Todo pagamento confirmado (`CHECKOUT_PAID`) gera um registro de inscrição rastreável e dispara e-mail de confirmação ao mentorando e ao mentor
- [ ] Zero cobrança sem rastro: nenhum evento de pagamento é perdido silenciosamente (sucesso vira registro; falha vira alerta)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Assinatura recorrente (cobrança mensal) | Usuário decidiu pagamento único por plano para ambos os planos |
| Integração automática (API) com Google Classroom | Mentor adiciona o mentorando manualmente à turma, por decisão explícita |
| Integração automática (bot/API) com grupo de WhatsApp | Mentor adiciona o mentorando manualmente ao grupo, por decisão explícita |
| Conteúdo de trilha pré-pronto dentro do sistema | Trilha é montada sob medida por mentorando, fora da landing page/sistema |
| Depoimentos de mentorados | Mentor ainda não tem depoimentos coletados; sem conteúdo, sem seção obrigatória (ver P3-1, estrutura pronta mas vazia) |
| Emissão de nota fiscal / fluxo para CNPJ | Mentor é pessoa física autônoma, sem CNPJ |
| Login / área logada para o mentorando | Acesso ao conteúdo (Classroom/WhatsApp) é gerenciado externamente e manualmente; esta feature não cria conta de usuário |
| Blog / conteúdo de SEO orgânico | Fora do escopo de uma landing page de vendas |
| Formulário de aplicação/triagem antes da compra | Nenhuma demanda hoje por filtrar fit antes da venda; ver P3-2 como ideia futura |
| Cupom de desconto / programa de indicação | Não solicitado; ideia futura |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Nomes de marketing dos planos | "Plano Primeira Vaga" (R$199) e "Plano Próximo Nível" (R$499) | Diferenciação agora é por público-alvo, não por recurso - nomes refletem isso; fáceis de trocar depois (conteúdo, não estrutura) | n |
| Modelo de diferenciação entre os planos | Por público-alvo, não por recurso: os dois planos entregam o mesmo pacote (call + relatório de currículo/LinkedIn/GitHub + preparação de entrevista + trilha personalizada no Classroom + grupo de WhatsApp de vagas, 6 meses de acesso). Plano Primeira Vaga (R$199) mira quem busca o 1º emprego/estágio; Plano Próximo Nível (R$499) mira profissionais buscando progressão de carreira - mesma trilha/mecânica, conteúdo da trilha com foco diferente por público | Decisão do usuário: preços seguem diferentes por público-alvo (maior disposição/capacidade de pagamento de quem já está empregado buscando progressão), não por diferença de entrega | y |
| Bio da seção "Sobre o mentor" | Texto redigido em `content.md` §3 a partir do LinkedIn do mentor (lido via sessão logada em 2026-10-01) | Usuário pediu para gerar a partir do LinkedIn; revisão final do mentor pendente | n |
| Copy da landing (hero, como funciona, FAQ, CTA final, obrigado, e-mails, SEO) | Definido em `content.md` | Fonte única de texto; pendências listadas em `content.md` §14 com defaults | n |
| Identidade visual (paleta, tipografia) | Sóbria, acento azul #1F4FD1, Space Grotesk + Inter, dark mode (`content.md` §11) | Context deixou a critério do agente; foco em credibilidade, não "infoproduto" | n |
| Alerta ao mentor em toda inscrição, não só em um plano específico | Adotado - MENT-15 cobre qualquer plano (ver `content.md` §10.2); coerente com os dois planos agora entregarem o mesmo pacote | Mentor precisa saber de toda inscrição para agendar a call e liberar Classroom/WhatsApp, independente do plano | y |
| Rate limiting / anti-spam no início do checkout | N/A para o MVP - sem proteção dedicada | Operação solo, baixo volume esperado no lançamento; o Checkout hospedado do Asaas já absorve a superfície de pagamento | y |
| Processo de reembolso dentro da janela de 7 dias (Art. 49 CDC) | Processo manual: mentor estorna via painel do Asaas ao receber o pedido | Baixo volume não justifica automação agora; o requisito legal de *informar* o direito permanece obrigatório (MENT-07) | y |
| Painel de acompanhamento de inscrições/expiração | P2 - lista simples protegida por senha básica | O e-mail de notificação (P1) já cobre o essencial para o mentor agir; o painel é conveniência, não bloqueio do MVP | y |
| Duplicidade de e-mail com inscrição ativa no mesmo plano | Registra o novo pagamento e alerta o mentor para verificação manual, não bloqueia a compra | Decisão automática arriscaria recusar um pagamento legítimo (ex: presente, reposição); mentor decide caso a caso | y |
| Consentimento para usar recomendações do LinkedIn (MENT-27) numa página comercial | Usar o texto como está, com nome/cargo reais e link para a fonte - usuário decidiu usar o conteúdo | São recomendações públicas, escritas para o contexto do LinkedIn, não para uma página de venda; recomendação (não bloqueio) é o usuário avisar os 4 autores antes de publicar | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Ver e comparar os planos ⭐ MVP

**User Story**: Como visitante interessado em carreira tech, quero ver e comparar os dois planos de mentoria em uma página só, para decidir qual contratar.

**Why P1**: Sem isso não existe venda - é a porta de entrada de todo o funil.

**Acceptance Criteria**:

1. WHEN um visitante acessa a página inicial THEN o sistema SHALL exibir os dois planos (Plano Primeira Vaga R$199 e Plano Próximo Nível R$499) lado a lado, com a mesma lista de entregáveis e o público-alvo de cada um (1º emprego/estágio vs. progressão de carreira).
2. The system SHALL exibir, para cada plano, um botão de CTA que inicia o checkout daquele plano específico.
3. WHILE a tela tiver largura menor que 768px (mobile) o sistema SHALL empilhar os planos verticalmente mantendo os dois CTAs visíveis sem exigir scroll horizontal.

**Independent Test**: Abrir a página em desktop e mobile e conferir que os dois planos, preços e entregáveis aparecem corretamente, com os CTAs clicáveis.

---

### P1: Pagar o plano escolhido via Asaas Checkout ⭐ MVP

**User Story**: Como visitante decidido, quero pagar o plano escolhido via Pix ou cartão (à vista ou parcelado) direto na página, para garantir minha vaga sem usar outro canal.

**Why P1**: É o núcleo comercial da feature - sem cobrança automática não há razão de ser para o projeto.

**Acceptance Criteria**:

1. WHEN o visitante clica no CTA de um plano THEN o sistema SHALL redirecionar para um Asaas Checkout hospedado, configurado como cobrança única (não recorrente), pré-preenchido com o valor e a descrição do plano escolhido.
2. The system SHALL oferecer Pix e cartão de crédito (com parcelamento) como formas de pagamento no checkout.
3. IF o pagamento for recusado ou cancelado pelo visitante THEN o sistema SHALL redirecioná-lo de volta à landing page sem criar uma inscrição ativa.
4. The system SHALL exibir, na página de planos, o aviso de direito de arrependimento de 7 dias corridos (Art. 49 CDC) e a política de reembolso correspondente, visível antes da confirmação do pagamento.
5. IF a API do Asaas estiver indisponível ao criar o checkout (erro 5xx ou timeout) THEN o sistema SHALL exibir uma mensagem de erro amigável ao visitante e SHALL permitir nova tentativa, sem perder o plano selecionado.
6. IF o visitante clicar duas vezes seguidas no mesmo CTA (duplo clique) THEN o sistema SHALL evitar criar dois checkouts simultâneos para a mesma ação.

**Independent Test**: Clicar no CTA de cada plano, completar um pagamento de teste no Asaas (sandbox) e confirmar que o checkout reflete o valor e a descrição corretos; simular recusa e indisponibilidade da API e confirmar o comportamento de erro.

---

### P1: Confirmação automática pós-pagamento ⭐ MVP

**User Story**: Como mentor, quero receber uma notificação automática com os dados do novo mentorando assim que o pagamento for confirmado, para agendar a call e adicioná-lo manualmente à turma do Google Classroom e ao grupo de WhatsApp (ambos inclusos nos dois planos).

**Why P1**: Sem isso o pagamento acontece, mas ninguém - nem o mentorando, nem o mentor - sabe o que fazer a seguir.

**Acceptance Criteria**:

1. WHEN o Asaas envia um evento `CHECKOUT_PAID` para o endpoint de webhook THEN o sistema SHALL validar a autenticidade do evento (token configurado) e, se válido, SHALL registrar uma inscrição com plano, valor, data de pagamento e data de expiração de acesso (Classroom e WhatsApp) igual à data de pagamento mais 6 meses, para qualquer plano.
2. IF o token de autenticidade do webhook for inválido ou ausente THEN o sistema SHALL rejeitar a requisição com status 401 e SHALL registrar a tentativa para auditoria.
3. IF o mesmo evento de webhook (mesmo event ID) for reenviado pelo Asaas THEN o sistema SHALL processá-lo apenas uma vez (idempotência), sem duplicar inscrições nem reenviar e-mails.
4. IF eventos chegarem fora de ordem (ex.: `CHECKOUT_CANCELED` recebido depois de um `CHECKOUT_PAID` já processado para o mesmo checkout) THEN o sistema SHALL manter o status pago como definitivo e SHALL registrar o conflito para revisão manual, sem reverter a inscrição automaticamente.
5. WHEN uma inscrição é registrada com sucesso THEN o sistema SHALL enviar um e-mail de confirmação ao mentorando com o plano contratado e os próximos passos.
6. WHEN uma inscrição (qualquer plano) é registrada com sucesso THEN o sistema SHALL enviar um e-mail ao mentor com nome, e-mail, plano e data de expiração do novo mentorando, para que ele agende a call e libere manualmente o acesso ao Classroom e ao WhatsApp.
7. IF o envio de um e-mail (mentorando ou mentor) falhar THEN o sistema SHALL manter a inscrição registrada e SHALL tentar reenviar o e-mail até 3 vezes, registrando a falha final para acompanhamento manual caso todas falhem.
8. IF os dados do cliente vindos do evento de webhook estiverem incompletos ou malformados (ex.: e-mail inválido) THEN o sistema SHALL rejeitar o registro automático da inscrição e SHALL alertar o mentor por e-mail para tratamento manual.
9. IF o e-mail do pagamento já corresponder a uma inscrição ativa no mesmo plano THEN o sistema SHALL registrar o novo pagamento normalmente e SHALL alertar o mentor sobre a possível duplicidade para verificação manual.
10. The system SHALL manter cada inscrição em exatamente um dos estados `pendente`, `paga`, `ativa`, `expirada` ou `cancelada`, transitando apenas pelos caminhos: pendente→paga, paga→ativa, ativa→expirada (ao atingir a data de expiração), pendente→cancelada, pendente→expirada.
11. WHEN uma inscrição (qualquer plano) atinge sua data de expiração THEN o sistema SHALL marcar a inscrição como `expirada` e SHALL notificar o mentor por e-mail para remover o acesso ao Classroom e ao grupo de WhatsApp manualmente.
12. The system SHALL registrar (log) cada evento de webhook recebido com event ID, tipo e resultado do processamento (sucesso ou erro), permitindo auditoria posterior.

**Independent Test**: Disparar manualmente (ou via sandbox do Asaas) eventos `CHECKOUT_PAID`, reenviar o mesmo evento, enviar um evento com token inválido, e um evento fora de ordem; conferir os registros, e-mails e logs resultantes em cada caso.

---

### P1: Página de obrigado pós-pagamento ⭐ MVP

**User Story**: Como mentorando que acabou de pagar, quero ver uma página de confirmação explicando que os próximos passos chegarão por e-mail, para saber que a compra deu certo.

**Why P1**: Fecha o loop de confiança no momento exato em que o visitante mais precisa de confirmação.

**Acceptance Criteria**:

1. WHEN o pagamento é concluído com sucesso no Asaas Checkout THEN o sistema SHALL redirecionar o mentorando para uma página de obrigado informando que os próximos passos chegarão por e-mail.

**Independent Test**: Completar um pagamento de teste e verificar o redirecionamento e o conteúdo da página de obrigado.

---

### P2: Hero, rodapé e política de privacidade

**User Story**: Como visitante chegando na página, quero entender em poucos segundos do que se trata antes de ver os preços, e como pessoa que teve nome/e-mail coletados no checkout, quero saber o que acontece com esses dados.

**Why P2**: A página funciona sem o Hero (os planos já contam a oferta), mas começa "no meio"; a política de privacidade é uma lacuna real - o checkout já coleta nome/e-mail (MENT-10) e a LGPD exige que isso seja informado, mas nenhuma task anterior cobria isso.

**Acceptance Criteria**:

1. The system SHALL exibir uma seção de abertura (Hero) no topo da página com título, subtítulo e selo de confiança (pagamento seguro, parcelamento, garantia), conforme `content.md` §2.
2. WHEN o visitante clica no CTA primário do Hero THEN o sistema SHALL levar à seção de planos (âncora `#planos`).
3. WHEN o visitante clica no CTA secundário do Hero THEN o sistema SHALL levar à seção "Sobre o mentor" (âncora `#sobre`).
4. The system SHALL exibir um rodapé com copyright, link para o LinkedIn, e-mail de contato, política de reembolso e política de privacidade.
5. The system SHALL disponibilizar uma página de política de privacidade (LGPD) explicando quais dados são coletados no checkout (nome, e-mail), a finalidade (processar o pagamento e contato sobre a mentoria), quem recebe esses dados (Asaas, Resend, Supabase) e como o titular exerce seus direitos (acesso, correção, exclusão) pelo e-mail de contato.

**Independent Test**: Abrir a home, ver o Hero antes dos planos, clicar nos dois CTAs e confirmar que levam às âncoras certas; abrir o link de política de privacidade no rodapé e confirmar que a página existe e cobre os pontos acima.

---

### P2: Seção "Sobre o mentor"

**User Story**: Como visitante avaliando se confio no mentor, quero ver quem é essa pessoa (trajetória, experiência), para decidir se vale a pena pagar.

**Why P2**: Reforça conversão mas a página funciona (tecnicamente) sem ela; conteúdo depende do texto que o usuário vai enviar.

**Acceptance Criteria**:

1. The system SHALL exibir uma seção "Sobre o mentor" na landing page com foto, bio, cargo atual, números de destaque, credenciais e link para o LinkedIn, conforme `content.md` §3.

---

### P2: FAQ

**User Story**: Como visitante com dúvidas antes de pagar, quero respostas rápidas às perguntas mais comuns, para decidir sem precisar falar com o mentor antes.

**Why P2**: Reduz atrito e perguntas repetidas, mas não bloqueia a primeira venda.

**Acceptance Criteria**:

1. The system SHALL exibir uma seção de perguntas frequentes cobrindo ao menos: formas de pagamento, prazo de acesso (6 meses), processo de reembolso e diferenças entre os planos.

---

### P2: Lista de inscrições para o mentor

**User Story**: Como mentor, quero ver uma lista de quem pagou, qual plano e quando expira, para saber quando remover acesso sem depender só de e-mails antigos.

**Why P2**: Conveniência operacional; o e-mail de notificação (P1) já cobre o essencial no lançamento.

**Acceptance Criteria**:

1. WHEN o mentor acessa a lista de inscrições (rota protegida por senha) THEN o sistema SHALL exibir nome, e-mail, plano, data de pagamento e data de expiração (quando aplicável) de cada mentorando, ordenados por proximidade da expiração.

---

### P2: Analytics de conversão

**User Story**: Como mentor que pretende rodar anúncios, quero rastrear quando um pagamento é concluído, para medir o retorno dos investimentos em divulgação.

**Why P2**: Só tem valor quando houver tráfego pago; não bloqueia o lançamento orgânico.

**Acceptance Criteria**:

1. WHERE um pixel de analytics estiver configurado o sistema SHALL disparar um evento de conversão ao concluir o pagamento com sucesso.

---

### P2: Recomendações de ex-alunos ~~Depoimentos de mentorados~~

**User Story**: Como visitante cético, quero ver evidência de que o mentor já ajudou gente de verdade, para confiar que vale a pena pagar.

**Why P2** (promovida de P3 em 2026-10-03): ninguém ainda pagou por *esta* mentoria (site não tinha nem sido lançado), então não existe "depoimento de mentorado" no sentido literal - mas o mentor tem recomendações públicas reais no LinkedIn, de ex-alunos que ele orientou como coordenador/professor, sobre o mesmo tipo de trabalho (orientação de carreira). Conteúdo real existe agora, decisão do usuário foi usá-lo.

**Acceptance Criteria**:

1. The system SHALL exibir uma seção de prova social com recomendações reais de ex-alunos (texto, nome e cargo atual), rotulada honestamente como recomendações profissionais do LinkedIn sobre a trajetória do mentor como professor/coordenador - nunca apresentada como avaliação de quem pagou por esta mentoria especificamente.
2. The system SHALL exibir, ao lado de cada recomendação, um link para a fonte (perfil do LinkedIn do autor ou o próprio LinkedIn do mentor).

---

### P3: Formulário de aplicação/triagem

**User Story**: Como mentor, quero (no futuro) filtrar quem se inscreve antes de liberar o pagamento, para garantir fit com o programa.

**Why P3**: Ideia levantada na pesquisa de mercado, sem demanda confirmada hoje.

**Acceptance Criteria**:

1. WHERE um formulário de aplicação estiver habilitado o sistema SHALL coletar respostas do candidato antes de liberar o botão de checkout.

---

### P2: Reforço de conversão (adicionada em 2026-10-03, pesquisa de concorrentes)

**User Story**: Como visitante avaliando se compra, quero entender rápido se a mentoria é pra mim, ver que outras pessoas já tiveram resultado, e saber que as vagas da turma não são infinitas, para decidir com confiança.

**Why P2**: Conteúdo ("Como funciona" e CTA final) já existia desde a primeira leva mas nunca foi renderizado - gap real. Os demais itens vêm da pesquisa de duas páginas concorrentes (`suacarreiratech.com.br`, `viumavaga.com.br/mentoria`) e usam dados reais (30 vagas/turma, confirmado pelo usuário) - sem nenhum número inventado.

**Acceptance Criteria**:

1. The system SHALL exibir a seção "Como funciona" (4 passos) entre a seção de planos e a seção "Sobre o mentor", conforme `content.md` §5.
2. The system SHALL exibir uma chamada final (CTA) com link para os planos, antes do rodapé, conforme `content.md` §8.
3. The system SHALL exibir um menu fixo no topo da página com links âncora para Planos, Sobre e FAQ, visível durante a rolagem.
4. The system SHALL exibir, antes da seção de planos, uma seção descrevendo as dificuldades comuns de quem busca o primeiro emprego ou progressão de carreira em tecnologia, uma por cada público-alvo dos dois planos.
5. The system SHALL exibir uma seção "Para quem é" e "Para quem não é" a mentoria, ajudando o visitante a se autoavaliar antes de comprar.
6. The system SHALL exibir, próximo aos planos, o número real de vagas disponíveis por turma (30), sem usar contagem regressiva nem linguagem que sugira urgência falsa.

---

## Edge Cases

- IF o visitante tentar pagar o mesmo plano duas vezes em sequência rápida (duplo clique) THEN o sistema SHALL evitar criar dois checkouts simultâneos para a mesma ação. <!-- duplicado de P1-pagamento AC6, mantido aqui por visibilidade -->
- IF o Asaas enviar um evento de tipo desconhecido ou um payload com campos novos não mapeados THEN o sistema SHALL ignorar os campos desconhecidos sem lançar erro, processando apenas o que reconhece.
- WHEN a data atual ultrapassa a data de expiração de uma inscrição (qualquer plano) THEN o sistema SHALL marcar a inscrição como `expirada` e SHALL notificar o mentor por e-mail. <!-- mesma regra de P1-confirmação AC11 -->

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --------------- | ----- | ------ | ------- |
| MENT-01 | P1: Ver e comparar os planos | Design | Pending |
| MENT-02 | P1: Ver e comparar os planos | Design | Pending |
| MENT-03 | P1: Ver e comparar os planos | Design | Pending |
| MENT-04 | P1: Pagar o plano escolhido | Design | Pending |
| MENT-05 | P1: Pagar o plano escolhido | Design | Pending |
| MENT-06 | P1: Pagar o plano escolhido | Design | Pending |
| MENT-07 | P1: Pagar o plano escolhido | Design | Pending |
| MENT-08 | P1: Pagar o plano escolhido | Design | Pending |
| MENT-09 | P1: Pagar o plano escolhido | Design | Pending |
| MENT-10 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-11 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-12 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-13 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-14 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-15 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-16 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-17 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-18 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-19 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-20 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-21 | P1: Confirmação pós-pagamento | Design | Pending |
| MENT-22 | P1: Página de obrigado | Design | Pending |
| MENT-29 | P2: Hero, rodapé e privacidade | Implementing | ✅ Verified |
| MENT-30 | P2: Hero, rodapé e privacidade | Implementing | ✅ Verified |
| MENT-31 | P2: Hero, rodapé e privacidade | Implementing | ✅ Verified |
| MENT-32 | P2: Hero, rodapé e privacidade | Implementing | ✅ Verified |
| MENT-33 | P2: Hero, rodapé e privacidade | Implementing | ✅ Verified |
| MENT-23 | P2: Sobre o mentor | Implementing | ✅ Verified |
| MENT-24 | P2: FAQ | Implementing | ✅ Verified |
| MENT-25 | P2: Lista de inscrições | Implementing | ✅ Verified |
| MENT-26 | P2: Analytics de conversão | - | Pending |
| MENT-27 | P2: Recomendações de ex-alunos | Implementing | ✅ Verified |
| MENT-28 | P3: Formulário de triagem | - | Pending |
| MENT-34 | P2: Reforço de conversão | Implementing | ✅ Verified |
| MENT-35 | P2: Reforço de conversão | Implementing | ✅ Verified |
| MENT-36 | P2: Reforço de conversão | Implementing | ✅ Verified |
| MENT-37 | P2: Reforço de conversão | Implementing | ✅ Verified |
| MENT-38 | P2: Reforço de conversão | Implementing | ✅ Verified |
| MENT-39 | P2: Reforço de conversão | Implementing | ✅ Verified |
| MENT-40 | P2: Recomendações de ex-alunos | Implementing | ✅ Verified |

**ID format:** `MENT-[NUMBER]`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 40 total, 22 mapped to tasks and Verified (P1: MENT-01 a MENT-22), 18 unmapped (P2/P3: MENT-23 a MENT-40) ⚠️

---

## Success Criteria

How we know the feature is successful:

- [ ] Visitante consegue entender os dois planos e concluir o pagamento em menos de 3 minutos, sem sair da página exceto pelo checkout hospedado do Asaas
- [ ] Toda cobrança confirmada (`CHECKOUT_PAID`) gera um registro de inscrição ou um alerta de erro rastreável - nenhum pagamento "some" sem deixar rastro
- [ ] Mentor recebe a notificação de toda nova inscrição, em qualquer plano, em até 1 minuto após a confirmação do pagamento
