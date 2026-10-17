"use client";

import { FINAL_CTA_COPY } from "@/content/copy";

// Componente apresentacional: chamada final antes do rodapé (spec.md P2
// "Reforço de conversão" AC2, MENT-39). Conteúdo já existia em
// `content/copy.ts` desde T7, nunca tinha sido renderizado.
//
// O botão é um <button> (não um <a href="#planos">) de propósito: o Hero
// (T31, não tocado nesta fase) já tem um link com o mesmo rótulo
// "Ver planos" apontando para a mesma âncora, e os testes e2e existentes de
// T36 (`page.getByRole("link", { name: HERO_COPY.primaryCta.label })`)
// dependem de esse rótulo resolver a um único elemento com role "link" na
// página. Usando role "button" aqui, este CTA não compete com esse locator.
// A seção ganha `id="cta-final"` para permitir escopar este botão (que
// compartilha o rótulo "Ver planos" com o CTA do NavBar, T44) sem
// ambiguidade nos testes e2e de T51.

export default function FinalCta() {
  function handleClick() {
    window.location.hash = FINAL_CTA_COPY.buttonHref;
  }

  return (
    <section
      id="cta-final"
      className="mx-6 mb-12 flex flex-col items-center gap-5 rounded-[2rem] bg-[var(--navy-deep)] px-6 py-16 text-center text-white md:mx-16 md:px-16"
    >
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-200">O próximo passo é seu</p>
      <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
        {FINAL_CTA_COPY.title}
      </h2>
      <p className="max-w-xl text-base leading-7 text-slate-300">
        {FINAL_CTA_COPY.text}
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-full bg-[var(--warm)] px-7 py-3 text-base font-bold text-[var(--navy-deep)] transition-transform hover:-translate-y-0.5 hover:bg-amber-300"
      >
        {FINAL_CTA_COPY.buttonLabel}
      </button>
      <p className="text-xs leading-5 text-slate-400">{FINAL_CTA_COPY.subtext}</p>
    </section>
  );
}
