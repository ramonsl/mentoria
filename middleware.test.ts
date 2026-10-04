import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createAdminSessionToken } from "./lib/admin-session";
import { config, middleware } from "./middleware";

// Cobre tasks.md T38 "Done when" (spec.md P2 "Lista de inscrições para o
// mentor", MENT-25): sem cookie válido -> redireciona para /admin/login; com
// cookie válido -> passa; /admin/login nunca é bloqueada (provado aqui via o
// `matcher` exportado, que é o mecanismo real que decide se o middleware
// roda ou não para uma rota - Next.js nunca invoca a função `middleware`
// para uma rota fora do matcher).

const VALID_ENV: Record<string, string> = {
  ASAAS_API_KEY: "asaas-key",
  ASAAS_API_BASE_URL: "https://api.asaas.com/v3",
  ASAAS_WEBHOOK_TOKEN: "webhook-token",
  DATABASE_URL: "postgresql://localhost/test",
  RESEND_API_KEY: "resend-key",
  MENTOR_EMAIL: "mentor@example.com",
  ADMIN_PASSWORD: "correct-horse-battery-staple",
  CRON_SECRET: "cron-secret",
};

function makeRequest(path: string, cookieHeader?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }
  return new NextRequest(new URL(path, "http://localhost:3000"), { headers });
}

describe("middleware", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      process.env[key] = value;
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("requisição a /admin/inscricoes sem cookie é redirecionada para /admin/login", async () => {
    const response = await middleware(makeRequest("/admin/inscricoes"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/admin/login",
    );
  });

  it("requisição a /admin/inscricoes com cookie inválido é redirecionada para /admin/login", async () => {
    const response = await middleware(
      makeRequest("/admin/inscricoes", "admin_session=token-forjado"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/admin/login",
    );
  });

  it("requisição a /admin/inscricoes com cookie válido passa (sem redirecionar)", async () => {
    const validToken = await createAdminSessionToken(
      VALID_ENV.ADMIN_PASSWORD,
    );

    const response = await middleware(
      makeRequest("/admin/inscricoes", `admin_session=${validToken}`),
    );

    expect(response.status).not.toBe(307);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("/admin/login nunca é alcançada pelo middleware (fora do matcher exportado)", () => {
    // O Next.js só invoca a função `middleware` para uma rota quando ela
    // casa com `config.matcher` - lido aqui diretamente do valor exportado
    // por middleware.ts, não reimplementado. /admin/login não aparece na
    // lista, logo não pode ser bloqueada por este middleware.
    expect(config.matcher).not.toContain("/admin/login");
    expect(config.matcher).toContain("/admin/inscricoes");
  });
});
