// Transcrito de .specs/features/landing-mentoria/content.md
// §2 (hero), §5 (como funciona), §8 (CTA final), §4 (aviso legal dos 7 dias),
// §13 (rodapé).

export const HERO_COPY = {
  eyebrow: "Mentoria de carreira em tecnologia",
  title:
    "Vamos construir o próximo passo da sua carreira em tecnologia.",
  subtitle:
    "Uma mentoria prática para transformar seu currículo, LinkedIn e GitHub em oportunidades reais — com diagnóstico individual, plano de ação e direcionamento para se posicionar melhor, evoluir tecnicamente e buscar as vagas certas.",
  primaryCta: { label: "Ver planos", href: "#planos" },
  secondaryCta: { label: "Conhecer o mentor", href: "#sobre" },
  // content.md §14 item 8 resolve o parcelamento máximo por plano e que os
  // juros ficam com o comprador - texto final, não é mais um ⚠️ em aberto.
  trustBadge:
    "Pagamento seguro via Asaas · cartão em até 12x · Pix com 15% de desconto · 7 dias de garantia",
};

// content.md §14 item 7 resolve a ausência de link de agendamento: o e-mail
// avisa que o contato para agendar a call acontece em até 2 dias úteis.
export const HOW_IT_WORKS_STEPS: string[] = [
  "Escolha entre Direção de Carreira, Aceleração de Carreira ou Próximo Nível e faça o pagamento pelo Asaas.",
  "Envie seu currículo/CV, LinkedIn e GitHub para receber um diagnóstico individual e um plano de ação priorizado.",
  "Nos planos de acompanhamento, avance com encontros síncronos, suporte pelo WhatsApp, preparação para entrevistas e projetos reais.",
  "Ao longo da jornada, acompanho sua evolução e compartilho oportunidades alinhadas ao seu perfil por 3 ou 12 meses. No Próximo Nível, também exploramos juntos caminhos para buscar vagas internacionais.",
];

export const FINAL_CTA_COPY = {
  title: "Pronto para destravar sua próxima vaga?",
  text: "Escolha o plano que combina com o seu momento e comece a construir seu próximo passo.",
  buttonLabel: "Ver planos",
  buttonHref: "#planos",
};

// content.md §14 item 3 resolve o e-mail de contato público como
// ramonsl@gmail.com - texto final, não é mais um ⚠️ em aberto.
export const LEGAL_NOTICE_COPY = {
  contactEmail: "ramonsl@gmail.com",
  text: "Você tem 7 dias corridos a partir do pagamento para desistir da compra e receber 100% do valor de volta, conforme o art. 49 do Código de Defesa do Consumidor. Basta enviar um e-mail para ramonsl@gmail.com pedindo o reembolso. O estorno é feito pelo mesmo meio de pagamento.",
};

// content.md §9 - página de obrigado (MENT-22). O placeholder
// ⚠️[e-mail de contato] usa o mesmo contactEmail já resolvido em
// LEGAL_NOTICE_COPY (content.md §14 item 3).
export const THANK_YOU_COPY = {
  title: "Pagamento recebido. Bem-vindo(a)!",
  text: "Em alguns minutos você recebe um e-mail com os próximos passos e o link para agendar sua call. Se não aparecer, confira a caixa de spam ou promoções.",
  secondaryText: `Pagou com Pix e a confirmação ainda não chegou? Pode levar alguns minutos. Dúvidas: ${LEGAL_NOTICE_COPY.contactEmail}.`,
  buttonLabel: "Voltar para o início",
  buttonHref: "/",
};

export const FOOTER_COPY = {
  copyrightTemplate:
    "© {year} Ramon dos Santos Lummertz · Atendimento online a partir de Torres, RS",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ramonsl/" },
    { label: "E-mail de contato", href: "mailto:ramonsl@gmail.com" },
    { label: "Política de reembolso", href: "#planos" },
    // TODO: confirmar texto da política de privacidade (LGPD) - content.md
    // §13 marca como pendente ("texto-padrão gerado na fase Execute"); a
    // página /privacidade ainda não existe, criar em task futura.
    { label: "Política de privacidade", href: "/privacidade" },
  ],
};
