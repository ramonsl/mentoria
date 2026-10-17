import { SOLUTION_COPY } from "@/content/conversion";

export default function Solution() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 md:px-16">
      <div className="flex max-w-2xl flex-col gap-4">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">{SOLUTION_COPY.eyebrow}</p>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">{SOLUTION_COPY.title}</h2>
        <p className="text-lg font-semibold leading-7 text-[var(--ink)]">{SOLUTION_COPY.subtitle}</p>
        {SOLUTION_COPY.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-base leading-7 text-[var(--muted)]">{paragraph}</p>
        ))}
      </div>

      <p className="rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.12em] text-blue-800">
        {SOLUTION_COPY.tagline}
      </p>

      <div className="flex flex-col items-center gap-5 text-center">
        <p className="max-w-2xl text-base font-semibold leading-7 text-[var(--ink)]">{SOLUTION_COPY.closing}</p>
        <a
          href={SOLUTION_COPY.cta.href}
          className="rounded-full bg-[var(--warm)] px-7 py-3 text-base font-bold text-[var(--navy-deep)] transition-transform hover:-translate-y-0.5 hover:bg-amber-300"
        >
          {SOLUTION_COPY.cta.label}
        </a>
      </div>
    </section>
  );
}
