import { HOW_IT_WORKS_STEPS } from "@/content/copy";

// Componente apresentacional puro: seção "Como funciona" (spec.md P2
// "Reforço de conversão" AC1, MENT-38). Conteúdo já existia em
// `content/copy.ts` desde T7, nunca tinha sido renderizado.

export default function HowItWorks() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 md:px-16">
      <div className="max-w-xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">Da clareza à oportunidade</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">Como funciona</h2>
      </div>

      <ol className="grid gap-4 md:grid-cols-4">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <li
            key={step}
            className="relative flex flex-col gap-4 border-l-2 border-blue-200 py-3 pl-5 md:border-l-0 md:border-t-2 md:px-1 md:pt-5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--navy)] text-sm font-bold text-white">0{index + 1}</span>
            <p className="text-sm leading-6 text-[var(--muted)]">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
