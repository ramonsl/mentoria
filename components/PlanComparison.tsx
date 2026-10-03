import { PLANS, type PlanDisplay } from "@/content/plans";

// Componente apresentacional puro (spec.md P1 "Ver e comparar os planos",
// MENT-01/02/03). Sem lógica de clique nos CTAs ainda - isso é conectado em
// T16 (fora do escopo desta task).

function PlanCard({ plan }: { plan: PlanDisplay }) {
  return (
    <article className="flex flex-1 flex-col gap-6 rounded-2xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-zinc-950">
      <header className="flex flex-col gap-2">
        {plan.badge ? (
          <span className="w-fit rounded-full bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
            {plan.badge}
          </span>
        ) : null}
        <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
          {plan.name}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {plan.targetAudience}
        </p>
      </header>

      <p className="text-3xl font-bold text-black dark:text-zinc-50">
        {plan.priceLabel}
      </p>

      <ul className="flex flex-1 flex-col gap-3 text-sm text-zinc-700 dark:text-zinc-300">
        {plan.deliverables.map((deliverable) => (
          <li key={deliverable} className="flex gap-2">
            <span aria-hidden="true">✓</span>
            <span>{deliverable}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        data-plan={plan.slug}
        className="w-full rounded-full bg-blue-700 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-blue-800"
      >
        {plan.ctaLabel}
      </button>
    </article>
  );
}

export default function PlanComparison() {
  return (
    <section
      id="planos"
      className="flex flex-col gap-8 py-16 px-6 md:flex-row md:items-stretch md:gap-6 md:px-16"
    >
      {PLANS.map((plan) => (
        <PlanCard key={plan.slug} plan={plan} />
      ))}
    </section>
  );
}
