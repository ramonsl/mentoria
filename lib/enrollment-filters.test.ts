import { describe, expect, it } from "vitest";
import type { Enrollment } from "./enrollments";
import {
  filterEnrollments,
  formatCentsBrl,
  loadFilteredEnrollments,
  sortByCreatedAtDesc,
  statusLabelFor,
  toCsv,
  toDisplayRow,
} from "./enrollment-filters";

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

describe("statusLabelFor", () => {
  it.each([
    ["pendente", "Pendente"],
    ["paga", "Pago"],
    ["ativa", "Pago"],
    ["expirada", "Expirado"],
    ["cancelada", "Cancelado"],
  ] as const)("mapeia %s para %s", (status, label) => {
    expect(statusLabelFor(status)).toBe(label);
  });
});

describe("filterEnrollments", () => {
  const ana = makeEnrollment({
    id: "ana",
    customerName: "Ana Lima",
    customerEmail: "ana@example.com",
    plan: "avulso",
    status: "ativa",
    paidAt: new Date("2026-03-10T00:00:00Z"),
  });
  const bruno = makeEnrollment({
    id: "bruno",
    customerName: "Bruno Souza",
    customerEmail: "bruno@example.com",
    plan: "acompanhamento-3m",
    status: "cancelada",
    paidAt: new Date("2026-05-20T00:00:00Z"),
  });
  const carla = makeEnrollment({
    id: "carla",
    customerName: "Carla Mendes",
    customerEmail: "carla@example.com",
    plan: "acompanhamento-6m",
    status: "pendente",
    paidAt: null,
  });
  const all = [ana, bruno, carla];

  it("sem filtros, devolve todas as inscrições", () => {
    expect(filterEnrollments(all, {})).toEqual(all);
  });

  it("combina filtros com E (status + busca juntos excluem o que só bate em um dos dois)", () => {
    // Bruno bate na busca "bru" mas não no status "Pago"; Ana bate nos dois.
    const result = filterEnrollments(all, { status: "Pago", q: "bru" });
    expect(result).toEqual([]);

    const result2 = filterEnrollments(all, { status: "Pago", q: "ana" });
    expect(result2).toEqual([ana]);
  });

  it("filtro de status: 'Pago' bate com paga e ativa, não com os outros", () => {
    const paga = makeEnrollment({ id: "paga-row", status: "paga" });
    const result = filterEnrollments([ana, bruno, carla, paga], {
      status: "Pago",
    });
    expect(result.map((e) => e.id).sort()).toEqual(["ana", "paga-row"]);
  });

  it("filtro de plano: aceita exatamente os 3 slugs de content/plans.ts", () => {
    expect(filterEnrollments(all, { plano: "avulso" })).toEqual([ana]);
    expect(filterEnrollments(all, { plano: "acompanhamento-3m" })).toEqual([
      bruno,
    ]);
    expect(filterEnrollments(all, { plano: "acompanhamento-6m" })).toEqual([
      carla,
    ]);
  });

  it("filtro de período: bate em paidAt, inclusive nas duas pontas", () => {
    expect(
      filterEnrollments(all, { de: "2026-03-10", ate: "2026-03-10" }),
    ).toEqual([ana]);
    expect(
      filterEnrollments(all, { de: "2026-03-11", ate: "2026-05-19" }),
    ).toEqual([]);
    expect(filterEnrollments(all, { de: "2026-01-01" })).toEqual([ana, bruno]);
  });

  it("filtro de período: uma inscrição com paidAt nulo nunca bate", () => {
    expect(filterEnrollments(all, { de: "2020-01-01" })).not.toContain(carla);
    expect(
      filterEnrollments(all, { de: "2020-01-01", ate: "2030-01-01" }),
    ).toEqual([ana, bruno]);
  });

  it("busca por nome ou e-mail: parcial e sem diferenciar maiúsculas/minúsculas", () => {
    expect(filterEnrollments(all, { q: "ANA" })).toEqual([ana]);
    expect(filterEnrollments(all, { q: "bruno@EXAMPLE" })).toEqual([bruno]);
    expect(filterEnrollments(all, { q: "mendes" })).toEqual([carla]);
    expect(filterEnrollments(all, { q: "zzz-ninguem" })).toEqual([]);
  });
});

