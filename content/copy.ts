// Transcrito de .specs/features/landing-mentoria/content.md
// §2 (hero), §5 (como funciona), §8 (CTA final), §4 (aviso legal dos 7 dias),
// §13 (rodapé).

export const HERO_COPY = {
  eyebrow: "Mentoria individual de carreira em tecnologia",
  title:
    "Um plano de carreira construído por quem está do lado de quem contrata.",
  subtitle:
    "Tenha um diagnóstico completo da sua situação profissional e um roadmap personalizado com ações, metas e prazos para conquistar seu primeiro emprego em tecnologia, mudar de empresa ou avançar na carreira.",
  primaryCta: { label: "Quero meu plano de carreira", href: "#planos" },
  // Parcelamento em até 12x com juros pagos pelo comprador - o valor exato da
  // parcela de cada plano fica em content/plans.ts (`installment`).
  trustBadge:
    "Pagamento seguro via Kiwify · cartão em até 12x · Pix ou cartão · 7 dias de garantia",
  mentorCredentials:
    "Mais de 20 anos em tecnologia · Professor na PUCRS · Gerente de Tecnologia na Betha Sistemas",
};

export interface RoadmapCard {
  title: string;
  description: string;
}

export const ROADMAP_COPY = {
  eyebrow: "Roadmap personalizado",
  title: "Um plano que mostra o que fazer, em qual ordem e em qual prazo.",
  intro: [
    "Seu objetivo pode ser conquistar a primeira vaga, mudar de área, crescer profissionalmente ou alcançar uma posição mais competitiva.",
    "O caminho para cada um desses objetivos é diferente. Por isso eu crio um roadmap considerando sua realidade e as exigências das oportunidades que deseja conquistar.",
  ],
  closing:
    "Nada de estudar aleatoriamente e esperar que alguma oportunidade apareça! Você passa a ter um direcionamento individualizado para conduzir sua evolução.",
  disclaimer: "*Os prazos representam estimativas de planejamento, não garantias de contratação.",
};

export const ROADMAP_CARDS: RoadmapCard[] = [
  {
    title: "Diagnóstico do seu momento",
    description: "Identificação de competências, experiências, pontos de melhoria e oportunidades compatíveis com seu perfil.",
  },
  {
    title: "Plano de ação priorizado",
    description: "Definição das atividades que realmente fazem sentido para seu objetivo, evitando esforços desnecessários.",
  },
  {
    title: "Metas e prazos realistas",
    description: "Planejamento com etapas e horizontes de desenvolvimento que podem envolver três, seis, doze meses ou outros períodos conforme o diagnóstico.",
  },
  {
    title: "Estratégia de evolução",
    description: "Identificação de oportunidades intermediárias que podem ajudar você a construir experiência enquanto trabalha para alcançar seu objetivo principal.",
  },
];

export const FINAL_CTA_COPY = {
  title: "Sua carreira não precisa continuar no campo das tentativas.",
  text: "Descubra quais competências precisa desenvolver, quais oportunidades fazem sentido para seu momento e quais passos podem aproximar você do seu objetivo profissional. Tenha um plano personalizado e a orientação de quem conhece o mercado de tecnologia por dentro.",
  buttonLabel: "Quero começar minha mentoria",
  buttonHref: "#planos",
  subtext: "Mentoria individual e online · Planos a partir de R$ 249 · Garantia de 7 dias",
};

// content.md §14 item 3 resolve o e-mail de contato público como
// ramonsl@gmail.com - texto final, não é mais um ⚠️ em aberto.
export const LEGAL_NOTICE_COPY = {
  title: "7 dias de garantia para contratar com tranquilidade.",
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
