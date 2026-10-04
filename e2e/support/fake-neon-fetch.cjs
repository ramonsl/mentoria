// Test-only fetch shim loaded via NODE_OPTIONS=--require when Playwright's
// webServer starts `next dev` for e2e (see playwright.config.ts). Intercepts
// POST requests to https://fake-neon-e2e.test/sql (Neon HTTP API for the
// fake DATABASE_URL) and returns fixed seed rows for admin-inscricoes spec
// (tasks.md T41, .tasks/painel-inscricoes.md). Every other request goes
// through the real global fetch.
//
// Column order must match lib/schema.ts column definition order:
// enrollments: id, asaas_checkout_id, plan, status, customer_name,
//   customer_email, amount_cents, paid_at, expires_at, created_at, updated_at
// webhook_events: id, event_type, checkout_id, payload, processed_at,
//   result, error_message

// @neondatabase/serverless's neon-http driver rewrites the connection
// string's hostname before calling fetch: it replaces the first label with
// "api." (or "apiauth." for jwt auth), so DATABASE_URL's
// "fake-neon-e2e.test" host actually gets requested as "api.test" - this
// constant must match what the driver really calls, not the DATABASE_URL
// hostname itself.
const FAKE_NEON_HOST = "https://api.test";

// Rows sorted by expires_at ASC - listEnrollments()'s own SQL order. The
// list page re-sorts by createdAt descending in memory
// (lib/enrollment-filters.ts), so this array's order doesn't need to match
// what any test expects to see on screen.
const ENROLLMENT_SEED_ROWS = [
  [
    "e2e-seed-1",
    "chk-e2e-1",
    "acompanhamento-3m",
    "ativa",
    "Ana Beatriz Souza",
    "ana.beatriz@example.com",
    "59900",
    "2026-01-10T00:00:00.000Z",
    "2026-07-10T00:00:00.000Z",
    "2026-01-10T00:00:00.000Z",
    "2026-01-10T00:00:00.000Z",
  ],
  [
    "e2e-seed-2",
    "chk-e2e-2",
    "acompanhamento-3m",
    "paga",
    "Bruno Lima",
    "bruno.lima@example.com",
    "59900",
    "2026-02-15T00:00:00.000Z",
    "2026-10-15T00:00:00.000Z",
    "2026-02-15T00:00:00.000Z",
    "2026-02-15T00:00:00.000Z",
  ],
  [
    "e2e-seed-3",
    "chk-e2e-3",
    "acompanhamento-6m",
    "ativa",
    "Carla Mendes",
    "carla.mendes@example.com",
    "99900",
    "2026-04-01T00:00:00.000Z",
    "2027-04-01T00:00:00.000Z",
    "2026-04-01T00:00:00.000Z",
    "2026-04-01T00:00:00.000Z",
  ],
];

const ENROLLMENT_FIELDS = [
  { name: "id", dataTypeID: 25 },
  { name: "asaas_checkout_id", dataTypeID: 25 },
  { name: "plan", dataTypeID: 25 },
  { name: "status", dataTypeID: 25 },
  { name: "customer_name", dataTypeID: 25 },
  { name: "customer_email", dataTypeID: 25 },
  { name: "amount_cents", dataTypeID: 25 },
  { name: "paid_at", dataTypeID: 25 },
  { name: "expires_at", dataTypeID: 25 },
  { name: "created_at", dataTypeID: 25 },
  { name: "updated_at", dataTypeID: 25 },
];

const PLAN_PRICE_ROWS = [
  ["avulso", "29900", "2026-10-04T00:00:00.000Z"],
  ["acompanhamento-3m", "59900", "2026-10-04T00:00:00.000Z"],
  ["acompanhamento-6m", "99900", "2026-10-04T00:00:00.000Z"],
];

const PLAN_PRICE_FIELDS = [
  { name: "plan", dataTypeID: 25 },
  { name: "price_cents", dataTypeID: 25 },
  { name: "updated_at", dataTypeID: 25 },
];

