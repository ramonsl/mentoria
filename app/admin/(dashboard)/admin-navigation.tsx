"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin/inscricoes", label: "Inscrições" },
  { href: "/admin/comercial", label: "Preços e cupons" },
  { href: "/admin/eventos", label: "Evento" },
  { href: "/admin/configuracoes", label: "Configurações" },
] as const;

export function AdminNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r border-[var(--wv-border)] bg-[var(--wv-surface)] px-5 py-10 sm:flex">
        <p className="mb-8 px-3 text-[11px] font-semibold tracking-[0.14em] text-[var(--wv-text)] uppercase">
          Mentoria
        </p>
        <nav aria-label="Navegação do admin" className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/admin/inscricoes" && pathname.startsWith("/admin/inscricoes/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#eef2ff] text-[var(--wv-accent)]"
                    : "text-[var(--wv-muted)] hover:bg-[#f7f7f8] hover:text-[var(--wv-text)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <header className="border-b border-[var(--wv-border)] bg-[var(--wv-surface)] sm:hidden">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="admin-navigation"
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setIsOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-md border border-[var(--wv-border)] text-[var(--wv-text)] transition-colors hover:border-[var(--wv-accent)] hover:text-[var(--wv-accent)] focus-visible:outline-3 focus-visible:outline-[var(--wv-focus)]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-5"
            >
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
          <Link
            href="/admin/inscricoes"
            className="text-[11px] font-semibold tracking-[0.14em] text-[var(--wv-text)] uppercase"
          >
            Mentoria
          </Link>
        </div>

        <p className="text-xs text-[var(--wv-muted)]">Admin</p>
      </div>

        {isOpen ? (
          <>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-20 cursor-default bg-[rgb(10_10_10_/_18%)]"
          />
          <nav
            id="admin-navigation"
            aria-label="Navegação do admin"
            className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-[var(--wv-border)] bg-[var(--wv-surface)] p-5 shadow-[12px_0_28px_rgb(10_10_10_/_10%)]"
          >
            <div className="mb-8 flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--wv-text)] uppercase">Mentoria</p>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setIsOpen(false)}
                className="flex size-9 items-center justify-center rounded-md border border-[var(--wv-border)] text-[var(--wv-muted)] transition-colors hover:border-[var(--wv-accent)] hover:text-[var(--wv-accent)]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/admin/inscricoes" && pathname.startsWith("/admin/inscricoes/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#eef2ff] text-[var(--wv-accent)]"
                        : "text-[var(--wv-muted)] hover:bg-[#f7f7f8] hover:text-[var(--wv-text)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          </>
        ) : null}
      </header>
    </>
  );
}
