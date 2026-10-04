import { expect, test } from "@playwright/test";
import { E2E_ADMIN_PASSWORD } from "../playwright.config";

test("admin atualiza um preço comercial", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Senha").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.goto("/admin/comercial");
  const priceInput = page.getByLabel("Novo preço para Direção de Carreira");
  await expect(priceInput).toHaveValue("29900");

  await priceInput.fill("34900");
  await page.getByRole("button", { name: "Salvar" }).first().click();

  await expect(priceInput).toHaveValue("34900");
  await expect(page.getByText("R$ 349,00")).toBeVisible();
});
