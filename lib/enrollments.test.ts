import { describe, expect, it } from "vitest";
import type { Db } from "./db";
import {
  createEnrollment,
  findActiveByEmailAndPlan,
  findByCheckoutId,
  findById,
  listEnrollments,
  markExpiredEnrollments,
  updateEnrollmentStatus,
} from "./enrollments";

// Fake db que armazena linhas em memória e implementa o subconjunto da
// interface Drizzle usado por lib/enrollments.ts.
// As operações SELECT retornam todas as linhas do store. Os testes usam
// dados iniciais cuidadosamente escolhidos para que o comportamento
// exercitado seja o esperado (ex: só há linhas com expiresAt no passado
// quando se testa markExpiredEnrollments).
type Row = Record<string, unknown>;

function makeThenable(rows: Row[]) {
  return {
    limit: (_n: number) => Promise.resolve(rows.slice(0, _n)),
    then: (
      resolve: (v: Row[]) => unknown,
      reject?: (e: unknown) => unknown,
    ) => Promise.resolve(rows).then(resolve, reject),
  };
}

function createFakeDb(initial: Row[] = []) {
  const rows: Row[] = [...initial];
  let nextId = initial.length + 1;

  return {
    _rows: rows,
    insert: (_t: unknown) => ({
      values: (data: Row) => ({
        returning: async (): Promise<Row[]> => {
          const row: Row = {
            id: `id-${nextId++}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            paidAt: null,
            expiresAt: null,
            ...data,
          };
          rows.push(row);
          return [row];
        },
      }),
    }),
    select: () => ({
      from: (_t: unknown) => ({
        where: (_c: unknown) => makeThenable(rows),
        orderBy: (_s: unknown) => Promise.resolve([...rows]),
      }),
    }),
    update: (_t: unknown) => ({
      set: (updates: Row) => ({
        where: (_c: unknown) => ({
          returning: async (): Promise<Row[]> => {
            // Para testes de update, encontra a primeira linha e aplica as mudanças.
            // O teste garante que apenas a linha alvo existe no store.
            if (rows.length === 0) return [];
            const targetIdx = rows.findIndex(
              (r) => updates.id === undefined || r.id !== undefined,
            );
            const idx = targetIdx === -1 ? 0 : targetIdx;
            rows[idx] = { ...rows[idx], ...updates };
            return [rows[idx]];
          },
        }),
      }),
    }),
  } as unknown as Db & { _rows: Row[] };
}

const BASE_INPUT = {
  asaasCheckoutId: "checkout-1",
  plan: "avulso" as const,
  customerName: "Ana Lima",
  customerEmail: "ana@example.com",
  amountCents: 29700,
  paidAt: new Date("2026-10-01T12:00:00Z"),
};

describe("createEnrollment", () => {
  it("cria inscrição com status paga", async () => {
    const db = createFakeDb();
    const result = await createEnrollment(BASE_INPUT, db);
    expect(result.status).toBe("paga");
    expect(result.plan).toBe("avulso");
    expect(result.customerName).toBe("Ana Lima");
  });

  it("expiresAt é null para plano avulso", async () => {
    const db = createFakeDb();
    const result = await createEnrollment(BASE_INPUT, db);
    expect(result.expiresAt).toBeNull();
  });

  it("calcula expiresAt corretamente para acompanhamento-3m", async () => {
    const db = createFakeDb();
    const paidAt = new Date("2026-10-01T00:00:00Z");
    const result = await createEnrollment(
      { ...BASE_INPUT, plan: "acompanhamento-3m", paidAt },
      db,
    );
    expect(result.expiresAt?.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("calcula expiresAt corretamente para acompanhamento-6m", async () => {
    const db = createFakeDb();
    const paidAt = new Date("2026-10-01T00:00:00Z");
    const result = await createEnrollment(
      { ...BASE_INPUT, plan: "acompanhamento-6m", paidAt },
      db,
    );
    expect(result.expiresAt?.toISOString()).toBe("2027-04-01T00:00:00.000Z");
  });
});

describe("findActiveByEmailAndPlan", () => {
  it("retorna inscrição ativa quando existe", async () => {
    const db = createFakeDb([
      {
        id: "id-1",
        asaasCheckoutId: "c1",
        plan: "acompanhamento-3m",
        status: "ativa",
        customerEmail: "ana@example.com",
        customerName: "Ana",
        amountCents: 59700,
        paidAt: new Date(),
        expiresAt: new Date("2027-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const result = await findActiveByEmailAndPlan(
      "ana@example.com",
      "acompanhamento-3m",
      db,
    );
    expect(result).not.toBeNull();
    expect(result?.status).toBe("ativa");
  });

  it("retorna null quando não há inscrição ativa no store", async () => {
    const db = createFakeDb();
    const result = await findActiveByEmailAndPlan(
      "ninguem@example.com",
      "avulso",
      db,
    );
    expect(result).toBeNull();
  });
});

describe("findByCheckoutId", () => {
  it("retorna inscrição existente", async () => {
    const db = createFakeDb([
      {
        id: "id-1",
        asaasCheckoutId: "checkout-abc",
        plan: "avulso",
        status: "paga",
        customerEmail: "j@j.com",
        customerName: "J",
        amountCents: 0,
        paidAt: null,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const result = await findByCheckoutId("checkout-abc", db);
    expect(result?.asaasCheckoutId).toBe("checkout-abc");
  });

  it("retorna null quando não existe", async () => {
    const db = createFakeDb();
    expect(await findByCheckoutId("nenhum", db)).toBeNull();
  });
});

describe("findById", () => {
  it("retorna a inscrição com esse id (painel-inscricoes.md critério 12)", async () => {
    const db = createFakeDb([
      {
        id: "id-abc",
        asaasCheckoutId: "checkout-abc",
        plan: "avulso",
        status: "paga",
        customerEmail: "j@j.com",
        customerName: "J",
        amountCents: 29900,
        paidAt: null,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const result = await findById("id-abc", db);
    expect(result?.id).toBe("id-abc");
    expect(result?.customerName).toBe("J");
  });

  it("retorna null quando o id não bate com nenhuma inscrição (critério 13 - vira 404)", async () => {
    const db = createFakeDb();
    expect(await findById("nenhum", db)).toBeNull();
  });
});

describe("updateEnrollmentStatus", () => {
  it("retorna inscrição com novo status", async () => {
    const db = createFakeDb([
      {
        id: "id-1",
        asaasCheckoutId: "c1",
        plan: "avulso",
        status: "paga",
        customerEmail: "a@a.com",
        customerName: "A",
        amountCents: 0,
        paidAt: null,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const now = new Date("2026-10-01T10:00:00Z");
    const result = await updateEnrollmentStatus("id-1", "ativa", now, db);
    expect(result.status).toBe("ativa");
    expect(result.updatedAt).toEqual(now);
  });
});

describe("markExpiredEnrollments", () => {
  it("transiciona inscrições ativas expiradas para 'expirada'", async () => {
    const past = new Date("2026-01-01T00:00:00Z");
    const db = createFakeDb([
      {
        id: "id-1",
        asaasCheckoutId: "c1",
        plan: "acompanhamento-3m",
        status: "ativa",
        customerEmail: "a@a.com",
        customerName: "A",
        amountCents: 0,
        paidAt: past,
        expiresAt: past,
        createdAt: past,
        updatedAt: past,
      },
    ]);
    const result = await markExpiredEnrollments(new Date("2026-10-01"), db);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("expirada");
  });

  it("ignora inscrições que não podem transicionar (já expiradas ou canceladas)", async () => {
    const past = new Date("2026-01-01T00:00:00Z");
    const db = createFakeDb([
      {
        id: "id-1",
        asaasCheckoutId: "c1",
        plan: "acompanhamento-3m",
        status: "expirada",
        customerEmail: "a@a.com",
        customerName: "A",
        amountCents: 0,
        paidAt: past,
        expiresAt: past,
        createdAt: past,
        updatedAt: past,
      },
    ]);
    const result = await markExpiredEnrollments(new Date("2026-10-01"), db);
    expect(result).toHaveLength(0);
  });

  it("retorna array vazio quando não há inscrições no store", async () => {
    const result = await markExpiredEnrollments(
      new Date("2026-10-01"),
      createFakeDb(),
    );
    expect(result).toHaveLength(0);
  });
});

describe("listEnrollments", () => {
  it("retorna todas as inscrições", async () => {
    const db = createFakeDb([
      {
        id: "id-1",
        asaasCheckoutId: "c1",
        plan: "avulso",
        status: "paga",
        customerEmail: "a@a.com",
        customerName: "A",
        amountCents: 0,
        paidAt: null,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "id-2",
        asaasCheckoutId: "c2",
        plan: "acompanhamento-3m",
        status: "ativa",
        customerEmail: "b@b.com",
        customerName: "B",
        amountCents: 0,
        paidAt: new Date(),
        expiresAt: new Date("2027-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const result = await listEnrollments(db);
    expect(result).toHaveLength(2);
  });

  it("coloca inscrições avulso (expiresAt null) por último", async () => {
    const db = createFakeDb([
      {
        id: "id-1",
        asaasCheckoutId: "c1",
        plan: "avulso",
        status: "paga",
        customerEmail: "a@a.com",
        customerName: "A",
        amountCents: 0,
        paidAt: null,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "id-2",
        asaasCheckoutId: "c2",
        plan: "acompanhamento-3m",
        status: "ativa",
        customerEmail: "b@b.com",
        customerName: "B",
        amountCents: 0,
        paidAt: new Date(),
        expiresAt: new Date("2027-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const result = await listEnrollments(db);
    expect(result[result.length - 1].plan).toBe("avulso");
  });
});
