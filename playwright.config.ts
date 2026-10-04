import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// PORT é opcional - default 3000, igual ao comportamento anterior. Permite
// apontar para um `next dev` já rodando em outra porta (reuseExistingServer
// só reaproveita se a URL configurada já responder) sem precisar derrubar um
// processo existente para rodar a suíte localmente.
const PORT = process.env.PORT ?? "3000";
const BASE_URL = `http://localhost:${PORT}`;

// Env do webServer (next dev): valores dummy para as vars obrigatórias de
// lib/env.ts que as rotas de admin (T37/T38) e a página de inscrições (T41)
// agora exigem em runtime - sem isso `getEnv()` lançaria erro ao servir
// /admin/login, /admin/inscricoes e o middleware. DATABASE_URL aponta para
// fake-neon-e2e.test, interceptada por e2e/support/fake-neon-fetch.cjs (via
// NODE_OPTIONS), que semeia os dados usados por
// e2e/admin-inscricoes.spec.ts (T41). Cada valor só preenche quando ausente
// do ambiente real, então um `.env.local` do desenvolvedor continua
// prevalecendo fora deste fallback de teste.
const E2E_SERVER_ENV: Record<string, string> = {
  NODE_OPTIONS: `--require ${path.resolve(
    __dirname,
    "e2e/support/fake-neon-fetch.cjs",
  )}`,
  ASAAS_API_KEY: process.env.ASAAS_API_KEY ?? "e2e-test-asaas-key",
  ASAAS_API_BASE_URL:
    process.env.ASAAS_API_BASE_URL ?? "https://api-sandbox.asaas.com/v3",
  ASAAS_WEBHOOK_TOKEN:
    process.env.ASAAS_WEBHOOK_TOKEN ?? "e2e-test-webhook-token",
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://user:pass@fake-neon-e2e.test/db",
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "e2e-test-resend-key",
  MENTOR_EMAIL: process.env.MENTOR_EMAIL ?? "mentor@example.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "e2e-test-admin-password",
  CRON_SECRET: process.env.CRON_SECRET ?? "e2e-test-cron-secret",
};

// Reexportado para e2e/admin-inscricoes.spec.ts (T41) usar a mesma senha que
// o webServer recebeu, sem duplicar o fallback.
export const E2E_ADMIN_PASSWORD = E2E_SERVER_ENV.ADMIN_PASSWORD;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.E2E_SERVER_COMMAND ?? "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: E2E_SERVER_ENV,
  },
});
