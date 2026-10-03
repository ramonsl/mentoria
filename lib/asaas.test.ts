import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cobre tasks.md T14 "Done when": checkout criado com sucesso (mock) para
// os dois planos, e erro 5xx/timeout da API do Asaas lançando um erro
// tipado reconhecível pela rota de checkout (T15).

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

  it.each(["primeira-vaga", "proximo-nivel"] as const)(
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
      const result = await createCheckout(
        plan,
        "https://mentoria.example.com",
      );

      expect(result.checkoutUrl).toBe(
        "https://sandbox.asaas.com/checkoutSession/show/chk-1",
      );

      // tasks.md T28 "Done when": createCheckout inclui externalReference =
      // slug do plano no payload enviado ao Asaas.
      const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(sentBody.externalReference).toBe(plan);
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
      createCheckout("primeira-vaga", "https://mentoria.example.com"),
    ).rejects.toBeInstanceOf(AsaasApiError);
  });

  it("lança um erro tipado (AsaasApiError) quando a chamada à API falha por timeout/rede", async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error("fetch timed out"));

    const { createCheckout, AsaasApiError } = await import("./asaas");

    await expect(
      createCheckout("primeira-vaga", "https://mentoria.example.com"),
    ).rejects.toBeInstanceOf(AsaasApiError);
  });
});
