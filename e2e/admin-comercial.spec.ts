import { expect, test } from "@playwright/test";
import { E2E_ADMIN_PASSWORD } from "../playwright.config";

test("admin atualiza um preço comercial", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Senha").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();

  const commercialLink = page.getByRole("link", { name: "Preços e cupons" });
  await expect(commercialLink).toBeVisible();
  await commercialLink.click();
  await expect(page).toHaveURL(/\/admin\/comercial$/);

  const priceInput = page.getByLabel("Novo preço para Direção de Carreira");
  await expect(priceInput).not.toHaveValue("");

  await priceInput.fill("389.00");
  await page.getByRole("button", { name: "Salvar" }).first().click();

  await expect(priceInput).toHaveValue("389.00");
  await expect(page.getByText("R$ 389,00")).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("R$ 389,00", { exact: true })).toBeVisible();
});

test("admin comercial exige uma sessão autenticada", async ({ page }) => {
  await page.goto("/admin/comercial");

  await expect(page).toHaveURL(/\/admin\/login$/);
});
