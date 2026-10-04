import { notFound } from "next/navigation";
import { findById } from "@/lib/enrollments";
import { listEventsByCheckoutId } from "@/lib/webhook-events";
import { formatCentsBrl, toDisplayRow } from "@/lib/enrollment-filters";

// Detalhe de uma inscrição (.tasks/painel-inscricoes.md critérios 12-17):
// dados do lead, plano, valor e a linha do tempo de eventos do webhook pro
// checkout dessa inscrição. Protegida pela mesma sessão de admin de
// /admin/inscricoes (middleware.ts cobre `/admin/inscricoes/:path*`).
//
// Critério 16 (link "Ver cliente no Asaas") NÃO está implementado nesta
// build - bloqueado pela pergunta em aberto #1 de painel-inscricoes.md (URL
// exata do painel Asaas pra um cliente). Critério 17 (link omitido) é o
// comportamento padrão enquanto isso não for respondido.
export const dynamic = "force-dynamic";

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export default async function AdminEnrollmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enrollment = await findById(id);

  if (!enrollment) {
    notFound();
  }

  const row = toDisplayRow(enrollment);
  const events = await listEventsByCheckoutId(enrollment.asaasCheckoutId);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <h1 className="text-2xl font-bold text-black dark:text-zinc-50">
        {row.name}
      </h1>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-zinc-700 dark:text-zinc-300">
        <dt className="font-medium">E-mail</dt>
        <dd>{row.email}</dd>

        <dt className="font-medium">Plano</dt>
        <dd>{row.plan}</dd>

        <dt className="font-medium">Valor pago</dt>
        <dd>{formatCentsBrl(enrollment.amountCents)}</dd>

        <dt className="font-medium">Status</dt>
        <dd>{row.status}</dd>

        <dt className="font-medium">Pago em</dt>
        <dd>{row.paidAt}</dd>

        <dt className="font-medium">Expira em</dt>
        <dd>{row.expiresAt}</dd>
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
          Linha do tempo
        </h2>

        {events.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Nenhum evento registrado.
          </p>
        ) : (
          <ol className="flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex justify-between border-b border-black/5 py-2 dark:border-white/5"
              >
                <span>{event.eventType}</span>
                <span>{formatDateTime(event.processedAt)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
