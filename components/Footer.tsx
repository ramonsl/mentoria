import { FOOTER_COPY } from "@/content/copy";

// Componente apresentacional puro: rodapé com copyright e links (spec.md P2
// "Hero, rodapé e política de privacidade" AC4, MENT-32).

export default function Footer() {
  const copyright = FOOTER_COPY.copyrightTemplate.replace(
    "{year}",
    String(new Date().getFullYear()),
  );

  return (
    <footer className="flex flex-col items-center gap-4 border-t border-black/10 px-6 py-10 text-center text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400 md:px-16">
      <p>{copyright}</p>
      <nav className="flex flex-wrap justify-center gap-4">
        {FOOTER_COPY.links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-zinc-600 underline-offset-2 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
