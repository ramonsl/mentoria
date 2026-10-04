import { and, eq, gt, lt, sql } from "drizzle-orm";
import { PLANS, type PlanSlug } from "../content/plans";
import { getDb, type Db } from "./db";
import { coupons, planPrices } from "./schema";

const PLAN_SLUGS = new Set<string>(PLANS.map((plan) => plan.slug));

export type DiscountType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  plan: PlanSlug | null;
  expiresAt: Date | null;
  maxUses: number | null;
  reservedUses: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  plan: PlanSlug | null;
  expiresAt: Date | null;
  maxUses: number | null;
}

export class CommercialError extends Error {
  constructor(
    public readonly code:
      | "invalid_price"
      | "price_not_found"
      | "invalid_coupon"
      | "invalid_discount"
      | "invalid_date"
      | "invalid_limit"
      | "unknown"
      | "inactive"
      | "expired"
      | "ineligible"
      | "exhausted",
  ) {
    super(code);
  }
}

function isPlanSlug(value: string): value is PlanSlug {
  return PLAN_SLUGS.has(value);
}

function mapCoupon(row: typeof coupons.$inferSelect): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discountType as DiscountType,
    discountValue: row.discountValue,
    plan: row.plan as PlanSlug | null,
    expiresAt: row.expiresAt,
    maxUses: row.maxUses,
    reservedUses: row.reservedUses,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function validatePositiveWholeCents(value: number, errorCode: "invalid_price" | "invalid_discount") {
  if (!Number.isInteger(value) || value <= 0) {
    throw new CommercialError(errorCode);
  }
}

function validateCouponInput(input: CouponInput): CouponInput {
  const code = input.code.trim().toUpperCase();
  if (!code) throw new CommercialError("invalid_coupon");
  if (input.discountType !== "percentage" && input.discountType !== "fixed") {
    throw new CommercialError("invalid_discount");
  }
  validatePositiveWholeCents(input.discountValue, "invalid_discount");
  if (input.discountType === "percentage" && input.discountValue > 99) {
    throw new CommercialError("invalid_discount");
  }
  if (input.plan !== null && !isPlanSlug(input.plan)) {
    throw new CommercialError("invalid_coupon");
  }
  if (input.expiresAt !== null && Number.isNaN(input.expiresAt.getTime())) {
    throw new CommercialError("invalid_date");
  }
  if (
    input.maxUses !== null &&
    (!Number.isInteger(input.maxUses) || input.maxUses <= 0)
  ) {
    throw new CommercialError("invalid_limit");
  }

  return { ...input, code };
}

export async function listPlanPrices(
  db: Db = getDb(),
): Promise<Partial<Record<PlanSlug, number>>> {
  const rows = await db.select().from(planPrices);
  return Object.fromEntries(
    rows.map((row) => [row.plan as PlanSlug, row.priceCents]),
  ) as Partial<Record<PlanSlug, number>>;
}

export async function updatePlanPrice(
  input: { plan: PlanSlug; priceCents: number },
  db: Db = getDb(),
): Promise<void> {
  if (!isPlanSlug(input.plan)) throw new CommercialError("invalid_price");
  validatePositiveWholeCents(input.priceCents, "invalid_price");

  const [updated] = await db
    .update(planPrices)
    .set({ priceCents: input.priceCents, updatedAt: new Date() })
    .where(eq(planPrices.plan, input.plan))
    .returning({ plan: planPrices.plan });

  if (!updated) throw new CommercialError("price_not_found");
}

export async function listCoupons(db: Db = getDb()): Promise<Coupon[]> {
  const rows = await db.select().from(coupons);
  return rows.map(mapCoupon);
}

export async function createCoupon(
  rawInput: CouponInput,
  db: Db = getDb(),
): Promise<Coupon> {
  const input = validateCouponInput(rawInput);
  const [row] = await db
    .insert(coupons)
    .values({
      ...input,
      active: true,
      reservedUses: 0,
    })
    .returning();

  return mapCoupon(row);
}

export async function deactivateCoupon(
  id: string,
  db: Db = getDb(),
): Promise<void> {
  await db
    .update(coupons)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(coupons.id, id));
}

export async function reserveCoupon(
  code: string,
  plan: PlanSlug,
  priceCents: number,
  now: Date,
  db: Db = getDb(),
): Promise<{ couponId: string; priceCents: number }> {
  const normalizedCode = code.trim().toUpperCase();
  const [row] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, normalizedCode))
    .limit(1);

  if (!row) throw new CommercialError("unknown");
  const coupon = mapCoupon(row);
  if (!coupon.active) throw new CommercialError("inactive");
  if (coupon.expiresAt && now > coupon.expiresAt) {
    throw new CommercialError("expired");
  }
  if (coupon.plan && coupon.plan !== plan) throw new CommercialError("ineligible");

  const discountedPrice =
    coupon.discountType === "percentage"
      ? Math.round((priceCents * (100 - coupon.discountValue)) / 100)
      : priceCents - coupon.discountValue;
  if (discountedPrice <= 0) throw new CommercialError("invalid_discount");

  const limitCondition =
    coupon.maxUses === null
      ? eq(coupons.id, coupon.id)
      : and(eq(coupons.id, coupon.id), lt(coupons.reservedUses, coupon.maxUses));
  const [reserved] = await db
    .update(coupons)
    .set({
      reservedUses: sql`${coupons.reservedUses} + 1`,
      updatedAt: now,
    })
    .where(limitCondition)
    .returning({ id: coupons.id });

  if (!reserved) throw new CommercialError("exhausted");
  return { couponId: coupon.id, priceCents: discountedPrice };
}

export async function releaseCouponReservation(
  couponId: string,
  db: Db = getDb(),
): Promise<void> {
  await db
    .update(coupons)
    .set({
      reservedUses: sql`greatest(${coupons.reservedUses} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(and(eq(coupons.id, couponId), gt(coupons.reservedUses, 0)));
}
