import { notFound } from "next/navigation";
import { JetBrains_Mono } from "next/font/google";
import { findById } from "@/lib/enrollments";
import { listEventsByCheckoutId } from "@/lib/webhook-events";
import { formatCentsBrl, toDisplayRow } from "@/lib/enrollment-filters";

// Fonte monoespaçada pro valor pago (.tasks/admin-wattvision-theme.md
// critério 14) - reaproveita a regra tipográfica do design system WattVision
// de usar monoespaçada pra métricas numéricas.
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

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
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12 sm:px-10">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--wv-muted)] uppercase">Inscrição</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{row.name}</h1>
      </div>

      <dl className="admin-card grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-[var(--wv-muted)]">
        <dt className="font-medium">E-mail</dt>
        <dd className="text-[var(--wv-text)]">{row.email}</dd>

        <dt className="font-medium">Plano</dt>
        <dd className="text-[var(--wv-text)]">{row.plan}</dd>

        <dt className="font-medium">Valor pago</dt>
        <dd className={`${jetbrainsMono.className} font-bold text-[var(--wv-text)]`}>
          {formatCentsBrl(enrollment.amountCents)}
        </dd>

        <dt className="font-medium">Status</dt>
        <dd className="text-[var(--wv-text)]">{row.status}</dd>

        <dt className="font-medium">Pago em</dt>
        <dd className="text-[var(--wv-text)]">{row.paidAt}</dd>

        <dt className="font-medium">Expira em</dt>
        <dd className="text-[var(--wv-text)]">{row.expiresAt}</dd>
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight">Linha do tempo</h2>

        {events.length === 0 ? (
          <p className="admin-card text-sm text-[var(--wv-muted)]">
            Nenhum evento registrado.
          </p>
        ) : (
          <ol className="admin-card flex flex-col gap-2 text-sm text-[var(--wv-muted)]">
            {events.map((event) => (
              <li key={event.id} className="flex justify-between py-2">
                <span className="text-[var(--wv-text)]">{event.eventType}</span>
                <span>{formatDateTime(event.processedAt)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
