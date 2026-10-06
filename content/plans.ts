// Transcrito de .specs/features/landing-mentoria/content.md §4 (reformulado
// em 2026-10-03). Modelo substituído: de 2 planos por público-alvo (mesma
// entrega) para 3 planos por nível de acompanhamento - cada um com entregas
// próprias, não mais um pacote compartilhado.
//
// Descrição incremental (T4, ajustes 2026-10-06): a partir do 2º plano,
// `deliverables` lista só os itens NOVOS daquele tier - os itens dos tiers
// anteriores não se repetem, e `incrementalIntro` (quando presente) é o
// texto em negrito, sem ✓, que antecede a lista ("Tudo da X, mais:").

export type PlanSlug =
  | "avulso"
  | "acompanhamento-3m"
  | "acompanhamento-6m";

export interface PlanDisplay {
  slug: PlanSlug;
  name: string;
  badge?: string;
  // Preço cheio de referência, mostrado riscado ao lado do preço
  // promocional de lançamento da primeira turma (vem de `plan_prices` via
  // listPlanPrices) - puramente de exibição, não afeta o valor cobrado.
  fullPriceCents: number;
  targetAudience: string;
  // Texto em negrito, sem ✓, antes da lista de entregas - só nos planos que
  // constroem sobre o anterior ("Tudo da Visibilidade Profissional, mais:").
  incrementalIntro?: string;
  deliverables: string[];
  ctaLabel: string;
  // Link de checkout hospedado na Kiwify - clicar no CTA do plano abre esse
  // link direto, em vez de chamar /api/checkout (Asaas).
  kiwifyUrl: string;
}

export const PLANS: PlanDisplay[] = [
  {
    slug: "avulso",
    name: "Visibilidade Profissional",
    fullPriceCents: 69900,
    kiwifyUrl: "https://pay.kiwify.com.br/GusAEUc",
    targetAudience: "Você já mandou vários currículos sem nenhuma resposta: tem currículo, LinkedIn e GitHub, mas não sabe como se apresentar para ser visto. Aqui a gente ajusta isso e te dá direção prática para buscar novas oportunidades.",
    deliverables: [
      "Revisão do seu currículo/CV, LinkedIn e GitHub",
      "Diagnóstico individual com os principais pontos de melhoria",
      "Plano de ação priorizado: o que fazer, em que ordem",
      "Durante 3 meses, envio ativamente vagas alinhadas ao seu perfil",
    ],
    ctaLabel: "Quero a Visibilidade",
  },
  {
    slug: "acompanhamento-3m",
    name: "Direção de Carreira",
    fullPriceCents: 150000,
    kiwifyUrl: "https://pay.kiwify.com.br/GkQERUU",
    targetAudience: "Você sente que não consegue conectar o que aprendeu com o que o mercado cobra. Aqui a gente fecha essa lacuna com acompanhamento próximo e um plano de estudos que gera XP (experiência prática) de verdade.",
    incrementalIntro: "Tudo da Visibilidade Profissional, mais:",
    deliverables: [
      "3 encontros individuais ao vivo, agendados ao longo de 3 meses",
      "Acompanhamento pelo WhatsApp entre os encontros",
      "Preparação para entrevistas técnicas e comportamentais",
      "Plano de estudos personalizado com projetos reais",
    ],
    ctaLabel: "Quero a Direção",
  },
  {
    slug: "acompanhamento-6m",
    name: "Aceleração de Carreira",
    badge: "Mais completa",
    fullPriceCents: 299900,
    kiwifyUrl: "https://pay.kiwify.com.br/HpgxfqT",
    targetAudience: "Você quer projeto real e XP (experiência prática) para mostrar. Aqui a gente constrói isso junto, com acompanhamento contínuo, projetos reais para o portfólio e direcionamento para buscar oportunidades, inclusive internacionais.",
    incrementalIntro: "Tudo da Direção de Carreira, mais:",
    deliverables: [
      "6 encontros ao vivo ao longo de 6 meses (o dobro)",
      "Execução de projetos reais com acompanhamento, para construir portfólio",
      "Guia de estudos ajustado aos seus interesses e objetivos",
      "Envio de vagas por 12 meses (em vez de 3)",
      "Orientação para vagas internacionais: plataformas, posicionamento e processos seletivos",
    ],
    ctaLabel: "Quero acelerar minha carreira",
  },
];
