import { HERO_COPY } from "@/content/copy";

// Componente apresentacional puro: seção de abertura da landing (spec.md P2
// "Hero, rodapé e política de privacidade" AC1-AC3, MENT-29/30/31). CTAs são
// âncoras HTML simples - o navegador resolve o scroll, sem JS.

export default function Hero() {
  return (
    <section className="flex flex-col items-center gap-6 px-6 py-20 text-center md:px-16 md:py-28">
      <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
        {HERO_COPY.eyebrow}
      </span>

      <h1 className="max-w-3xl text-3xl font-bold text-black dark:text-zinc-50 md:text-5xl">
        {HERO_COPY.title}
      </h1>

      <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400 md:text-lg">
        {HERO_COPY.subtitle}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={HERO_COPY.primaryCta.href}
          className="rounded-full bg-blue-700 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-800"
        >
          {HERO_COPY.primaryCta.label}
        </a>
        <a
          href={HERO_COPY.secondaryCta.href}
          className="rounded-full border border-black/10 px-6 py-3 text-base font-medium text-black transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
        >
          {HERO_COPY.secondaryCta.label}
        </a>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {HERO_COPY.trustBadge}
      </p>
    </section>
  );
}
