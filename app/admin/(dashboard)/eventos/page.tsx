import { EVENT, EVENT_COPY } from "@/content/event";
import {
  formatRegisteredAt,
  formatWhatsapp,
  listRegistrations,
  type EventRegistration,
} from "@/lib/event-registrations";

// Protegida por middleware.ts (matcher `/admin/eventos/:path*`).
export const dynamic = "force-dynamic";

export default async function AdminEventPage() {
  let registrations: EventRegistration[] = [];
  let loadError = false;
  try {
    registrations = await listRegistrations(EVENT.slug);
  } catch (error) {
    console.error("Falha ao carregar inscrições do evento", error);
    loadError = true;
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--wv-muted)] uppercase">Evento</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Palestra: Se eu tivesse 20 anos</h1>
          <p className="mt-2 text-sm text-[var(--wv-muted)]">
            {EVENT.dateLabel} · {EVENT.timeLabel} ·{" "}
            <a href={EVENT.path} target="_blank" rel="noopener" className="text-[var(--wv-accent)] underline underline-offset-2">
              ver página pública
            </a>
          </p>
        </div>
        <a
          href="/admin/eventos/export"
          className="rounded-md border border-[var(--wv-border)] bg-[var(--wv-surface)] px-4 py-2 text-sm font-medium text-[var(--wv-accent)] transition-colors hover:border-[var(--wv-accent)]"
        >
          Exportar CSV
        </a>
      </div>

      {loadError ? (
        <p className="admin-alert text-sm">Não foi possível carregar as inscrições. Tente novamente.</p>
      ) : (
        <>
          <div className="admin-card flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[var(--wv-text)]">{registrations.length}</span>
            <span className="text-sm text-[var(--wv-muted)]">
              {registrations.length === 1 ? "pessoa inscrita" : "pessoas inscritas"}
            </span>
          </div>

          {registrations.length === 0 ? (
            <p className="admin-card text-sm text-[var(--wv-muted)]">Nenhuma inscrição ainda.</p>
          ) : (
            <div className="admin-card overflow-x-auto" style={{ padding: 0 }}>
              <table className="w-full text-left text-sm text-[var(--wv-muted)]">
                <caption className="sr-only">Inscritos em {EVENT_COPY.title}</caption>
                <thead>
                  <tr className="border-b border-[var(--wv-border)] bg-[#fcfcfc] text-[11px] tracking-[0.08em] uppercase">
                    <th className="px-5 py-3 font-semibold">Nome</th>
                    <th className="px-5 py-3 font-semibold">E-mail</th>
                    <th className="px-5 py-3 font-semibold">WhatsApp</th>
                    <th className="px-5 py-3 font-semibold">Inscrito em</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="border-b border-[var(--wv-border)] last:border-0">
                      <td className="px-5 py-3 text-[var(--wv-text)]">{registration.name}</td>
                      <td className="px-5 py-3">{registration.email}</td>
                      <td className="px-5 py-3">
                        <a
                          href={`https://wa.me/55${registration.whatsapp}`}
                          target="_blank"
                          rel="noopener"
                          className="text-[var(--wv-accent)] underline-offset-2 hover:underline"
                        >
                          {formatWhatsapp(registration.whatsapp)}
                        </a>
                      </td>
                      <td className="px-5 py-3">{formatRegisteredAt(registration.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
