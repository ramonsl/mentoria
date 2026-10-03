import { PRIVACY_COPY } from "@/content/privacy";

// Página de política de privacidade (LGPD) - spec.md P2 "Hero, rodapé e
// política de privacidade" AC5, MENT-33.

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-8 px-6 py-16 md:px-0">
      <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
        {PRIVACY_COPY.title}
      </h1>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {PRIVACY_COPY.intro}
      </p>

      {PRIVACY_COPY.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
            {section.heading}
          </h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {section.body}
          </p>
        </section>
      ))}
    </main>
  );
}
