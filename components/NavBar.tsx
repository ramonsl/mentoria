"use client";

import { NAV_CTA, NAV_LINKS } from "@/content/conversion";

// Componente apresentacional: menu fixo no topo da página (spec.md P2
// "Reforço de conversão" AC3, MENT-36). `position: fixed` mantém a barra
// visível durante toda a rolagem, por isso é montado fora do fluxo normal de
// `<main>` em app/page.tsx (T51).
//
// O CTA é um <button> (não um <a href="#planos">) de propósito: o Hero (T31,
// não tocado nesta fase) já tem um link com o mesmo rótulo "Ver planos"
// apontando para a mesma âncora, e os testes e2e existentes de T36
// (`page.getByRole("link", { name: HERO_COPY.primaryCta.label })`) dependem
// de esse rótulo resolver a um único elemento com role "link" na página.
// Usando role "button" aqui, o CTA do menu não compete com esse locator.

export default function NavBar() {
  function handleCtaClick() {
    window.location.hash = NAV_CTA.href;
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 bg-zinc-950/90 px-6 py-4 text-zinc-50 backdrop-blur md:px-16">
      <ul className="flex items-center gap-6 text-sm font-medium">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="transition-colors hover:text-blue-400"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleCtaClick}
        className="rounded-full bg-blue-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
      >
        {NAV_CTA.label}
      </button>
    </nav>
  );
}
