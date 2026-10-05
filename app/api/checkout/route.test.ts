import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateCheckout,
  mockListPlanPrices,
  mockReleaseCouponReservation,
  mockReserveCoupon,
} = vi.hoisted(() => ({
  mockCreateCheckout: vi.fn(),
  mockListPlanPrices: vi.fn(),
  mockReleaseCouponReservation: vi.fn(),
  mockReserveCoupon: vi.fn(),
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

vi.mock("../../../lib/commercial", async () => {
  const actual =
    await vi.importActual<typeof import("../../../lib/commercial")>(
      "../../../lib/commercial",
    );
  return {
    ...actual,
    listPlanPrices: mockListPlanPrices,
    releaseCouponReservation: mockReleaseCouponReservation,
    reserveCoupon: mockReserveCoupon,
  };
});

import { AsaasApiError } from "../../../lib/asaas";
import { CommercialError } from "../../../lib/commercial";
import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    mockCreateCheckout.mockReset();
    mockListPlanPrices.mockReset();
    mockReleaseCouponReservation.mockReset();
    mockReserveCoupon.mockReset();
    mockListPlanPrices.mockResolvedValue({
      avulso: 29900,
      "acompanhamento-3m": 59900,
      "acompanhamento-6m": 99900,
    });
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

  it("normaliza e reserva um cupom válido antes de criar o checkout", async () => {
    mockReserveCoupon.mockResolvedValue({
      couponId: "coupon-1",
      priceCents: 23920,
    });
    mockCreateCheckout.mockResolvedValue({
      checkoutUrl: "https://sandbox.asaas.com/checkoutSession/show/chk-1",
    });

    const response = await POST(
      makeRequest({ plan: "avulso", couponCode: "  oferta20  " }),
    );

    expect(response.status).toBe(200);
    expect(mockReserveCoupon).toHaveBeenCalledWith(
      "OFERTA20",
      "avulso",
      29900,
      expect.any(Date),
    );
    expect(mockCreateCheckout).toHaveBeenCalledWith(
      "avulso",
      "http://localhost:3000",
      23920,
    );
  });

  it("usa o preço persistido quando nenhum cupom é enviado", async () => {
    mockCreateCheckout.mockResolvedValue({
      checkoutUrl: "https://sandbox.asaas.com/checkoutSession/show/chk-1",
    });

    const response = await POST(makeRequest({ plan: "avulso" }));

    expect(response.status).toBe(200);
    expect(mockCreateCheckout).toHaveBeenCalledWith(
      "avulso",
      "http://localhost:3000",
      29900,
    );
    expect(mockReserveCoupon).not.toHaveBeenCalled();
  });

  it("não cria checkout quando o preço persistido não está disponível", async () => {
    mockListPlanPrices.mockResolvedValue({});

    const response = await POST(makeRequest({ plan: "avulso" }));

    expect(response.status).toBe(400);
    expect(mockCreateCheckout).not.toHaveBeenCalled();
  });

  it.each([
    { status: 502, category: "upstream" },
    { status: 401, category: "auth" },
    { status: 400, category: "payload" },
    { status: 404, category: "endpoint" },
    { status: undefined, category: "network" },
  ])(
    "registra categoria segura para falha Asaas $status",
    async ({ status, category }) => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const upstreamDetail = "private Asaas response detail";
      mockCreateCheckout.mockRejectedValue(
        new AsaasApiError(upstreamDetail, status),
      );

      const response = await POST(makeRequest({ plan: "avulso" }));
      const json = (await response.json()) as { error?: string };

      expect(response.status).toBe(502);
      expect(json.error).toBe(
        "Não foi possível iniciar o pagamento agora. Tente novamente em instantes.",
      );
      expect(json.error).not.toContain(upstreamDetail);
      expect(consoleError).toHaveBeenCalledWith(
        "[checkout] Asaas checkout failed",
        JSON.stringify({
          category,
          status: status ?? null,
          providerCode: null,
          providerDescription: null,
        }),
      );
      expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
        upstreamDetail,
      );
    },
  );

  it("libera a reserva quando o Asaas falha", async () => {
    mockReserveCoupon.mockResolvedValue({
      couponId: "coupon-1",
      priceCents: 23920,
    });
    mockCreateCheckout.mockRejectedValue(
      new AsaasApiError("Asaas API returned 502", 502),
    );

    const response = await POST(
      makeRequest({ plan: "avulso", couponCode: "oferta20" }),
    );

    expect(response.status).toBe(502);
    expect(mockReleaseCouponReservation).toHaveBeenCalledWith("coupon-1");
  });

  it("usa a origem pública configurada nos callbacks", async () => {
    process.env.PUBLIC_APP_URL = "https://mentoria.example.com/";
    mockCreateCheckout.mockResolvedValue({
      checkoutUrl: "https://sandbox.asaas.com/checkoutSession/show/chk-1",
    });

    const response = await POST(makeRequest({ plan: "avulso" }));

    expect(response.status).toBe(200);
    expect(mockCreateCheckout).toHaveBeenCalledWith(
      "avulso",
      "https://mentoria.example.com",
      29900,
    );
  });

  it("retorna 400 sem criar checkout quando o cupom é inválido", async () => {
    mockReserveCoupon.mockRejectedValue(new CommercialError("expired"));

    const response = await POST(
      makeRequest({ plan: "avulso", couponCode: "expirado" }),
    );
    const json = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(json.error).toBe("Este cupom expirou.");
    expect(mockCreateCheckout).not.toHaveBeenCalled();
  });

  it("retorna 400 sem criar checkout quando o código do cupom é malformado", async () => {
    const response = await POST(makeRequest({ plan: "avulso", couponCode: 123 }));

    expect(response.status).toBe(400);
    expect(mockReserveCoupon).not.toHaveBeenCalled();
    expect(mockCreateCheckout).not.toHaveBeenCalled();
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
