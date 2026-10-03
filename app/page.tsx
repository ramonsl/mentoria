import LegalNotice from "@/components/LegalNotice";
import PlanComparison from "@/components/PlanComparison";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <PlanComparison />
      <LegalNotice />
    </main>
  );
}
