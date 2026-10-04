import { ABOUT_MENTOR } from "@/content/about";
import Image from "next/image";

// Componente apresentacional puro: seção "Sobre o mentor" (spec.md P2 "Sobre
// o mentor" AC1, MENT-23).
//
export default function AboutMentor() {
  return (
    <section
      id="sobre"
      className="bg-white px-6 py-20 md:px-16"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <div className="flex flex-row items-start gap-5 text-left md:gap-8">
        <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-[2rem] border-4 border-white bg-[var(--navy)] shadow-2xl ring-1 ring-blue-100 md:h-64 md:w-64 md:rounded-[2.5rem]">
          <Image
            src="/mentor.jpg"
            alt={`Foto de ${ABOUT_MENTOR.name}`}
            width={800}
            height={800}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex max-w-5xl flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">Quem é Ramon Lummertz?</p>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
              {ABOUT_MENTOR.name}
            </h2>
            <p className="text-sm font-semibold text-blue-700">
              {ABOUT_MENTOR.jobTitle}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {ABOUT_MENTOR.location}
            </p>
          </div>

          <div className="flex flex-col gap-4 text-justify text-sm leading-7 text-[var(--muted)]">
            {ABOUT_MENTOR.bioLong.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {ABOUT_MENTOR.stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 rounded-2xl bg-slate-100 p-5 text-center"
          >
            <dt className="text-2xl font-bold text-blue-700">
              {stat.value}
            </dt>
            <dd className="text-xs leading-5 text-[var(--muted)]">
              {stat.label}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="grid max-w-5xl gap-3 text-sm leading-6 text-[var(--muted)] md:grid-cols-2">
        {ABOUT_MENTOR.credentials.map((credential) => (
          <li key={credential} className="flex gap-2">
            <span aria-hidden="true" className="font-bold text-blue-700">✓</span>
            <span>{credential}</span>
          </li>
        ))}
      </ul>

      <a
        href={ABOUT_MENTOR.linkedinUrl}
        target="_blank"
        rel="noopener"
        className="w-fit rounded-full border border-[var(--navy)] px-5 py-2 text-sm font-bold text-[var(--navy)] transition-colors hover:bg-[var(--navy)] hover:text-white"
      >
        {ABOUT_MENTOR.linkedinLabel}
      </a>
      </div>
    </section>
  );
}
