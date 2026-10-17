import { ROADMAP_CARDS, ROADMAP_COPY } from "@/content/copy";

export default function HowItWorks() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 md:px-16">
      <div className="flex max-w-2xl flex-col gap-3">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">{ROADMAP_COPY.eyebrow}</p>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">{ROADMAP_COPY.title}</h2>
        {ROADMAP_COPY.intro.map((paragraph) => (
          <p key={paragraph} className="text-base leading-7 text-[var(--muted)]">{paragraph}</p>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {ROADMAP_CARDS.map((card, index) => (
          <div
            key={card.title}
            className="flex flex-col gap-4 rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--navy)] text-sm font-bold text-white">
              0{index + 1}
            </span>
            <h3 className="text-base font-bold text-[var(--ink)]">{card.title}</h3>
            <p className="text-sm leading-6 text-[var(--muted)]">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <p className="max-w-2xl text-base font-semibold leading-7 text-[var(--ink)]">{ROADMAP_COPY.closing}</p>
        <p className="text-xs italic leading-5 text-[var(--muted)]">{ROADMAP_COPY.disclaimer}</p>
      </div>
    </section>
  );
}
