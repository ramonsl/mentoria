import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLANS } from "../../../../content/plans";

// Cobre tasks.md T27 "Done when" fim a fim pela ROTA REAL - diferente de
// app/api/webhooks/asaas/route.test.ts (T18), que mocka processCheckoutEvent
// inteiro. Aqui só a borda externa de cada integração é substituída:
// lib/supabase.ts (Postgres real) e lib/email.ts (Resend real). Tudo entre a
// rota HTTP e essas duas bordas - validação de token, recordEvent,
// processCheckoutEvent, createEnrollment, os templates de e-mail - roda com
// o código de verdade, provando que T27 liga o fio de ponta a ponta (não só
// que processCheckoutEvent funciona isoladamente, já coberto por
// lib/process-checkout-event.test.ts).

// Fake Supabase com tabelas separadas (enrollments, webhook_events), cada
// uma com a fração da query builder usada pelos repositórios reais:
// insert/update/select/eq/maybeSingle/single/then, mais detecção de
// conflito de PK (23505) só relevante para webhook_events (idempotência).
function createFakeSupabaseClient() {
  const tables: Record<string, Record<string, unknown>[]> = {
    enrollments: [],
    webhook_events: [],
  };
  let nextId = 1;

  type Filter = { col: string; val: unknown };

  function matches(row: Record<string, unknown>, filters: Filter[]): boolean {
    return filters.every(({ col, val }) => row[col] === val);
  }

  function from(table: string) {
    const rows = tables[table] ?? (tables[table] = []);
    const filters: Filter[] = [];
    let insertPayload: Record<string, unknown> | null = null;
    let updatePayload: Record<string, unknown> | null = null;

    const api = {
      insert(payload: Record<string, unknown>) {
        insertPayload = payload;
        return api;
      },
      update(payload: Record<string, unknown>) {
        updatePayload = payload;
        return api;
      },
      select() {
        return api;
      },
      eq(col: string, val: unknown) {
        filters.push({ col, val });
        return api;
      },
      async single() {
        if (insertPayload) {
          if (table === "webhook_events") {
            const conflict = rows.find((r) => r.id === insertPayload!.id);
            if (conflict) {
              return {
                data: null,
                error: {
                  code: "23505",
                  message:
                    'duplicate key value violates unique constraint "webhook_events_pkey"',
                },
              };
            }
          }
          const row = {
            ...insertPayload,
            id: insertPayload.id ?? `id-${nextId++}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            processed_at: new Date().toISOString(),
          };
          rows.push(row);
          return { data: row, error: null };
        }
        if (updatePayload) {
          const idx = rows.findIndex((r) => matches(r, filters));
          if (idx === -1) return { data: null, error: { message: "not found" } };
          rows[idx] = { ...rows[idx], ...updatePayload };
          return { data: rows[idx], error: null };
        }
        const match = rows.find((r) => matches(r, filters)) ?? null;
        return { data: match, error: null };
      },
      async maybeSingle() {
        const match = rows.find((r) => matches(r, filters)) ?? null;
        return { data: match, error: null };
      },
      then(resolve: (value: { data: unknown; error: null }) => void) {
        if (updatePayload) {
          const idx = rows.findIndex((r) => matches(r, filters));
          if (idx !== -1) rows[idx] = { ...rows[idx], ...updatePayload };
          resolve({ data: null, error: null });
          return;
        }
        const matched = rows.filter((r) => matches(r, filters));
        resolve({ data: matched, error: null });
      },
    };

    return api;
  }

  return { from, _tables: tables };
}

const { getFakeClient, setFakeClient } = vi.hoisted(() => {
  let client: ReturnType<typeof createFakeSupabaseClient> | null = null;
  return {
    getFakeClient: () => client,
    setFakeClient: (c: typeof client) => {
      client = c;
    },
  };
});

vi.mock("../../../../lib/supabase", () => ({
  getSupabaseClient: () => getFakeClient(),
}));

const mockSend = vi.fn();

vi.mock("../../../../lib/email", () => ({
  getResendClient: () => ({ emails: { send: mockSend } }),
  sendWithRetry: (fn: () => Promise<unknown>) => fn(),
}));

import { POST } from "./route";

const VALID_ENV: Record<string, string> = {
  ASAAS_API_KEY: "asaas-key",
  ASAAS_API_BASE_URL: "https://api.asaas.com/v3",
  ASAAS_WEBHOOK_TOKEN: "correct-webhook-token",
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  RESEND_API_KEY: "resend-key",
  MENTOR_EMAIL: "mentor@example.com",
  ADMIN_PASSWORD: "admin-password",
  CRON_SECRET: "cron-secret",
};

function makeRequest(body: unknown, token?: string): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token !== undefined) {
    headers["asaas-access-token"] = token;
  }
  return new Request("http://localhost:3000/api/webhooks/asaas", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function checkoutPaidBody(overrides: Record<string, unknown> = {}) {
  return {
    id: "evt-paid-1",
    event: "CHECKOUT_PAID",
    checkout: {
      id: "chk-paid-1",
      customerData: { name: "Fulano de Tal", email: "fulano@example.com" },
      items: [{ name: PLANS[0].name, value: PLANS[0].priceCents / 100 }],
    },
    ...overrides,
  };
}

describe("POST /api/webhooks/asaas - processamento real (T27)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    setFakeClient(createFakeSupabaseClient());
    for (const [key, value] of Object.entries(VALID_ENV)) {
      process.env[key] = value;
    }
    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("CHECKOUT_PAID válido cria a inscrição e dispara os e-mails corretos (não só grava o log do evento)", async () => {
    const response = await POST(
      makeRequest(checkoutPaidBody(), "correct-webhook-token"),
    );

    expect(response.status).toBe(200);

    const client = getFakeClient()!;
    expect(client._tables.enrollments).toHaveLength(1);
    expect(client._tables.enrollments[0]).toMatchObject({
      plan: PLANS[0].slug,
      status: "ativa",
      customer_email: "fulano@example.com",
    });

    expect(mockSend).toHaveBeenCalledTimes(2);
    const recipients = mockSend.mock.calls.map((call) => call[0].to);
    expect(recipients).toContain("fulano@example.com");
    expect(recipients).toContain("mentor@example.com");

    expect(client._tables.webhook_events[0]).toMatchObject({
      id: "evt-paid-1",
      result: "success",
    });
  });

  it("evento duplicado (mesmo event id) não reprocessa processCheckoutEvent nem reenvia e-mail", async () => {
    const body = checkoutPaidBody();

    const first = await POST(makeRequest(body, "correct-webhook-token"));
    const second = await POST(makeRequest(body, "correct-webhook-token"));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const client = getFakeClient()!;
    // Uma inscrição só, não duas - o reenvio do mesmo event id não recria.
    expect(client._tables.enrollments).toHaveLength(1);
    // 2 e-mails (mentorando + mentor) no total, não 4 - o reenvio não
    // dispara os templates de novo.
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("token inválido continua retornando 401 sem chamar processCheckoutEvent", async () => {
    const response = await POST(
      makeRequest(checkoutPaidBody(), "wrong-token"),
    );

    expect(response.status).toBe(401);

    const client = getFakeClient()!;
    expect(client._tables.enrollments).toHaveLength(0);
    expect(client._tables.webhook_events).toHaveLength(0);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
