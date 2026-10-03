import { expect, test } from "@playwright/test";
import { ABOUT_MENTOR } from "../content/about";
import { HERO_COPY } from "../content/copy";

// Cobre spec.md P2 "Hero, rodapé e política de privacidade" AC1-AC4
// (MENT-29/30/31/32) e tasks.md T36 "Done when": Hero acima dos planos,
// âncoras do Hero navegando para #planos/#sobre, e as seções Sobre/FAQ/rodapé
// presentes na página completa. Os testes de T13 (planos, legal notice,
// mobile) ficam em e2e/landing-page.spec.ts e não são alterados aqui.

test.describe("landing page - full composition (hero, about, faq, footer)", () => {
  test("hero appears above the plans section", async ({ page }) => {
    await page.goto("/");

    const heroHeading = page.getByRole("heading", { name: HERO_COPY.title });
    const plansSection = page.locator("#planos");

    await expect(heroHeading).toBeVisible();
    await expect(plansSection).toBeVisible();

    const heroBox = await heroHeading.boundingBox();
    const plansBox = await plansSection.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(plansBox).not.toBeNull();
    expect(heroBox!.y).toBeLessThan(plansBox!.y);
  });

  test("hero primary CTA navigates to the plans section", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .getByRole("link", { name: HERO_COPY.primaryCta.label })
      .click();

    await expect(page).toHaveURL(/#planos$/);
    await expect(page.locator("#planos")).toBeInViewport();
  });

  test("hero secondary CTA navigates to the about-mentor section", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .getByRole("link", { name: HERO_COPY.secondaryCta.label })
      .click();

    await expect(page).toHaveURL(/#sobre$/);
    await expect(page.locator("#sobre")).toBeInViewport();
  });

  test("about-mentor, faq and footer sections render with a link to the privacy policy", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("#sobre")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: ABOUT_MENTOR.name }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Perguntas frequentes" }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Política de privacidade" }),
    ).toHaveAttribute("href", "/privacidade");
  });
});
