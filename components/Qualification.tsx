import { QUALIFICATION_COPY } from "@/content/conversion";

// Componente apresentacional puro: seção "pra quem é / não é" (spec.md P2
// "Reforço de conversão" AC5, MENT-35).

export default function Qualification() {
  return (
    <section className="bg-[var(--navy)] px-6 py-20 text-white md:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-200">Um acordo honesto</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
        {QUALIFICATION_COPY.title}
      </h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-5 rounded-3xl border border-emerald-300/25 bg-emerald-300/10 p-7">
          <h3 className="text-xl font-bold text-white">
            {QUALIFICATION_COPY.fitTitle}
          </h3>
          <ul className="flex flex-col gap-3 text-sm leading-6 text-slate-200">
            {QUALIFICATION_COPY.fitPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden="true" className="font-bold text-emerald-300">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-5 rounded-3xl border border-white/15 bg-white/5 p-7">
          <h3 className="text-xl font-bold text-white">
            {QUALIFICATION_COPY.notFitTitle}
          </h3>
          <ul className="flex flex-col gap-3 text-sm leading-6 text-slate-200">
            {QUALIFICATION_COPY.notFitPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden="true" className="font-bold text-rose-300">✕</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      </div>
    </section>
  );
}
