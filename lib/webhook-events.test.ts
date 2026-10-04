import { describe, expect, it } from "vitest";
import type { Db } from "./db";
import { listEventsByCheckoutId, logOutcome, recordEvent } from "./webhook-events";

type Row = Record<string, unknown>;

function makeThenable(rows: Row[]) {
  return {
    limit: (n: number) => Promise.resolve(rows.slice(0, n)),
    // Único uso real hoje é `asc(processedAt)` (listEventsByCheckoutId) -
    // ordena por esse campo em vez de ignorar o argumento, pra que um teste
    // que semeia fora de ordem realmente exercite a ordenação.
    orderBy: (_s: unknown) =>
      Promise.resolve(
        [...rows].sort(
          (a, b) =>
            (a.processedAt as Date).getTime() -
            (b.processedAt as Date).getTime(),
        ),
      ),
    then: (
      resolve: (v: Row[]) => unknown,
      reject?: (e: unknown) => unknown,
    ) => Promise.resolve(rows).then(resolve, reject),
  };
}

function createFakeDb(initial: Row[] = []) {
  const rows: Row[] = [...initial];
  let conflictOnId: string | null = null;

  return {
    _rows: rows,
    _setConflictId: (id: string) => {
      conflictOnId = id;
    },
    insert: (_t: unknown) => ({
      values: (data: Row) => ({
        returning: async (): Promise<Row[]> => {
          if (conflictOnId && data.id === conflictOnId) {
            const err = new Error(
              'duplicate key value violates unique constraint "webhook_events_pkey" (23505)',
            );
            throw err;
          }
          const row: Row = { processedAt: new Date(), ...data };
          rows.push(row);
          return [row];
        },
      }),
    }),
    select: () => ({
      from: (_t: unknown) => ({
        where: (_c: unknown) => makeThenable(rows),
      }),
    }),
    update: (_t: unknown) => ({
      set: (updates: Row) => ({
        where: (_c: unknown) => ({
          returning: async (): Promise<Row[]> => {
            if (rows.length === 0) return [];
            rows[0] = { ...rows[0], ...updates };
            return [rows[0]];
          },
        }),
      }),
    }),
  } as unknown as Db & { _rows: Row[]; _setConflictId: (id: string) => void };
}

const BASE_INPUT = {
  id: "evt-1",
  eventType: "CHECKOUT_PAID",
  checkoutId: "chk-1",
  payload: { event: "CHECKOUT_PAID" },
};

describe("recordEvent", () => {
  it("grava o evento e retorna recorded=true na primeira vez", async () => {
    const db = createFakeDb();
    const result = await recordEvent(BASE_INPUT, db);
    expect(result.recorded).toBe(true);
    expect(result.event.id).toBe("evt-1");
    expect(result.event.result).toBe("success");
  });

  it("retorna recorded=false quando o mesmo id já existe (idempotência MENT-12)", async () => {
    const db = createFakeDb();
    (db as unknown as ReturnType<typeof createFakeDb>)._setConflictId("evt-1");

    const existing: Row = {
      id: "evt-1",
      eventType: "CHECKOUT_PAID",
      checkoutId: "chk-1",
      payload: {},
      result: "success",
      errorMessage: null,
      processedAt: new Date(),
    };
    (db as unknown as ReturnType<typeof createFakeDb>)._rows.push(existing);

    const result = await recordEvent(BASE_INPUT, db);
    expect(result.recorded).toBe(false);
    expect(result.event.id).toBe("evt-1");
  });

  it("registra o payload completo", async () => {
    const db = createFakeDb();
    const payload = { event: "CHECKOUT_PAID", data: { id: "x" } };
    const result = await recordEvent({ ...BASE_INPUT, payload }, db);
    expect(result.event.payload).toEqual(payload);
  });
});

describe("listEventsByCheckoutId", () => {
  it("devolve os eventos ordenados por processedAt ascendente (painel-inscricoes.md critério 14)", async () => {
    const db = createFakeDb([
      {
        id: "evt-paid",
        eventType: "CHECKOUT_PAID",
        checkoutId: "chk-1",
        payload: {},
        result: "success",
        errorMessage: null,
        processedAt: new Date("2026-03-02T00:00:00Z"),
      },
      {
        id: "evt-created",
        eventType: "CHECKOUT_CREATED",
        checkoutId: "chk-1",
        payload: {},
        result: "success",
        errorMessage: null,
        processedAt: new Date("2026-03-01T00:00:00Z"),
      },
    ]);

    const events = await listEventsByCheckoutId("chk-1", db);

    expect(events.map((e) => e.id)).toEqual(["evt-created", "evt-paid"]);
  });

  it("devolve lista vazia quando o checkout não tem nenhum evento registrado (critério 15)", async () => {
    const db = createFakeDb();
    expect(await listEventsByCheckoutId("chk-sem-eventos", db)).toEqual([]);
  });
});

describe("logOutcome", () => {
  it("atualiza o resultado para success", async () => {
    const db = createFakeDb([
      {
        id: "evt-1",
        eventType: "CHECKOUT_PAID",
        checkoutId: "chk-1",
        payload: {},
        result: "success",
        errorMessage: null,
        processedAt: new Date(),
      },
    ]);
    const result = await logOutcome("evt-1", "success", null, db);
    expect(result.result).toBe("success");
    expect(result.errorMessage).toBeNull();
  });

  it("atualiza o resultado para error com mensagem", async () => {
    const db = createFakeDb([
      {
        id: "evt-1",
        eventType: "CHECKOUT_PAID",
        checkoutId: "chk-1",
        payload: {},
        result: "success",
        errorMessage: null,
        processedAt: new Date(),
      },
    ]);
    const result = await logOutcome("evt-1", "error", "something failed", db);
    expect(result.result).toBe("error");
    expect(result.errorMessage).toBe("something failed");
  });
});
