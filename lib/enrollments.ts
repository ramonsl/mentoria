import { asc, and, eq, lte } from "drizzle-orm";
import type { Db } from "./db";
import { getDb } from "./db";
import { canTransition, type EnrollmentStatus } from "./enrollment-state";
import { enrollments as enrollmentsTable } from "./schema";

export type Plan = "avulso" | "acompanhamento-3m" | "acompanhamento-6m";

export interface Enrollment {
  id: string;
  asaasCheckoutId: string;
  plan: Plan;
  status: EnrollmentStatus;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  paidAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewEnrollment {
  asaasCheckoutId: string;
  plan: Plan;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  paidAt: Date;
}

const ACCESS_DURATION_MONTHS: Record<Plan, number | null> = {
  avulso: null,
  "acompanhamento-3m": 3,
  "acompanhamento-6m": 6,
};

function addMonthsUtc(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

function mapRow(row: typeof enrollmentsTable.$inferSelect): Enrollment {
  return {
    id: row.id,
    asaasCheckoutId: row.asaasCheckoutId,
    plan: row.plan as Plan,
    status: row.status as EnrollmentStatus,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    amountCents: row.amountCents,
    paidAt: row.paidAt ?? null,
    expiresAt: row.expiresAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createEnrollment(
  input: NewEnrollment,
  db: Db = getDb(),
): Promise<Enrollment> {
  const durationMonths = ACCESS_DURATION_MONTHS[input.plan];
  const expiresAt =
    durationMonths === null ? null : addMonthsUtc(input.paidAt, durationMonths);

  const [row] = await db
    .insert(enrollmentsTable)
    .values({
      asaasCheckoutId: input.asaasCheckoutId,
      plan: input.plan,
      status: "paga",
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      amountCents: input.amountCents,
      paidAt: input.paidAt,
      expiresAt,
    })
    .returning();

  return mapRow(row);
}

export async function findActiveByEmailAndPlan(
  email: string,
  plan: Plan,
  db: Db = getDb(),
): Promise<Enrollment | null> {
  const [row] = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.customerEmail, email),
        eq(enrollmentsTable.plan, plan),
        eq(enrollmentsTable.status, "ativa"),
      ),
    )
    .limit(1);

  return row ? mapRow(row) : null;
}

export async function findByCheckoutId(
  checkoutId: string,
  db: Db = getDb(),
): Promise<Enrollment | null> {
  const [row] = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.asaasCheckoutId, checkoutId))
    .limit(1);

  return row ? mapRow(row) : null;
}

export async function updateEnrollmentStatus(
  id: string,
  status: EnrollmentStatus,
  updatedAt: Date,
  db: Db = getDb(),
): Promise<Enrollment> {
  const [row] = await db
    .update(enrollmentsTable)
    .set({ status, updatedAt })
    .where(eq(enrollmentsTable.id, id))
    .returning();

  if (!row) throw new Error(`Enrollment not found: ${id}`);
  return mapRow(row);
}

export async function markExpiredEnrollments(
  now: Date,
  db: Db = getDb(),
): Promise<Enrollment[]> {
  const candidates = await db
    .select()
    .from(enrollmentsTable)
    .where(lte(enrollmentsTable.expiresAt, now));

  const expired: Enrollment[] = [];

  for (const enrollment of candidates) {
    if (!canTransition(enrollment.status as EnrollmentStatus, "expirada")) {
      continue;
    }

    const [updated] = await db
      .update(enrollmentsTable)
      .set({ status: "expirada", updatedAt: now })
      .where(eq(enrollmentsTable.id, enrollment.id))
      .returning();

    expired.push(mapRow(updated));
  }

  return expired;
}

export async function listEnrollments(db: Db = getDb()): Promise<Enrollment[]> {
  const rows = await db
    .select()
    .from(enrollmentsTable)
    .orderBy(asc(enrollmentsTable.expiresAt));

  // avulso (expiresAt null) vai para o final, como o comportamento anterior
  const withExpiry = rows.filter((r) => r.expiresAt !== null);
  const nullExpiry = rows.filter((r) => r.expiresAt === null);

  return [...withExpiry, ...nullExpiry].map(mapRow);
}
