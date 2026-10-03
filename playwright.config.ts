import { defineConfig, devices } from "@playwright/test";

// PORT é opcional - default 3000, igual ao comportamento anterior. Permite
// apontar para um `next dev` já rodando em outra porta (reuseExistingServer
// só reaproveita se a URL configurada já responder) sem precisar derrubar um
// processo existente para rodar a suíte localmente.
const PORT = process.env.PORT ?? "3000";
const BASE_URL = `http://localhost:${PORT}`;

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
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
