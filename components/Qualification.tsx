import { QUALIFICATION_COPY } from "@/content/conversion";

// Componente apresentacional puro: seção "pra quem é / não é" (spec.md P2
// "Reforço de conversão" AC5, MENT-35).

export default function Qualification() {
  return (
    <section className="flex flex-col gap-10 px-6 py-16 md:px-16">
      <h2 className="text-center text-2xl font-semibold text-black dark:text-zinc-50">
        {QUALIFICATION_COPY.title}
      </h2>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
            {QUALIFICATION_COPY.fitTitle}
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-zinc-700 dark:text-zinc-300">
            {QUALIFICATION_COPY.fitPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden="true">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
            {QUALIFICATION_COPY.notFitTitle}
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-zinc-700 dark:text-zinc-300">
            {QUALIFICATION_COPY.notFitPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden="true">✕</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
