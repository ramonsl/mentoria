import { expect, test } from "@playwright/test";
import { EVENT_COPY } from "../content/event";

test.describe("palestra - página do evento", () => {
  test("mostra título, detalhes e formulário de inscrição", async ({ page }) => {
    await page.goto("/palestra");

    await expect(page.getByRole("heading", { level: 1, name: EVENT_COPY.title })).toBeVisible();
    await expect(page.getByText("Gratuito", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: EVENT_COPY.form.submitLabel })).toBeVisible();
  });

  test("dados inválidos mostram o erro de cada campo sem perder o que foi digitado", async ({ page }) => {
    await page.goto("/palestra");

    await page.getByLabel("Nome").fill("Ana Lima");
    await page.getByLabel("E-mail").fill("ana@");
    await page.getByLabel("WhatsApp").fill("123");
    await page.getByRole("button", { name: EVENT_COPY.form.submitLabel }).click();

    await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
    await expect(page.getByText(/Informe um WhatsApp com DDD/)).toBeVisible();
    await expect(page.getByText("Informe seu nome.")).toHaveCount(0);
    await expect(page.getByLabel("Nome")).toHaveValue("Ana Lima");
  });

  test("CTA final leva ao formulário", async ({ page }) => {
    await page.goto("/palestra");

    await page.getByRole("link", { name: EVENT_COPY.finalCta.buttonLabel }).click();

    await expect(page).toHaveURL(/#inscricao$/);
    await expect(page.locator("#inscricao")).toBeInViewport();
  });

  test("mobile: sem rolagem horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/palestra");

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });

  test("admin do evento e exportação exigem login", async ({ page }) => {
    await page.goto("/admin/eventos");
    await expect(page).toHaveURL(/\/admin\/login$/);

    await page.goto("/admin/eventos/export");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
