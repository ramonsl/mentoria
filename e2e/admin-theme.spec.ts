import { expect, test, type Locator, type Page } from "@playwright/test";
import { E2E_ADMIN_PASSWORD } from "../playwright.config";

// Cobre .tasks/admin-wattvision-theme.md (16 critérios): tokens de cor,
// tipografia e estilo de card/tabela/alerta do design system WattVision
// aplicados às 3 telas de /admin. Dados semeados por
// e2e/support/fake-neon-fetch.cjs (mesmo seed de e2e/admin-inscricoes.spec.ts):
// Ana Beatriz Souza (chk-e2e-1, com 2 eventos), Bruno Lima (chk-e2e-2, sem
// eventos), Carla Mendes (chk-e2e-3, sem eventos).

const WV = {
  bg: "rgb(18, 18, 18)",
  surface: "rgb(30, 30, 30)",
  border: "rgb(44, 44, 46)",
  rowHover: "rgb(37, 37, 37)",
  accent: "rgb(0, 229, 255)",
  success: "rgb(50, 215, 75)",
  alert: "rgb(255, 69, 58)",
  alertBg: "rgb(58, 28, 28)",
  text: "rgb(255, 255, 255)",
  muted: "rgb(152, 152, 157)",
};

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Senha").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin\/inscricoes$/);
}

async function wrapperStyle(page: Page): Promise<{
  backgroundColor: string;
  color: string;
}> {
  return page.locator(".admin-theme").first().evaluate((el) => {
    const style = getComputedStyle(el);
    return { backgroundColor: style.backgroundColor, color: style.color };
  });
}

async function computed(locator: Locator, ...props: string[]) {
  return locator.evaluate((el, props) => {
    const style = getComputedStyle(el);
    return Object.fromEntries(props.map((p) => [p, style.getPropertyValue(p)]));
  }, props);
}

