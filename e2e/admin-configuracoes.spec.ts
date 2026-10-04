import { expect, test, type Page } from "@playwright/test";
import { E2E_ADMIN_PASSWORD } from "../playwright.config";

// Menu lateral do admin (Inscrições/Configurações) e a tela de status das
// configurações do Asaas (só leitura, nunca mostra segredo).

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Senha").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin\/inscricoes$/);
}

test.describe("admin - menu lateral e configurações", () => {
  test("acessar /admin/configuracoes sem sessão redireciona para /admin/login", async ({
    page,
  }) => {
    await page.goto("/admin/configuracoes");

    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("o menu lateral mostra Inscrições e Configurações e navega entre as duas", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const nav = page.locator("aside");
    await expect(nav.getByRole("link", { name: "Inscrições" })).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Configurações" }),
    ).toBeVisible();

    await nav.getByRole("link", { name: "Configurações" }).click();
    await expect(page).toHaveURL(/\/admin\/configuracoes$/);
    await expect(
      page.getByRole("heading", { name: "Configurações" }),
    ).toBeVisible();
  });

  test("mostra o status configurado/ausente sem expor valores de segredo", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/configuracoes");

    await expect(page.getByText("Chave da API")).toBeVisible();
    await expect(page.getByText("Token do webhook")).toBeVisible();
    await expect(page.getByText("Configurado").first()).toBeVisible();

    // Nunca expõe o valor de um segredo - só "Configurado"/"Ausente".
    await expect(page.getByText("e2e-test-asaas-key")).toHaveCount(0);
    await expect(page.getByText("e2e-test-webhook-token")).toHaveCount(0);
  });
});
