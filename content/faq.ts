// Perguntas 1-8 seguem a "Sugestão de copy LP V1" (seção 12 | FAQ); as
// demais foram mantidas do FAQ anterior por cobrirem dúvidas que a V1 não
// trata (pagamento, duração, call, nota fiscal). Nomes e entregas dos planos
// precisam continuar em sincronia com `content/plans.ts`.

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "A mentoria garante que vou conseguir um emprego?",
    answer:
      "Não. O objetivo é ajudar você a melhorar seu posicionamento, desenvolver competências e construir uma estratégia para buscar oportunidades compatíveis com seu perfil. A contratação depende dos processos seletivos e das decisões das empresas.",
  },
  {
    question: "Preciso já trabalhar com tecnologia?",
    answer:
      "Não. A mentoria também atende quem busca a primeira oportunidade e pessoas em transição para a área.",
  },
  {
    question: "Como funciona o roadmap de carreira?",
    answer:
      "A partir do diagnóstico individual, eu identifico prioridades e organizo ações e etapas para orientar seu desenvolvimento profissional.",
  },
  {
    question: "Os prazos são garantias de contratação?",
    answer:
      "Não. Os prazos são estimativas de planejamento definidas conforme a situação profissional, as competências e os objetivos de cada pessoa.",
  },
  {
    question: "Vou receber vagas de emprego?",
    answer:
      "Sim. Os planos incluem pesquisa e envio de oportunidades alinhadas ao perfil, respeitando o período contratado. O compartilhamento de vagas não garante entrevistas ou contratação.",
  },
  {
    question: "A mentoria é online?",
    answer:
      "Sim. O atendimento é 100% online. Os encontros ao vivo estão disponíveis nos planos Direção de Carreira e Aceleração de Carreira.",
  },
  {
    question: "Qual plano devo escolher?",
    answer:
      "Visibilidade Profissional é indicado para quem busca um diagnóstico e melhorias no posicionamento. Direção de Carreira é indicado para quem também deseja encontros e acompanhamento durante três meses. Aceleração de Carreira é a opção mais completa, com seis meses de acompanhamento individual, desenvolvimento de projetos e envio de vagas durante doze meses.",
  },
  {
    question: "Como funciona a garantia?",
    answer:
      "Você tem sete dias corridos após a confirmação do pagamento para solicitar reembolso, conforme as condições de contratação.",
  },
  {
    question: "Quais as formas de pagamento?",
    answer:
      "Pix (aprovação na hora) ou cartão de crédito, à vista ou parcelado. O pagamento é processado pela Kiwify, e nenhum dado de cartão passa pelo nosso site.",
  },
  {
    question: "Por quanto tempo tenho acesso?",
    answer:
      "Na Visibilidade Profissional não há acesso contínuo: você recebe o diagnóstico e o plano de ação, e segue recebendo vagas alinhadas ao seu perfil por 3 meses. Na Direção de Carreira, os encontros, o acompanhamento pelo WhatsApp e o envio de vagas duram 3 meses. Na Aceleração de Carreira, os encontros e o WhatsApp duram 6 meses, mas o envio de vagas continua por 12 meses.",
  },
  {
    question: "Como é a call? Fica gravada?",
    answer:
      "Nos planos de Acompanhamento (Direção de Carreira ou Aceleração de Carreira), é uma chamada de vídeo online (Google Meet) e não é gravada. A Visibilidade Profissional não tem call - é 100% assíncrona, pelo formulário de envio de materiais.",
  },
  {
    question: "Emite nota fiscal?",
    answer: "Sim, emito nota fiscal de serviço pela CB Soluções em Educação (CNPJ 40.409.150/0001-78).",
  },
];
