import { ABOUT_MENTOR } from "@/content/about";

// Componente apresentacional puro: seção "Sobre o mentor" (spec.md P2 "Sobre
// o mentor" AC1, MENT-23).
//
// SPEC_DEVIATION: a foto real do mentor (public/mentor.jpg) ainda não existe
// (pendência do mentor, ver content.md §3.1/§14 item 2 e design.md P2
// Addendum). Enquanto o arquivo não existir, renderiza um placeholder visual
// (círculo com as iniciais "RL") no lugar da <img>. Trocar pela foto real é
// uma troca de asset (substituir este bloco por um <Image src="/mentor.jpg">
// quando o arquivo existir), não requer novo código.

export default function AboutMentor() {
  return (
    <section
      id="sobre"
      className="flex flex-col gap-10 px-6 py-16 md:px-16"
    >
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
        <div
          aria-label={`Foto de ${ABOUT_MENTOR.name} (placeholder temporário)`}
          className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-blue-700 text-3xl font-bold text-white dark:bg-blue-600"
        >
          {ABOUT_MENTOR.photoInitials}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
            {ABOUT_MENTOR.name}
          </h2>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
            {ABOUT_MENTOR.jobTitle}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {ABOUT_MENTOR.location}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 text-sm text-zinc-700 dark:text-zinc-300">
        {ABOUT_MENTOR.bioLong.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {ABOUT_MENTOR.stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-4 text-center dark:border-white/10 dark:bg-zinc-950"
          >
            <dt className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {stat.value}
            </dt>
            <dd className="text-xs text-zinc-600 dark:text-zinc-400">
              {stat.label}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        {ABOUT_MENTOR.credentials.map((credential) => (
          <li key={credential} className="flex gap-2">
            <span aria-hidden="true">✓</span>
            <span>{credential}</span>
          </li>
        ))}
      </ul>

      <a
        href={ABOUT_MENTOR.linkedinUrl}
        target="_blank"
        rel="noopener"
        className="w-fit rounded-full border border-black/10 px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
      >
        {ABOUT_MENTOR.linkedinLabel}
      </a>
    </section>
  );
}
