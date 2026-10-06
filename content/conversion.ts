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

export interface PainPointColumn {
  title: string;
  points: string[];
}

// content.md §15.2: seção de dores, uma coluna por público-alvo (mesmo
// recorte dos dois planos).
export const PAIN_POINTS_COPY = {
  title: "Em qual dessas situações você está?",
  subtitle:
    "Se você se reconheceu em pelo menos uma frase, a mentoria foi feita para esse momento.",
  closing:
    "A boa notícia: quase sempre o problema não é falta de capacidade — é como você está se apresentando. E isso dá para ajustar.",
  columns: [
    {
      title: "Estou buscando o primeiro emprego ou estágio",
      points: [
        "Mando currículo e não sou chamado para entrevista",
        "Meu currículo não passa da triagem automática",
        "Meu LinkedIn está parado e não sei o que destacar",
        "Meu GitHub só tem projeto de curso",
        "Não sei por onde começar a estudar para entrevista",
      ],
    },
    {
      title: "Já trabalho na área e quero subir de nível",
      points: [
        "Tenho anos de experiência, mas não sei me posicionar para crescer",
        "Currículo e LinkedIn estão desatualizados desde a última vaga",
        "Travo na entrevista técnica em assuntos que quase não uso no dia a dia",
        "Não tenho rede nem indicação para chegar em vagas melhores",
      ],
    },
  ] as PainPointColumn[],
};

// content.md §15.3: qualificação "para quem é" / "para quem não é".
export const QUALIFICATION_COPY = {
  title: "Essa mentoria é para você se...",
  fitTitle: "É para você se:",
  fitPoints: [
    "Está buscando o primeiro emprego/estágio ou uma posição melhor em tech",
    "Sente que a faculdade não conectou os pontos entre as disciplinas e quer sair daqui com XP (experiência prática) real para mostrar",
    "Topa investir 1 call + tempo de estudo próprio na trilha",
    "Quer feedback direto e honesto, não só elogio",
    "Tem pelo menos alguns meses de disponibilidade para seguir a trilha",
  ],
  notFitTitle: "Não é para você se:",
  notFitPoints: [
    "Busca garantia de vaga (ninguém honesto promete isso - ver FAQ)",
    "Quer só o certificado, sem aplicar o que for combinado na call",
    "Não tem nenhuma disponibilidade de tempo nos próximos 6 meses",
    "Já tem currículo/LinkedIn/GitHub otimizados por um processo parecido recente",
  ],
};

// content.md §15.4: selo de vagas - número real confirmado pelo mentor em
// 2026-10-03, sem contagem regressiva nem linguagem de urgência falsa.
export const COHORT_BADGE_COPY = {
  text: "Turma com 10 vagas - novo ciclo mensal",
};

export interface FocusCard {
  title: string;
  description: string;
}

// T8 (ajustes 2026-10-06): bloco "01-05" que vivia dentro do card flutuante
// do Hero, extraído para uma seção própria em formato de cards (T13 ainda
// decide a posição final na nova ordem das seções).
export const FOCUS_COPY = {
  eyebrow: "O foco da mentoria",
  title: "Feedback direto. Próximos passos claros.",
  subtitle:
    "Nada de conteúdo genérico: eu olho para o seu material e te digo o que mudar, em que ordem e por quê.",
  cards: [
    {
      title: "Currículo que passa pela triagem",
      description: "Ajustamos o que trava nos filtros automáticos e no olhar do recrutador.",
    },
    {
      title: "LinkedIn com posicionamento claro",
      description: "Um perfil que mostra em poucos segundos quem você é e que vaga você busca.",
    },
    {
      title: "GitHub que mostra seu raciocínio",
      description: "Menos projeto de curso, mais projeto que prova o que você sabe fazer.",
    },
    {
      title: "Preparação para entrevistas",
      description: "Treino das perguntas técnicas e comportamentais mais comuns para o seu nível.",
    },
    {
      title: "Busca ativa de vagas",
      description: "Eu envio vagas alinhadas ao seu perfil — você não procura sozinho.",
    },
  ] satisfies FocusCard[],
};
