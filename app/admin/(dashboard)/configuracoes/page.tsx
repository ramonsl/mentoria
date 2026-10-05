// Status das configurações do Asaas - só leitura, nunca mostra valores de
// segredo (API key, token de webhook), só se estão configurados ou não.
// Editar continua sendo só via variável de ambiente (.env.local local ou
// painel da Vercel em produção) - esta tela não grava nada.
export const dynamic = "force-dynamic";

interface ConfigRow {
  label: string;
  envVar: string;
  secret: boolean;
}

const ASAAS_CONFIG: ConfigRow[] = [
  { label: "Chave da API", envVar: "ASAAS_API_KEY", secret: true },
  { label: "URL base da API", envVar: "ASAAS_API_BASE_URL", secret: false },
  { label: "Token do webhook", envVar: "ASAAS_WEBHOOK_TOKEN", secret: true },
];

const OTHER_CONFIG: ConfigRow[] = [
  { label: "Banco de dados", envVar: "DATABASE_URL", secret: true },
  { label: "E-mail do mentor", envVar: "MENTOR_EMAIL", secret: false },
  { label: "Senha do admin", envVar: "ADMIN_PASSWORD", secret: true },
  { label: "Segredo do cron", envVar: "CRON_SECRET", secret: true },
  { label: "Chave do Resend", envVar: "RESEND_API_KEY", secret: true },
];

function ConfigTable({ title, rows }: { title: string; rows: ConfigRow[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="admin-card overflow-hidden" style={{ padding: 0 }}>
        <table className="w-full text-left text-sm text-[var(--wv-muted)]">
          <tbody>
            {rows.map((row) => {
              const value = process.env[row.envVar];
              const configured = Boolean(value);
              return (
                <tr key={row.envVar}>
                  <td className="px-5 py-3 text-[var(--wv-text)]">
                    {row.label}
                  </td>
                  <td className="px-5 py-3">
                    {!row.secret && configured ? value : null}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className="font-medium"
                      style={{
                        color: configured
                          ? "var(--wv-success)"
                          : "var(--wv-alert)",
                      }}
                    >
                      {configured ? "Configurado" : "Ausente"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminConfigPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12 sm:px-10">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--wv-muted)] uppercase">Administração</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="mt-1 text-sm text-[var(--wv-muted)]">
          Só leitura - os valores de segredo nunca aparecem aqui. Para
          alterar, edite as variáveis de ambiente (.env.local local, ou o
          painel do projeto na Vercel em produção).
        </p>
      </div>

      <ConfigTable title="Asaas" rows={ASAAS_CONFIG} />
      <ConfigTable title="Outras" rows={OTHER_CONFIG} />
    </main>
  );
}
