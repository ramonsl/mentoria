import { beforeEach, describe, expect, it, vi } from "vitest";

// Cobre tasks.md T15 "Done when": caminho feliz para os dois planos, falha
// 5xx/timeout do Asaas vira 502 amigável, e plan ausente/inválido vira 400.

const { mockCreateCheckout } = vi.hoisted(() => ({
  mockCreateCheckout: vi.fn(),
}));

vi.mock("../../../lib/asaas", async () => {
  const actual =
    await vi.importActual<typeof import("../../../lib/asaas")>(
      "../../../lib/asaas",
    );
  return {
    ...actual,
    createCheckout: mockCreateCheckout,
  };
});

import { AsaasApiError } from "../../../lib/asaas";
import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    mockCreateCheckout.mockReset();
  });

  it.each(["avulso", "acompanhamento-3m", "acompanhamento-6m"] as const)(
    "retorna checkoutUrl para o plano %s no caminho feliz",
    async (plan) => {
      mockCreateCheckout.mockResolvedValue({
        checkoutUrl: `https://sandbox.asaas.com/checkoutSession/show/${plan}`,
      });

      const response = await POST(makeRequest({ plan }));
      const json = (await response.json()) as { checkoutUrl?: string };

      expect(response.status).toBe(200);
      expect(json.checkoutUrl).toBe(
        `https://sandbox.asaas.com/checkoutSession/show/${plan}`,
      );
    },
  );

  it("retorna 502 com mensagem amigável quando o Asaas falha (5xx/timeout)", async () => {
    mockCreateCheckout.mockRejectedValue(
      new AsaasApiError("Asaas API returned 502", 502),
    );

    const response = await POST(makeRequest({ plan: "avulso" }));
    const json = (await response.json()) as { error?: string };

    expect(response.status).toBe(502);
    expect(typeof json.error).toBe("string");
    expect((json.error ?? "").length).toBeGreaterThan(0);
  });

  it("retorna 400 quando plan está ausente", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    expect(mockCreateCheckout).not.toHaveBeenCalled();
  });

  it("retorna 400 quando plan é inválido", async () => {
    const response = await POST(makeRequest({ plan: "plano-inexistente" }));

    expect(response.status).toBe(400);
    expect(mockCreateCheckout).not.toHaveBeenCalled();
  });
});
