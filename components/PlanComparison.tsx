"use client";

import { useRef, useState } from "react";
import { PLANS, type PlanDisplay } from "@/content/plans";

// Componente apresentacional (spec.md P1 "Ver e comparar os planos",
// MENT-01/02/03) com os CTAs conectados a /api/checkout (spec.md P1 "Pagar o
// plano escolhido", MENT-06/08/09 - T16).

const GENERIC_CHECKOUT_ERROR =
  "Não foi possível iniciar o pagamento agora. Tente novamente em instantes.";

function PlanCard({ plan }: { plan: PlanDisplay }) {
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
        body: JSON.stringify({ plan: plan.slug }),
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
        disabled={isLoading}
        onClick={handleClick}
        className="w-full rounded-full bg-blue-700 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {plan.ctaLabel}
      </button>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
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
