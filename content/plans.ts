// Transcrito de .specs/features/landing-mentoria/content.md §4 (reformulado
// em 2026-10-03). Modelo substituído: de 2 planos por público-alvo (mesma
// entrega) para 3 planos por nível de acompanhamento - cada um com entregas
// próprias, não mais um pacote compartilhado.
//
// Textos de público, introdução e entregas seguem a "Sugestão de copy LP V1"
// (seção 09 | Oferta). `incrementalIntro` (quando presente) é o texto em
// negrito, sem ✓, que antecede a lista de entregas.

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
  highlights?: string;
  // Parcela de 12x com juros, como a Kiwify cobra. Vale só para o preço à
  // vista em que foi calculada: se o preço mudar no admin, o card deixa de
  // exibir a parcela até este valor ser atualizado.
  installment: { forPriceCents: number; installmentCents: number };
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
    installment: { forPriceCents: 24900, installmentCents: 2575 },
    targetAudience: "Para quem precisa melhorar seu posicionamento e definir os próximos passos.",
    deliverables: [
      "Revisão de currículo, LinkedIn e GitHub.",
      "Diagnóstico individual do posicionamento profissional.",
      "Plano de ação priorizado.",
      "Pesquisa e envio de vagas por 3 meses.",
      "Atendimento assíncrono, sem encontros individuais ao vivo.",
    ],
    ctaLabel: "Quero melhorar meu posicionamento",
  },
  {
    slug: "acompanhamento-3m",
    name: "Direção de Carreira",
    fullPriceCents: 150000,
    kiwifyUrl: "https://pay.kiwify.com.br/GkQERUU",
    installment: { forPriceCents: 59900, installmentCents: 6195 },
    targetAudience: "Para quem quer direcionamento individual e acompanhamento para evoluir.",
    incrementalIntro: "Inclui tudo do plano Visibilidade Profissional, mais:",
    deliverables: [
      "3 encontros individuais ao vivo ao longo de 3 meses.",
      "Suporte pelo WhatsApp durante o acompanhamento.",
      "Preparação para entrevistas técnicas e comportamentais.",
      "Plano de estudos personalizado.",
      "Orientação sobre projetos práticos.",
    ],
    ctaLabel: "Quero direcionamento individual",
  },
  {
    slug: "acompanhamento-6m",
    name: "Aceleração de Carreira",
    badge: "Plano mais completo",
    fullPriceCents: 299900,
    kiwifyUrl: "https://pay.kiwify.com.br/HpgxfqT",
    installment: { forPriceCents: 99900, installmentCents: 10332 },
    targetAudience: "Para quem quer um acompanhamento mais profundo para desenvolver competências, fortalecer o portfólio e buscar oportunidades melhores.",
    highlights: "Encontros individuais · Acompanhamento por 6 meses · Vagas por 12 meses",
    incrementalIntro: "Inclui os serviços dos planos anteriores, com acompanhamento ampliado:",
    deliverables: [
      "6 encontros individuais ao vivo ao longo de 6 meses.",
      "Suporte pelo WhatsApp durante 6 meses.",
      "Diagnóstico e roadmap personalizado.",
      "Revisão de currículo, LinkedIn e GitHub.",
      "Plano de estudos personalizado.",
      "Preparação para entrevistas técnicas e comportamentais.",
      "Desenvolvimento e acompanhamento de projetos reais para o portfólio.",
      "Pesquisa e envio de vagas durante 12 meses.",
      "Orientação para oportunidades internacionais.",
    ],
    ctaLabel: "Quero acelerar minha carreira",
  },
];

export const PLANS_SECTION_COPY = {
  eyebrow: "Oferta",
  title: "Escolha o nível de acompanhamento ideal para sua carreira.",
  subtitle:
    "Três modalidades de mentoria para diferentes objetivos, momentos profissionais e necessidades de orientação.",
};
