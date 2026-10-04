import { FOOTER_COPY } from "@/content/copy";

// Componente apresentacional puro: rodapé com copyright e links (spec.md P2
// "Hero, rodapé e política de privacidade" AC4, MENT-32).

export default function Footer() {
  const copyright = FOOTER_COPY.copyrightTemplate.replace(
    "{year}",
    String(new Date().getFullYear()),
  );

  return (
    <footer className="flex flex-col items-center gap-4 bg-[var(--navy-deep)] px-6 py-12 text-center text-sm text-slate-300 md:px-16">
      <p>{copyright}</p>
      <nav className="flex flex-wrap justify-center gap-4">
        {FOOTER_COPY.links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-slate-300 underline-offset-2 hover:text-white hover:underline"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
