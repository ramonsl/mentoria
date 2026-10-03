import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLANS } from "../../../../content/plans";
import type { Enrollment } from "../../../../lib/enrollments";

// Cobre tasks.md T25 "Done when" (spec.md AC11, MENT-20): secret
// ausente/incorreto -> 401 sem processar nada; inscrições vencidas (qualquer
// plano) são marcadas expiradas e o mentor recebe um e-mail por cada uma;
// nenhuma vencida -> nenhum e-mail.

const { mockMarkExpiredEnrollments } = vi.hoisted(() => ({
  mockMarkExpiredEnrollments: vi.fn(),
}));

vi.mock("../../../../lib/enrollments", () => ({
  markExpiredEnrollments: mockMarkExpiredEnrollments,
}));

const { mockSendMentorExpirationAlert } = vi.hoisted(() => ({
  mockSendMentorExpirationAlert: vi.fn(),
}));

vi.mock("../../../../emails/templates", () => ({
  sendMentorExpirationAlert: mockSendMentorExpirationAlert,
}));

import { GET } from "./route";

const VALID_ENV: Record<string, string> = {
  ASAAS_API_KEY: "asaas-key",
  ASAAS_API_BASE_URL: "https://api.asaas.com/v3",
  ASAAS_WEBHOOK_TOKEN: "webhook-token",
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  RESEND_API_KEY: "resend-key",
  MENTOR_EMAIL: "mentor@example.com",
  ADMIN_PASSWORD: "admin-password",
  CRON_SECRET: "correct-cron-secret",
};

function makeRequest(authorization?: string): Request {
  const headers: Record<string, string> = {};
  if (authorization !== undefined) {
    headers.authorization = authorization;
  }
  return new Request("http://localhost:3000/api/cron/check-expirations", {
    headers,
  });
}

function makeExpiredEnrollment(overrides: Partial<Enrollment> = {}): Enrollment {
  return {
    id: "enr-expired-1",
    asaasCheckoutId: "chk-1",
    plan: PLANS[0].slug,
    status: "expirada",
    customerName: "Fulano de Tal",
    customerEmail: "fulano@example.com",
    amountCents: PLANS[0].priceCents,
    paidAt: new Date("2026-01-01T00:00:00.000Z"),
    expiresAt: new Date("2026-07-01T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("GET /api/cron/check-expirations", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      process.env[key] = value;
    }
    mockMarkExpiredEnrollments.mockReset();
    mockSendMentorExpirationAlert.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("secret ausente: retorna 401 e não processa nada", async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(mockMarkExpiredEnrollments).not.toHaveBeenCalled();
    expect(mockSendMentorExpirationAlert).not.toHaveBeenCalled();
  });

  it("secret incorreto: retorna 401 e não processa nada", async () => {
    const response = await GET(makeRequest("Bearer wrong-secret"));

    expect(response.status).toBe(401);
    expect(mockMarkExpiredEnrollments).not.toHaveBeenCalled();
    expect(mockSendMentorExpirationAlert).not.toHaveBeenCalled();
  });

  it.each(PLANS)(
    "secret correto: inscrições vencidas do plano $slug são marcadas expiradas e o mentor recebe um e-mail por cada uma",
    async (plan) => {
      const expiredOne = makeExpiredEnrollment({
        id: "enr-1",
        plan: plan.slug,
      });
      const expiredTwo = makeExpiredEnrollment({
        id: "enr-2",
        plan: plan.slug,
        customerEmail: "ciclano@example.com",
      });
      mockMarkExpiredEnrollments.mockResolvedValue([expiredOne, expiredTwo]);

      const response = await GET(
        makeRequest("Bearer correct-cron-secret"),
      );

      expect(response.status).toBe(200);
      expect(mockMarkExpiredEnrollments).toHaveBeenCalledTimes(1);
      expect(mockSendMentorExpirationAlert).toHaveBeenCalledTimes(2);
      expect(mockSendMentorExpirationAlert).toHaveBeenCalledWith(expiredOne);
      expect(mockSendMentorExpirationAlert).toHaveBeenCalledWith(expiredTwo);
    },
  );

  it("secret correto, nenhuma inscrição vencida: nenhum e-mail é enviado", async () => {
    mockMarkExpiredEnrollments.mockResolvedValue([]);

    const response = await GET(makeRequest("Bearer correct-cron-secret"));

    expect(response.status).toBe(200);
    expect(mockSendMentorExpirationAlert).not.toHaveBeenCalled();
  });
});
