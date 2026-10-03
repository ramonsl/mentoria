// Processa eventos de checkout do Asaas vindos do webhook (spec.md P1
// "Confirmação automática pós-pagamento"). T19 cobre CHECKOUT_PAID; T20
// estende para CANCELED/EXPIRED e eventos fora de ordem.

import {
  createEnrollment,
  findActiveByEmailAndPlan,
  type Enrollment,
  type Plan,
} from "./enrollments";
import { canTransition } from "./enrollment-state";
import { getSupabaseClient } from "./supabase";
import { PLANS, type PlanDisplay } from "../content/plans";

export interface AsaasCheckoutCustomerData {
  name?: string;
  email?: string;
}

export interface AsaasCheckoutItem {
  name?: string;
  value?: number;
}

export interface AsaasCheckoutEvent {
  id: string;
  event: string;
  checkout: {
    id: string;
    customerData?: AsaasCheckoutCustomerData | null;
    items?: AsaasCheckoutItem[];
  };
}

export type ProcessOutcome =
  | { type: "enrolled"; enrollment: Enrollment; duplicateAlert: boolean }
  | { type: "rejected"; reason: string }
  | { type: "ignored"; reason: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// DECISÃO (não exigida em nenhuma task): a criação do checkout (T14) não
// grava externalReference com o slug do plano, então o evento de webhook não
// carrega essa informação diretamente. O item do checkout ecoa o `name` que
// T14 enviou (`planDisplay.name`) - usamos isso pra identificar o plano, em
// vez de voltar a mexer em lib/asaas.ts (fora do escopo desta task).
function findPlanByItemName(itemName: string | undefined): PlanDisplay | undefined {
  if (!itemName) return undefined;
  return PLANS.find((p) => p.name === itemName);
}

/**
 * Transitions a freshly created ("paga") enrollment straight to "ativa" as
 * part of the same CHECKOUT_PAID processing.
 *
 * DECISÃO DE PROJETO (fecha um gap implícito da spec, não um desvio dela):
 * nenhuma task deste projeto define um passo manual separado de "ativação"
 * da inscrição - o fluxo é pagamento confirmado -> inscrição criada ->
 * inscrição ativa (dá acesso). createEnrollment grava o status inicial
 * "paga" (válido pela máquina de estados de lib/enrollment-state.ts). Sem
 * esta transição paga->ativa, markExpiredEnrollments (que só opera sobre
 * inscrições "ativa") nunca encontraria nada para expirar.
 */
async function activateEnrollment(
  enrollment: Enrollment,
  now: Date,
): Promise<Enrollment> {
  if (!canTransition(enrollment.status, "ativa")) {
    return enrollment;
  }

  const client = getSupabaseClient();
  const { error } = await client
    .from("enrollments")
    .update({ status: "ativa", updated_at: now.toISOString() })
    .eq("id", enrollment.id);

  if (error) {
    throw new Error(
      `Failed to activate enrollment ${enrollment.id}: ${error.message}`,
    );
  }

  return { ...enrollment, status: "ativa", updatedAt: now };
}

function rejectionReason(
  email: string | undefined,
  name: string | undefined,
  plan: PlanDisplay | undefined,
  checkoutId: string,
): string {
  if (!email || !EMAIL_REGEX.test(email)) {
    return `Malformed or missing customer email for checkout ${checkoutId}`;
  }
  if (!name) {
    return `Missing customer name for checkout ${checkoutId}`;
  }
  return `Unable to determine plan for checkout ${checkoutId}`;
}

/**
 * Handles a CHECKOUT_PAID event: validates customer data (MENT-17), checks
 * for an existing active enrollment on the same e-mail+plan (MENT-18,
 * flagged but never blocking), and creates+activates the enrollment
 * (MENT-10). Any other event type is ignored here (handled starting at T20).
 */
export async function processCheckoutEvent(
  event: AsaasCheckoutEvent,
  options: { now?: Date } = {},
): Promise<ProcessOutcome> {
  if (event.event !== "CHECKOUT_PAID") {
    return {
      type: "ignored",
      reason: `Unhandled event type: ${event.event}`,
    };
  }

  const customerData = event.checkout.customerData;
  const email = customerData?.email;
  const name = customerData?.name;
  const planDisplay = findPlanByItemName(event.checkout.items?.[0]?.name);
  const emailValid = !!email && EMAIL_REGEX.test(email);

  if (!emailValid || !name || !planDisplay) {
    return {
      type: "rejected",
      reason: rejectionReason(email, name, planDisplay, event.checkout.id),
    };
  }

  const plan: Plan = planDisplay.slug;
  const now = options.now ?? new Date();

  const existingActive = await findActiveByEmailAndPlan(email, plan);

  const created = await createEnrollment({
    asaasCheckoutId: event.checkout.id,
    plan,
    customerName: name,
    customerEmail: email,
    amountCents: planDisplay.priceCents,
    paidAt: now,
  });

  const activated = await activateEnrollment(created, now);

  return {
    type: "enrolled",
    enrollment: activated,
    duplicateAlert: existingActive !== null,
  };
}
