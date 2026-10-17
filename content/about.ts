// Transcrito de .specs/features/landing-mentoria/content.md §3
// (cabeçalho, bio longa, bio curta, stat tiles, credenciais, link do LinkedIn).

export interface AboutStat {
  value: string;
  label: string;
}

export interface Differential {
  title: string;
  description: string;
}

export const ABOUT_MENTOR = {
  name: "Ramon Lummertz",
  jobTitle: "Gerente de Tecnologia na Betha Sistemas · Professor na PUCRS",
  location: "Torres, RS - atendimento 100% online",
  // Fallback textual mantido para usos que precisem de uma identificação curta
  // além da foto local em public/mentor.jpg.
  photoInitials: "RL",
  eyebrow: "Quem vai orientar sua carreira?",
  bioLong: [
    "Minha trajetória em tecnologia começou em 2002 como estagiário. Ao longo de mais de duas décadas, construí experiência em diferentes áreas da tecnologia e avancei até posições de gestão.",
    "Paralelamente, dediquei mais de 14 anos à formação de profissionais, incluindo atuação como professor universitário e coordenador de curso superior.",
    "Hoje combino essas experiências para oferecer uma mentoria individual baseada nas necessidades reais do mercado e no momento profissional de cada pessoa. Mais do que indicar o que melhorar, meu objetivo é ajudar você a construir um caminho concreto para evoluir.",
  ],
  bioShort:
    "Ramon Lummertz é Gerente de Tecnologia na Betha Sistemas e professor na PUCRS. Com mais de 20 anos em TI e 14 em sala de aula, coordenou o melhor curso de ADS do RS no ENADE 2021 e levou 80% dos formandos ao mercado.",
  stats: [
    { value: "+20 anos", label: "de experiência em tecnologia" },
    { value: "Gerente de Tecnologia", label: "na Betha Sistemas" },
    { value: "Professor", label: "na PUCRS" },
    { value: "+14 anos", label: "de experiência acadêmica" },
  ] satisfies AboutStat[],
  employability:
    "80% de empregabilidade entre os formandos de 2022 a 2025 do curso que coordenei, conforme indicador apresentado em minha trajetória acadêmica.",
  linkedinUrl: "https://www.linkedin.com/in/ramonsl/",
  linkedinLabel: "Veja meu LinkedIn",
};

export const DIFFERENTIALS_COPY = {
  eyebrow: "Diferencial competitivo",
  title: "Orientação de quem conhece os dois lados do processo seletivo.",
  subtitle:
    "Entenda o que as empresas procuram e como demonstrar que suas competências atendem a essas necessidades. Minha mentoria reúne três diferenciais:",
  cards: [
    {
      title: "Experiência de Gestão",
      description:
        "Mais de 20 anos no mercado de tecnologia, com atuação em liderança de equipes e conhecimento das exigências das empresas.",
    },
    {
      title: "Experiência na Formação de Profissionais",
      description:
        "Mais de 14 anos na educação, ajudando a desenvolver competências e preparar profissionais para o mercado de trabalho.",
    },
    {
      title: "Conexão com o Mercado",
      description:
        "Relacionamento com empresas e profissionais de tecnologia, incluindo contatos que procuram Ramon em busca de indicações para oportunidades.",
    },
  ] satisfies Differential[],
  closing:
    "Na mentoria essa experiência ajuda a orientar sua preparação e identificar caminhos profissionais mais compatíveis com seus objetivos.",
};
