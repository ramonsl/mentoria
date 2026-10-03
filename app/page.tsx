import AboutMentor from "@/components/AboutMentor";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import LegalNotice from "@/components/LegalNotice";
import PlanComparison from "@/components/PlanComparison";

export default function Home() {
  return (
    <>
      <main className="flex flex-1 flex-col">
        <Hero />
        <PlanComparison />
        <LegalNotice />
        <AboutMentor />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
