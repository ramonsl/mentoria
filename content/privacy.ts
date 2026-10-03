// Política de privacidade (LGPD) - texto novo, a lacuna só estava apontada
// em .specs/features/landing-mentoria/content.md §13 (sem conteúdo pronto).
// Cobre: dados coletados no checkout, finalidade, terceiros que recebem os
// dados e como o titular exerce seus direitos (spec.md P2 "Hero, rodapé e
// privacidade" AC5, MENT-33).

import { LEGAL_NOTICE_COPY } from "./copy";

export const PRIVACY_COPY = {
  title: "Política de Privacidade",
  intro:
    "Esta página explica quais dados coletamos quando você contrata uma mentoria, para que usamos esses dados, quem mais tem acesso a eles e como você pode exercer seus direitos, conforme a Lei Geral de Proteção de Dados (LGPD).",
  sections: [
    {
      heading: "Quais dados coletamos",
      body: "Ao pagar um plano de mentoria no checkout, coletamos seu nome e seu e-mail. Esses dados são informados por você diretamente no checkout hospedado pelo Asaas, nosso processador de pagamento.",
    },
    {
      heading: "Para que usamos esses dados",
      body: "Usamos seu nome e e-mail para processar o pagamento, registrar sua inscrição na mentoria, enviar a confirmação com os próximos passos e entrar em contato com você sobre a mentoria contratada (agendamento da call, acesso à trilha no Google Classroom e ao grupo de WhatsApp).",
    },
    {
      heading: "Quem recebe esses dados",
      body: "Compartilhamos seus dados apenas com os prestadores de serviço necessários para operar a mentoria: Asaas (processamento do pagamento), Resend (envio dos e-mails transacionais) e Supabase (armazenamento do registro da sua inscrição). Nenhum dado é vendido ou usado para fins de publicidade de terceiros.",
    },
    {
      heading: "Seus direitos",
      body: `Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento, enviando um e-mail para ${LEGAL_NOTICE_COPY.contactEmail}.`,
    },
  ],
};
