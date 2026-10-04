import { describe, expect, it } from "vitest";
import type { Db } from "./db";
import {
  CommercialError,
  createCoupon,
  reserveCoupon,
  updatePlanPrice,
} from "./commercial";

type Row = Record<string, unknown>;

function fakeDb({
  coupon,
  updateRows = [{}],
}: {
  coupon?: Row;
  updateRows?: Row[];
} = {}) {
  const inserted: Row[] = [];
  const updates: Row[] = [];

  return {
    inserted,
    updates,
    db: {
      insert: () => ({
        values: (value: Row) => ({
          returning: async () => {
            inserted.push(value);
            return [{ id: "coupon-1", ...value }];
          },
        }),
      }),
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => (coupon ? [coupon] : []),
          }),
          then: (resolve: (rows: Row[]) => unknown) =>
            Promise.resolve(coupon ? [coupon] : []).then(resolve),
        }),
      }),
      update: () => ({
        set: (value: Row) => ({
          where: () => ({
            returning: async () => {
              updates.push(value);
              return updateRows;
            },
          }),
        }),
      }),
    } as unknown as Db,
  };
}

describe("updatePlanPrice", () => {
  it("persiste um preço inteiro positivo para o plano selecionado", async () => {
    const store = fakeDb();

    await updatePlanPrice(
      { plan: "avulso", priceCents: 34900 },
      store.db,
    );

    expect(store.updates[0]).toMatchObject({ priceCents: 34900 });
  });

  it.each([0, -1, 12.5, Number.NaN])(
    "rejeita preço inválido (%s) sem atualizar",
    async (priceCents) => {
      const store = fakeDb();

      await expect(
        updatePlanPrice({ plan: "avulso", priceCents }, store.db),
      ).rejects.toMatchObject({ code: "invalid_price" });
      expect(store.updates).toEqual([]);
    },
  );
});

describe("createCoupon", () => {
  it("persiste um cupom percentual ativo com código normalizado", async () => {
    const store = fakeDb();

    const coupon = await createCoupon(
      {
        code: " carreira10 ",
        discountType: "percentage",
        discountValue: 10,
        plan: "avulso",
        expiresAt: null,
        maxUses: 5,
      },
      store.db,
    );

    expect(coupon).toMatchObject({
      code: "CARREIRA10",
      discountType: "percentage",
      discountValue: 10,
      plan: "avulso",
      maxUses: 5,
      active: true,
      reservedUses: 0,
    });
  });

  it.each([
    ["percentage", 0, null, null],
    ["percentage", 100, null, null],
    ["fixed", 0, null, null],
    ["fixed", 100, null, 0],
  ] as const)(
    "rejeita desconto ou limite inválido sem criar cupom",
    async (discountType, discountValue, expiresAt, maxUses) => {
      const store = fakeDb();

      await expect(
        createCoupon(
          {
            code: "PROMO",
            discountType,
            discountValue,
            plan: null,
            expiresAt,
            maxUses,
          },
          store.db,
        ),
      ).rejects.toBeInstanceOf(CommercialError);
      expect(store.inserted).toEqual([]);
    },
  );

  it("rejeita data de expiração inválida sem criar cupom", async () => {
    const store = fakeDb();

    await expect(
      createCoupon(
        {
          code: "PROMO",
          discountType: "fixed",
          discountValue: 100,
          plan: null,
          expiresAt: new Date("invalid"),
          maxUses: null,
        },
        store.db,
      ),
    ).rejects.toMatchObject({ code: "invalid_date" });
    expect(store.inserted).toEqual([]);
  });
});

describe("reserveCoupon", () => {
  const now = new Date("2026-10-04T12:00:00.000Z");
  const eligibleCoupon = {
    id: "coupon-1",
    code: "PROMO10",
    discountType: "percentage",
    discountValue: 10,
    plan: "avulso",
    expiresAt: null,
    maxUses: 2,
    reservedUses: 0,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  it("reserva cupom elegível e retorna o valor positivo descontado", async () => {
    const store = fakeDb({ coupon: eligibleCoupon });

    await expect(
      reserveCoupon("promo10", "avulso", 29900, now, store.db),
    ).resolves.toEqual({ couponId: "coupon-1", priceCents: 26910 });
    expect(store.updates).toHaveLength(1);
  });

  it.each([
    [undefined, "unknown"],
    [{ ...eligibleCoupon, active: false }, "inactive"],
    [{ ...eligibleCoupon, expiresAt: new Date("2026-10-04T11:59:59.000Z") }, "expired"],
    [{ ...eligibleCoupon, plan: "acompanhamento-3m" }, "ineligible"],
    [{ ...eligibleCoupon, discountType: "fixed", discountValue: 29900 }, "invalid_discount"],
  ] as const)(
    "rejeita cupom %s sem reservá-lo",
    async (coupon, code) => {
      const store = fakeDb({ coupon });

      await expect(
        reserveCoupon("PROMO10", "avulso", 29900, now, store.db),
      ).rejects.toMatchObject({ code });
      expect(store.updates).toEqual([]);
    },
  );

  it("rejeita cupom esgotado quando a reserva condicional não atualiza uma linha", async () => {
    const store = fakeDb({ coupon: eligibleCoupon, updateRows: [] });

    await expect(
      reserveCoupon("PROMO10", "avulso", 29900, now, store.db),
    ).rejects.toMatchObject({ code: "exhausted" });
  });
});
