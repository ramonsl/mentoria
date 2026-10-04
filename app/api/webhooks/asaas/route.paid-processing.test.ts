import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLANS } from "../../../../content/plans";
import type { Db } from "../../../../lib/db";
import { enrollments as enrollmentsTable, webhookEvents as webhookEventsTable } from "../../../../lib/schema";

// Cobre tasks.md T27 "Done when" fim a fim pela ROTA REAL - diferente de
// app/api/webhooks/asaas/route.test.ts (T18), que mocka processCheckoutEvent
// inteiro. Aqui só a borda externa de cada integração é substituída:
// lib/db.ts (Postgres real) e lib/email.ts (Resend real). Tudo entre a
// rota HTTP e essas duas bordas - validação de token, recordEvent,
// processCheckoutEvent, createEnrollment, os templates de e-mail - roda com
// o código de verdade, provando que T27 liga o fio de ponta a ponta (não só
// que processCheckoutEvent funciona isoladamente, já coberto por
// lib/process-checkout-event.test.ts).

type Row = Record<string, unknown>;

function makeThenable(rows: Row[]) {
  return {
    limit: (n: number) => Promise.resolve(rows.slice(0, n)),
    then: (
      resolve: (v: Row[]) => unknown,
      reject?: (e: unknown) => unknown,
    ) => Promise.resolve(rows).then(resolve, reject),
  };
}

function createFakeDb() {
  const enrollmentRows: Row[] = [];
  const webhookEventRows: Row[] = [];
  let nextId = 1;

  const tableRows = new Map<unknown, Row[]>([
    [enrollmentsTable, enrollmentRows],
    [webhookEventsTable, webhookEventRows],
  ]);

  function getRows(table: unknown): Row[] {
    return tableRows.get(table) ?? [];
  }

  return {
    _enrollments: enrollmentRows,
    _webhookEvents: webhookEventRows,
    insert: (table: unknown) => ({
      values: (data: Row) => ({
        returning: async (): Promise<Row[]> => {
          const rows = getRows(table);
          if (table === webhookEventsTable && data.id) {
            if (rows.some((r) => r.id === data.id)) {
              throw new Error(
                'duplicate key value violates unique constraint "webhook_events_pkey" (23505)',
              );
            }
          }
          const row: Row = {
            id: `id-${nextId++}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            processedAt: new Date(),
            paidAt: null,
            expiresAt: null,
            ...data,
          };
          rows.push(row);
          return [row];
        },
      }),
    }),
    select: () => ({
      from: (table: unknown) => ({
        where: (_c: unknown) => makeThenable(getRows(table)),
        orderBy: (_s: unknown) => Promise.resolve([...getRows(table)]),
      }),
    }),
    update: (table: unknown) => ({
      set: (updates: Row) => ({
        where: (_c: unknown) => ({
          returning: async (): Promise<Row[]> => {
            const rows = getRows(table);
            if (rows.length === 0) return [];
            rows[0] = { ...rows[0], ...updates };
            return [rows[0]];
          },
        }),
      }),
    }),
  } as unknown as Db & { _enrollments: Row[]; _webhookEvents: Row[] };
}

const { getFakeDb, setFakeDb } = vi.hoisted(() => {
  let db: ReturnType<typeof createFakeDb> | null = null;
  return {
    getFakeDb: () => db,
    setFakeDb: (d: typeof db) => {
      db = d;
    },
  };
});

vi.mock("../../../../lib/db", () => ({
  getDb: () => getFakeDb(),
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
  DATABASE_URL: "postgresql://localhost/test",
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
      externalReference: PLANS[0].slug,
    },
    ...overrides,
  };
}

describe("POST /api/webhooks/asaas - processamento real (T27)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    setFakeDb(createFakeDb());
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

    const db = getFakeDb()!;
    expect(db._enrollments).toHaveLength(1);
    expect(db._enrollments[0]).toMatchObject({
      plan: PLANS[0].slug,
      status: "ativa",
      customerEmail: "fulano@example.com",
    });

    expect(mockSend).toHaveBeenCalledTimes(2);
    const recipients = mockSend.mock.calls.map((call) => call[0].to);
    expect(recipients).toContain("fulano@example.com");
    expect(recipients).toContain("mentor@example.com");

    expect(db._webhookEvents[0]).toMatchObject({
      id: "evt-paid-1",
      result: "success",
    });
  });

  it("falha no envio de e-mail (MENT-16): inscrição permanece registrada e o resultado final é logado como erro, resposta continua 200", async () => {
    mockSend.mockRejectedValue(new Error("Resend API error: rate limited"));

    const response = await POST(
      makeRequest(checkoutPaidBody(), "correct-webhook-token"),
    );

    expect(response.status).toBe(200);

    const db = getFakeDb()!;
    // AC7 (MENT-16): "mantém a inscrição registrada" mesmo com falha de
    // e-mail - o pagamento não pode "sumir" por causa disso.
    expect(db._enrollments).toHaveLength(1);
    expect(db._enrollments[0]).toMatchObject({
      plan: PLANS[0].slug,
      status: "ativa",
    });
    // "registrando a falha final para acompanhamento manual" - o log do
    // evento reflete o erro, não um "success" mascarado.
    expect(db._webhookEvents[0]).toMatchObject({
      id: "evt-paid-1",
      result: "error",
    });
    expect(db._webhookEvents[0].errorMessage).toContain("Resend API error");
  });

  it("evento duplicado (mesmo event id) não reprocessa processCheckoutEvent nem reenvia e-mail", async () => {
    const body = checkoutPaidBody();

    const first = await POST(makeRequest(body, "correct-webhook-token"));
    const second = await POST(makeRequest(body, "correct-webhook-token"));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const db = getFakeDb()!;
    // Uma inscrição só, não duas - o reenvio do mesmo event id não recria.
    expect(db._enrollments).toHaveLength(1);
    // 2 e-mails (mentorando + mentor) no total, não 4 - o reenvio não
    // dispara os templates de novo.
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("token inválido continua retornando 401 sem chamar processCheckoutEvent", async () => {
    const response = await POST(
      makeRequest(checkoutPaidBody(), "wrong-token"),
    );

    expect(response.status).toBe(401);

    const db = getFakeDb()!;
    expect(db._enrollments).toHaveLength(0);
    expect(db._webhookEvents).toHaveLength(0);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
