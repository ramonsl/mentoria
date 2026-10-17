import { PAIN_POINTS_COPY } from "@/content/conversion";

export default function PainPoints() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 md:px-16">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">Antes de enviar mais uma candidatura</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">{PAIN_POINTS_COPY.title}</h2>
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">{PAIN_POINTS_COPY.subtitle}</p>
        <p className="mt-2 text-base leading-7 text-[var(--muted)]">{PAIN_POINTS_COPY.bridge}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {PAIN_POINTS_COPY.cards.map((card) => (
          <div
            key={card.question}
            className="flex flex-col gap-3 rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm"
          >
            <h3 className="text-lg font-bold text-[var(--ink)]">{card.question}</h3>
            <p className="text-sm leading-6 text-[var(--muted)]">{card.description}</p>
          </div>
        ))}
      </div>

      <p className="mx-auto max-w-2xl text-center text-base font-semibold leading-7 text-[var(--ink)]">
        {PAIN_POINTS_COPY.closing}
      </p>
    </section>
  );
}
