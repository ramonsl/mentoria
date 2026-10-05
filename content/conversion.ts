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
  title: "Isso soa familiar?",
  columns: [
    {
      title: "Primeiro emprego / estágio",
      points: [
        "Currículo que não passa da triagem automática",
        "LinkedIn parado, sem clareza do que destacar",
        "GitHub com projetos de curso, nada que mostre capacidade real",
        "Não sabe por onde começar a estudar pra entrevista",
      ],
    },
    {
      title: "Progressão de carreira",
      points: [
        "Trabalha há anos, mas não sabe como se posicionar pra subir de nível",
        "Currículo e LinkedIn desatualizados desde a última vaga",
        "Entrevista técnica trava em tópicos que raramente usa no dia a dia",
        "Sem rede nem indicação pra saber de vagas melhores",
      ],
    },
  ] as PainPointColumn[],
};

// content.md §15.3: qualificação "pra quem é" / "pra quem não é".
export const QUALIFICATION_COPY = {
  title: "Essa mentoria é pra você se...",
  fitTitle: "É pra você se:",
  fitPoints: [
    "Está buscando o primeiro emprego/estágio ou uma posição melhor em tech",
    "Sente que a faculdade não conectou os pontos entre as disciplinas e quer sair daqui com XP (experiência prática) real pra mostrar",
    "Topa investir 1 call + tempo de estudo próprio na trilha",
    "Quer feedback direto e honesto, não só elogio",
    "Tem pelo menos alguns meses de disponibilidade pra seguir a trilha",
  ],
  notFitTitle: "Não é pra você se:",
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
