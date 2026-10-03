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
      className="flex flex-col items-center gap-4 px-6 py-16 text-center md:px-16"
    >
      <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
        {FINAL_CTA_COPY.title}
      </h2>
      <p className="text-base text-zinc-600 dark:text-zinc-400">
        {FINAL_CTA_COPY.text}
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-full bg-blue-700 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-800"
      >
        {FINAL_CTA_COPY.buttonLabel}
      </button>
    </section>
  );
}
