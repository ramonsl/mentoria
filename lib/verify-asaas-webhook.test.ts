import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isValidWebhookToken } from "./verify-asaas-webhook";

// Cobre tasks.md T17 "Done when" (spec.md MENT-11): token correto -> true,
// token incorreto -> false, header ausente -> false.

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

describe("isValidWebhookToken", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      process.env[key] = value;
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("retorna true quando o header corresponde ao token configurado", () => {
    expect(isValidWebhookToken("correct-webhook-token")).toBe(true);
  });

  it("retorna false quando o header não corresponde ao token configurado", () => {
    expect(isValidWebhookToken("wrong-token")).toBe(false);
  });

  it("retorna false quando o header está ausente (null)", () => {
    expect(isValidWebhookToken(null)).toBe(false);
  });

  it("retorna false quando o header está ausente (undefined)", () => {
    expect(isValidWebhookToken(undefined)).toBe(false);
  });
});
