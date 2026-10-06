import { PAIN_POINTS_COPY } from "@/content/conversion";

// Componente apresentacional puro: seção de dores, uma coluna por
// público-alvo (spec.md P2 "Reforço de conversão" AC4, MENT-34).

export default function PainPoints() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 md:px-16">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">Antes de enviar mais uma candidatura</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">{PAIN_POINTS_COPY.title}</h2>
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">{PAIN_POINTS_COPY.subtitle}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {PAIN_POINTS_COPY.columns.map((column) => (
          <div
            key={column.title}
            className="flex flex-col gap-5 rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--warm)]" />
              <h3 className="text-xl font-bold text-[var(--ink)]">
              {column.title}
              </h3>
            </div>
            <ul className="flex flex-col gap-3 text-sm leading-6 text-[var(--muted)]">
              {column.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span aria-hidden="true" className="font-bold text-blue-600">—</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mx-auto max-w-2xl text-center text-base font-semibold leading-7 text-[var(--ink)]">
        {PAIN_POINTS_COPY.closing}
      </p>
    </section>
  );
}
