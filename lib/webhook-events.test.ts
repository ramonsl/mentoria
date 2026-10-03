import { beforeEach, describe, expect, it, vi } from "vitest";

// Fake Supabase client com suporte a conflito de PK (código Postgres 23505),
// para exercitar o no-op de recordEvent num evento já gravado - sem precisar
// de um Postgres real. Mesmo padrão usado em lib/enrollments.test.ts.
function createFakeSupabaseClient(initialRows: Record<string, unknown>[] = []) {
  const rows: Record<string, unknown>[] = [...initialRows];

  function from(_table: string) {
    const filters: { col: string; val: unknown }[] = [];
    let insertPayload: Record<string, unknown> | null = null;
    let updatePayload: Record<string, unknown> | null = null;

    const api = {
      insert(payload: Record<string, unknown>) {
        insertPayload = payload;
        return api;
      },
      update(payload: Record<string, unknown>) {
        updatePayload = payload;
        return api;
      },
      select() {
        return api;
      },
      eq(col: string, val: unknown) {
        filters.push({ col, val });
        return api;
      },
      async single() {
        if (insertPayload) {
          const conflict = rows.find((r) => r.id === insertPayload!.id);
          if (conflict) {
            return {
              data: null,
              error: {
                code: "23505",
                message: `duplicate key value violates unique constraint "webhook_events_pkey"`,
              },
            };
          }
          const row = {
            ...insertPayload,
            processed_at: new Date().toISOString(),
          };
          rows.push(row);
          return { data: row, error: null };
        }
        if (updatePayload) {
          const idx = rows.findIndex((r) =>
            filters.every((f) => r[f.col] === f.val),
          );
          if (idx === -1) {
            return { data: null, error: { message: "not found" } };
          }
          rows[idx] = { ...rows[idx], ...updatePayload };
          return { data: rows[idx], error: null };
        }
        const match =
          rows.find((r) => filters.every((f) => r[f.col] === f.val)) ?? null;
        return { data: match, error: null };
      },
    };

    return api;
  }

  return { from, _rows: rows };
}

const { getFakeClient, setFakeClient } = vi.hoisted(() => {
  let client: ReturnType<typeof createFakeSupabaseClient> | null = null;
  return {
    getFakeClient: () => client,
    setFakeClient: (c: typeof client) => {
      client = c;
    },
  };
});

vi.mock("./supabase", () => ({
  getSupabaseClient: () => getFakeClient(),
}));

import { logOutcome, recordEvent } from "./webhook-events";

describe("recordEvent", () => {
  beforeEach(() => {
    setFakeClient(createFakeSupabaseClient());
  });

  it("grava um evento novo com sucesso", async () => {
    const result = await recordEvent({
      id: "evt-1",
      eventType: "CHECKOUT_PAID",
      checkoutId: "checkout-1",
      payload: { foo: "bar" },
    });

    expect(result.recorded).toBe(true);
    expect(result.event.id).toBe("evt-1");
    expect(result.event.eventType).toBe("CHECKOUT_PAID");
  });

  it("o mesmo event id enviado duas vezes resulta em no-op na segunda, sem lançar erro", async () => {
    await recordEvent({
      id: "evt-dup",
      eventType: "CHECKOUT_PAID",
      checkoutId: "checkout-1",
      payload: { foo: "bar" },
    });

    const second = await recordEvent({
      id: "evt-dup",
      eventType: "CHECKOUT_PAID",
      checkoutId: "checkout-1",
      payload: { foo: "bar" },
    });

    expect(second.recorded).toBe(false);
  });
});

describe("logOutcome", () => {
  it("grava resultado de sucesso sem mensagem de erro", async () => {
    setFakeClient(createFakeSupabaseClient());
    await recordEvent({
      id: "evt-success",
      eventType: "CHECKOUT_PAID",
      checkoutId: "checkout-1",
      payload: {},
    });

    const updated = await logOutcome("evt-success", "success");

    expect(updated.result).toBe("success");
    expect(updated.errorMessage).toBeNull();
  });

  it("grava resultado de erro com a mensagem de erro", async () => {
    setFakeClient(createFakeSupabaseClient());
    await recordEvent({
      id: "evt-error",
      eventType: "CHECKOUT_PAID",
      checkoutId: "checkout-1",
      payload: {},
    });

    const updated = await logOutcome(
      "evt-error",
      "error",
      "e-mail do cliente malformado",
    );

    expect(updated.result).toBe("error");
    expect(updated.errorMessage).toBe("e-mail do cliente malformado");
  });
});
