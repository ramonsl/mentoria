// Test-only fetch shim, loaded via NODE_OPTIONS=--require when Playwright's
// webServer starts `next dev` for e2e (see playwright.config.ts). Lets
// e2e/admin-inscricoes.spec.ts (tasks.md T41) prove the admin enrollments
// list page against seeded data without a real Supabase project available in
// this environment (same class of constraint already documented in
// tasks.md T5/T26). Intercepts GET requests to
// `${SUPABASE_URL}/rest/v1/enrollments` and returns fixed seed rows,
// honoring the `order` query param the same way PostgREST would for the one
// query this app issues (lib/enrollments.ts `listEnrollments`); every other
// request goes through the real global fetch untouched. Never imported by
// application code - referenced only from playwright.config.ts.

const FAKE_SUPABASE_URL = process.env.SUPABASE_URL || "";

const SEED_ENROLLMENTS = [
  {
    id: "e2e-seed-3",
    asaas_checkout_id: "chk-e2e-3",
    plan: "acompanhamento-6m",
    status: "ativa",
    customer_name: "Carla Mendes",
    customer_email: "carla.mendes@example.com",
    amount_cents: 99900,
    paid_at: "2026-04-01T00:00:00.000Z",
    expires_at: "2027-04-01T00:00:00.000Z",
    created_at: "2026-04-01T00:00:00.000Z",
    updated_at: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "e2e-seed-1",
    asaas_checkout_id: "chk-e2e-1",
    plan: "acompanhamento-3m",
    status: "ativa",
    customer_name: "Ana Beatriz Souza",
    customer_email: "ana.beatriz@example.com",
    amount_cents: 59900,
    paid_at: "2026-01-10T00:00:00.000Z",
    expires_at: "2026-07-10T00:00:00.000Z",
    created_at: "2026-01-10T00:00:00.000Z",
    updated_at: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "e2e-seed-2",
    asaas_checkout_id: "chk-e2e-2",
    plan: "acompanhamento-3m",
    status: "paga",
    customer_name: "Bruno Lima",
    customer_email: "bruno.lima@example.com",
    amount_cents: 59900,
    paid_at: "2026-02-15T00:00:00.000Z",
    expires_at: "2026-10-15T00:00:00.000Z",
    created_at: "2026-02-15T00:00:00.000Z",
    updated_at: "2026-02-15T00:00:00.000Z",
  },
];

const originalFetch = global.fetch;

global.fetch = async function fakeFetch(input, init) {
  const url = typeof input === "string" ? input : (input && input.url) || "";

  if (
    FAKE_SUPABASE_URL &&
    url.indexOf(FAKE_SUPABASE_URL) === 0 &&
    url.indexOf("/rest/v1/enrollments") !== -1
  ) {
    const parsed = new URL(url);
    const order = parsed.searchParams.get("order") || "";
    let rows = SEED_ENROLLMENTS.slice();

    if (order.indexOf("expires_at") === 0) {
      const ascending = order.indexOf("desc") === -1;
      rows.sort((a, b) => {
        if (a.expires_at < b.expires_at) return ascending ? -1 : 1;
        if (a.expires_at > b.expires_at) return ascending ? 1 : -1;
        return 0;
      });
    }

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  return originalFetch(input, init);
};
