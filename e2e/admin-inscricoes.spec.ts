import { expect, test, type Page } from "@playwright/test";
import { PLANS } from "../content/plans";
import { E2E_ADMIN_PASSWORD } from "../playwright.config";

// Cobre tasks.md T41 "Done when" (spec.md P2 "Lista de inscrições para o
// mentor", MENT-25) e .tasks/painel-inscricoes.md (lista, filtros, busca,
// detalhe e exportação): acesso sem sessão redireciona pro login; login com
// a senha correta volta pra /admin/inscricoes e exibe a lista; cada linha
// mostra nome/e-mail/plano/status/data de pagamento/data de expiração;
// lista ordenada por data de criação (mais recente primeiro); filtros e
// busca; detalhe com timeline de eventos; exportação em CSV. Dados semeados
// por e2e/support/fake-neon-fetch.cjs, carregado pelo webServer via
// NODE_OPTIONS - não há banco real disponível neste ambiente (mesma
// limitação já documentada em tasks.md T5/T26).
//
// Os 3 registros semeados: Ana Beatriz Souza (acompanhamento-3m, criada em
// 2026-01-10), Bruno Lima (acompanhamento-3m, criada em 2026-02-15), Carla
// Mendes (acompanhamento-6m, criada em 2026-04-01).

const ACOMPANHAMENTO_3M_NAME = PLANS.find(
  (p) => p.slug === "acompanhamento-3m",
)!.name;

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Senha").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin\/inscricoes$/);
}

test.describe("admin - lista de inscrições", () => {
  test("acessar /admin/inscricoes sem sessão redireciona para /admin/login", async ({
    page,
  }) => {
    await page.goto("/admin/inscricoes");

    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("lista ordenada por data de criação, mais recente primeiro (critério 1)", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(3);

    // Mais recente primeiro: Carla (2026-04-01) > Bruno (2026-02-15) > Ana
    // (2026-01-10).
    await expect(rows.nth(0)).toContainText("Carla Mendes");
    await expect(rows.nth(1)).toContainText("Bruno Lima");
    await expect(rows.nth(2)).toContainText("Ana Beatriz Souza");
  });

  test("cada linha mostra nome, e-mail, plano, data de pagamento e data de expiração", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const anaRow = page.locator("table tbody tr", {
      hasText: "Ana Beatriz Souza",
    });
    await expect(anaRow).toContainText("ana.beatriz@example.com");
    await expect(anaRow).toContainText(ACOMPANHAMENTO_3M_NAME);
    await expect(anaRow).toContainText("Pago");
    await expect(anaRow).toContainText("10/01/2026");
    await expect(anaRow).toContainText("10/07/2026");
  });

  test("nenhuma inscrição encontrada: filtro sem resultado mostra a mensagem de vazio (critério 4)", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/inscricoes?q=zzz-ninguem-bate");

    await expect(page.locator("table")).toHaveCount(0);
    await expect(page.getByText("Nenhuma inscrição encontrada.")).toBeVisible();
  });

  test("filtro fica na URL e sobrevive a um reload (critério 11)", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.getByLabel("Plano").selectOption("acompanhamento-3m");
    await page.getByRole("button", { name: "Filtrar" }).click();

    await expect(page).toHaveURL(/plano=acompanhamento-3m/);
    await expect(page.locator("table tbody tr")).toHaveCount(2);
    await expect(page.getByText("Carla Mendes")).toHaveCount(0);

    await page.goto("/admin/inscricoes?plano=acompanhamento-3m");
    await expect(page.locator("table tbody tr")).toHaveCount(2);
    await expect(page.getByText("Ana Beatriz Souza")).toBeVisible();
    await expect(page.getByText("Bruno Lima")).toBeVisible();
  });
});

test.describe("admin - detalhe da inscrição", () => {
  test("detalhe mostra os dados da inscrição (critério 12)", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/inscricoes/e2e-seed-1");

    await expect(page.getByRole("heading", { name: "Ana Beatriz Souza" })).toBeVisible();
    await expect(page.getByText("ana.beatriz@example.com")).toBeVisible();
    await expect(page.getByText(ACOMPANHAMENTO_3M_NAME)).toBeVisible();
    await expect(page.getByText("R$")).toBeVisible();
  });

  test("id inexistente responde 404 (critério 13)", async ({ page }) => {
    await loginAsAdmin(page);

    const response = await page.goto("/admin/inscricoes/id-que-nao-existe");

    expect(response?.status()).toBe(404);
  });

  test("timeline mostra só os eventos deste checkout, em ordem (critério 14)", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/inscricoes/e2e-seed-1");

    const timeline = page.locator("ol li");
    await expect(timeline).toHaveCount(2);
    await expect(timeline.nth(0)).toContainText("CHECKOUT_CREATED");
    await expect(timeline.nth(1)).toContainText("CHECKOUT_PAID");
  });

  test("timeline vazia: checkout sem nenhum evento mostra a mensagem de vazio (critério 15)", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/inscricoes/e2e-seed-2");

    await expect(page.getByText("Nenhum evento registrado.")).toBeVisible();
  });

  test("não existe link para o Asaas nesta build (critério 17 - critério 16 bloqueado)", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/inscricoes/e2e-seed-1");

    await expect(
      page.getByRole("link", { name: "Ver cliente no Asaas" }),
    ).toHaveCount(0);
  });
});

test.describe("admin - exportar CSV", () => {
  test("export sem sessão redireciona para /admin/login (critério 20)", async ({
    page,
  }) => {
    await page.goto("/admin/inscricoes/export");

    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
