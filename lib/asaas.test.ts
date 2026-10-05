import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cobre tasks.md T14 "Done when": checkout criado com sucesso (mock) para
// os dois planos, e erro 5xx/timeout da API do Asaas lançando um erro
// tipado reconhecível pela rota de checkout (T15).

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

describe("createCheckout", () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      process.env[key] = value;
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
  });

  it.each(["avulso", "acompanhamento-3m", "acompanhamento-6m"] as const)(
    "retorna uma URL de checkout válida em caso de sucesso para o plano %s",
    async (plan) => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "chk-1",
          link: "https://sandbox.asaas.com/checkoutSession/show/chk-1",
        }),
      });
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      const { createCheckout } = await import("./asaas");
      const amountCents = {
        avulso: 29900,
        "acompanhamento-3m": 59900,
        "acompanhamento-6m": 99900,
      }[plan];
      const result = await createCheckout(
        plan,
        "https://mentoria.example.com",
        amountCents,
      );

      expect(result.checkoutUrl).toBe(
        "https://sandbox.asaas.com/checkoutSession/show/chk-1",
      );

      // tasks.md T28 "Done when": createCheckout inclui externalReference =
      // slug do plano no payload enviado ao Asaas.
      const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(sentBody.externalReference).toBe(plan);

      // Fix MENT-04/MENT-05 (validation.md, ciclo 1): spec.md exige cobrança
      // única (não recorrente) e Pix + cartão como formas de pagamento - o
      // sensor de mutação do Verifier provou que nenhum teste travava uma
      // mudança indevida nesses dois campos.
      expect(sentBody.chargeTypes).toEqual(["DETACHED"]);
      expect(sentBody.billingTypes).toEqual(["PIX", "CREDIT_CARD"]);

      // Fix MENT-06/MENT-22 (validation.md, ciclo 1): o redirecionamento
      // pós-pagamento (sucesso -> /obrigado, recusa/cancelamento -> landing)
      // depende destes dois valores - não bastava a página /obrigado existir
      // isoladamente.
      expect(sentBody.callback.successUrl).toBe(
        "https://mentoria.example.com/obrigado",
      );
      expect(sentBody.callback.expiredUrl).toBe("https://mentoria.example.com");
      expect(sentBody.callback.cancelUrl).toBe("https://mentoria.example.com");
      expect(sentBody.items[0].value).toBe(amountCents / 100);
    },
  );

  it("lança um erro tipado (AsaasApiError) quando a API do Asaas retorna 5xx", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    const { createCheckout, AsaasApiError } = await import("./asaas");

    await expect(
      createCheckout("avulso", "https://mentoria.example.com", 29900),
    ).rejects.toBeInstanceOf(AsaasApiError);
  });

  it("rejeita callbacks locais antes de chamar o Asaas", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const { createCheckout, AsaasConfigurationError } = await import("./asaas");

    await expect(
      createCheckout("avulso", "http://localhost:3000", 29900),
    ).rejects.toBeInstanceOf(AsaasConfigurationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserva apenas o código e a descrição do primeiro erro do provedor", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        errors: [
          { code: "invalid_object", description: "callback inválido" },
        ],
      }),
    }) as unknown as typeof fetch;

    const { createCheckout, AsaasApiError } = await import("./asaas");

    try {
      await createCheckout("avulso", "https://mentoria.example.com", 29900);
      throw new Error("expected checkout to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(AsaasApiError);
      const asaasError = error as InstanceType<typeof AsaasApiError>;
      expect(asaasError.status).toBe(400);
      expect(asaasError.providerCode).toBe("invalid_object");
      expect(asaasError.providerDescription).toBe(
        "callback inválido",
      );
    }
  });

  it("lança um erro tipado (AsaasApiError) quando a chamada à API falha por timeout/rede", async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error("fetch timed out"));

    const { createCheckout, AsaasApiError } = await import("./asaas");

    await expect(
      createCheckout("avulso", "https://mentoria.example.com", 29900),
    ).rejects.toBeInstanceOf(AsaasApiError);
  });

  it("envia o valor final descontado recebido do servidor", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ link: "https://sandbox.asaas.com/checkout" }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { createCheckout } = await import("./asaas");
    await createCheckout("avulso", "https://mentoria.example.com", 23920);
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);

    expect(sentBody.items[0].value).toBe(239.2);
  });

  it("faz fallback para cartão quando a conta Sandbox não tem chave Pix", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          errors: [
            {
              code: "invalid_object",
              description: "Para gerar cobranças com Pix é necessário criar uma chave Pix no Asaas.",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ link: "https://sandbox.asaas.com/checkout" }),
      });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { createCheckout } = await import("./asaas");
    await createCheckout("avulso", "https://mentoria.example.com", 29900);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const fallbackBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(fallbackBody.billingTypes).toEqual(["CREDIT_CARD"]);
  });

  it.each([
    ["https://api.asaas.com", "https://api.asaas.com/v3/checkouts"],
    ["https://api.asaas.com/v3", "https://api.asaas.com/v3/checkouts"],
  ])(
    "usa exatamente uma versão /v3 quando a base é %s",
    async (baseUrl, expectedUrl) => {
      process.env.ASAAS_API_BASE_URL = baseUrl;
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ link: "https://sandbox.asaas.com/checkout" }),
      });
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      const { createCheckout } = await import("./asaas");
      await createCheckout("avulso", "https://mentoria.example.com", 29900);

      expect(fetchMock.mock.calls[0][0]).toBe(expectedUrl);
    },
  );
});
