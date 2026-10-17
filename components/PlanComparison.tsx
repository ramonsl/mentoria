import { PLANS_SECTION_COPY, type PlanDisplay } from "@/content/plans";

// Componente apresentacional (spec.md P1 "Ver e comparar os planos",
// MENT-01/02/03) e o selo de vagas reais (spec.md P2 "Reforço de conversão"
// AC6, MENT-37 - T50). O CTA de cada plano abre direto o link de checkout
// hospedado na Kiwify (plan.kiwifyUrl), em vez de chamar /api/checkout
// (Asaas) - troca temporária enquanto o checkout não migra de verdade pra
// Kiwify.

interface PricedPlan extends PlanDisplay {
  priceCents: number;
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function PlanCard({ plan }: { plan: PricedPlan }) {
  const isHighlighted = plan.slug === "acompanhamento-6m";
  const className = `flex min-w-0 flex-1 flex-col gap-6 rounded-3xl border bg-white p-7 transition-transform hover:-translate-y-1 ${
    isHighlighted
      ? "border-2 border-[var(--warm)] shadow-xl hover:shadow-2xl"
      : "border-[var(--line)] shadow-sm hover:shadow-lg"
  }`;
  const ctaClassName = `mt-auto w-full whitespace-nowrap rounded-full px-5 py-3 text-center text-sm font-bold transition-colors ${
    isHighlighted
      ? "bg-[var(--warm)] text-[var(--navy-deep)] hover:bg-amber-300"
      : "border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white"
  }`;
  return (
    <article className={className}>
      <header className="flex flex-col gap-2">
        {plan.badge ? (
          <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
            {plan.badge}
          </span>
        ) : null}
        <h3 className="text-2xl font-bold tracking-tight text-[var(--ink)]">{plan.name}</h3>
        <p className="text-sm leading-6 text-[var(--muted)]">{plan.targetAudience}</p>
      </header>

      <div className="flex flex-col gap-1">
        {plan.installment.forPriceCents === plan.priceCents ? (
          <>
            <p className="text-4xl font-bold tracking-tight text-[var(--ink)]">
              <span className="text-xl font-semibold">12x de </span>
              {currency.format(plan.installment.installmentCents / 100)}
            </p>
            <p className="text-sm font-medium text-[var(--muted)]">ou {currency.format(plan.priceCents / 100)} à vista</p>
          </>
        ) : (
          <>
            <p className="text-4xl font-bold tracking-tight text-[var(--ink)]">{currency.format(plan.priceCents / 100)}</p>
            <p className="text-sm font-medium text-[var(--muted)]">à vista ou em até 12x no cartão</p>
          </>
        )}
        {plan.fullPriceCents > plan.priceCents ? (
          <p className="text-xs text-[var(--muted)]">
            <span className="font-bold text-emerald-700">Preço de lançamento</span> · de{" "}
            <span className="line-through">{currency.format(plan.fullPriceCents / 100)}</span>
          </p>
        ) : null}
      </div>

      {plan.highlights ? (
        <p className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-bold leading-5 text-amber-900">{plan.highlights}</p>
      ) : null}

      <ul className="flex flex-1 flex-col gap-3 border-y border-[var(--line)] py-5 text-sm leading-5 text-[var(--muted)]">
        {plan.incrementalIntro ? (
          <li className="font-bold text-[var(--ink)]">{plan.incrementalIntro}</li>
        ) : null}
        {plan.deliverables.map((deliverable) => (
          <li key={deliverable} className="flex gap-2">
            <span aria-hidden="true" className="font-bold text-blue-700">✓</span>
            <span>{deliverable}</span>
          </li>
        ))}
      </ul>

      <a
        data-plan={plan.slug}
        href={plan.kiwifyUrl}
        target="_blank"
        rel="noopener"
        className={ctaClassName}
      >
        {plan.ctaLabel}
      </a>
    </article>
  );
}

export default function PlanComparison({ plans }: { plans: PricedPlan[] }) {
  return (
    <section id="planos" className="bg-white px-6 py-20 md:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">{PLANS_SECTION_COPY.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">{PLANS_SECTION_COPY.title}</h2>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">{PLANS_SECTION_COPY.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.slug} plan={plan} />
        ))}
      </div>
      </div>
    </section>
  );
}
