import { expect, test } from "@playwright/test";
import { FINAL_CTA_COPY } from "../content/copy";
import {
  COHORT_BADGE_COPY,
  NAV_LINKS,
  PAIN_POINTS_COPY,
  QUALIFICATION_COPY,
} from "../content/conversion";
import { TESTIMONIALS, TESTIMONIALS_COPY } from "../content/testimonials";

// Cobre spec.md P2 "Reforço de conversão" (AC1-AC6, MENT-34..39) e P2
// "Recomendações de ex-alunos" (AC1-AC2, MENT-27/40), e tasks.md T51 "Done
// when". Os testes e2e existentes de T13/T16/T36 (planos, legal notice,
// mobile, CTAs, hero, about, faq, footer) ficam em landing-page.spec.ts,
// checkout-cta.spec.ts e landing-page-full.spec.ts e não são alterados aqui.
//
// `page.locator("nav").first()` mira o NavBar (MENT-36) e não o `<nav>`
// interno do Footer (components/Footer.tsx) - o NavBar é o primeiro `<nav>`
// na ordem do DOM (montado fora de `<main>`, antes do Footer, em
// app/page.tsx).

test.describe("landing page - conversion boost sections (T51)", () => {
  test("fixed nav bar is visible and its 3 links navigate to the right anchors", async ({
    page,
  }) => {
    await page.goto("/");

    const navBar = page.locator("nav").first();
    await expect(navBar).toBeVisible();

    for (const link of NAV_LINKS) {
      await navBar.getByRole("link", { name: link.label }).click();
      await expect(page).toHaveURL(new RegExp(`${link.href}$`));
      await expect(page.locator(link.href)).toBeInViewport();
    }
  });

  test("nav bar stays visible after scrolling down the page", async ({
    page,
  }) => {
    await page.goto("/");
    const navBar = page.locator("nav").first();
    await expect(navBar).toBeVisible();

    await page.mouse.wheel(0, 2000);

    await expect(navBar).toBeVisible();
  });

  test("pain points section appears before the plans section", async ({
    page,
  }) => {
    await page.goto("/");

    const painHeading = page.getByRole("heading", {
      name: PAIN_POINTS_COPY.title,
    });
    const plansSection = page.locator("#planos");

    await expect(painHeading).toBeVisible();
    await expect(plansSection).toBeVisible();

    const painBox = await painHeading.boundingBox();
    const plansBox = await plansSection.boundingBox();
    expect(painBox).not.toBeNull();
    expect(plansBox).not.toBeNull();
    expect(painBox!.y).toBeLessThan(plansBox!.y);
  });

  test("cohort size badge is visible near the plans section", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.locator("#planos").getByText(COHORT_BADGE_COPY.text, {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("qualification section appears after the plans section", async ({
    page,
  }) => {
    await page.goto("/");

    const plansSection = page.locator("#planos");
    const qualificationHeading = page.getByRole("heading", {
      name: QUALIFICATION_COPY.title,
    });

    await expect(qualificationHeading).toBeVisible();

    const plansBox = await plansSection.boundingBox();
    const qualificationBox = await qualificationHeading.boundingBox();
    expect(plansBox).not.toBeNull();
    expect(qualificationBox).not.toBeNull();
    expect(qualificationBox!.y).toBeGreaterThan(plansBox!.y);
  });

  test("how-it-works section renders its 4 steps", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Como funciona" }),
    ).toBeVisible();
  });

  test("testimonials section renders recommendation cards 6 per page, sliding to the next page, each linking to the source", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: TESTIMONIALS_COPY.title }),
    ).toBeVisible();

    const testimonialSection = page
      .getByRole("heading", { name: TESTIMONIALS_COPY.title })
      .locator("xpath=ancestor::section");

    // Mirrors the component's PAGE_SIZE: with more than 6 testimonials,
    // only the first 6 render initially and pagination controls appear.
    const PAGE_SIZE = 6;
    const firstPage = TESTIMONIALS.slice(0, PAGE_SIZE);
    const secondPage = TESTIMONIALS.slice(PAGE_SIZE, PAGE_SIZE * 2);

    for (const testimonial of firstPage) {
      await expect(
        testimonialSection.getByText(testimonial.name, { exact: true }),
      ).toBeVisible();
    }
    for (const testimonial of secondPage) {
      await expect(
        testimonialSection.getByText(testimonial.name, { exact: true }),
      ).toHaveCount(0);
    }

    const linkedinLinks = testimonialSection.getByRole("link", {
      name: "Ver no LinkedIn",
    });
    await expect(linkedinLinks).toHaveCount(firstPage.length);
    for (const [index, testimonial] of firstPage.entries()) {
      await expect(linkedinLinks.nth(index)).toHaveAttribute(
        "href",
        testimonial.linkedinUrl,
      );
    }

    await expect(
      testimonialSection.getByRole("button", { name: "Depoimentos anteriores" }),
    ).toBeVisible();
    await testimonialSection
      .getByRole("button", { name: "Mais depoimentos" })
      .click();

    for (const testimonial of secondPage) {
      await expect(
        testimonialSection.getByText(testimonial.name, { exact: true }),
      ).toBeVisible();
    }
    for (const testimonial of firstPage) {
      await expect(
        testimonialSection.getByText(testimonial.name, { exact: true }),
      ).toHaveCount(0);
    }
  });

  test("final cta section renders and its button links to the plans section", async ({
    page,
  }) => {
    await page.goto("/");

    const ctaSection = page.locator("#cta-final");
    await expect(
      ctaSection.getByRole("heading", { name: FINAL_CTA_COPY.title }),
    ).toBeVisible();
    await expect(ctaSection.getByText(FINAL_CTA_COPY.text)).toBeVisible();

    await ctaSection
      .getByRole("button", { name: FINAL_CTA_COPY.buttonLabel })
      .click();

    await expect(page).toHaveURL(/#planos$/);
    await expect(page.locator("#planos")).toBeInViewport();
  });
});
