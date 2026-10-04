import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLANS } from "../content/plans";
import { EMAIL_TEMPLATES_COPY } from "../content/emails";
import type { Enrollment } from "../lib/enrollments";

// Cobre tasks.md T22 "Done when" (spec.md AC5/AC6, content.md §10.1-10.3):
// sendMenteeConfirmation envia ao mentorando com o assunto/corpo certos;
// sendMentorNewEnrollmentAlert envia ao MENTOR_EMAIL para os dois planos com
// os dados corretos; sendMentorExpirationAlert envia ao MENTOR_EMAIL com os
// dados corretos. Só o client Resend (./lib/email) é mockado - o restante
// (interpolação, PLANS, content/emails.ts) roda de verdade.

const mockSend = vi.fn();

vi.mock("../lib/email", () => ({
  getResendClient: () => ({ emails: { send: mockSend } }),
  sendWithRetry: (fn: () => Promise<unknown>) => fn(),
}));

import {
  sendMenteeConfirmation,
  sendMentorExpirationAlert,
  sendMentorNewEnrollmentAlert,
} from "./templates";

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

function makeEnrollment(overrides: Partial<Enrollment> = {}): Enrollment {
  return {
    id: "enr-1",
    asaasCheckoutId: "chk-1",
    plan: PLANS[0].slug,
    status: "ativa",
    customerName: "Fulano de Tal",
    customerEmail: "fulano@example.com",
    amountCents: PLANS[0].priceCents,
    paidAt: new Date("2026-01-15T00:00:00.000Z"),
    expiresAt: new Date("2026-07-15T00:00:00.000Z"),
    createdAt: new Date("2026-01-15T00:00:00.000Z"),
    updatedAt: new Date("2026-01-15T00:00:00.000Z"),
    ...overrides,
  };
}

describe("emails/templates", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      process.env[key] = value;
    }
    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("sendMenteeConfirmation", () => {
    it("envia ao e-mail do mentorando com assunto e corpo de content/emails.ts §10.1", async () => {
      await sendMenteeConfirmation(makeEnrollment());

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];
      expect(call.to).toBe("fulano@example.com");
      expect(call.subject).toBe(
        EMAIL_TEMPLATES_COPY.menteeConfirmation.subject,
      );
      expect(call.text).toContain("Olá, Fulano!");
      expect(call.text).toContain(`${PLANS[0].name} (${PLANS[0].priceLabel})`);
    });
  });

  describe("sendMentorNewEnrollmentAlert", () => {
    it.each(PLANS)(
      "envia ao MENTOR_EMAIL com os dados corretos para o plano $slug",
      async (plan) => {
        await sendMentorNewEnrollmentAlert(
          makeEnrollment({ plan: plan.slug, amountCents: plan.priceCents }),
        );

        expect(mockSend).toHaveBeenCalledTimes(1);
        const call = mockSend.mock.calls[0][0];
        expect(call.to).toBe("mentor@example.com");
        expect(call.subject).toBe(
          `[Mentoria] Nova inscrição - ${plan.name} - Fulano de Tal`,
        );
        expect(call.text).toContain("Nome: Fulano de Tal");
        expect(call.text).toContain("E-mail: fulano@example.com");
        expect(call.text).toContain(`Plano: ${plan.name}`);
        expect(call.text).toContain("Data de pagamento: 15/01/2026");
        expect(call.text).toContain("Data de expiração: 15/07/2026");
        expect(call.text).not.toContain("Possível duplicidade");
      },
    );

    // Fix MENT-18 (validation.md, ciclo 1): spec.md AC9 exige que o mentor
    // seja alertado sobre a possível duplicidade, não só que o pagamento
    // seja registrado normalmente.
    it("inclui o aviso de possível duplicidade quando duplicateAlert é true", async () => {
      await sendMentorNewEnrollmentAlert(makeEnrollment(), {
        duplicateAlert: true,
      });

      const call = mockSend.mock.calls[0][0];
      expect(call.text).toContain(
        "Possível duplicidade: já existe uma inscrição ativa",
      );
    });
  });

  describe("sendMentorExpirationAlert", () => {
    it("envia ao MENTOR_EMAIL com os dados corretos", async () => {
      await sendMentorExpirationAlert(makeEnrollment());

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];
      expect(call.to).toBe("mentor@example.com");
      expect(call.subject).toBe("[Mentoria] Acesso expirado - remover Fulano de Tal");
      expect(call.text).toContain("Nome: Fulano de Tal");
      expect(call.text).toContain(`Plano: ${PLANS[0].name}`);
      expect(call.text).toContain("Data de expiração: 15/07/2026");
    });
  });
});
