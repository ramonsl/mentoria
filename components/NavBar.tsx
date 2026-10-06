"use client";

import Image from "next/image";
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
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 border-b border-white/10 bg-[var(--navy-deep)]/90 px-6 py-3 text-zinc-50 backdrop-blur md:px-16">
      <a href="#" className="flex items-center gap-2 text-sm font-bold tracking-wide text-white">
        <Image src="/logo-rl.svg" alt="" width={32} height={32} className="h-8 w-8" />
        <span className="hidden sm:inline">RAMON LUMMERTZ</span>
      </a>
      <ul className="hidden items-center gap-4 text-sm font-medium sm:flex sm:gap-6">
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
        className="rounded-full bg-[var(--warm)] px-4 py-2 text-sm font-bold text-[var(--navy-deep)] transition-colors hover:bg-amber-300 sm:px-5"
      >
        {NAV_CTA.label}
      </button>
    </nav>
  );
}