const COUPON_FIELDS = [
  { name: "id", dataTypeID: 25 },
  { name: "code", dataTypeID: 25 },
  { name: "discount_type", dataTypeID: 25 },
  { name: "discount_value", dataTypeID: 25 },
  { name: "plan", dataTypeID: 25 },
  { name: "expires_at", dataTypeID: 25 },
  { name: "max_uses", dataTypeID: 25 },
  { name: "reserved_uses", dataTypeID: 25 },
  { name: "active", dataTypeID: 16 },
  { name: "created_at", dataTypeID: 25 },
  { name: "updated_at", dataTypeID: 25 },
];

// chk-e2e-1 (Ana) tem 2 eventos, fora de ordem aqui de propósito - prova que
// a timeline reordena por processed_at ascendente. chk-e2e-2 (Bruno) e
// chk-e2e-3 (Carla) não têm nenhum evento - timeline vazia.
const WEBHOOK_EVENT_SEED_ROWS = [
  [
    "evt-e2e-paid",
    "CHECKOUT_PAID",
    "chk-e2e-1",
    JSON.stringify({ event: "CHECKOUT_PAID" }),
    "2026-01-10T12:30:00.000Z",
    "success",
    null,
  ],
  [
    "evt-e2e-created",
    "CHECKOUT_CREATED",
    "chk-e2e-1",
    JSON.stringify({ event: "CHECKOUT_CREATED" }),
    "2026-01-10T12:00:00.000Z",
    "success",
    null,
  ],
];

const WEBHOOK_EVENT_FIELDS = [
  { name: "id", dataTypeID: 25 },
  { name: "event_type", dataTypeID: 25 },
  { name: "checkout_id", dataTypeID: 25 },
  { name: "payload", dataTypeID: 25 },
  { name: "processed_at", dataTypeID: 25 },
  { name: "result", dataTypeID: 25 },
  { name: "error_message", dataTypeID: 25 },
];

function jsonResponse(rows, fields) {
  return new Response(JSON.stringify({ rows, fields }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

const originalFetch = global.fetch;

global.fetch = async function fakeFetch(input, init) {
  const url = typeof input === "string" ? input : (input && input.url) || "";

  if (url.indexOf(FAKE_NEON_HOST) !== 0) {
    return originalFetch(input, init);
  }

  let query = "";
  let params = [];
  try {
    const body = JSON.parse(init && init.body ? init.body : "{}");
    query = body.query || "";
    params = body.params || [];
  } catch {
    // corpo não é o {query, params} esperado - cai no fallback de enrollments
  }

  if (query.indexOf("webhook_events") !== -1) {
    const checkoutId = params[0];
    const rows = WEBHOOK_EVENT_SEED_ROWS.filter(
      (row) => row[2] === checkoutId,
    ).sort((a, b) => (a[4] < b[4] ? -1 : a[4] > b[4] ? 1 : 0));
    return jsonResponse(rows, WEBHOOK_EVENT_FIELDS);
  }

  if (query.indexOf("plan_prices") !== -1) {
    if (/^update/i.test(query.trim())) {
      const price = String(params[0]);
      const plan = params[params.length - 1];
      const row = PLAN_PRICE_ROWS.find((entry) => entry[0] === plan);
      if (row) row[1] = price;
      return jsonResponse(row ? [[row[0]]] : [], [{ name: "plan", dataTypeID: 25 }]);
    }
    return jsonResponse(PLAN_PRICE_ROWS, PLAN_PRICE_FIELDS);
  }

  if (query.indexOf("coupons") !== -1) {
    return jsonResponse([], COUPON_FIELDS);
  }

  // listEnrollments() faz um SELECT sem WHERE (filtro acontece em memória no
  // app - ver Landing de .checks/painel-inscricoes.md): sem params, devolve
  // tudo. findById() faz um SELECT com `id = $1`: com 1 param, filtra por id.
  const rows =
    params.length > 0
      ? ENROLLMENT_SEED_ROWS.filter((row) => row[0] === params[0])
      : ENROLLMENT_SEED_ROWS;
  return jsonResponse(rows, ENROLLMENT_FIELDS);
};
