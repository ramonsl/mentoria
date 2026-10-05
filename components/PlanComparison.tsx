"use client";

import { useRef, useState } from "react";
import { COHORT_BADGE_COPY } from "@/content/conversion";
import type { PlanDisplay } from "@/content/plans";

// Componente apresentacional (spec.md P1 "Ver e comparar os planos",
// MENT-01/02/03) com os CTAs conectados a /api/checkout (spec.md P1 "Pagar o
// plano escolhido", MENT-06/08/09 - T16), e o selo de vagas reais (spec.md P2
// "Reforço de conversão" AC6, MENT-37 - T50).

const GENERIC_CHECKOUT_ERROR =
  "Não foi possível iniciar o pagamento agora. Tente novamente em instantes.";

interface PricedPlan extends PlanDisplay {
  priceCents: number;
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function PlanCard({
  plan,
  couponCode,
}: {
  plan: PricedPlan;
  couponCode: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guarda síncrona contra duplo clique (MENT-09): dois cliques disparados
  // no mesmo tick podem ambos ler `isLoading` como false antes do React
  // re-renderizar o `disabled` do botão - a ref é setada de imediato, antes
  // de qualquer await, então o segundo clique já a vê true.
  const isSubmittingRef = useRef(false);

  async function handleClick() {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.slug,
          ...(couponCode ? { couponCode } : {}),
        }),
      });
      const data = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.checkoutUrl) {
        isSubmittingRef.current = false;
        setIsLoading(false);
        setError(data.error ?? GENERIC_CHECKOUT_ERROR);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      isSubmittingRef.current = false;
      setIsLoading(false);
      setError(GENERIC_CHECKOUT_ERROR);
    }
  }

  const content = (
    <>
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
        {plan.fullPriceCents > plan.priceCents ? (
          <p className="text-sm text-[var(--muted)]">
            <span className="line-through">{currency.format(plan.fullPriceCents / 100)}</span>{" "}
            <span className="font-bold text-emerald-700">preço de lançamento</span>
          </p>
        ) : null}
        <p className="text-4xl font-bold tracking-tight text-[var(--ink)]">{currency.format(plan.priceCents / 100)}</p>
        <p className="text-sm font-medium text-[var(--muted)]">ou até 12x de {currency.format(Math.round(plan.priceCents / 12) / 100)} no cartão</p>
      </div>

      <ul className="flex flex-1 flex-col gap-3 border-y border-[var(--line)] py-5 text-sm leading-5 text-[var(--muted)]">
        {plan.deliverables.map((deliverable) => (
          <li key={deliverable} className="flex gap-2">
            <span aria-hidden="true" className="font-bold text-blue-700">✓</span>
            <span>{deliverable}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        data-plan={plan.slug}
        disabled={isLoading}
        onClick={handleClick}
        className="w-full rounded-full bg-[var(--navy)] px-5 py-3 text-base font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {plan.ctaLabel}
      </button>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </>
  );

  const className = "flex min-w-0 flex-1 flex-col gap-6 rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg";
  return <article className={className}>{content}</article>;
}

export default function PlanComparison({ plans }: { plans: PricedPlan[] }) {
  return (
    <section id="planos" className="bg-white px-6 py-20 md:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">Escolha o formato que faz sentido agora</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">Um plano claro para tirar sua carreira do modo tentativa e erro.</h2>
        </div>
      <p className="w-fit shrink-0 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
        {COHORT_BADGE_COPY.text}
      </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.slug} plan={plan} couponCode="" />
        ))}
      </div>
      </div>
    </section>
  );
}
