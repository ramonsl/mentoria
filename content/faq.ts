// Transcrito de .specs/features/landing-mentoria/content.md §6 (8 perguntas).

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Quais as formas de pagamento?",
    answer:
      "Pix (aprovação na hora) ou cartão de crédito, à vista ou parcelado. O pagamento é processado pelo Asaas, e nenhum dado de cartão passa pelo nosso site.",
  },
  {
    question: "Qual a diferença entre os planos?",
    answer:
      "Os dois entregam a mesma coisa: call, relatório, trilha no Classroom e grupo de vagas por 6 meses. A diferença é o público e o foco da trilha. O Primeira Vaga é para quem busca o 1º emprego/estágio, com trilha de fundamentos. O Próximo Nível é para quem já está no mercado e busca progressão, com trilha de tópicos avançados e liderança.",
  },
  {
    question: "Por quanto tempo tenho acesso?",
    answer:
      "Nos dois planos, a trilha no Google Classroom e o grupo de WhatsApp ficam disponíveis por 6 meses a partir do pagamento. A call e o relatório são entregas únicas, sem prazo de expiração.",
  },
  {
    question: "Como funciona o reembolso?",
    answer:
      "Você tem 7 dias corridos após o pagamento para desistir e receber 100% do valor, sem precisar justificar. Basta mandar um e-mail.",
  },
  {
    question: "A mentoria garante que eu vou conseguir uma vaga?",
    answer:
      "Não. Ninguém honesto pode garantir isso. O que eu garanto é que você vai sair sabendo exatamente o que ajustar e o que estudar para aumentar suas chances.",
  },
  {
    question: "Preciso já saber programar?",
    answer:
      "Depende do seu momento: no Primeira Vaga, a trilha parte do zero/fundamentos; no Próximo Nível, ela parte do que você já sabe para avançar na carreira.",
  },
  {
    // content.md §14 item 9 resolve esta pergunta: as calls não são gravadas.
    question: "Como é a call? Fica gravada?",
    answer: "É uma chamada de vídeo online (Google Meet) e não é gravada.",
  },
  // content.md §14 item 9 propõe omitir esta pergunta, mas o "Done when" de
  // T7 exige as 8 perguntas listadas em content.md §6 - mantida, usando a
  // resposta que o próprio content.md §6 já propõe (decisão de conteúdo já
  // dada, não um TODO em aberto).
  {
    question: "Emite nota fiscal?",
    answer: "Emito recibo de pagamento em meu nome (pessoa física).",
  },
];
