import { expect, test } from "@playwright/test";
import { PLANS } from "../content/plans";

// Cobre tasks.md T16 "Done when" (spec.md P1 "Pagar o plano escolhido"
// MENT-06, MENT-08, MENT-09), com /api/checkout mockado via page.route.

test.describe("checkout CTA", () => {
  test("clicar no CTA redireciona para a checkoutUrl retornada pela API", async ({
    page,
  }) => {
    const plan = PLANS[0];
    await page.route("**/api/checkout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          checkoutUrl: "https://sandbox.asaas.com/checkoutSession/show/mock-1",
        }),
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: plan.ctaLabel }).click();

    await page.waitForURL(
      "https://sandbox.asaas.com/checkoutSession/show/mock-1",
    );
  });

  test("dois cliques em sequência rápida no mesmo CTA disparam só uma chamada a /api/checkout", async ({
    page,
  }) => {
    const plan = PLANS[0];
    let callCount = 0;
    await page.route("**/api/checkout", async (route) => {
      callCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          checkoutUrl: "https://sandbox.asaas.com/checkoutSession/show/mock-2",
        }),
      });
    });

    await page.goto("/");
    // Dispara os dois cliques no mesmo tick (direto no DOM), reproduzindo um
    // duplo clique real antes de qualquer re-render do React desabilitar o
    // botão - exercita a guarda síncrona, não a latência de rede do mock.
    await page.evaluate((slug) => {
      const button = document.querySelector(
        `button[data-plan="${slug}"]`,
      ) as HTMLButtonElement;
      button.click();
      button.click();
    }, plan.slug);

    await page.waitForURL(
      "https://sandbox.asaas.com/checkoutSession/show/mock-2",
    );
    expect(callCount).toBe(1);
  });

  test("falha simulada da API mostra erro e permite nova tentativa, mantendo o plano selecionado", async ({
    page,
  }) => {
    const plan = PLANS[0];
    const errorMessage =
      "Não foi possível iniciar o pagamento agora. Tente novamente em instantes.";
    let shouldFail = true;
    await page.route("**/api/checkout", async (route) => {
      if (shouldFail) {
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: errorMessage }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          checkoutUrl: "https://sandbox.asaas.com/checkoutSession/show/mock-3",
        }),
      });
    });

    await page.goto("/");
    const button = page.getByRole("button", { name: plan.ctaLabel });
    await button.click();

    // Mira o texto do erro diretamente - getByRole("alert") também casa com
    // o route-announcer oculto que o próprio Next.js injeta no shell da
    // página (elemento vazio, sem relação com esta feature).
    await expect(page.getByText(errorMessage)).toBeVisible();
    // Plano selecionado mantido: o mesmo CTA segue visível, habilitado e com
    // o mesmo rótulo - não há reset da seleção nem navegação para fora.
    await expect(button).toBeEnabled();
    await expect(button).toHaveText(plan.ctaLabel);

    shouldFail = false;
    await button.click();

    await page.waitForURL(
      "https://sandbox.asaas.com/checkoutSession/show/mock-3",
    );
  });
});
