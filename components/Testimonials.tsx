import { TESTIMONIALS, TESTIMONIALS_COPY } from "@/content/testimonials";

// Componente apresentacional puro: seção de prova social com recomendações
// reais de ex-alunos do LinkedIn (spec.md P2 "Recomendações de ex-alunos"
// AC1-AC2, MENT-27, MENT-40).
//
// Os cards usam <li>, não <article> - a suíte e2e existente (T13) conta
// `page.getByRole("article")` esperando exatamente 2 (os cards de
// PlanComparison); usar a mesma role aqui quebraria aquele teste.

export default function Testimonials() {
  return (
    <section className="flex flex-col gap-10 px-6 py-16 md:px-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
          {TESTIMONIALS_COPY.title}
        </h2>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          {TESTIMONIALS_COPY.subtitle}
        </p>
      </div>

      <ul className="grid gap-6 md:grid-cols-2">
        {TESTIMONIALS.map((testimonial) => (
          <li
            key={testimonial.name}
            className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950"
          >
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-black dark:text-zinc-50">
                {testimonial.name}
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {testimonial.role}
              </span>
            </div>
            <a
              href={testimonial.linkedinUrl}
              target="_blank"
              rel="noopener"
              className="w-fit text-xs font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
            >
              Ver no LinkedIn
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
