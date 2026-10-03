import { PLANS } from "@/content/plans";
import { listEnrollments } from "@/lib/enrollments";

// Lista de inscrições do mentor (spec.md P2 "Lista de inscrições para o
// mentor", MENT-25) - protegida por middleware.ts (T38). Mostra nome,
// e-mail, plano, data de pagamento e data de expiração de cada inscrição,
// ordenadas por proximidade da expiração (listEnrollments, T39).
//
// Nunca pode ser pré-renderizada estaticamente: é uma página protegida com
// dados ao vivo por requisição (e sem isso, `next build` tentaria gerar esta
// página em tempo de build, antes de qualquer env var/Supabase estar
// configurado, e falharia).
export const dynamic = "force-dynamic";

function planName(slug: string): string {
  return PLANS.find((plan) => plan.slug === slug)?.name ?? slug;
}

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

export default async function AdminEnrollmentsPage() {
  const enrollments = await listEnrollments();

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold text-black dark:text-zinc-50">
        Inscrições
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="py-2 pr-4 font-medium">Nome</th>
              <th className="py-2 pr-4 font-medium">E-mail</th>
              <th className="py-2 pr-4 font-medium">Plano</th>
              <th className="py-2 pr-4 font-medium">Pago em</th>
              <th className="py-2 pr-4 font-medium">Expira em</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr
                key={enrollment.id}
                className="border-b border-black/5 dark:border-white/5"
              >
                <td className="py-2 pr-4">{enrollment.customerName}</td>
                <td className="py-2 pr-4">{enrollment.customerEmail}</td>
                <td className="py-2 pr-4">{planName(enrollment.plan)}</td>
                <td className="py-2 pr-4">{formatDate(enrollment.paidAt)}</td>
                <td className="py-2 pr-4">
                  {formatDate(enrollment.expiresAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