describe("sortByCreatedAtDesc", () => {
  it("ordena do mais recente para o mais antigo, sem mutar o array original", () => {
    const old = makeEnrollment({
      id: "old",
      createdAt: new Date("2026-01-10T00:00:00Z"),
    });
    const recent = makeEnrollment({
      id: "recent",
      createdAt: new Date("2026-05-01T00:00:00Z"),
    });
    const middle = makeEnrollment({
      id: "middle",
      createdAt: new Date("2026-03-01T00:00:00Z"),
    });
    const input = [old, recent, middle];

    const sorted = sortByCreatedAtDesc(input);

    expect(sorted.map((e) => e.id)).toEqual(["recent", "middle", "old"]);
    expect(input.map((e) => e.id)).toEqual(["old", "recent", "middle"]);
  });
});

describe("formatCentsBrl", () => {
  it("formata centavos como moeda BRL", () => {
    expect(formatCentsBrl(29900)).toBe("R$ 299,00");
    expect(formatCentsBrl(99900)).toBe("R$ 999,00");
  });
});

describe("toDisplayRow", () => {
  it("usa nome do plano e rótulo de status de exibição, nunca slug/enum cru", () => {
    const row = toDisplayRow(
      makeEnrollment({ plan: "acompanhamento-6m", status: "ativa" }),
    );
    expect(row.plan).toBe("Próximo Nível");
    expect(row.status).toBe("Pago");
  });

  it("datas nulas viram '-'", () => {
    const row = toDisplayRow(makeEnrollment({ expiresAt: null }));
    expect(row.expiresAt).toBe("-");
  });
});

describe("loadFilteredEnrollments", () => {
  it("em caso de sucesso, devolve as inscrições filtradas e ordenadas com loadError false", async () => {
    const old = makeEnrollment({
      id: "old",
      createdAt: new Date("2026-01-01T00:00:00Z"),
    });
    const recent = makeEnrollment({
      id: "recent",
      createdAt: new Date("2026-05-01T00:00:00Z"),
    });
    const result = await loadFilteredEnrollments({}, async () => [
      old,
      recent,
    ]);
    expect(result.loadError).toBe(false);
    expect(result.enrollments.map((e) => e.id)).toEqual(["recent", "old"]);
  });

  it("quando a busca falha, devolve loadError true e lista vazia em vez de lançar (critérios 5 e 21)", async () => {
    const result = await loadFilteredEnrollments({}, async () => {
      throw new Error("conexão com o banco falhou");
    });
    expect(result.loadError).toBe(true);
    expect(result.enrollments).toEqual([]);
  });
});

describe("toCsv", () => {
  it("gera uma linha por inscrição, mesmas colunas/ordem da tabela, com valores de exibição", () => {
    const ana = makeEnrollment({
      customerName: "Ana Lima",
      customerEmail: "ana@example.com",
      plan: "avulso",
      status: "ativa",
    });
    const csv = toCsv([ana]);
    const lines = csv.replace(/^﻿/, "").split("\r\n");

    expect(lines[0]).toBe("Nome;E-mail;Plano;Status;Pago em;Expira em");
    expect(lines[1]).toBe(
      "Ana Lima;ana@example.com;Direção de Carreira;Pago;10/03/2026;-",
    );
    expect(lines[1]).not.toMatch(/avulso|ativa/);
  });

  it("BOM e delimitador: começa com BOM UTF-8 e usa ; para separar campos", () => {
    const csv = toCsv([makeEnrollment()]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.split("\r\n")[0].split(";")).toHaveLength(6);
  });
});
