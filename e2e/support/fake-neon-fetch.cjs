// Test-only fetch shim loaded via NODE_OPTIONS=--require when Playwright's
// webServer starts `next dev` for e2e (see playwright.config.ts). Intercepts
// POST requests to https://fake-neon-e2e.test/sql (Neon HTTP API for the
// fake DATABASE_URL) and returns fixed seed rows for admin-inscricoes spec
// (tasks.md T41). Every other request goes through the real global fetch.
//
// Column order must match lib/schema.ts enrollments definition order:
// id, asaas_checkout_id, plan, status, customer_name, customer_email,
// amount_cents, paid_at, expires_at, created_at, updated_at

const FAKE_NEON_HOST = "https://fake-neon-e2e.test";

// Rows sorted by expires_at ASC, matching the SQL ORDER BY the app issues.
// Values are strings; Drizzle's column decoders parse integers and timestamps.
const SEED_ROWS = [
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

const FIELDS = [
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

const NEON_RESPONSE = JSON.stringify({ rows: SEED_ROWS, fields: FIELDS });

const originalFetch = global.fetch;

global.fetch = async function fakeFetch(input, init) {
  const url = typeof input === "string" ? input : (input && input.url) || "";

  if (url.indexOf(FAKE_NEON_HOST) === 0) {
    return new Response(NEON_RESPONSE, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  return originalFetch(input, init);
};
