import { beforeEach, describe, expect, it, vi } from "vitest";

// Fake Supabase client: mantém linhas em memória (snake_case, como a
// migration) e implementa só a fração da query builder que lib/enrollments.ts
// usa, permitindo testar o comportamento real (estado persistido/retornado),
// não apenas se um método foi chamado.
function createFakeSupabaseClient(initialRows: Record<string, unknown>[] = []) {
  const rows: Record<string, unknown>[] = [...initialRows];
  let nextId = rows.length + 1;

  type Filter = { col: string; op: "eq" | "lte"; val: unknown };

  function matches(row: Record<string, unknown>, filters: Filter[]): boolean {
    return filters.every(({ col, op, val }) => {
      if (op === "eq") return row[col] === val;
      if (op === "lte") return (row[col] as string) <= (val as string);
      return true;
    });
  }

  function from(_table: string) {
    const filters: Filter[] = [];
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
        filters.push({ col, op: "eq", val });
        return api;
      },
      lte(col: string, val: unknown) {
        filters.push({ col, op: "lte", val });
        return api;
      },
      async single() {
        if (insertPayload) {
          const row = {
            ...insertPayload,
            id: `id-${nextId++}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          rows.push(row);
          return { data: row, error: null };
        }
        if (updatePayload) {
          const idx = rows.findIndex((r) => matches(r, filters));
          if (idx === -1) {
            return { data: null, error: { message: "not found" } };
          }
          rows[idx] = { ...rows[idx], ...updatePayload };
          return { data: rows[idx], error: null };
        }
        const match = rows.find((r) => matches(r, filters)) ?? null;
        return { data: match, error: null };
      },
      async maybeSingle() {
        const match = rows.find((r) => matches(r, filters)) ?? null;
        return { data: match, error: null };
      },
      then(
        resolve: (value: {
          data: Record<string, unknown>[];
          error: null;
        }) => void,
      ) {
        const matched = rows.filter((r) => matches(r, filters));
        resolve({ data: matched, error: null });
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

// createFakeSupabaseClient precisa ser acessível a vi.hoisted sem import
// hoisting issues - redeclarada aqui via closure already defined above the
// vi.mock call is fine since vi.mock itself is hoisted but its factory body
// only runs lazily on first `./supabase` import, after this module's own
// top-level code (including createFakeSupabaseClient's definition) has run.

import {
  createEnrollment,
  findActiveByEmailAndPlan,
  markExpiredEnrollments,
} from "./enrollments";

describe("createEnrollment", () => {
  beforeEach(() => {
    setFakeClient(createFakeSupabaseClient());
  });

  it.each(["primeira-vaga", "proximo-nivel"] as const)(
    "calcula expiresAt = paidAt + 6 meses para o plano %s",
    async (plan) => {
      const paidAt = new Date("2026-01-15T12:00:00.000Z");

      const enrollment = await createEnrollment({
        asaasCheckoutId: "checkout-1",
        plan,
        customerName: "Fulano de Tal",
        customerEmail: "fulano@example.com",
        amountCents: plan === "primeira-vaga" ? 19900 : 49900,
        paidAt,
      });

      expect(enrollment.expiresAt.toISOString()).toBe(
        "2026-07-15T12:00:00.000Z",
      );
    },
  );
});

describe("findActiveByEmailAndPlan", () => {
  it("retorna a inscrição quando existe uma ativa para o mesmo e-mail e plano", async () => {
    setFakeClient(
      createFakeSupabaseClient([
        {
          id: "id-1",
          asaas_checkout_id: "checkout-1",
          plan: "primeira-vaga",
          status: "ativa",
          customer_name: "Fulano de Tal",
          customer_email: "fulano@example.com",
          amount_cents: 19900,
          paid_at: "2026-01-15T00:00:00.000Z",
          expires_at: "2026-07-15T00:00:00.000Z",
          created_at: "2026-01-15T00:00:00.000Z",
          updated_at: "2026-01-15T00:00:00.000Z",
        },
      ]),
    );

    const found = await findActiveByEmailAndPlan(
      "fulano@example.com",
      "primeira-vaga",
    );

    expect(found).not.toBeNull();
    expect(found?.customerEmail).toBe("fulano@example.com");
    expect(found?.plan).toBe("primeira-vaga");
    expect(found?.status).toBe("ativa");
  });

  it("retorna null quando não existe inscrição ativa para o e-mail e plano", async () => {
    setFakeClient(createFakeSupabaseClient());

    const found = await findActiveByEmailAndPlan(
      "ninguem@example.com",
      "proximo-nivel",
    );

    expect(found).toBeNull();
  });
});

describe("markExpiredEnrollments", () => {
  it("move para expirada as inscrições ativas vencidas e devolve a lista das que mudaram", async () => {
    const now = new Date("2026-08-01T00:00:00.000Z");
    setFakeClient(
      createFakeSupabaseClient([
        {
          id: "id-vencida",
          asaas_checkout_id: "checkout-1",
          plan: "primeira-vaga",
          status: "ativa",
          customer_name: "Vencida",
          customer_email: "vencida@example.com",
          amount_cents: 19900,
          paid_at: "2026-01-15T00:00:00.000Z",
          expires_at: "2026-07-15T00:00:00.000Z",
          created_at: "2026-01-15T00:00:00.000Z",
          updated_at: "2026-01-15T00:00:00.000Z",
        },
      ]),
    );

    const expired = await markExpiredEnrollments(now);

    expect(expired).toHaveLength(1);
    expect(expired[0].id).toBe("id-vencida");
    expect(expired[0].status).toBe("expirada");
  });

  it("não altera inscrições ativas ainda dentro do prazo", async () => {
    const now = new Date("2026-03-01T00:00:00.000Z");
    const client = createFakeSupabaseClient([
      {
        id: "id-vigente",
        asaas_checkout_id: "checkout-2",
        plan: "proximo-nivel",
        status: "ativa",
        customer_name: "Vigente",
        customer_email: "vigente@example.com",
        amount_cents: 49900,
        paid_at: "2026-01-15T00:00:00.000Z",
        expires_at: "2026-07-15T00:00:00.000Z",
        created_at: "2026-01-15T00:00:00.000Z",
        updated_at: "2026-01-15T00:00:00.000Z",
      },
    ]);
    setFakeClient(client);

    const expired = await markExpiredEnrollments(now);

    expect(expired).toHaveLength(0);
    expect(client._rows[0].status).toBe("ativa");
  });

  it("respeita a máquina de estados: não expira uma inscrição 'paga' vencida (paga->expirada é inválido)", async () => {
    const now = new Date("2026-08-01T00:00:00.000Z");
    const client = createFakeSupabaseClient([
      {
        id: "id-paga-vencida",
        asaas_checkout_id: "checkout-3",
        plan: "primeira-vaga",
        status: "paga",
        customer_name: "Paga Vencida",
        customer_email: "paga@example.com",
        amount_cents: 19900,
        paid_at: "2026-01-15T00:00:00.000Z",
        expires_at: "2026-07-15T00:00:00.000Z",
        created_at: "2026-01-15T00:00:00.000Z",
        updated_at: "2026-01-15T00:00:00.000Z",
      },
    ]);
    setFakeClient(client);

    const expired = await markExpiredEnrollments(now);

    expect(expired).toHaveLength(0);
    expect(client._rows[0].status).toBe("paga");
  });
});
