# Landing Page de Mentoria Context

**Gathered:** 2026-10-01
**Spec:** `.specs/features/landing-mentoria/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Uma landing page de venda com dois planos de mentoria de carreira tech, pagamento único via Asaas Checkout (Pix/cartão), registro automático de inscrições via webhook, e-mails de confirmação para mentorando e mentor, e página de obrigado. Classroom e grupo de WhatsApp continuam geridos manualmente pelo mentor - o sistema só avisa, não integra.

---

## Implementation Decisions

### Modelo de cobrança

- Pagamento único por plano (não recorrente) para os dois planos.
- Plano Primeira Vaga: R$199. Plano Próximo Nível: R$499.
- Formas de pagamento: Pix e cartão de crédito parcelado, via Asaas Checkout hospedado.

### Escopo por plano

- **Mudança de modelo** (2026-10-01): os dois planos entregam exatamente o mesmo pacote - call + relatório de currículo/LinkedIn/GitHub, preparação de entrevista, trilha personalizada no Classroom e grupo de WhatsApp de vagas, com 6 meses de acesso à trilha e ao grupo. Não há mais diferença de recursos entre os planos.
- A diferenciação passa a ser por **público-alvo**: Plano Primeira Vaga (R$199) mira quem busca o 1º emprego/estágio; Plano Próximo Nível (R$499) mira profissionais buscando progressão de carreira. Os preços continuam diferentes por público (maior disposição/capacidade de pagamento de quem já está empregado), não por entrega.
- O conteúdo da trilha no Classroom muda pelo foco do aluno (fundamentos para quem busca o 1º emprego vs. tópicos avançados/liderança para quem busca progressão) - mesma mecânica, montada caso a caso pelo mentor, fora do escopo de código.
- Grupo de WhatsApp agora vale para os dois planos (antes era exclusivo do plano mais caro).

### Duração de acesso

- Acesso à trilha (Classroom) e ao grupo de WhatsApp: período fixo de **6 meses** a partir do pagamento, para qualquer plano (os dois incluem trilha e grupo agora).
- Ao expirar, o sistema apenas notifica o mentor por e-mail; a remoção do Classroom/WhatsApp é manual.

### Formato de entrega do apoio de currículo/LinkedIn/GitHub

- Uma call ao vivo com o mentorando, seguida da entrega de um relatório escrito pelo mentor.
- Vale igualmente para os dois planos (entrega idêntica; só o foco da trilha muda).

### Trilha de estudos

- Não é conteúdo pré-pronto no sistema - é montada sob medida pelo mentor, por mentorando, dentro do próprio Google Classroom. Fora do escopo de código desta feature.

### Dados do mentor / pessoa jurídica

- Pessoa física autônoma, sem CNPJ - afeta o cadastro no Asaas (conta de pessoa física) e dispensa fluxo de nota fiscal com CNPJ.

### Prova social

- Sem depoimentos no lançamento - decisão explícita do usuário. Seção fica fora do MVP (P3, estrutura pronta mas vazia por enquanto).

---

## Agent's Discretion

- **Nomes de marketing dos planos**: "Plano Primeira Vaga" e "Plano Próximo Nível" escolhidos pelo agente por refletirem a diferenciação por público-alvo; usuário pode trocar antes do lançamento (é conteúdo, não estrutura).
- **Rate limiting / anti-spam no início do checkout**: nenhuma proteção dedicada no MVP - baixo volume esperado, Checkout hospedado do Asaas já absorve a superfície de pagamento.
- **Processo de reembolso na janela de 7 dias (Art. 49 CDC)**: manual, mentor estorna via painel do Asaas ao receber o pedido. A exigência legal de *informar* o direito na página é obrigatória e faz parte do MVP (spec P1, AC de pagamento).
- **Painel de acompanhamento de inscrições/expiração**: fica para P2 (lista simples protegida por senha); o e-mail automático ao mentor já cobre o essencial no lançamento.
- **Duplicidade de e-mail com inscrição ativa no mesmo plano**: registra o novo pagamento e alerta o mentor, não bloqueia a compra - decisão automática arriscaria recusar pagamento legítimo.

---

## Declined / Undiscussed Gray Areas → Assumptions

Layout visual, paleta de cores e tom de voz do copy não foram discutidos em detalhe - ficam a critério do agente na fase de Design, seguindo o padrão de confiança/credibilidade já apontado pela pesquisa (seção "Sobre o mentor" em destaque já que ainda não há depoimentos). Qualquer decisão de marca (nomes de plano, tom) está registrada na tabela de Assumptions do spec.md, não aqui.

---

## Specific References

- Bio do mentor e demais conteúdos: redigidos em `.specs/features/landing-mentoria/content.md` (2026-10-01), a partir do LinkedIn do mentor lido no navegador logado dele. Pendências do mentor em `content.md` §14.
- LinkedIn do mentor: https://www.linkedin.com/in/ramonsl/

---

## Deferred Ideas

- Formulário de aplicação/triagem antes da compra (P3 no spec).
- Depoimentos de mentorados (P3 no spec, aguardando conteúdo real).
- Cupom de desconto / programa de indicação (Out of Scope no spec).
- Blog / conteúdo de SEO orgânico (Out of Scope no spec).
