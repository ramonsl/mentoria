import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLANS } from "../content/plans";
import type { Db } from "./db";

const PLAN_PRICES_CENTS: Record<string, number> = {
  avulso: 29900,
  "acompanhamento-3m": 59900,
  "acompanhamento-6m": 99900,
};

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

function createFakeDb(initial: Row[] = []) {
  const rows: Row[] = [...initial];
  let nextId = initial.length + 1;

  return {
    _rows: rows,
    insert: (_t: unknown) => ({
      values: (data: Row) => ({
        returning: async (): Promise<Row[]> => {
          const row: Row = {
            id: `id-${nextId++}`,
            createdAt: new Date(),
            updatedAt: new Date(),
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
      from: (_t: unknown) => ({
        where: (_c: unknown) => makeThenable(rows),
        orderBy: (_s: unknown) => Promise.resolve([...rows]),
      }),
    }),
    update: (_t: unknown) => ({
      set: (updates: Row) => ({
        where: (_c: unknown) => ({
          returning: async (): Promise<Row[]> => {
            if (rows.length === 0) return [];
            rows[0] = { ...rows[0], ...updates };
            return [rows[0]];
          },
        }),
      }),
    }),
  } as unknown as Db & { _rows: Row[] };
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

vi.mock("./db", () => ({
  getDb: () => getFakeDb(),
}));

// Mocka só o client Resend (./email, mesmo arquivo importado por
// emails/templates.tsx via "../lib/email" - mesmo módulo resolvido) para
// provar T23 fim a fim: emails/templates.tsx e content/emails.ts rodam de
// verdade a partir de processCheckoutEvent, só a chamada de rede ao Resend
// é substituída.
const mockSend = vi.fn();

vi.mock("./email", () => ({
  getResendClient: () => ({ emails: { send: mockSend } }),
  sendWithRetry: (fn: () => Promise<unknown>) => fn(),
}));

const VALID_ENV: Record<string, string> = {
  ASAAS_API_KEY: "asaas-key",
  ASAAS_API_BASE_URL: "https://api.asaas.com/v3",
  ASAAS_WEBHOOK_TOKEN: "webhook-token",
  DATABASE_URL: "postgresql://localhost/test",
  RESEND_API_KEY: "resend-key",
  MENTOR_EMAIL: "mentor@example.com",
  ADMIN_PASSWORD: "admin-password",
  CRON_SECRET: "cron-secret",
};

import { processCheckoutEvent, type AsaasCheckoutEvent } from "./process-checkout-event";

function makeEvent(overrides: Partial<AsaasCheckoutEvent> = {}): AsaasCheckoutEvent {
  return {
    id: "evt-1",
    event: "CHECKOUT_PAID",
    checkout: {
      id: "chk-1",
      customerData: { name: "Fulano de Tal", email: "fulano@example.com" },
      items: [{ name: PLANS[0].name, value: PLAN_PRICES_CENTS.avulso / 100 }],
      externalReference: PLANS[0].slug,
    },
    ...overrides,
  };
}

describe("processCheckoutEvent - CHECKOUT_PAID", () => {
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

  // design.md "Addendum: 3 planos + envio assíncrono": duração de acesso por
  // plano - "avulso" não tem trilha, logo nunca expira (expiresAt null).
  const EXPECTED_EXPIRES_AT: Record<string, string | null> = {
    avulso: null,
    "acompanhamento-3m": "2026-04-15T12:00:00.000Z",
    "acompanhamento-6m": "2026-07-15T12:00:00.000Z",
  };

  it.each(PLANS)(
    "cria a inscrição com expiresAt correto por plano e status ativa para o plano $slug",
    async (plan) => {
      const now = new Date("2026-01-15T12:00:00.000Z");
      const event = makeEvent({
        checkout: {
          id: `chk-${plan.slug}`,
          customerData: { name: "Fulano de Tal", email: "fulano@example.com" },
          items: [{ name: plan.name, value: PLAN_PRICES_CENTS[plan.slug] / 100 }],
          externalReference: plan.slug,
        },
      });

      const outcome = await processCheckoutEvent(event, { now });

      expect(outcome.type).toBe("enrolled");
      if (outcome.type !== "enrolled") throw new Error("unreachable");
      expect(outcome.enrollment.plan).toBe(plan.slug);
      expect(outcome.enrollment.amountCents).toBe(PLAN_PRICES_CENTS[plan.slug]);
      expect(outcome.enrollment.expiresAt?.toISOString() ?? null).toBe(
        EXPECTED_EXPIRES_AT[plan.slug],
      );
      // Decisão documentada em process-checkout-event.ts: a inscrição sai do
      // mesmo processamento já em "ativa", não "paga" - sem passo manual de
      // ativação em nenhuma task do projeto.
      expect(outcome.enrollment.status).toBe("ativa");

      // tasks.md T23 "Done when": mentorando e mentor recebem e-mail, pro
      // plano $slug - prova fim a fim (emails/templates.tsx + content/emails.ts
      // reais, só o envio ao Resend é mockado).
      expect(mockSend).toHaveBeenCalledTimes(2);
      const recipients = mockSend.mock.calls.map((call) => call[0].to);
      expect(recipients).toContain("fulano@example.com");
      expect(recipients).toContain("mentor@example.com");
    },
  );

  it("identifica o plano por externalReference mesmo quando o nome de marketing do item mudou (tasks.md T28)", async () => {
    const now = new Date("2026-01-15T12:00:00.000Z");
    const event = makeEvent({
      checkout: {
        id: "chk-nome-mudou",
        customerData: { name: "Fulano de Tal", email: "fulano@example.com" },
        // Nome do item divergente de qualquer PLANS[].name atual - simula
        // uma mudança de copy em content/plans.ts depois que o checkout foi
        // criado. A identificação não deve depender disso.
        items: [{ name: "Nome de marketing totalmente diferente", value: PLAN_PRICES_CENTS[PLANS[1].slug] / 100 }],
        externalReference: PLANS[1].slug,
      },
    });

    const outcome = await processCheckoutEvent(event, { now });

    expect(outcome.type).toBe("enrolled");
    if (outcome.type !== "enrolled") throw new Error("unreachable");
    expect(outcome.enrollment.plan).toBe(PLANS[1].slug);
  });

  it("registra o valor descontado que veio no checkout pago", async () => {
    const outcome = await processCheckoutEvent(
      makeEvent({
        checkout: {
          id: "chk-discounted",
          customerData: { name: "Fulano de Tal", email: "fulano@example.com" },
          items: [{ name: PLANS[0].name, value: 239.2 }],
          externalReference: PLANS[0].slug,
        },
      }),
    );

    expect(outcome.type).toBe("enrolled");
    if (outcome.type !== "enrolled") throw new Error("unreachable");
    expect(outcome.enrollment.amountCents).toBe(23920);
  });

  it.each([undefined, 0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejeita valor pago ausente ou inválido (%s) sem criar inscrição",
    async (value) => {
      const db = createFakeDb();
      setFakeDb(db);
      const outcome = await processCheckoutEvent(
        makeEvent({
          checkout: {
            id: "chk-invalid-amount",
            customerData: { name: "Fulano de Tal", email: "fulano@example.com" },
            items: value === undefined ? [] : [{ value }],
            externalReference: PLANS[0].slug,
          },
        }),
      );

      expect(outcome.type).toBe("rejected");
      expect(db._rows).toHaveLength(0);
    },
  );

  it("e-mail do cliente malformado: nenhuma inscrição é criada e o resultado sinaliza alerta ao mentor", async () => {
    const db = createFakeDb();
    setFakeDb(db);

    const outcome = await processCheckoutEvent(
      makeEvent({
        checkout: {
          id: "chk-bad-email",
          customerData: { name: "Fulano", email: "nao-e-um-email" },
          items: [{ name: PLANS[0].name, value: PLAN_PRICES_CENTS.avulso / 100 }],
        },
      }),
    );

    expect(outcome.type).toBe("rejected");
    expect(db._rows).toHaveLength(0);

    // tasks.md T23 "Done when": dado malformado -> só o mentor recebe e-mail.
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].to).toBe("mentor@example.com");
  });

  it("e-mail já com inscrição ativa no mesmo plano: cria mesmo assim e sinaliza duplicidade", async () => {
    const db = createFakeDb([
      {
        id: "id-existente",
        asaasCheckoutId: "checkout-anterior",
        plan: PLANS[0].slug,
        status: "ativa",
        customerName: "Fulano de Tal",
        customerEmail: "fulano@example.com",
        amountCents: PLAN_PRICES_CENTS.avulso,
        paidAt: new Date("2026-01-01T00:00:00.000Z"),
        expiresAt: new Date("2026-07-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);
    setFakeDb(db);

    const outcome = await processCheckoutEvent(
      makeEvent({
        checkout: {
          id: "chk-novo",
          customerData: { name: "Fulano de Tal", email: "fulano@example.com" },
          items: [{ name: PLANS[0].name, value: PLAN_PRICES_CENTS.avulso / 100 }],
          externalReference: PLANS[0].slug,
        },
      }),
    );

    expect(outcome.type).toBe("enrolled");
    if (outcome.type !== "enrolled") throw new Error("unreachable");
    expect(outcome.duplicateAlert).toBe(true);
    // Cria mesmo assim: a inscrição existente permanece e uma nova é
    // adicionada - não é um bloqueio da compra.
    expect(db._rows).toHaveLength(2);

    // Fix MENT-18 (validation.md, ciclo 1): não basta o outcome sinalizar
    // duplicateAlert internamente - o e-mail que o mentor de fato recebe
    // precisa conter o aviso.
    const mentorCall = mockSend.mock.calls.find(
      (call) => call[0].to === "mentor@example.com",
    );
    expect(mentorCall?.[0].text).toContain("Possível duplicidade");
  });
});

// Cobre tasks.md T20 "Done when" (spec.md MENT-06, MENT-13): CANCELED/EXPIRED
// sem PAID anterior é no-op; CANCELED/EXPIRED após um PAID já processado do
// mesmo checkout mantém a inscrição como está e vira conflito pra revisão.
describe("processCheckoutEvent - CHECKOUT_CANCELED / CHECKOUT_EXPIRED", () => {
  it.each(["CHECKOUT_CANCELED", "CHECKOUT_EXPIRED"] as const)(
    "%s sem CHECKOUT_PAID anterior para o checkout: nenhuma inscrição é criada",
    async (eventType) => {
      const db = createFakeDb();
      setFakeDb(db);

      const outcome = await processCheckoutEvent(
        makeEvent({
          event: eventType,
          checkout: { id: "chk-nunca-pago" },
        }),
      );

      expect(outcome.type).toBe("ignored");
      expect(db._rows).toHaveLength(0);
    },
  );

  it.each(["CHECKOUT_CANCELED", "CHECKOUT_EXPIRED"] as const)(
    "%s recebido após CHECKOUT_PAID já processado do mesmo checkout: inscrição permanece ativa e o conflito é registrado",
    async (eventType) => {
      const db = createFakeDb([
        {
          id: "id-ja-paga",
          asaasCheckoutId: "chk-ja-pago",
          plan: PLANS[0].slug,
          status: "ativa",
          customerName: "Fulano de Tal",
          customerEmail: "fulano@example.com",
          amountCents: PLAN_PRICES_CENTS.avulso,
          paidAt: new Date("2026-01-01T00:00:00.000Z"),
          expiresAt: new Date("2026-07-01T00:00:00.000Z"),
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ]);
      setFakeDb(db);

      const outcome = await processCheckoutEvent(
        makeEvent({
          event: eventType,
          checkout: { id: "chk-ja-pago" },
        }),
      );

      expect(outcome.type).toBe("conflict");
      if (outcome.type !== "conflict") throw new Error("unreachable");
      expect(outcome.enrollment.status).toBe("ativa");
      expect(db._rows).toHaveLength(1);
      expect(db._rows[0].status).toBe("ativa");
    },
  );
});

// Fix (validation.md, ciclo 1): edge case de spec.md não coberto antes -
// "evento de tipo desconhecido... ignorar sem lançar erro, processando
// apenas o que reconhece" (distinto de campos extras desconhecidos no
// payload, já coberto em app/api/webhooks/asaas/route.test.ts).
describe("processCheckoutEvent - tipo de evento desconhecido", () => {
  it("evento de tipo não reconhecido é ignorado sem lançar erro e sem gravar nada", async () => {
    const db = createFakeDb();
    setFakeDb(db);
    mockSend.mockReset();

    const outcome = await processCheckoutEvent(
      makeEvent({ event: "CHECKOUT_REFUNDED", checkout: { id: "chk-desconhecido" } }),
    );

    expect(outcome.type).toBe("ignored");
    expect(db._rows).toHaveLength(0);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
