// Transcrito de .specs/features/landing-mentoria/content.md
// §2 (hero), §5 (como funciona), §8 (CTA final), §4 (aviso legal dos 7 dias),
// §13 (rodapé).

export const HERO_COPY = {
  eyebrow: "Mentoria de carreira em tecnologia",
  title:
    "Seu currículo, LinkedIn e GitHub revisados por quem contrata e forma devs há mais de 20 anos.",
  subtitle:
    "Uma call ao vivo comigo, um relatório escrito com o que mudar, uma trilha de estudos feita para você e um grupo de vagas por 6 meses - nos dois planos, cada um pensado para um momento diferente da carreira.",
  primaryCta: { label: "Ver planos", href: "#planos" },
  secondaryCta: { label: "Conhecer o mentor", href: "#sobre" },
  // content.md §14 item 8 resolve o parcelamento máximo por plano e que os
  // juros ficam com o comprador - texto final, não é mais um ⚠️ em aberto.
  trustBadge:
    "Pagamento seguro via Asaas · Pix ou cartão parcelado (até 6x no Primeira Vaga, até 12x no Próximo Nível, juros por conta do comprador) · 7 dias de garantia",
};

// content.md §14 item 7 resolve a ausência de link de agendamento: o e-mail
// avisa que o contato para agendar a call acontece em até 2 dias úteis.
export const HOW_IT_WORKS_STEPS: string[] = [
  "Escolha o plano e pague com Pix ou cartão, em ambiente seguro do Asaas.",
  "Receba o e-mail de boas-vindas: você recebe contato em até 2 dias úteis para combinar sua call.",
  "Call ao vivo comigo (online) para revisar seu currículo, LinkedIn e GitHub.",
  "Receba seu relatório, o acesso à trilha no Classroom e ao grupo de vagas.",
];

export const FINAL_CTA_COPY = {
  title: "Pronto para destravar sua próxima vaga?",
  text: "Escolha o plano e marque sua call ainda esta semana.",
  buttonLabel: "Ver planos",
  buttonHref: "#planos",
};

// content.md §14 item 3 resolve o e-mail de contato público como
// ramonsl@gmail.com - texto final, não é mais um ⚠️ em aberto.
export const LEGAL_NOTICE_COPY = {
  contactEmail: "ramonsl@gmail.com",
  text: "Você tem 7 dias corridos a partir do pagamento para desistir da compra e receber 100% do valor de volta, conforme o art. 49 do Código de Defesa do Consumidor. Basta enviar um e-mail para ramonsl@gmail.com pedindo o reembolso. O estorno é feito pelo mesmo meio de pagamento.",
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
