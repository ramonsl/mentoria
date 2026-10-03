import { HOW_IT_WORKS_STEPS } from "@/content/copy";

// Componente apresentacional puro: seção "Como funciona" (spec.md P2
// "Reforço de conversão" AC1, MENT-38). Conteúdo já existia em
// `content/copy.ts` desde T7, nunca tinha sido renderizado.

export default function HowItWorks() {
  return (
    <section className="flex flex-col gap-8 px-6 py-16 md:px-16">
      <h2 className="text-center text-2xl font-semibold text-black dark:text-zinc-50">
        Como funciona
      </h2>

      <ol className="grid gap-6 md:grid-cols-4">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <li
            key={step}
            className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950"
          >
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {index + 1}
            </span>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
