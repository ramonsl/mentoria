import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLANS } from "../content/plans";

// Fake Supabase client suportando insert+select+single (createEnrollment),
// select+eq*+maybeSingle (findActiveByEmailAndPlan) e update+eq aguardado
// direto sem .select() (activateEnrollment) - mesmo padrão de
// lib/enrollments.test.ts, estendido para o caso de update sem select.
function createFakeSupabaseClient(initialRows: Record<string, unknown>[] = []) {
  const rows: Record<string, unknown>[] = [...initialRows];
  let nextId = rows.length + 1;

  type Filter = { col: string; val: unknown };

  function matches(row: Record<string, unknown>, filters: Filter[]): boolean {
    return filters.every(({ col, val }) => row[col] === val);
  }

  function from(_table: string) {
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
          const row = {
            ...insertPayload,
            id: `id-${nextId++}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          rows.push(row);
          return { data: row, error: null };
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
          if (idx !== -1) {
            rows[idx] = { ...rows[idx], ...updatePayload };
          }
          resolve({ data: null, error: null });
          return;
        }
        const matched = rows.filter((r) => matches(r, filters));
        resolve({ data: matched, error: null });
      },
    };

    return api;
  }

  return { from, _rows: rows };
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

vi.mock("./supabase", () => ({
  getSupabaseClient: () => getFakeClient(),
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
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
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
      items: [{ name: PLANS[0].name, value: PLANS[0].priceCents / 100 }],
      externalReference: PLANS[0].slug,
    },
    ...overrides,
  };
}

describe("processCheckoutEvent - CHECKOUT_PAID", () => {
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

  it.each(PLANS)(
    "cria a inscrição com expiresAt = pagamento + 6 meses e status ativa para o plano $slug",
    async (plan) => {
      const now = new Date("2026-01-15T12:00:00.000Z");
      const event = makeEvent({
        checkout: {
          id: `chk-${plan.slug}`,
          customerData: { name: "Fulano de Tal", email: "fulano@example.com" },
          items: [{ name: plan.name, value: plan.priceCents / 100 }],
          externalReference: plan.slug,
        },
      });

      const outcome = await processCheckoutEvent(event, { now });

      expect(outcome.type).toBe("enrolled");
      if (outcome.type !== "enrolled") throw new Error("unreachable");
      expect(outcome.enrollment.plan).toBe(plan.slug);
      expect(outcome.enrollment.expiresAt.toISOString()).toBe(
        "2026-07-15T12:00:00.000Z",
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
        items: [{ name: "Nome de marketing totalmente diferente", value: PLANS[1].priceCents / 100 }],
        externalReference: PLANS[1].slug,
      },
    });

    const outcome = await processCheckoutEvent(event, { now });

    expect(outcome.type).toBe("enrolled");
    if (outcome.type !== "enrolled") throw new Error("unreachable");
    expect(outcome.enrollment.plan).toBe(PLANS[1].slug);
  });

  it("e-mail do cliente malformado: nenhuma inscrição é criada e o resultado sinaliza alerta ao mentor", async () => {
    const client = createFakeSupabaseClient();
    setFakeClient(client);

    const outcome = await processCheckoutEvent(
      makeEvent({
        checkout: {
          id: "chk-bad-email",
          customerData: { name: "Fulano", email: "nao-e-um-email" },
          items: [{ name: PLANS[0].name, value: PLANS[0].priceCents / 100 }],
        },
      }),
    );

    expect(outcome.type).toBe("rejected");
    expect(client._rows).toHaveLength(0);

    // tasks.md T23 "Done when": dado malformado -> só o mentor recebe e-mail.
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].to).toBe("mentor@example.com");
  });

  it("e-mail já com inscrição ativa no mesmo plano: cria mesmo assim e sinaliza duplicidade", async () => {
    const client = createFakeSupabaseClient([
      {
        id: "id-existente",
        asaas_checkout_id: "checkout-anterior",
        plan: PLANS[0].slug,
        status: "ativa",
        customer_name: "Fulano de Tal",
        customer_email: "fulano@example.com",
        amount_cents: PLANS[0].priceCents,
        paid_at: "2026-01-01T00:00:00.000Z",
        expires_at: "2026-07-01T00:00:00.000Z",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ]);
    setFakeClient(client);

    const outcome = await processCheckoutEvent(
      makeEvent({
        checkout: {
          id: "chk-novo",
          customerData: { name: "Fulano de Tal", email: "fulano@example.com" },
          items: [{ name: PLANS[0].name, value: PLANS[0].priceCents / 100 }],
          externalReference: PLANS[0].slug,
        },
      }),
    );

    expect(outcome.type).toBe("enrolled");
    if (outcome.type !== "enrolled") throw new Error("unreachable");
    expect(outcome.duplicateAlert).toBe(true);
    // Cria mesmo assim: a inscrição existente permanece e uma nova é
    // adicionada - não é um bloqueio da compra.
    expect(client._rows).toHaveLength(2);

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
      const client = createFakeSupabaseClient();
      setFakeClient(client);

      const outcome = await processCheckoutEvent(
        makeEvent({
          event: eventType,
          checkout: { id: "chk-nunca-pago" },
        }),
      );

      expect(outcome.type).toBe("ignored");
      expect(client._rows).toHaveLength(0);
    },
  );

  it.each(["CHECKOUT_CANCELED", "CHECKOUT_EXPIRED"] as const)(
    "%s recebido após CHECKOUT_PAID já processado do mesmo checkout: inscrição permanece ativa e o conflito é registrado",
    async (eventType) => {
      const client = createFakeSupabaseClient([
        {
          id: "id-ja-paga",
          asaas_checkout_id: "chk-ja-pago",
          plan: PLANS[0].slug,
          status: "ativa",
          customer_name: "Fulano de Tal",
          customer_email: "fulano@example.com",
          amount_cents: PLANS[0].priceCents,
          paid_at: "2026-01-01T00:00:00.000Z",
          expires_at: "2026-07-01T00:00:00.000Z",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ]);
      setFakeClient(client);

      const outcome = await processCheckoutEvent(
        makeEvent({
          event: eventType,
          checkout: { id: "chk-ja-pago" },
        }),
      );

      expect(outcome.type).toBe("conflict");
      if (outcome.type !== "conflict") throw new Error("unreachable");
      expect(outcome.enrollment.status).toBe("ativa");
      expect(client._rows).toHaveLength(1);
      expect(client._rows[0].status).toBe("ativa");
    },
  );
});

// Fix (validation.md, ciclo 1): edge case de spec.md não coberto antes -
// "evento de tipo desconhecido... ignorar sem lançar erro, processando
// apenas o que reconhece" (distinto de campos extras desconhecidos no
// payload, já coberto em app/api/webhooks/asaas/route.test.ts).
describe("processCheckoutEvent - tipo de evento desconhecido", () => {
  it("evento de tipo não reconhecido é ignorado sem lançar erro e sem gravar nada", async () => {
    const client = createFakeSupabaseClient();
    setFakeClient(client);
    mockSend.mockReset();

    const outcome = await processCheckoutEvent(
      makeEvent({ event: "CHECKOUT_REFUNDED", checkout: { id: "chk-desconhecido" } }),
    );

    expect(outcome.type).toBe("ignored");
    expect(client._rows).toHaveLength(0);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
