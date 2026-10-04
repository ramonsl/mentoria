"use client";

import { useState } from "react";
import { TESTIMONIALS, TESTIMONIALS_COPY } from "@/content/testimonials";

// Componente apresentacional puro: seção de prova social com recomendações
// reais de ex-alunos do LinkedIn (spec.md P2 "Recomendações de ex-alunos"
// AC1-AC2, MENT-27, MENT-40).
//
// Os cards usam <li>, não <article> - a suíte e2e existente (T13) conta
// `page.getByRole("article")` esperando exatamente 2 (os cards de
// PlanComparison); usar a mesma role aqui quebraria aquele teste.
//
// Exibidos em grade de até PAGE_SIZE cards por página, com navegação para
// avançar/voltar em blocos de PAGE_SIZE quando houver mais depoimentos do
// que cabem em uma página. Sem foto nem avatar: as recomendações do LinkedIn
// autorizam a publicação do texto, não o uso da imagem de cada pessoa em
// material de divulgação da mentoria.

const PAGE_SIZE = 5;

export default function Testimonials() {
  const totalPages = Math.ceil(TESTIMONIALS.length / PAGE_SIZE);
  const [page, setPage] = useState(0);

  const start = page * PAGE_SIZE;
  const visibleTestimonials = TESTIMONIALS.slice(start, start + PAGE_SIZE);

  function showPrevious() {
    setPage((current) => (current === 0 ? totalPages - 1 : current - 1));
  }

  function showNext() {
    setPage((current) => (current + 1) % totalPages);
  }

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

      <div aria-label="Depoimentos de ex-alunos" aria-live="polite" className="flex flex-col gap-8">
        {totalPages > 1 && (
          <p className="sr-only">
            Página {page + 1} de {totalPages}
          </p>
        )}
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTestimonials.map((testimonial) => (
            <li
              key={testimonial.name}
              className="flex flex-col gap-4 rounded-3xl border border-white bg-white p-7 shadow-sm"
            >
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
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2" aria-label="Selecionar página de depoimentos">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Mostrar depoimentos ${index * PAGE_SIZE + 1} a ${Math.min(
                    (index + 1) * PAGE_SIZE,
                    TESTIMONIALS.length,
                  )}`}
                  aria-current={page === index ? "true" : undefined}
                  onClick={() => setPage(index)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    page === index
                      ? "bg-[var(--navy)] text-white"
                      : "bg-white text-[var(--muted)] hover:bg-blue-100"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Depoimentos anteriores"
                onClick={showPrevious}
                className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold text-[var(--navy)] transition-colors hover:bg-blue-50"
              >
                Anterior
              </button>
              <button
                type="button"
                aria-label="Mais depoimentos"
                onClick={showNext}
                className="rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
