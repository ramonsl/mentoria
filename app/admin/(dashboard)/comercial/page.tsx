import { PLANS } from "../../../../content/plans";
import { listCoupons, listPlanPrices } from "../../../../lib/commercial";
import {
  createCouponAction,
  deactivateCouponAction,
  updatePlanPriceAction,
} from "./actions";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

async function submitPlanPrice(formData: FormData): Promise<void> {
  "use server";
  await updatePlanPriceAction(formData);
}

async function submitCoupon(formData: FormData): Promise<void> {
  "use server";
  await createCouponAction(formData);
}

async function submitCouponDeactivation(formData: FormData): Promise<void> {
  "use server";
  await deactivateCouponAction(formData);
}

function formatDate(value: Date | null): string {
  return value
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(value)
    : "Sem validade";
}

export default async function CommercialAdminPage() {
  const [prices, coupons] = await Promise.all([listPlanPrices(), listCoupons()]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 sm:px-10">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--wv-muted)] uppercase">
          Administração
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Preços e cupons
        </h1>
        <p className="mt-1 text-sm text-[var(--wv-muted)]">
          Atualize o valor de cada plano e crie ofertas para o checkout.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Preços dos planos</h2>
          <p className="mt-1 text-sm text-[var(--wv-muted)]">
            Informe o valor em reais, com até duas casas decimais.
          </p>
        </div>
        <div className="admin-card overflow-x-auto" style={{ padding: 0 }}>
          <table className="w-full text-left text-sm text-[var(--wv-muted)]">
            <thead>
              <tr className="border-b border-[var(--wv-border)] bg-[#fcfcfc] text-[11px] tracking-[0.08em] uppercase">
                <th className="px-5 py-3 font-semibold">Plano</th>
                <th className="px-5 py-3 font-semibold">Preço atual</th>
                <th className="px-5 py-3 font-semibold">Novo valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {PLANS.map((plan) => {
                const priceCents = prices[plan.slug];
                return (
                  <tr key={plan.slug}>
                    <td className="px-5 py-3 font-medium text-[var(--wv-text)]">
                      {plan.name}
                    </td>
                    <td className="px-5 py-3">
                      {priceCents === undefined
                        ? "Indisponível"
                        : currency.format(priceCents / 100)}
                    </td>
                    <td className="px-5 py-3">
                      <form action={submitPlanPrice} className="flex gap-2">
                        <input type="hidden" name="plan" value={plan.slug} />
                        <label className="sr-only" htmlFor={`price-${plan.slug}`}>
                          Novo preço para {plan.name}
                        </label>
                        <input
                          id={`price-${plan.slug}`}
                          name="priceReais"
                          type="number"
                          min="0.01"
                          step="0.01"
                          required
                          defaultValue={priceCents === undefined ? "" : (priceCents / 100).toFixed(2)}
                          className="w-36 rounded-md border border-[var(--wv-border)] bg-[var(--wv-surface)] px-3 py-2 text-[var(--wv-text)]"
                        />
                        <button className="admin-primary-button px-4 py-2 text-sm font-medium">
                          Salvar
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <form action={submitCoupon} className="admin-card flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Novo cupom</h2>
            <p className="mt-1 text-sm text-[var(--wv-muted)]">
              O código será salvo em letras maiúsculas.
            </p>
          </div>
          <label className="flex flex-col gap-1 text-sm text-[var(--wv-muted)]">
            Código
            <input
              name="code"
              required
              className="rounded-md border border-[var(--wv-border)] bg-[var(--wv-surface)] px-3 py-2 text-[var(--wv-text)]"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--wv-muted)]">
              Tipo de desconto
              <select
                name="discountType"
                defaultValue="percentage"
                className="rounded-md border border-[var(--wv-border)] bg-[var(--wv-surface)] px-3 py-2 text-[var(--wv-text)]"
              >
                <option value="percentage">Percentual</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--wv-muted)]">
              Desconto (% ou R$)
              <input
                name="discountValue"
                type="number"
                min="1"
                step="0.01"
                required
                className="rounded-md border border-[var(--wv-border)] bg-[var(--wv-surface)] px-3 py-2 text-[var(--wv-text)]"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm text-[var(--wv-muted)]">
            Plano elegível
            <select
              name="plan"
              defaultValue=""
              className="rounded-md border border-[var(--wv-border)] bg-[var(--wv-surface)] px-3 py-2 text-[var(--wv-text)]"
            >
              <option value="">Todos os planos</option>
              {PLANS.map((plan) => (
                <option key={plan.slug} value={plan.slug}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--wv-muted)]">
              Expira em
              <input
                name="expiresAt"
                type="date"
                className="rounded-md border border-[var(--wv-border)] bg-[var(--wv-surface)] px-3 py-2 text-[var(--wv-text)]"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--wv-muted)]">
              Máximo de usos
              <input
                name="maxUses"
                type="number"
                min="1"
                step="1"
                className="rounded-md border border-[var(--wv-border)] bg-[var(--wv-surface)] px-3 py-2 text-[var(--wv-text)]"
              />
            </label>
          </div>
          <button className="admin-primary-button self-start px-4 py-2 text-sm font-medium">
            Criar cupom
          </button>
        </form>

        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Cupons</h2>
            <p className="mt-1 text-sm text-[var(--wv-muted)]">
              Usos reservados incluem checkouts iniciados e ainda não pagos.
            </p>
          </div>
          {coupons.length === 0 ? (
            <p className="admin-card text-sm text-[var(--wv-muted)]">
              Nenhum cupom criado.
            </p>
          ) : (
            <div className="admin-card overflow-x-auto" style={{ padding: 0 }}>
              <table className="w-full text-left text-sm text-[var(--wv-muted)]">
                <thead>
                  <tr className="border-b border-[var(--wv-border)] bg-[#fcfcfc] text-[11px] tracking-[0.08em] uppercase">
                    <th className="px-5 py-3 font-semibold">Código</th>
                    <th className="px-5 py-3 font-semibold">Desconto</th>
                    <th className="px-5 py-3 font-semibold">Plano</th>
                    <th className="px-5 py-3 font-semibold">Validade</th>
                    <th className="px-5 py-3 font-semibold">Usos</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td className="px-5 py-3 font-medium text-[var(--wv-text)]">
                        {coupon.code}
                      </td>
                      <td className="px-5 py-3">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : currency.format(coupon.discountValue / 100)}
                      </td>
                      <td className="px-5 py-3">
                        {coupon.plan
                          ? PLANS.find((plan) => plan.slug === coupon.plan)?.name
                          : "Todos"}
                      </td>
                      <td className="px-5 py-3">{formatDate(coupon.expiresAt)}</td>
                      <td className="px-5 py-3">
                        {coupon.reservedUses}
                        {coupon.maxUses === null ? "" : ` / ${coupon.maxUses}`}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="font-medium"
                          style={{
                            color: coupon.active
                              ? "var(--wv-success)"
                              : "var(--wv-muted)",
                          }}
                        >
                          {coupon.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {coupon.active ? (
                          <form action={submitCouponDeactivation}>
                            <input type="hidden" name="couponId" value={coupon.id} />
                            <button className="text-sm font-medium text-[var(--wv-alert)] hover:underline">
                              Desativar
                            </button>
                          </form>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
