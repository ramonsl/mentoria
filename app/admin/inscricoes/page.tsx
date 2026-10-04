import Link from "next/link";
import { PLANS } from "@/content/plans";
import { listEnrollments, type Enrollment } from "@/lib/enrollments";
import {
  loadFilteredEnrollments,
  toDisplayRow,
  type EnrollmentFilters,
  type StatusLabel,
} from "@/lib/enrollment-filters";
import { statusAccent } from "@/lib/admin-theme";

// Lista de inscrições do mentor (spec.md P2 "Lista de inscrições para o
// mentor", MENT-25; .tasks/painel-inscricoes.md) - protegida por
// middleware.ts (matcher `/admin/inscricoes/:path*`, cobre esta página, o
// detalhe e a exportação). Mostra status, filtros, busca e exportação CSV
// por cima do que `listEnrollments()` já traz - sem query nova, filtro e
// ordenação acontecem em memória (ver Landing de .checks/painel-inscricoes.md).
//
// Nunca pode ser pré-renderizada estaticamente: é uma página protegida com
// dados ao vivo por requisição (e sem isso, `next build` tentaria gerar esta
// página em tempo de build, antes de qualquer env var/banco estar
// configurado, e falharia).
export const dynamic = "force-dynamic";

const STATUS_LABELS: StatusLabel[] = ["Pendente", "Pago", "Expirado", "Cancelado"];

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v ? v.trim() : undefined;
}

function parseFilters(searchParams: SearchParams): EnrollmentFilters {
  const status = firstValue(searchParams.status);
  const plano = firstValue(searchParams.plano);
  return {
    status: STATUS_LABELS.includes(status as StatusLabel)
      ? (status as StatusLabel)
      : undefined,
    plano: PLANS.some((plan) => plan.slug === plano)
      ? (plano as Enrollment["plan"])
      : undefined,
    de: firstValue(searchParams.de),
    ate: firstValue(searchParams.ate),
    q: firstValue(searchParams.q),
  };
}

function toQueryString(filters: EnrollmentFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.plano) params.set("plano", filters.plano);
  if (filters.de) params.set("de", filters.de);
  if (filters.ate) params.set("ate", filters.ate);
  if (filters.q) params.set("q", filters.q);
  return params.toString();
}

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = parseFilters(await searchParams);
  const { enrollments, loadError } = await loadFilteredEnrollments(
    filters,
    listEnrollments,
  );

  const exportQuery = toQueryString(filters);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Inscrições</h1>
        <a
          href={`/admin/inscricoes/export${exportQuery ? `?${exportQuery}` : ""}`}
          className="rounded-full px-4 py-2 text-sm font-medium text-[var(--wv-accent)]"
        >
          Exportar CSV
        </a>
      </div>

      <form
        method="get"
        className="admin-card flex flex-wrap items-end gap-3 text-sm text-[var(--wv-muted)]"
      >
        <label className="flex flex-col gap-1">
          Status
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className="rounded-lg border border-[var(--wv-border)] bg-[var(--wv-bg)] px-3 py-2 text-[var(--wv-text)]"
          >
            <option value="">Todos</option>
            {STATUS_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          Plano
          <select
            name="plano"
            defaultValue={filters.plano ?? ""}
            className="rounded-lg border border-[var(--wv-border)] bg-[var(--wv-bg)] px-3 py-2 text-[var(--wv-text)]"
          >
            <option value="">Todos</option>
            {PLANS.map((plan) => (
              <option key={plan.slug} value={plan.slug}>
                {plan.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          De
          <input
            type="date"
            name="de"
            defaultValue={filters.de ?? ""}
            className="rounded-lg border border-[var(--wv-border)] bg-[var(--wv-bg)] px-3 py-2 text-[var(--wv-text)]"
          />
        </label>

        <label className="flex flex-col gap-1">
          Até
          <input
            type="date"
            name="ate"
            defaultValue={filters.ate ?? ""}
            className="rounded-lg border border-[var(--wv-border)] bg-[var(--wv-bg)] px-3 py-2 text-[var(--wv-text)]"
          />
        </label>

        <label className="flex flex-col gap-1">
          Buscar
          <input
            type="text"
            name="q"
            placeholder="Nome ou e-mail"
            defaultValue={filters.q ?? ""}
            className="rounded-lg border border-[var(--wv-border)] bg-[var(--wv-bg)] px-3 py-2 text-[var(--wv-text)]"
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-[var(--wv-accent)] px-5 py-2 text-sm font-medium text-[var(--wv-bg)]"
        >
          Filtrar
        </button>
      </form>

      {loadError ? (
        <p className="admin-alert text-sm">
          Não foi possível carregar as inscrições. Tente novamente.
        </p>
      ) : enrollments.length === 0 ? (
        <p className="admin-card text-sm text-[var(--wv-muted)]">
          Nenhuma inscrição encontrada.
        </p>
      ) : (
        <div className="admin-card overflow-x-auto" style={{ padding: 0 }}>
          <table className="w-full text-left text-sm text-[var(--wv-muted)]">
            <thead>
              <tr className="border-b border-[var(--wv-border)]">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">E-mail</th>
                <th className="px-5 py-3 font-medium">Plano</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Pago em</th>
                <th className="px-5 py-3 font-medium">Expira em</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => {
                const row = toDisplayRow(enrollment);
                return (
                  <tr key={enrollment.id}>
                    <td className="px-5 py-3 text-[var(--wv-text)]">{row.name}</td>
                    <td className="px-5 py-3">{row.email}</td>
                    <td className="px-5 py-3">{row.plan}</td>
                    <td
                      className="px-5 py-3 font-medium"
                      style={{ color: statusAccent(row.status) }}
                    >
                      {row.status}
                    </td>
                    <td className="px-5 py-3">{row.paidAt}</td>
                    <td className="px-5 py-3">{row.expiresAt}</td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/inscricoes/${enrollment.id}`}
                        className="font-medium text-[var(--wv-accent)]"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
