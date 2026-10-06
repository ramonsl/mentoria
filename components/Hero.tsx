import { HERO_COPY } from "@/content/copy";

// Componente apresentacional puro: seção de abertura da landing (spec.md P2
// "Hero, rodapé e política de privacidade" AC1-AC3, MENT-29/30/31). CTAs são
// âncoras HTML simples - o navegador resolve o scroll, sem JS.
//
// O card "O foco da mentoria" que vivia aqui foi extraído pra sua própria
// seção (T8, ajustes 2026-10-06) - ver components/MentoringFocus.tsx.

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--navy-deep)] px-6 pb-16 pt-32 text-white md:px-16 md:pb-24 md:pt-40">
      <div aria-hidden="true" className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-100">
          {HERO_COPY.eyebrow}
        </span>
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
          {HERO_COPY.title}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
          {HERO_COPY.subtitle}
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <a href={HERO_COPY.primaryCta.href} className="w-full max-w-xs rounded-full bg-[var(--warm)] px-6 py-3 text-center text-base font-bold text-[var(--navy-deep)] transition-transform hover:-translate-y-0.5 hover:bg-amber-300">
            {HERO_COPY.primaryCta.label}
          </a>
          <a href={HERO_COPY.secondaryCta.href} className="w-full max-w-xs rounded-full border border-white/25 px-6 py-3 text-center text-base font-medium text-white transition-colors hover:bg-white/10">
            {HERO_COPY.secondaryCta.label}
          </a>
        </div>
        <p className="max-w-2xl text-center text-xs leading-5 text-slate-400">{HERO_COPY.trustBadge}</p>
      </div>
    </section>
  );
}
