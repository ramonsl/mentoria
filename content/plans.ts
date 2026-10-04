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
  priceCents: number;
  priceLabel: string;
  installmentLabel: string;
  pixPriceLabel: string;
  badge?: string;
  targetAudience: string;
  deliverables: string[];
  ctaLabel: string;
}

export const PLANS: PlanDisplay[] = [
  {
    slug: "avulso",
    name: "Direção de Carreira",
    priceCents: 29900,
    priceLabel: "R$ 299,00",
    installmentLabel: "ou até 12x de R$ 24,92 no cartão",
    pixPriceLabel: "R$ 254,15 no Pix (15% OFF)",
    targetAudience: "Quer organizar sua apresentação profissional e receber direção prática para buscar novas oportunidades.",
    deliverables: [
      "Trabalhamos seu currículo/CV, LinkedIn e GitHub",
      "Você recebe um diagnóstico individual com os principais pontos de melhoria",
      "Plano de ação priorizado, com orientações claras sobre o que fazer depois do diagnóstico",
      "Durante 3 meses, envio ativamente vagas alinhadas ao seu perfil para você se candidatar",
    ],
    ctaLabel: "Quero minha Direção",
  },
  {
    slug: "acompanhamento-3m",
    name: "Aceleração de Carreira",
    priceCents: 59900,
    priceLabel: "R$ 599,00",
    installmentLabel: "ou até 12x de R$ 49,92 no cartão",
    pixPriceLabel: "R$ 509,15 no Pix (15% OFF)",
    targetAudience: "Quer acompanhamento próximo por um ciclo curto.",
    deliverables: [
      "3 encontros síncronos individuais, previamente agendados, ao longo de 3 meses",
      "Acompanhamento individual pelo WhatsApp entre os encontros",
      "Revisão de currículo, LinkedIn e GitHub",
      "Preparação para entrevistas técnicas e comportamentais",
      "Plano de ação priorizado, com orientações claras sobre o que fazer depois do diagnóstico",
      "Plano de estudos personalizado com projetos reais para construir experiência prática",
      "Durante 3 meses, envio ativamente vagas alinhadas ao seu perfil para você se candidatar",
    ],
    ctaLabel: "Quero acelerar minha carreira",
  },
  {
    slug: "acompanhamento-6m",
    name: "Próximo Nível",
    priceCents: 99900,
    priceLabel: "R$ 999,00",
    installmentLabel: "ou até 12x de R$ 83,25 no cartão",
    pixPriceLabel: "R$ 849,15 no Pix (15% OFF)",
    badge: "Mais completo",
    targetAudience: "Quer acompanhamento contínuo para evoluir, construir experiência prática e buscar novas oportunidades.",
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
    ctaLabel: "Quero chegar ao próximo nível",
  },
];
