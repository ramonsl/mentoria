// Transcrito de .specs/features/landing-mentoria/content.md §4 (reformulado
// em 2026-10-03). Modelo substituído: de 2 planos por público-alvo (mesma
// entrega) para 3 planos por nível de acompanhamento - cada um com entregas
// próprias, não mais um pacote compartilhado.

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
  deliverables: string[];
  ctaLabel: string;
}

export const PLANS: PlanDisplay[] = [
  {
    slug: "avulso",
    name: "Visibilidade Profissional",
    fullPriceCents: 69900,
    targetAudience: "Você sente que tem currículo, LinkedIn e GitHub, mas não sabe como se apresentar pra ser visto - aqui a gente ajusta isso e te dá direção prática pra buscar novas oportunidades.",
    deliverables: [
      "Trabalhamos seu currículo/CV, LinkedIn e GitHub",
      "Você recebe um diagnóstico individual com os principais pontos de melhoria",
      "Plano de ação priorizado, com orientações claras sobre o que fazer depois do diagnóstico",
      "Durante 3 meses, envio ativamente vagas alinhadas ao seu perfil para você se candidatar",
    ],
    ctaLabel: "Quero minha Visibilidade Profissional",
  },
  {
    slug: "acompanhamento-3m",
    name: "Direção de Carreira",
    fullPriceCents: 150000,
    targetAudience: "Você sente que não consegue conectar o que aprendeu com o que o mercado cobra - aqui a gente fecha essa lacuna com acompanhamento próximo e um plano de estudos que gera XP (experiência prática) de verdade.",
    deliverables: [
      "3 encontros síncronos individuais, previamente agendados, ao longo de 3 meses",
      "Acompanhamento individual pelo WhatsApp entre os encontros",
      "Revisão de currículo, LinkedIn e GitHub",
      "Preparação para entrevistas técnicas e comportamentais",
      "Plano de ação priorizado, com orientações claras sobre o que fazer depois do diagnóstico",
      "Plano de estudos personalizado com projetos reais para construir experiência prática",
      "Durante 3 meses, envio ativamente vagas alinhadas ao seu perfil para você se candidatar",
    ],
    ctaLabel: "Quero minha Direção",
  },
  {
    slug: "acompanhamento-6m",
    name: "Aceleração de Carreira",
    badge: "Mais completa",
    fullPriceCents: 299900,
    targetAudience: "Você sente que falta projeto real e XP (experiência prática) pra mostrar - aqui a gente constrói isso junto, com acompanhamento contínuo, projetos reais pro portfólio e direcionamento pra buscar oportunidades, inclusive internacionais.",
    deliverables: [
      "6 encontros síncronos individuais, previamente agendados, ao longo de 6 meses",
      "Acompanhamento individual pelo WhatsApp entre os encontros",
      "Revisão de currículo, LinkedIn e GitHub",
      "Preparação para entrevistas técnicas e comportamentais",
      "Plano de ação priorizado, com orientações claras sobre o que fazer depois do diagnóstico",
      "Guia de estudos personalizado conforme seus interesses e objetivos",
      "Execução de projetos reais para construir portfólio e experiência prática",
      "Durante 12 meses, envio ativamente vagas alinhadas ao seu perfil para você se candidatar",
      "Orientação para buscar vagas internacionais, incluindo plataformas, posicionamento e processos seletivos",
    ],
    ctaLabel: "Quero acelerar minha carreira",
  },
];
