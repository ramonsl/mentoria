// GET /admin/inscricoes/export (.tasks/painel-inscricoes.md critérios 18-21)
// - exporta em CSV a mesma visão filtrada da lista. Protegida pela mesma
// sessão de admin (middleware.ts cobre `/admin/inscricoes/:path*`, que
// inclui este path literal - nenhuma rota/matcher nova precisa ser criada).
import { PLANS } from "../../../../content/plans";
import { listEnrollments, type Enrollment } from "../../../../lib/enrollments";
import {
  loadFilteredEnrollments,
  toCsv,
  type EnrollmentFilters,
  type StatusLabel,
} from "../../../../lib/enrollment-filters";

const STATUS_LABELS: StatusLabel[] = ["Pendente", "Pago", "Expirado", "Cancelado"];

function parseFilters(url: URL): EnrollmentFilters {
  const status = url.searchParams.get("status") ?? undefined;
  const plano = url.searchParams.get("plano") ?? undefined;
  return {
    status: STATUS_LABELS.includes(status as StatusLabel)
      ? (status as StatusLabel)
      : undefined,
    plano: PLANS.some((plan) => plan.slug === plano)
      ? (plano as Enrollment["plan"])
      : undefined,
    de: url.searchParams.get("de") ?? undefined,
    ate: url.searchParams.get("ate") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  };
}

export async function GET(request: Request): Promise<Response> {
  const filters = parseFilters(new URL(request.url));
  const { enrollments, loadError } = await loadFilteredEnrollments(
    filters,
    listEnrollments,
  );

  if (loadError) {
    return Response.json(
      { error: "Não foi possível gerar a exportação agora." },
      { status: 500 },
    );
  }

  return new Response(toCsv(enrollments), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="inscricoes.csv"',
    },
  });
}
