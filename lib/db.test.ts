import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getDb } from "./db";

const VALID_ENV: Record<string, string> = {
  ASAAS_API_KEY: "asaas-key",
  ASAAS_API_BASE_URL: "https://api.asaas.com/v3",
  ASAAS_WEBHOOK_TOKEN: "webhook-token",
  DATABASE_URL: "postgresql://user:pass@fake.neon.test/testdb",
  RESEND_API_KEY: "resend-key",
  MENTOR_EMAIL: "mentor@example.com",
  ADMIN_PASSWORD: "admin-password",
  CRON_SECRET: "cron-secret",
};

describe("getDb", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      process.env[key] = value;
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("retorna um cliente Drizzle quando DATABASE_URL está configurado", () => {
    const db = getDb();
    expect(typeof db.select).toBe("function");
    expect(typeof db.insert).toBe("function");
    expect(typeof db.update).toBe("function");
  });

  it("lança erro claro quando DATABASE_URL está ausente", () => {
    delete process.env.DATABASE_URL;
    expect(() => getDb()).toThrowError(/DATABASE_URL/);
  });
});
