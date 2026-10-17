// Transcrito de .specs/features/landing-mentoria/content.md §15.1-15.4
// (MENT-34, MENT-35, MENT-36, MENT-37), rodada de reforço de conversão
// baseada em pesquisa de concorrentes (2026-10-03).

export interface NavLink {
  label: string;
  href: string;
}

// content.md §15.1: menu fixo com links para Planos/Sobre/FAQ e um CTA "Ver
// planos" à direita.
export const NAV_LINKS: NavLink[] = [
  { label: "Planos", href: "#planos" },
  { label: "Sobre", href: "#sobre" },
  { label: "FAQ", href: "#faq" },
];

export const NAV_CTA: NavLink = { label: "Ver planos", href: "#planos" };

export interface QuestionCard {
  question: string;
  description: string;
}

export const PAIN_POINTS_COPY = {
  title: "Você sabe onde quer chegar, mas sabe o que precisa fazer para conseguir?",
  subtitle:
    "Você quer entrar no mercado de tecnologia, conquistar um cargo melhor ou trabalhar em uma empresa que realmente valorize suas competências…",
  bridge:
    "Mas entre seu momento atual e o objetivo que deseja alcançar existem dúvidas que atrasam sua evolução.",
  cards: [
    {
      question: "O que está faltando?",
      description: "Você não sabe se precisa de mais experiência, certificações, projetos ou simplesmente melhorar a maneira como apresenta suas competências.",
    },
    {
      question: "Por onde começar?",
      description: "São tantas recomendações, cursos e caminhos possíveis que fica difícil identificar o que realmente merece sua atenção.",
    },
    {
      question: "Quanto tempo vai levar?",
      description: "Você não sabe se está perto de conquistar seu objetivo ou se ainda precisa de meses de preparação.",
    },
    {
      question: "Quais oportunidades buscar?",
      description: "Você encontra vagas interessantes, mas não sabe se seu perfil é competitivo ou se deveria buscar uma posição intermediária primeiro.",
    },
  ] satisfies QuestionCard[],
  closing:
    "O problema não é necessariamente falta de capacidade… Pode ser falta de uma estratégia alinhada ao seu momento profissional e ao que o mercado realmente exige.",
};

export const QUALIFICATION_COPY = {
  title: "A mentoria certa para o momento certo da sua carreira.",
  fitTitle: "A mentoria é indicada para você que:",
  fitPoints: [
    "Quer conquistar sua primeira oportunidade em tecnologia.",
    "Já trabalha na área, mas deseja um cargo, uma empresa ou uma oportunidade melhor.",
    "Está em transição de carreira e precisa identificar caminhos realistas.",
    "Não sabe quais competências precisa desenvolver para alcançar seu objetivo.",
    "Quer melhorar seu posicionamento profissional e sua preparação para processos seletivos.",
    "Procura direcionamento individualizado, com ações e prioridades claras.",
  ],
  notFitText:
    "Não é indicada para quem espera uma contratação garantida ou deseja resultados sem colocar as orientações em prática.",
};

export interface FocusCard {
  title: string;
  description: string;
}

export const SOLUTION_COPY = {
  eyebrow: "A solução",
  title: "Pare de adivinhar qual deve ser seu próximo passo.",
  subtitle: "Tenha uma estratégia de carreira construída individualmente para você.",
  paragraphs: [
    "Na mentoria eu avalio sua experiência, suas competências e seus objetivos para identificar onde você está, quais oportunidades fazem sentido e o que precisa desenvolver para avançar.",
    "Você recebe mais do que uma lista de recomendações. Recebe direcionamento prático, ações priorizadas e um planejamento com metas e prazos realistas.",
  ],
  tagline: "Diagnóstico + Roadmap prático + Direcionamento de mercado",
  closing: "Uma estratégia para transformar seus objetivos profissionais em próximos passos concretos.",
  cta: { label: "Quero ter direção para minha carreira", href: "#planos" },
};

export const DELIVERABLES_COPY = {
  eyebrow: "Entregáveis",
  title: "Aqui você não recebe apenas conselhos, e sim orientações que pode colocar em prática.",
  subtitle: "Conheça as principais frentes de atuação da mentoria, disponíveis conforme o plano contratado.",
  cta: { label: "Conhecer os planos da mentoria", href: "#planos" },
  cards: [
    {
      title: "Currículo e LinkedIn",
      description: "Análise e melhoria da sua apresentação profissional para comunicar suas competências de forma mais clara e alinhada às vagas desejadas.",
    },
    {
      title: "GitHub e Portfólio",
      description: "Avaliação de projetos e orientação para demonstrar suas habilidades técnicas de maneira mais consistente.",
    },
    {
      title: "Roadmap de Carreira",
      description: "Plano personalizado com prioridades, ações, metas e prazos para orientar sua evolução profissional.",
    },
    {
      title: "Plano de Estudos",
      description: "Materiais e direcionamento sobre o que estudar e quais conhecimentos desenvolver para as oportunidades que deseja conquistar.",
    },
    {
      title: "Preparação para Entrevistas",
      description: "Orientações para entrevistas técnicas e comportamentais, incluindo perguntas difíceis e estratégias para apresentar melhor suas experiências.",
    },
    {
      title: "Pesquisa de Vagas",
      description: "Busca e compartilhamento de oportunidades compatíveis com seu perfil e objetivos durante o período contratado.",
    },
    {
      title: "Acompanhamento Individual",
      description: "Encontros e suporte pelo WhatsApp para tirar dúvidas, receber feedback e trabalhar os próximos passos da sua carreira.",
    },
    {
      title: "Projetos Práticos",
      description: "Orientação para desenvolver projetos relevantes, construir experiência demonstrável e fortalecer seu portfólio.",
    },
  ] satisfies FocusCard[],
};
