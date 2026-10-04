// Lógica pura de filtro/ordenação/rótulos/CSV pro painel de inscrições do
// admin (.tasks/painel-inscricoes.md). Separada de lib/enrollments.ts (só
// persistência) do mesmo jeito que lib/enrollment-state.ts já separa a
// máquina de estados - nenhuma consulta nova: listEnrollments() já traz tudo
// e esta camada filtra/ordena/formata em memória.

import type { Enrollment, Plan } from "./enrollments";
import type { EnrollmentStatus } from "./enrollment-state";
import { PLANS } from "../content/plans";

export type StatusLabel = "Pendente" | "Pago" | "Expirado" | "Cancelado";

const STATUS_LABELS: Record<EnrollmentStatus, StatusLabel> = {
  pendente: "Pendente",
  paga: "Pago",
  ativa: "Pago",
  expirada: "Expirado",
  cancelada: "Cancelado",
};

const STATUSES_BY_LABEL: Record<StatusLabel, EnrollmentStatus[]> = {
  Pendente: ["pendente"],
  Pago: ["paga", "ativa"],
  Expirado: ["expirada"],
  Cancelado: ["cancelada"],
};

export function statusLabelFor(status: EnrollmentStatus): StatusLabel {
  return STATUS_LABELS[status];
}

export function planNameFor(slug: Plan): string {
  return PLANS.find((plan) => plan.slug === slug)?.name ?? slug;
}

export interface EnrollmentFilters {
  status?: StatusLabel;
  plano?: Plan;
  de?: string; // yyyy-mm-dd, inclusive
  ate?: string; // yyyy-mm-dd, inclusive
  q?: string;
}

function matchesStatus(enrollment: Enrollment, label: StatusLabel): boolean {
  return (STATUSES_BY_LABEL[label] as string[]).includes(enrollment.status);
}

function matchesDateRange(
  enrollment: Enrollment,
  de?: string,
  ate?: string,
): boolean {
  if (!de && !ate) return true;
  if (!enrollment.paidAt) return false;

  const paidDay = enrollment.paidAt.toISOString().slice(0, 10);
  if (de && paidDay < de) return false;
  if (ate && paidDay > ate) return false;
  return true;
}

function matchesQuery(enrollment: Enrollment, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    enrollment.customerName.toLowerCase().includes(needle) ||
    enrollment.customerEmail.toLowerCase().includes(needle)
  );
}

/**
 * Applies every provided filter with AND semantics. An omitted filter never
 * excludes anything.
 */
export function filterEnrollments(
  enrollments: Enrollment[],
  filters: EnrollmentFilters,
): Enrollment[] {
  return enrollments.filter((enrollment) => {
    if (filters.status && !matchesStatus(enrollment, filters.status)) {
      return false;
    }
    if (filters.plano && enrollment.plan !== filters.plano) {
      return false;
    }
    if (!matchesDateRange(enrollment, filters.de, filters.ate)) {
      return false;
    }
    if (filters.q && !matchesQuery(enrollment, filters.q)) {
      return false;
    }
    return true;
  });
}

/**
 * Most recently created first (.tasks/painel-inscricoes.md criterion 1) -
 * independent of listEnrollments()'s own default order (closest to expiring
 * first), which stays untouched for any other caller.
 */
export function sortByCreatedAtDesc(enrollments: Enrollment[]): Enrollment[] {
  return [...enrollments].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

function formatDateBr(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

export function formatCentsBrl(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export interface EnrollmentRow {
  name: string;
  email: string;
  plan: string;
  status: StatusLabel;
  paidAt: string;
  expiresAt: string;
}

export function toDisplayRow(enrollment: Enrollment): EnrollmentRow {
  return {
    name: enrollment.customerName,
    email: enrollment.customerEmail,
    plan: planNameFor(enrollment.plan),
    status: statusLabelFor(enrollment.status),
    paidAt: formatDateBr(enrollment.paidAt),
    expiresAt: formatDateBr(enrollment.expiresAt),
  };
}

export interface LoadFilteredResult {
  enrollments: Enrollment[];
  loadError: boolean;
}

/**
 * Fetches, filters and sorts in one step, turning a failed fetch into
 * `loadError: true` instead of throwing - the list page and the CSV export
 * both call this so their failure handling (criteria 5, 21) is the same
 * code, proven once. `fetchEnrollments` is injected the same way
 * `db: Db = getDb()` already is throughout lib/enrollments.ts, so a test can
 * pass a throwing fake without needing a live database or a page-rendering
 * harness this project doesn't have.
 */
export async function loadFilteredEnrollments(
  filters: EnrollmentFilters,
  fetchEnrollments: () => Promise<Enrollment[]>,
): Promise<LoadFilteredResult> {
  try {
    const all = await fetchEnrollments();
    return {
      enrollments: sortByCreatedAtDesc(filterEnrollments(all, filters)),
      loadError: false,
    };
  } catch (err) {
    console.error("[painel-inscricoes] falha ao carregar inscrições:", err);
    return { enrollments: [], loadError: true };
  }
}

const CSV_COLUMNS = ["Nome", "E-mail", "Plano", "Status", "Pago em", "Expira em"];

function escapeCsvField(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Same columns/order/display values as the table (criterion 18). `;` as
 * delimiter and a UTF-8 BOM prefix so the file opens correctly accented in
 * Excel pt-BR, whose locale uses `,` as the decimal separator and therefore
 * expects `;` to separate CSV fields (criterion 19).
 */
export function toCsv(enrollments: Enrollment[]): string {
  const rows = enrollments.map(toDisplayRow).map((row) =>
    [row.name, row.email, row.plan, row.status, row.paidAt, row.expiresAt]
      .map(escapeCsvField)
      .join(";"),
  );
  return ["﻿" + CSV_COLUMNS.join(";"), ...rows].join("\r\n");
}
