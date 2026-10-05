import { expect, test } from "@playwright/test";
import { LEGAL_NOTICE_COPY } from "../content/copy";
import { PLANS } from "../content/plans";

const PRICE_PATTERN = /R\$\s*\d{1,3}(?:\.\d{3})*,\d{2}/;

// Cobre spec.md P1 "Ver e comparar os planos" (AC1-AC3) e o aviso de 7 dias
// (AC4 de "Pagar o plano escolhido", MENT-07) na própria página de planos.

test.describe("landing page - plan comparison", () => {
  test("desktop: shows all plans side by side with persisted prices and CTAs", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    const cards = page.getByRole("article");
    await expect(cards).toHaveCount(3);

    for (const [index, plan] of PLANS.entries()) {
      await expect(
        page.getByRole("heading", { name: plan.name }),
      ).toBeVisible();
      await expect(cards.nth(index).locator("p.text-4xl")).toHaveText(
        PRICE_PATTERN,
      );
      await expect(
        page.getByRole("button", { name: plan.ctaLabel }),
      ).toBeVisible();
      // Fix MENT-01 (validation.md, ciclo 1): spec.md AC1 exige a mesma
      // lista de entregáveis e o público-alvo de cada plano, não só nome,
      // preço e CTA. Escopado ao card (cards.nth(index)) porque os planos
      // compartilham entregáveis idênticos - um getByText global ambíguo
      // (2 matches) quebraria o modo estrito do Playwright.
      const card = cards.nth(index);
      await expect(card.getByText(plan.targetAudience)).toBeVisible();
      await expect(
        card.getByText(plan.deliverables[0], { exact: true }),
      ).toBeVisible();
    }

    const firstBox = await cards.nth(0).boundingBox();
    const secondBox = await cards.nth(1).boundingBox();
    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();

    // "lado a lado" (AC1): mesma linha, não empilhados - o 2º card começa
    // mais à direita e ainda se sobrepõe verticalmente ao 1º.
    const thirdBox = await cards.nth(2).boundingBox();
    expect(thirdBox).not.toBeNull();
    expect(secondBox!.x).toBeGreaterThan(firstBox!.x);
    expect(secondBox!.y).toBeLessThan(firstBox!.y + firstBox!.height);
  });

  test("mobile (<768px): plans stack vertically, all CTAs visible, no horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/");

    for (const plan of PLANS) {
      await expect(
        page.getByRole("button", { name: plan.ctaLabel }),
      ).toBeVisible();
    }

    const cards = page.getByRole("article");
    await expect(cards).toHaveCount(3);
    const firstBox = await cards.nth(0).boundingBox();
    const secondBox = await cards.nth(1).boundingBox();
    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();

    // Empilhado (AC3): o 2º card começa no mesmo nível ou abaixo de onde o
    // 1º termina.
    const thirdBox = await cards.nth(2).boundingBox();
    expect(secondBox!.y).toBeGreaterThanOrEqual(firstBox!.y + firstBox!.height);
    expect(thirdBox!.y).toBeGreaterThanOrEqual(secondBox!.y + secondBox!.height);

    const hasHorizontalScroll = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });

  test("shows the 7-day withdrawal legal notice on the plans page", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText(LEGAL_NOTICE_COPY.text)).toBeVisible();
  });
});
