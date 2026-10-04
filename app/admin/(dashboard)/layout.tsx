import Link from "next/link";

// Menu lateral do painel autenticado - só envolve as rotas dentro deste
// route group (inscrições, configurações), nunca /admin/login (que fica
// fora do grupo, sem menu). app/admin/layout.tsx (fora deste grupo) já
// cuida do tema escuro/fonte; este layout só acrescenta a navegação.
const NAV_ITEMS = [
  { href: "/admin/inscricoes", label: "Inscrições" },
  { href: "/admin/configuracoes", label: "Configurações" },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl">
      <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r border-[var(--wv-border)] px-4 py-10 sm:flex">
        <p className="mb-4 px-3 text-xs font-semibold tracking-wide text-[var(--wv-muted)] uppercase">
          Admin
        </p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--wv-muted)] transition-colors hover:bg-[var(--wv-surface)] hover:text-[var(--wv-text)]"
          >
            {item.label}
          </Link>
        ))}
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
