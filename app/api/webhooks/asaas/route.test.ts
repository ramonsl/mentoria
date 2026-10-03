import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cobre tasks.md T18 "Done when": token válido grava e retorna 200; token
// inválido/ausente retorna 401 sem gravar; mesmo event id duas vezes não
// duplica; payload com campos extras desconhecidos é aceito sem erro.

const { mockRecordEvent } = vi.hoisted(() => ({
  mockRecordEvent: vi.fn(),
}));

vi.mock("../../../../lib/webhook-events", () => ({
  recordEvent: mockRecordEvent,
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

function fakeRecordedEvent(
  id: string,
  recorded: boolean,
  overrides: Record<string, unknown> = {},
) {
  return {
    recorded,
    event: {
      id,
      eventType: "CHECKOUT_PAID",
      checkoutId: "chk-1",
      payload: {},
      processedAt: new Date(),
      result: "success" as const,
      errorMessage: null,
      ...overrides,
    },
  };
}

describe("POST /api/webhooks/asaas", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      process.env[key] = value;
    }
    mockRecordEvent.mockReset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("registra o evento e retorna 200 quando o token é válido", async () => {
    mockRecordEvent.mockResolvedValue(fakeRecordedEvent("evt-1", true));

    const response = await POST(
      makeRequest(
        { id: "evt-1", event: "CHECKOUT_PAID", checkout: { id: "chk-1" } },
        "correct-webhook-token",
      ),
    );

    expect(response.status).toBe(200);
    expect(mockRecordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "evt-1",
        eventType: "CHECKOUT_PAID",
        checkoutId: "chk-1",
      }),
    );
  });

  it("retorna 401 e não grava nada quando o token é inválido", async () => {
    const response = await POST(
      makeRequest(
        { id: "evt-2", event: "CHECKOUT_PAID", checkout: { id: "chk-2" } },
        "wrong-token",
      ),
    );

    expect(response.status).toBe(401);
    expect(mockRecordEvent).not.toHaveBeenCalled();
  });

  it("retorna 401 e não grava nada quando o token está ausente", async () => {
    const response = await POST(
      makeRequest({
        id: "evt-3",
        event: "CHECKOUT_PAID",
        checkout: { id: "chk-3" },
      }),
    );

    expect(response.status).toBe(401);
    expect(mockRecordEvent).not.toHaveBeenCalled();
  });

  it("o mesmo event id enviado duas vezes não duplica o registro (idempotência)", async () => {
    mockRecordEvent
      .mockResolvedValueOnce(fakeRecordedEvent("evt-dup", true))
      .mockResolvedValueOnce(fakeRecordedEvent("evt-dup", false));

    const body = {
      id: "evt-dup",
      event: "CHECKOUT_PAID",
      checkout: { id: "chk-1" },
    };

    const first = await POST(makeRequest(body, "correct-webhook-token"));
    const second = await POST(makeRequest(body, "correct-webhook-token"));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(mockRecordEvent).toHaveBeenCalledTimes(2);
    expect(mockRecordEvent.mock.calls[0][0]).toMatchObject({ id: "evt-dup" });
    expect(mockRecordEvent.mock.calls[1][0]).toMatchObject({ id: "evt-dup" });
  });

  it("aceita payload com campos extras desconhecidos sem lançar erro", async () => {
    mockRecordEvent.mockResolvedValue(fakeRecordedEvent("evt-4", true));

    const response = await POST(
      makeRequest(
        {
          id: "evt-4",
          event: "CHECKOUT_PAID",
          checkout: { id: "chk-4" },
          umCampoNovoDesconhecido: { futuro: true },
        },
        "correct-webhook-token",
      ),
    );

    expect(response.status).toBe(200);
  });
});