test.describe("admin - tema WattVision", () => {
  test("fundo e texto principal fixos nas 3 telas (critério 1)", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    expect(await wrapperStyle(page)).toEqual({
      backgroundColor: WV.bg,
      color: WV.text,
    });

    await loginAsAdmin(page);
    expect(await wrapperStyle(page)).toEqual({
      backgroundColor: WV.bg,
      color: WV.text,
    });

    await page.goto("/admin/inscricoes/e2e-seed-1");
    expect(await wrapperStyle(page)).toEqual({
      backgroundColor: WV.bg,
      color: WV.text,
    });
  });

  test("tipografia Inter nos títulos e no corpo (critério 2)", async ({
    page,
  }) => {
    // Título: Inter Semi Bold 24px, nas 3 telas.
    await page.goto("/admin/login");
    const loginHeading = page.getByRole("heading", { name: "Acesso restrito" });
    expect(
      await computed(loginHeading, "font-family", "font-size", "font-weight"),
    ).toMatchObject({ "font-size": "24px", "font-weight": "600" });
    const { "font-family": loginFont } = await computed(
      loginHeading,
      "font-family",
    );
    expect(loginFont.toLowerCase()).toContain("inter");

    await loginAsAdmin(page);
    const listHeading = page.getByRole("heading", { name: "Inscrições" });
    expect(
      await computed(listHeading, "font-size", "font-weight"),
    ).toMatchObject({ "font-size": "24px", "font-weight": "600" });

    await page.goto("/admin/inscricoes/e2e-seed-1");
    const detailHeading = page.getByRole("heading", {
      name: "Ana Beatriz Souza",
    });
    expect(
      await computed(detailHeading, "font-size", "font-weight"),
    ).toMatchObject({ "font-size": "24px", "font-weight": "600" });

    // Corpo: Inter Regular 14px - amostrado numa célula da tabela.
    await page.goto("/admin/inscricoes");
    const bodyCell = page.getByText("ana.beatriz@example.com");
    const bodyStyle = await computed(
      bodyCell,
      "font-family",
      "font-size",
      "font-weight",
    );
    expect(bodyStyle["font-family"].toLowerCase()).toContain("inter");
    expect(bodyStyle["font-size"]).toBe("14px");
    expect(bodyStyle["font-weight"]).toBe("400");
  });

  test("texto secundário usa o tom neutro (critério 3)", async ({ page }) => {
    await page.goto("/admin/login");

    const label = page.getByText("Senha", { exact: true });
    const { color } = await computed(label, "color");
    expect(color).toBe(WV.muted);
  });

  test("botão Entrar usa o acento (critério 4)", async ({ page }) => {
    await page.goto("/admin/login");

    const button = page.getByRole("button", { name: "Entrar" });
    const { "background-color": bg } = await computed(
      button,
      "background-color",
    );
    expect(bg).toBe(WV.accent);
  });

  test("alerta de senha incorreta (critério 5)", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Senha").fill("senha-errada");
    await page.getByRole("button", { name: "Entrar" }).click();

    const alert = page.getByText("Senha incorreta. Tente novamente.");
    await expect(alert).toBeVisible();
    const style = await computed(
      alert,
      "background-color",
      "color",
      "border-left-width",
    );
    expect(style["background-color"]).toBe(WV.alertBg);
    expect(style.color).toBe(WV.alert);
    expect(style["border-left-width"]).toBe("4px");
  });

  test("card do formulário de login (critério 6)", async ({ page }) => {
    await page.goto("/admin/login");

    const form = page.locator("form");
    const style = await computed(
      form,
      "background-color",
      "border-radius",
      "border-top-width",
      "border-top-color",
    );
    expect(style["background-color"]).toBe(WV.surface);
    expect(style["border-radius"]).toBe("16px");
    expect(style["border-top-width"]).toBe("1px");
    expect(style["border-top-color"]).toBe(WV.border);
  });

  test("card de filtros e botão Filtrar (critério 7)", async ({ page }) => {
    await loginAsAdmin(page);

    const form = page.locator("form");
    const formStyle = await computed(
      form,
      "background-color",
      "border-radius",
      "border-top-color",
    );
    expect(formStyle["background-color"]).toBe(WV.surface);
    expect(formStyle["border-radius"]).toBe("16px");
    expect(formStyle["border-top-color"]).toBe(WV.border);

    const button = page.getByRole("button", { name: "Filtrar" });
    const { "background-color": buttonBg } = await computed(
      button,
      "background-color",
    );
    expect(buttonBg).toBe(WV.accent);
  });

  test("link Exportar CSV usa o acento (critério 8)", async ({ page }) => {
    await loginAsAdmin(page);

    const link = page.getByRole("link", { name: "Exportar CSV" });
    const { color } = await computed(link, "color");
    expect(color).toBe(WV.accent);
  });

  test("card da tabela, borda de linha e hover (critério 9)", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const card = page.locator("table").locator("xpath=..");
    const { "background-color": cardBg } = await computed(
      card,
      "background-color",
    );
    expect(cardBg).toBe(WV.surface);

    const firstRow = page.locator("table tbody tr").first();
    const { "border-bottom-color": borderColor } = await computed(
      firstRow,
      "border-bottom-color",
    );
    expect(borderColor).toBe(WV.border);

    await firstRow.hover();
    await expect
      .poll(async () => {
        const { "background-color": hoverBg } = await computed(
          firstRow,
          "background-color",
        );
        return hoverBg;
      })
      .toBe(WV.rowHover);
  });

  test("mensagem de lista vazia (critério 12)", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/inscricoes?q=zzz-ninguem-bate");

    const empty = page.getByText("Nenhuma inscrição encontrada.");
    await expect(empty).toBeVisible();
    const style = await computed(empty, "color", "background-color");
    expect(style.color).toBe(WV.muted);
    expect(style["background-color"]).toBe(WV.surface);
  });

  test("card dos dados da inscrição (critério 13)", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/inscricoes/e2e-seed-1");

    const dl = page.locator("dl");
    const style = await computed(
      dl,
      "background-color",
      "border-radius",
      "border-top-color",
    );
    expect(style["background-color"]).toBe(WV.surface);
    expect(style["border-radius"]).toBe("16px");
    expect(style["border-top-color"]).toBe(WV.border);
  });

  test("valor pago em monoespaçada (critério 14)", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/inscricoes/e2e-seed-1");

    const value = page.getByText("R$", { exact: false });
    const style = await computed(value, "font-family", "font-weight");
    expect(style["font-family"].toLowerCase()).toContain("jetbrains mono");
    expect(Number(style["font-weight"])).toBeGreaterThanOrEqual(700);
  });

  test("card da timeline e borda de linha (critério 15)", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/inscricoes/e2e-seed-1");

    const ol = page.locator("ol");
    const olStyle = await computed(
      ol,
      "background-color",
      "border-radius",
      "border-top-color",
    );
    expect(olStyle["background-color"]).toBe(WV.surface);
    expect(olStyle["border-radius"]).toBe("16px");
    expect(olStyle["border-top-color"]).toBe(WV.border);

    const firstItem = page.locator("ol li").first();
    const { "border-bottom-color": borderColor } = await computed(
      firstItem,
      "border-bottom-color",
    );
    expect(borderColor).toBe(WV.border);
  });

  test("mensagem de timeline vazia (critério 16)", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/inscricoes/e2e-seed-2");

    const empty = page.getByText("Nenhum evento registrado.");
    await expect(empty).toBeVisible();
    const { color } = await computed(empty, "color");
    expect(color).toBe(WV.muted);
  });
});
