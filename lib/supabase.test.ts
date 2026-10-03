import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSupabaseClient } from "./supabase";

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

describe("getSupabaseClient", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      process.env[key] = value;
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns a configured Supabase client when env is complete", () => {
    const client = getSupabaseClient();
    expect(typeof client.from).toBe("function");
  });

  it("throws a clear error naming the missing var when a required env var is absent", () => {
    delete process.env.SUPABASE_URL;
    expect(() => getSupabaseClient()).toThrowError(/SUPABASE_URL/);
  });
});
