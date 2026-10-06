import AboutMentor from "@/components/AboutMentor";
import FaqSection from "@/components/FaqSection";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LegalNotice from "@/components/LegalNotice";
import MentoringFocus from "@/components/MentoringFocus";
import NavBar from "@/components/NavBar";
import PainPoints from "@/components/PainPoints";
import PlanComparison from "@/components/PlanComparison";
import Qualification from "@/components/Qualification";
import { ABOUT_MENTOR } from "@/content/about";
import { FAQ_ITEMS } from "@/content/faq";
import { PLANS } from "@/content/plans";
import { listPlanPrices } from "@/lib/commercial";
import Testimonials from "@/components/Testimonials";

export const dynamic = "force-dynamic";

// Ordem redefinida no ticket "Tarefas de desenvolvimento — landing da
// mentoria" (2026-10-06, T13), seguindo dor -> solução -> quem -> prova ->
// oferta -> segurança -> dúvidas: NavBar -> Hero -> Dores -> Foco da
// mentoria -> Como funciona -> Sobre o mentor -> Depoimentos -> CTA
// (transição) -> Planos -> LegalNotice (colada nos planos) -> Um acordo
// honesto -> FAQ -> Rodapé.
//
// NavBar é `position: fixed` (fora do fluxo normal) - montado fora de
// `<main>`, mesmo padrão já usado para `<Footer />`.
//
// `#faq` é um wrapper de âncora em torno de `<FaqSection />`: o menu fixo
// (NavBar, T44) linka para `#faq`, mas o componente FaqSection (T33, fora do
// escopo desta fase) não tem esse id - resolvido aqui, no arquivo de
// montagem, em vez de tocar FaqSection.tsx fora do "Where" desta task.

const SITE_URL = "https://ramonlummertz.com.br";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: ABOUT_MENTOR.name,
  jobTitle: "Gerente de Tecnologia e Professor",
  description: ABOUT_MENTOR.bioShort,
  url: SITE_URL,
  sameAs: [ABOUT_MENTOR.linkedinUrl],
  knowsAbout: ["Carreira em tecnologia", "Desenvolvimento de software", "Mercado de trabalho em TI"],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Mentoria de carreira em tecnologia",
  description:
    "Mentoria prática para transformar currículo, LinkedIn e GitHub em oportunidades reais, com diagnóstico individual e plano de ação.",
  provider: {
    "@type": "Person",
    name: ABOUT_MENTOR.name,
    url: SITE_URL,
  },
  areaServed: { "@type": "Country", name: "Brasil" },
  serviceType: "Mentoria de carreira",
  url: SITE_URL,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default async function Home() {
  const prices = await listPlanPrices();
  const plans = PLANS.flatMap((plan) => {
    const priceCents = prices[plan.slug];
    return priceCents && priceCents > 0 ? [{ ...plan, priceCents }] : [];
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <NavBar />
      <main className="flex flex-1 flex-col">
        <Hero />
        <PainPoints />
        <MentoringFocus />
        <HowItWorks />
        <AboutMentor />
        <Testimonials />
        <FinalCta />
        <PlanComparison plans={plans} />
        <LegalNotice />
        <Qualification />
        <div id="faq">
          <FaqSection />
        </div>
      </main>
      <Footer />
    </>
  );
}
