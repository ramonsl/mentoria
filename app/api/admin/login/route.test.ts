import { afterEach, beforeEach, describe, expect, it } from "vitest";

// Cobre tasks.md T37 "Done when" (spec.md P2 "Lista de inscrições para o
// mentor", MENT-25): senha correta -> 200 + cookie httpOnly setado; senha
// incorreta -> 401, nenhum cookie setado.

import { POST } from "./route";
import { ADMIN_SESSION_COOKIE_NAME } from "../../../../lib/admin-session";

const VALID_ENV: Record<string, string> = {
  ASAAS_API_KEY: "asaas-key",
  ASAAS_API_BASE_URL: "https://api.asaas.com/v3",
  ASAAS_WEBHOOK_TOKEN: "webhook-token",
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  RESEND_API_KEY: "resend-key",
  MENTOR_EMAIL: "mentor@example.com",
  ADMIN_PASSWORD: "correct-horse-battery-staple",
  CRON_SECRET: "cron-secret",
};

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/login", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      process.env[key] = value;
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("senha correta retorna 200 e seta um cookie httpOnly", async () => {
    const response = await POST(
      makeRequest({ password: "correct-horse-battery-staple" }),
    );

    expect(response.status).toBe(200);

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).not.toBeNull();
    expect(setCookie).toContain(`${ADMIN_SESSION_COOKIE_NAME}=`);
    expect(setCookie?.toLowerCase()).toContain("httponly");

    // A senha em texto puro nunca aparece no valor do cookie.
    const cookieValue = setCookie!.split(";")[0].split("=")[1];
    expect(cookieValue).not.toBe("correct-horse-battery-staple");
    expect(cookieValue).not.toContain("correct-horse-battery-staple");
  });

  it("senha incorreta retorna 401 e nenhum cookie é setado", async () => {
    const response = await POST(makeRequest({ password: "wrong-password" }));

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("senha ausente retorna 401 e nenhum cookie é setado", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
