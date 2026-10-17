import { DIFFERENTIALS_COPY } from "@/content/about";

export default function Differentials() {
  return (
    <section className="bg-[var(--navy-deep)] px-6 py-20 text-white md:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-200">{DIFFERENTIALS_COPY.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{DIFFERENTIALS_COPY.title}</h2>
          <p className="mt-3 text-base leading-7 text-slate-300">{DIFFERENTIALS_COPY.subtitle}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {DIFFERENTIALS_COPY.cards.map((card) => (
            <div key={card.title} className="flex flex-col gap-3 rounded-3xl border border-white/15 bg-white/5 p-7">
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
              <p className="text-sm leading-6 text-slate-300">{card.description}</p>
            </div>
          ))}
        </div>

        <p className="max-w-2xl text-base font-semibold leading-7 text-white">{DIFFERENTIALS_COPY.closing}</p>
      </div>
    </section>
  );
}
