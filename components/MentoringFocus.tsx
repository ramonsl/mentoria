import { FOCUS_COPY } from "@/content/conversion";

// Componente apresentacional puro: seção "O foco da mentoria" (T8, ajustes
// 2026-10-06), extraída do card flutuante que vivia dentro do Hero. Grid de
// 2-3 colunas no desktop, lista vertical no mobile.

export default function MentoringFocus() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 md:px-16">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">{FOCUS_COPY.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">{FOCUS_COPY.title}</h2>
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">{FOCUS_COPY.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FOCUS_COPY.cards.map((card, index) => (
          <div
            key={card.title}
            className="flex flex-col gap-3 rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              0{index + 1}
            </span>
            <h3 className="text-lg font-bold text-[var(--ink)]">{card.title}</h3>
            <p className="text-sm leading-6 text-[var(--muted)]">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
