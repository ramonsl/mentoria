import { expect, test } from "@playwright/test";
import { PLANS } from "../content/plans";
import { E2E_ADMIN_PASSWORD } from "../playwright.config";

// Cobre tasks.md T41 "Done when" (spec.md P2 "Lista de inscrições para o
// mentor", MENT-25): acesso sem sessão redireciona pro login; login com a
// senha correta volta pra /admin/inscricoes e exibe a lista (dados semeados
// por e2e/support/fake-supabase-fetch.cjs, carregado pelo webServer via
// NODE_OPTIONS - não há projeto Supabase real disponível neste ambiente,
// mesma limitação já documentada em tasks.md T5/T26); cada linha mostra
// nome/e-mail/plano/data de pagamento/data de expiração; lista ordenada por
// proximidade da expiração. Os 3 registros semeados (ver
// fake-supabase-fetch.cjs) vencem em 2026-07-10 (Ana), 2026-10-15 (Bruno) e
// 2027-04-01 (Carla), nessa ordem.

const PRIMEIRA_VAGA_NAME = PLANS.find((p) => p.slug === "primeira-vaga")!.name;

test.describe("admin - lista de inscrições", () => {
  test("acessar /admin/inscricoes sem sessão redireciona para /admin/login", async ({
    page,
  }) => {
    await page.goto("/admin/inscricoes");

    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("logar com a senha correta volta para /admin/inscricoes e exibe a lista ordenada por proximidade da expiração", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Senha").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/admin\/inscricoes$/);

    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(3);

    // Mais próxima de expirar primeiro: Ana (2026-07-10) < Bruno
    // (2026-10-15) < Carla (2027-04-01).
    await expect(rows.nth(0)).toContainText("Ana Beatriz Souza");
    await expect(rows.nth(1)).toContainText("Bruno Lima");
    await expect(rows.nth(2)).toContainText("Carla Mendes");
  });

  test("cada linha mostra nome, e-mail, plano, data de pagamento e data de expiração", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Senha").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/admin\/inscricoes$/);

    const firstRow = page.locator("table tbody tr").nth(0);
    await expect(firstRow).toContainText("Ana Beatriz Souza");
    await expect(firstRow).toContainText("ana.beatriz@example.com");
    await expect(firstRow).toContainText(PRIMEIRA_VAGA_NAME);
    await expect(firstRow).toContainText("10/01/2026"); // pago em
    await expect(firstRow).toContainText("10/07/2026"); // expira em
  });
});
