// Transcrito de .specs/features/landing-mentoria/content.md §10
// (3 templates de e-mail transacional). Corpos usam tokens {entreChaves}
// para os campos dinâmicos - a interpolação acontece na task que monta os
// templates (T22), não aqui.

export const EMAIL_TEMPLATES_COPY = {
  senderName: "Ramon Lummertz",
  // TODO: confirmar domínio de produção do site e do remetente de e-mail
  // (content.md §14 item 4 - bloqueia produção, sem valor concreto definido
  // ainda; default provisório é subdomínio Vercel + domínio de teste do
  // Resend, nenhum dos dois é um domínio real que se possa transcrever aqui).
  senderEmail: "mentoria@TODO-confirmar-dominio.com.br",
  // content.md §14 item 3 resolve o e-mail de contato pessoal do mentor.
  replyTo: "ramonsl@gmail.com",

  menteeConfirmation: {
    subject: "Sua mentoria está confirmada - próximos passos",
    body: [
      "Olá, {customerFirstName}!",
      "Seu plano contratado: {planName} ({priceLabel}).",
      "Em até 2 dias úteis você recebe contato para combinar sua call.",
      "Antes da call, prepare: currículo em PDF, link do LinkedIn e link do GitHub.",
      "Em até 2 dias úteis você também será adicionado à turma do Classroom e ao grupo de WhatsApp - fique de olho no e-mail e no WhatsApp informado.",
      "Lembrete: você tem 7 dias corridos a partir do pagamento para desistir da compra, conforme o art. 49 do CDC.",
    ],
    signatureBioShort:
      "Ramon Lummertz é Gerente de Tecnologia na Betha Sistemas e professor na PUCRS. Com mais de 20 anos em TI e 14 em sala de aula, coordenou o melhor curso de ADS do RS no ENADE 2021 e levou 80% dos formandos ao mercado.",
  },

  mentorNewEnrollmentAlert: {
    subject: "[Mentoria] Nova inscrição - {planName} - {customerName}",
    body: [
      "Nome: {customerName}",
      "E-mail: {customerEmail}",
      "Telefone: {customerPhone}",
      "Plano: {planName}",
      "Valor: {priceLabel}",
      "Data de pagamento: {paidAt}",
      "Data de expiração: {expiresAt}",
      "Checklist:",
      "☐ agendar a call",
      "☐ adicionar ao Classroom",
      "☐ adicionar ao WhatsApp",
    ],
  },

  mentorExpirationAlert: {
    subject: "[Mentoria] Acesso expirado - remover {customerName}",
    body: [
      "Nome: {customerName}",
      "E-mail: {customerEmail}",
      "Plano: {planName}",
      "Data de pagamento: {paidAt}",
      "Data de expiração: {expiresAt}",
      "Checklist de remoção:",
      "☐ remover do Classroom",
      "☐ remover do grupo de WhatsApp",
    ],
  },

  // Sem seção correspondente em content.md - spec.md AC8 (MENT-17) exige
  // alertar o mentor quando um CHECKOUT_PAID chega com dados de cliente
  // malformados/incompletos, mas nesse caso não existe inscrição criada
  // (sem plano/datas de acesso) para reaproveitar o template de "nova
  // inscrição" acima. Texto mínimo, adicionado em T23 (tasks.md) só para
  // cobrir esse alerta.
  mentorRejectedCheckoutAlert: {
    subject:
      "[Mentoria] Pagamento recebido com dados inválidos - ação manual necessária",
    body: [
      "Um pagamento foi confirmado no Asaas, mas os dados do cliente vieram incompletos ou inválidos e a inscrição não foi criada automaticamente.",
      "Checkout: {checkoutId}",
      "Motivo: {reason}",
      "Verifique o pagamento diretamente no painel do Asaas e registre a inscrição manualmente se for um pagamento legítimo.",
    ],
  },
};
