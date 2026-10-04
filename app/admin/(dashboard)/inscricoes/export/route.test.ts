import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Enrollment } from "../../../../../lib/enrollments";

// Cobre .tasks/painel-inscricoes.md critérios 18-21: exporta a mesma visão
// filtrada da lista em CSV, com BOM+`;` (prova de toCsv em
// lib/enrollment-filters.test.ts), e devolve 500 sem nenhum arquivo quando a
// consulta falha.

const { mockListEnrollments } = vi.hoisted(() => ({
  mockListEnrollments: vi.fn(),
}));

vi.mock("../../../../../lib/enrollments", async () => {
  const actual =
    await vi.importActual<typeof import("../../../../../lib/enrollments")>(
      "../../../../../lib/enrollments",
    );
  return {
    ...actual,
    listEnrollments: mockListEnrollments,
  };
});

import { GET } from "./route";

function makeEnrollment(overrides: Partial<Enrollment> = {}): Enrollment {
  return {
    id: "id-1",
    asaasCheckoutId: "chk-1",
    plan: "avulso",
    status: "ativa",
    customerName: "Ana Lima",
    customerEmail: "ana@example.com",
    amountCents: 29900,
    paidAt: new Date("2026-03-10T00:00:00Z"),
    expiresAt: null,
    createdAt: new Date("2026-03-01T00:00:00Z"),
    updatedAt: new Date("2026-03-10T00:00:00Z"),
    ...overrides,
  };
}

function makeRequest(query = ""): Request {
  return new Request(`http://localhost:3000/admin/inscricoes/export${query}`);
}

describe("GET /admin/inscricoes/export", () => {
  beforeEach(() => {
    mockListEnrollments.mockReset();
  });

  it("caminho feliz: devolve CSV 200 com a visão filtrada", async () => {
    mockListEnrollments.mockResolvedValue([
      makeEnrollment({ customerName: "Ana Lima", plan: "avulso" }),
      makeEnrollment({ customerName: "Bruno Souza", plan: "acompanhamento-3m" }),
    ]);

    const response = await GET(makeRequest("?plano=avulso"));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/csv; charset=utf-8",
    );
    expect(body).toContain("Ana Lima");
    expect(body).not.toContain("Bruno Souza");
  });

  it("quando o banco falha, responde 500 e não devolve nenhum CSV", async () => {
    mockListEnrollments.mockRejectedValue(new Error("conexão falhou"));

    const response = await GET(makeRequest());
    const json = (await response.json()) as { error?: string };

    expect(response.status).toBe(500);
    expect(typeof json.error).toBe("string");
  });
});
