"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Formulário de senha do admin (spec.md P2 "Lista de inscrições para o
// mentor", MENT-25). Submete para POST /api/admin/login (T37); em sucesso,
// navega para /admin/inscricoes - o cookie setado pela resposta já vale na
// navegação seguinte (o browser anexa cookies em qualquer requisição à mesma
// origem, inclusive a chamada RSC do router do Next.js). Em 401, mostra erro
// inline sem navegar (comportamento de ponta a ponta - inclusive o redirect
// de senha certa - provado em T41, não isoladamente aqui).

const GENERIC_LOGIN_ERROR = "Senha incorreta. Tente novamente.";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setIsLoading(false);
        setError(GENERIC_LOGIN_ERROR);
        return;
      }

      router.push("/admin/inscricoes");
    } catch {
      setIsLoading(false);
      setError(GENERIC_LOGIN_ERROR);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--wv-muted)] uppercase">Mentoria</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Acesso restrito</h1>
        <p className="mt-2 text-sm text-[var(--wv-muted)]">Entre para gerenciar suas inscrições.</p>
      </div>

      <form onSubmit={handleSubmit} className="admin-card flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm text-[var(--wv-muted)]">
          Senha
          <input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="rounded-md border border-[var(--wv-border)] bg-[var(--wv-surface)] px-4 py-2 text-[var(--wv-text)]"
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="admin-primary-button w-full px-5 py-3 text-base font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          Entrar
        </button>

        {error ? (
          <p role="alert" className="admin-alert text-sm">
            {error}
          </p>
        ) : null}
      </form>
    </main>
  );
}
