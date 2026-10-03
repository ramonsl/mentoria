// Transcrito de .specs/features/landing-mentoria/content.md §4.
// Os dois planos entregam exatamente o mesmo pacote; só o público-alvo e o
// foco da trilha no Classroom diferem (decisão registrada no spec).

export type PlanSlug = "primeira-vaga" | "proximo-nivel";

export interface PlanDisplay {
  slug: PlanSlug;
  name: string;
  priceCents: number;
  priceLabel: string;
  badge?: string;
  targetAudience: string;
  deliverables: string[];
  ctaLabel: string;
}

// content.md §14 resolve a duração da call (item 5: 60 min) e a extensão
// quando inclui entrevista (item 6: mesma call, até 90 min) e o prazo do
// relatório (item 5: 5 dias úteis) - usados como texto final, não como TODO.
const SHARED_DELIVERABLES_INTRO = [
  "1 call ao vivo de 60 minutos (até 90 minutos quando inclui preparação para entrevista) para revisar currículo, LinkedIn e GitHub, com preparação para entrevistas (técnica e comportamental)",
  "Relatório escrito com os ajustes priorizados, entregue em até 5 dias úteis após a call",
];

const SHARED_DELIVERABLES_OUTRO = [
  "Grupo de WhatsApp com vagas selecionadas",
  "Acesso por 6 meses à trilha e ao grupo",
];

export const PLANS: PlanDisplay[] = [
  {
    slug: "primeira-vaga",
    name: "Plano Primeira Vaga",
    priceCents: 19900,
    priceLabel: "R$ 199",
    targetAudience:
      "Para quem está buscando o primeiro emprego ou estágio em tecnologia.",
    deliverables: [
      ...SHARED_DELIVERABLES_INTRO,
      "Trilha de estudos personalizada no Google Classroom, com foco em fundamentos para destravar a primeira vaga",
      ...SHARED_DELIVERABLES_OUTRO,
    ],
    ctaLabel: "Quero o Primeira Vaga",
  },
  {
    slug: "proximo-nivel",
    name: "Plano Próximo Nível",
    priceCents: 49900,
    priceLabel: "R$ 499",
    badge: "Para quem já está no mercado",
    targetAudience:
      "Para quem já atua na área de tecnologia e busca progressão de carreira (promoção, mudança de nível, nova posição).",
    deliverables: [
      ...SHARED_DELIVERABLES_INTRO,
      "Trilha de estudos personalizada no Google Classroom, com foco em tópicos avançados e liderança, direcionada a quem já tem experiência no mercado",
      ...SHARED_DELIVERABLES_OUTRO,
    ],
    ctaLabel: "Quero o Próximo Nível",
  },
];
