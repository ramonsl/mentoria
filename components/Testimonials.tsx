"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { TESTIMONIALS, TESTIMONIALS_COPY } from "@/content/testimonials";

// Componente apresentacional puro: seção de prova social com recomendações
// reais de ex-alunos do LinkedIn (spec.md P2 "Recomendações de ex-alunos"
// AC1-AC2, MENT-27, MENT-40).
//
// Os cards usam <li>, não <article> - a suíte e2e existente (T13) conta
// `page.getByRole("article")` esperando exatamente 2 (os cards de
// PlanComparison); usar a mesma role aqui quebraria aquele teste.
//
// Carrossel (T11, ajustes 2026-10-06): 1 depoimento por vez no mobile, 2 no
// tablet, 3 no desktop (flex-basis responsivo em cada slide, não grid).
// Autoplay a cada 6s via embla-carousel-autoplay, pausando no hover/toque
// (stopOnMouseEnter + stopOnInteraction: false) e desligado por completo
// quando o usuário pede "reduzir movimento" (prefers-reduced-motion) - nesse
// caso o carrossel some os passos manualmente (arrastar, bolinhas, setas).
// Sem foto nem avatar: as recomendações do LinkedIn autorizam a publicação
// do texto, não o uso da imagem de cada pessoa em material de divulgação da
// mentoria.

const AUTOPLAY_DELAY_MS = 6000;

function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    function handleChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches);
    }

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

export default function Testimonials() {
  const prefersReducedMotion = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    prefersReducedMotion
      ? []
      : [Autoplay({ delay: AUTOPLAY_DELAY_MS, stopOnInteraction: false, stopOnMouseEnter: true })],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollSnaps = emblaApi?.scrollSnapList() ?? [];

  return (
    <section className="bg-slate-100 px-6 py-20 md:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">Quem já caminhou com o Ramon</p>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">
          {TESTIMONIALS_COPY.title}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          {TESTIMONIALS_COPY.subtitle}
        </p>
      </div>

      <div
        aria-label="Depoimentos de ex-alunos"
        aria-roledescription="carrossel"
        className="relative flex flex-col gap-6"
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <ul className="flex">
            {TESTIMONIALS.map((testimonial) => (
              <li
                key={testimonial.name}
                className="flex min-w-0 flex-[0_0_100%] flex-col gap-4 px-2 sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%]"
              >
                <div className="flex h-full flex-col gap-4 rounded-3xl border border-white bg-white p-7 shadow-sm">
                  <span aria-hidden="true" className="text-4xl font-serif leading-none text-blue-300">“</span>
                  <p className="-mt-4 text-sm leading-7 text-[var(--muted)]">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-[var(--ink)]">
                      {testimonial.name}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {testimonial.role}
                    </span>
                  </div>
                  <a
                    href={testimonial.linkedinUrl}
                    target="_blank"
                    rel="noopener"
                    className="w-fit text-xs font-bold text-blue-700 underline-offset-2 hover:underline"
                  >
                    Ver no LinkedIn
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label="Depoimento anterior"
            disabled={!canScrollPrev}
            onClick={() => emblaApi?.scrollPrev()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--navy)] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>

          <div className="flex gap-2" aria-label="Selecionar depoimento">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Ir para o grupo de depoimentos ${index + 1}`}
                aria-current={selectedIndex === index ? "true" : undefined}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  selectedIndex === index ? "bg-[var(--navy)]" : "bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Próximo depoimento"
            disabled={!canScrollNext}
            onClick={() => emblaApi?.scrollNext()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--navy)] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
      </div>
    </section>
  );
}
