import { DELIVERABLES_COPY } from "@/content/conversion";

export default function Deliverables() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 md:px-16">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">{DELIVERABLES_COPY.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">{DELIVERABLES_COPY.title}</h2>
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">{DELIVERABLES_COPY.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {DELIVERABLES_COPY.cards.map((card, index) => (
          <div
            key={card.title}
            className="flex flex-col gap-3 rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-base font-bold text-[var(--ink)]">{card.title}</h3>
            <p className="text-sm leading-6 text-[var(--muted)]">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <a
          href={DELIVERABLES_COPY.cta.href}
          className="rounded-full border-2 border-[var(--navy)] px-7 py-3 text-base font-bold text-[var(--navy)] transition-colors hover:bg-[var(--navy)] hover:text-white"
        >
          {DELIVERABLES_COPY.cta.label}
        </a>
      </div>
    </section>
  );
}
