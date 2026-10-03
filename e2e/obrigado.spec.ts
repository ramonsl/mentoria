import { expect, test } from "@playwright/test";
import { THANK_YOU_COPY } from "../content/copy";

// Cobre tasks.md T24 "Done when" (spec.md P1 "Página de obrigado", MENT-22):
// acessar /obrigado diretamente renderiza o texto esperado.

test.describe("página de obrigado", () => {
  test("acessar /obrigado diretamente renderiza o texto esperado", async ({
    page,
  }) => {
    await page.goto("/obrigado");

    await expect(
      page.getByRole("heading", { name: THANK_YOU_COPY.title }),
    ).toBeVisible();
    await expect(page.getByText(THANK_YOU_COPY.text)).toBeVisible();
    await expect(page.getByText(THANK_YOU_COPY.secondaryText)).toBeVisible();
    await expect(
      page.getByRole("link", { name: THANK_YOU_COPY.buttonLabel }),
    ).toBeVisible();
  });
});
