import { FAQ_ITEMS } from "@/content/faq";

// Componente apresentacional puro: perguntas frequentes (spec.md P2 "FAQ"
// AC1, MENT-24).

export default function FaqSection() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-20 md:px-16">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">Sem letra miúda</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">Perguntas frequentes</h2>
      </div>

      <dl className="flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {FAQ_ITEMS.map((item) => (
          <div key={item.question} className="flex flex-col gap-2 py-6">
            <dt className="text-base font-bold text-[var(--ink)]">
              {item.question}
            </dt>
            <dd className="max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
