// Baseado em .specs/features/landing-mentoria/content.md §6, atualizado em
// 2026-10-03 para o modelo de 3 planos por nível de acompanhamento (Direção
// de Carreira / Aceleração de Carreira / Próximo Nível - ver
// content/plans.ts) que substituiu o modelo anterior de 2 planos por
// público-alvo com a mesma entrega. Os nomes e entregas de cada plano aqui
// precisam continuar em sincronia com `content/plans.ts`.

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
      "Os três entregam coisas diferentes, por intensidade. A Direção de Carreira é uma revisão pontual e 100% assíncrona (sem call) do currículo, LinkedIn e GitHub, com diagnóstico, plano de ação e envio de vagas por 3 meses. A Aceleração de Carreira adiciona 3 encontros ao vivo ao longo de 3 meses, acompanhamento pelo WhatsApp, preparação para entrevistas e um plano de estudos com projetos reais. O Próximo Nível é o mais completo: 6 encontros ao longo de 6 meses, guia de estudos e execução de projetos reais, envio de vagas por 12 meses e orientação para buscar vagas internacionais.",
  },
  {
    question: "Por quanto tempo tenho acesso?",
    answer:
      "Na Direção de Carreira não há acesso contínuo: você recebe o diagnóstico e o plano de ação, e segue recebendo vagas alinhadas ao seu perfil por 3 meses. Na Aceleração de Carreira, os encontros, o acompanhamento pelo WhatsApp e o envio de vagas duram 3 meses. No Próximo Nível, os encontros e o WhatsApp duram 6 meses, mas o envio de vagas continua por 12 meses.",
  },
  {
    question: "Como funciona o reembolso?",
    answer:
      "Você tem 7 dias corridos após o pagamento para desistir e receber 100% do valor, sem precisar justificar - vale para os 3 planos, inclusive a Direção de Carreira. Basta mandar um e-mail. Se o relatório ou uma call já tiver acontecido dentro desse prazo, o direito continua valendo; peço só que o reembolso seja pedido de boa fé quando o serviço já foi entregue.",
  },
  {
    question: "A mentoria garante que eu vou conseguir uma vaga?",
    answer:
      "Não. Ninguém honesto pode garantir isso. O que eu garanto é que você vai sair sabendo exatamente o que ajustar e o que estudar para aumentar suas chances.",
  },
  {
    question: "Preciso já saber programar?",
    answer:
      "Depende do plano: a Direção de Carreira é só a revisão dos materiais que você já tem, sem plano de estudos. Na Aceleração de Carreira e no Próximo Nível, o plano de estudos parte do seu momento atual, seja começando do zero ou avançando no que você já sabe.",
  },
  {
    // content.md §14 item 9 resolve esta pergunta: as calls não são gravadas.
    question: "Como é a call? Fica gravada?",
    answer:
      "Nos planos de Acompanhamento (Aceleração de Carreira ou Próximo Nível), é uma chamada de vídeo online (Google Meet) e não é gravada. A Direção de Carreira não tem call - é 100% assíncrona, pelo formulário de envio de materiais.",
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
