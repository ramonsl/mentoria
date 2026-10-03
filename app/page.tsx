import AboutMentor from "@/components/AboutMentor";
import FaqSection from "@/components/FaqSection";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LegalNotice from "@/components/LegalNotice";
import NavBar from "@/components/NavBar";
import PainPoints from "@/components/PainPoints";
import PlanComparison from "@/components/PlanComparison";
import Qualification from "@/components/Qualification";
import Testimonials from "@/components/Testimonials";

// Ordem definida em content.md §15 (reforço de conversão, pesquisa de
// concorrentes): NavBar -> Hero -> Dores -> Planos (com selo) -> Pra quem é/
// não é -> LegalNotice -> Como funciona -> Sobre o mentor -> Recomendações ->
// FAQ -> CTA final -> Rodapé.
//
// NavBar é `position: fixed` (fora do fluxo normal) - montado fora de
// `<main>`, mesmo padrão já usado para `<Footer />`.
//
// `#faq` é um wrapper de âncora em torno de `<FaqSection />`: o menu fixo
// (NavBar, T44) linka para `#faq`, mas o componente FaqSection (T33, fora do
// escopo desta fase) não tem esse id - resolvido aqui, no arquivo de
// montagem, em vez de tocar FaqSection.tsx fora do "Where" desta task.

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex flex-1 flex-col">
        <Hero />
        <PainPoints />
        <PlanComparison />
        <Qualification />
        <LegalNotice />
        <HowItWorks />
        <AboutMentor />
        <Testimonials />
        <div id="faq">
          <FaqSection />
        </div>
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
