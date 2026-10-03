// Repositório de inscrições. Ver design.md ("EnrollmentRepository" e "Data
// Models") para a assinatura e o shape canônicos.

import { getSupabaseClient } from "./supabase";
import { canTransition, type EnrollmentStatus } from "./enrollment-state";

export type Plan = "primeira-vaga" | "proximo-nivel";

export interface Enrollment {
  id: string;
  asaasCheckoutId: string;
  plan: Plan;
  status: EnrollmentStatus;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  paidAt: Date | null;
  expiresAt: Date;
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

const ACCESS_DURATION_MONTHS = 6;

function addMonthsUtc(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

function mapRow(row: Record<string, unknown>): Enrollment {
  return {
    id: row.id as string,
    asaasCheckoutId: row.asaas_checkout_id as string,
    plan: row.plan as Plan,
    status: row.status as EnrollmentStatus,
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string,
    amountCents: row.amount_cents as number,
    paidAt: row.paid_at ? new Date(row.paid_at as string) : null,
    expiresAt: new Date(row.expires_at as string),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

/**
 * Creates an enrollment for a confirmed payment. expiresAt is always
 * paidAt + 6 months, for either plan - both plans include Classroom and
 * WhatsApp access now (spec.md MENT-10). Initial status is "paga": the
 * payment just happened, no automated step in this feature moves it to
 * "ativa" yet (out of this task's scope).
 */
export async function createEnrollment(
  input: NewEnrollment,
): Promise<Enrollment> {
  const client = getSupabaseClient();
  const expiresAt = addMonthsUtc(input.paidAt, ACCESS_DURATION_MONTHS);

  const { data, error } = await client
    .from("enrollments")
    .insert({
      asaas_checkout_id: input.asaasCheckoutId,
      plan: input.plan,
      status: "paga",
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      amount_cents: input.amountCents,
      paid_at: input.paidAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create enrollment: ${error.message}`);
  }

  return mapRow(data);
}

/**
 * Finds an enrollment with status "ativa" for the same e-mail and plan,
 * used for duplicate-payment detection (spec.md MENT-18).
 */
export async function findActiveByEmailAndPlan(
  email: string,
  plan: Plan,
): Promise<Enrollment | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("enrollments")
    .select()
    .eq("customer_email", email)
    .eq("plan", plan)
    .eq("status", "ativa")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to look up active enrollment: ${error.message}`);
  }

  return data ? mapRow(data) : null;
}

/**
 * Moves every enrollment past its expiresAt to "expirada", only when that
 * transition is valid per the state machine (ativa -> expirada is the only
 * path into "expirada" from an existing paid enrollment). Returns the
 * enrollments that actually changed state, for the caller (cron, T25) to
 * notify the mentor.
 */
export async function markExpiredEnrollments(
  now: Date,
): Promise<Enrollment[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("enrollments")
    .select()
    .lte("expires_at", now.toISOString());

  if (error) {
    throw new Error(`Failed to list expired enrollments: ${error.message}`);
  }

  const candidates = (data ?? []).map(mapRow);
  const expired: Enrollment[] = [];

  for (const enrollment of candidates) {
    if (!canTransition(enrollment.status, "expirada")) {
      continue;
    }

    const { data: updated, error: updateError } = await client
      .from("enrollments")
      .update({ status: "expirada", updated_at: now.toISOString() })
      .eq("id", enrollment.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `Failed to mark enrollment ${enrollment.id} as expired: ${updateError.message}`,
      );
    }

    expired.push(mapRow(updated));
  }

  return expired;
}
