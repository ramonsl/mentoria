import { HERO_COPY } from "@/content/copy";

// Componente apresentacional puro: seção de abertura da landing (spec.md P2
// "Hero, rodapé e política de privacidade" AC1-AC3, MENT-29/30/31). CTAs são
// âncoras HTML simples - o navegador resolve o scroll, sem JS.

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--navy-deep)] px-6 pb-16 pt-32 text-white md:px-16 md:pb-24 md:pt-40">
      <div aria-hidden="true" className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
        <div className="flex flex-col items-start gap-6 text-left">
          <span className="rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-100">
            {HERO_COPY.eyebrow}
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            {HERO_COPY.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            {HERO_COPY.subtitle}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={HERO_COPY.primaryCta.href} className="rounded-full bg-[var(--warm)] px-6 py-3 text-center text-base font-bold text-[var(--navy-deep)] transition-transform hover:-translate-y-0.5 hover:bg-amber-300">
              {HERO_COPY.primaryCta.label}
            </a>
            <a href={HERO_COPY.secondaryCta.href} className="rounded-full border border-white/25 px-6 py-3 text-center text-base font-medium text-white transition-colors hover:bg-white/10">
              {HERO_COPY.secondaryCta.label}
            </a>
          </div>
          <p className="max-w-2xl text-xs leading-5 text-slate-400">{HERO_COPY.trustBadge}</p>
        </div>

        <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-sm">
          <div className="rounded-[1.5rem] bg-slate-50 p-6 text-[var(--ink)] shadow-lg">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">O foco da mentoria</p>
            <p className="mt-3 text-2xl font-bold leading-tight">Transformar sua experiência em posicionamento, oportunidades e próximos passos claros.</p>
            <div className="mt-7 space-y-3">
              {[
                "Currículo que passa pela triagem",
                "LinkedIn com posicionamento claro",
                "GitHub que mostra seu raciocínio",
                "Preparação para entrevistas",
                "Busca ativa de vagas conforme seu mapeamento",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">0{index + 1}</span>
                  <span className="text-sm font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-2xl border border-white/15 bg-[var(--navy)] px-4 py-3 text-sm font-semibold text-white shadow-xl">Feedback direto. Próximos passos claros.</div>
        </div>
      </div>
    </section>
  );
}
