import { expect, test } from "@playwright/test";
import { PLANS } from "../content/plans";

// Checkout temporariamente simplificado: o CTA de cada plano é um link
// direto pro pagamento hospedado na Kiwify (plan.kiwifyUrl), em vez de
// chamar /api/checkout (Asaas) - ver components/PlanComparison.tsx.

test.describe("checkout CTA", () => {
  test("o CTA de cada plano linka direto pro checkout da Kiwify, em nova aba", async ({
    page,
  }) => {
    await page.goto("/");

    for (const plan of PLANS) {
      const cta = page.getByRole("link", { name: plan.ctaLabel });
      await expect(cta).toHaveAttribute("href", plan.kiwifyUrl);
      await expect(cta).toHaveAttribute("target", "_blank");
    }
  });
});
