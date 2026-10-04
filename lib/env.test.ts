import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getEnv, type Env } from "./env";

const REQUIRED_ENV_VARS: (keyof Env)[] = [
  "ASAAS_API_KEY",
  "ASAAS_API_BASE_URL",
  "ASAAS_WEBHOOK_TOKEN",
  "DATABASE_URL",
  "RESEND_API_KEY",
  "MENTOR_EMAIL",
  "ADMIN_PASSWORD",
  "CRON_SECRET",
];

const VALID_ENV: Record<keyof Env, string> = {
  ASAAS_API_KEY: "asaas-key",
  ASAAS_API_BASE_URL: "https://api.asaas.com/v3",
  ASAAS_WEBHOOK_TOKEN: "webhook-token",
  DATABASE_URL: "postgresql://localhost/test",
  RESEND_API_KEY: "resend-key",
  MENTOR_EMAIL: "mentor@example.com",
  ADMIN_PASSWORD: "admin-password",
  CRON_SECRET: "cron-secret",
};

describe("getEnv", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const key of REQUIRED_ENV_VARS) {
      process.env[key] = VALID_ENV[key];
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns a typed object with all required vars present", () => {
    const env = getEnv();
    expect(env).toEqual(VALID_ENV);
  });

  it.each(REQUIRED_ENV_VARS)(
    "throws an error naming %s when it is missing",
    (missingKey) => {
      delete process.env[missingKey];
      expect(() => getEnv()).toThrowError(new RegExp(missingKey));
    },
  );
});
