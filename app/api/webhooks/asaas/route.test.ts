import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cobre tasks.md T18 "Done when": token válido grava e retorna 200; token
// inválido/ausente retorna 401 sem gravar; mesmo event id duas vezes não
// duplica; payload com campos extras desconhecidos é aceito sem erro.

// T27 conecta a rota a processCheckoutEvent/logOutcome - mockados aqui para
// manter este arquivo focado no contrato da rota (validação, idempotência,
// payload tolerante) já coberto por T18. O teste fim a fim que prova o
// processamento REAL (sem mockar processCheckoutEvent) vive em
// route.paid-processing.test.ts, conforme pedido para T27.
const { mockRecordEvent, mockLogOutcome, mockProcessCheckoutEvent } =
  vi.hoisted(() => ({
    mockRecordEvent: vi.fn(),
    mockLogOutcome: vi.fn(),
    mockProcessCheckoutEvent: vi.fn(),
  }));

vi.mock("../../../../lib/webhook-events", () => ({
  recordEvent: mockRecordEvent,
  logOutcome: mockLogOutcome,
}));

vi.mock("../../../../lib/process-checkout-event", () => ({
  processCheckoutEvent: mockProcessCheckoutEvent,
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
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      process.env[key] = value;
    }
    mockRecordEvent.mockReset();
    mockLogOutcome.mockReset().mockResolvedValue(undefined);
    mockProcessCheckoutEvent.mockReset().mockResolvedValue({
      type: "ignored",
      reason: "mocked in this test file - see route.paid-processing.test.ts",
    });
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    consoleErrorSpy.mockRestore();
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
    // tasks.md T27 "Done when": token inválido continua retornando 401 sem
    // chamar processCheckoutEvent.
    expect(mockProcessCheckoutEvent).not.toHaveBeenCalled();
    // Fix MENT-11 (validation.md, ciclo 1): a tentativa rejeitada é
    // registrada para auditoria.
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]).toContain("rejected request");
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
    expect(mockProcessCheckoutEvent).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
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
    // tasks.md T27 "Done when": evento duplicado não reprocessa
    // processCheckoutEvent - só a 1ª chamada (recorded: true) dispara.
    expect(mockProcessCheckoutEvent).toHaveBeenCalledTimes(1);
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

  // Fix MENT-13/MENT-16 (validation.md, ciclo 1): a rota não pode mascarar
  // um conflito ou uma rejeição como "success", nem perder o motivo de uma
  // falha final de processamento (ex.: e-mail que esgotou as 3 tentativas).
  describe("logOutcome reflete o tipo de resultado de processCheckoutEvent", () => {
    it("outcome 'enrolled' grava success", async () => {
      mockRecordEvent.mockResolvedValue(fakeRecordedEvent("evt-enrolled", true));
      mockProcessCheckoutEvent.mockResolvedValue({
        type: "enrolled",
        enrollment: {},
        duplicateAlert: false,
      });

      await POST(
        makeRequest(
          { id: "evt-enrolled", event: "CHECKOUT_PAID", checkout: { id: "chk-1" } },
          "correct-webhook-token",
        ),
      );

      expect(mockLogOutcome).toHaveBeenCalledWith("evt-enrolled", "success");
    });

    it("outcome 'conflict' (MENT-13, evento fora de ordem) grava error com o motivo, não success", async () => {
      mockRecordEvent.mockResolvedValue(fakeRecordedEvent("evt-conflict", true));
      mockProcessCheckoutEvent.mockResolvedValue({
        type: "conflict",
        reason: "CHECKOUT_CANCELED received after CHECKOUT_PAID already processed",
        enrollment: {},
      });

      await POST(
        makeRequest(
          { id: "evt-conflict", event: "CHECKOUT_CANCELED", checkout: { id: "chk-1" } },
          "correct-webhook-token",
        ),
      );

      expect(mockLogOutcome).toHaveBeenCalledWith(
        "evt-conflict",
        "error",
        "CHECKOUT_CANCELED received after CHECKOUT_PAID already processed",
      );
    });

    it("outcome 'rejected' (MENT-17, dado malformado) grava error com o motivo, não success", async () => {
      mockRecordEvent.mockResolvedValue(fakeRecordedEvent("evt-rejected", true));
      mockProcessCheckoutEvent.mockResolvedValue({
        type: "rejected",
        reason: "Malformed or missing customer email for checkout chk-1",
      });

      await POST(
        makeRequest(
          { id: "evt-rejected", event: "CHECKOUT_PAID", checkout: { id: "chk-1" } },
          "correct-webhook-token",
        ),
      );

      expect(mockLogOutcome).toHaveBeenCalledWith(
        "evt-rejected",
        "error",
        "Malformed or missing customer email for checkout chk-1",
      );
    });

    it("processCheckoutEvent lançando erro (ex.: e-mail esgotou as 3 tentativas, MENT-16) grava error com a mensagem final, e a resposta continua 200", async () => {
      mockRecordEvent.mockResolvedValue(fakeRecordedEvent("evt-email-fail", true));
      // Mensagem ilustrativa - este teste prova que a rota repassa qualquer
      // erro final de processCheckoutEvent (aqui mockado) pro log de
      // auditoria, não um texto específico de produção.
      mockProcessCheckoutEvent.mockRejectedValue(
        new Error("Resend API error: rate limited"),
      );

      const response = await POST(
        makeRequest(
          { id: "evt-email-fail", event: "CHECKOUT_PAID", checkout: { id: "chk-1" } },
          "correct-webhook-token",
        ),
      );

      expect(response.status).toBe(200);
      expect(mockLogOutcome).toHaveBeenCalledWith(
        "evt-email-fail",
        "error",
        "Resend API error: rate limited",
      );
    });
  });
});
