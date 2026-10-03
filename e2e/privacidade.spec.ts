import { expect, test } from "@playwright/test";
import { PRIVACY_COPY } from "../content/privacy";

// Cobre spec.md P2 "Hero, rodapé e política de privacidade" AC5 (MENT-33):
// a página de política de privacidade existe e explica dados coletados,
// finalidade, terceiros e direitos do titular.

test.describe("privacy policy page", () => {
  test("renders privacy content: collected data, purpose, third parties and rights", async ({
    page,
  }) => {
    await page.goto("/privacidade");

    await expect(
      page.getByRole("heading", { name: PRIVACY_COPY.title }),
    ).toBeVisible();

    for (const section of PRIVACY_COPY.sections) {
      await expect(
        page.getByRole("heading", { name: section.heading }),
      ).toBeVisible();
      await expect(page.getByText(section.body)).toBeVisible();
    }
  });
});
