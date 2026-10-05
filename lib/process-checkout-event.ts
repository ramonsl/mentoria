// Processa eventos de checkout do Asaas vindos do webhook (spec.md P1
// "Confirmação automática pós-pagamento"). T19 cobre CHECKOUT_PAID; T20
// (esta extensão) cobre CHECKOUT_CANCELED/CHECKOUT_EXPIRED e o caso de
// eventos fora de ordem (MENT-13).

import {
  createEnrollment,
  findActiveByEmailAndPlan,
  findByCheckoutId,
  updateEnrollmentStatus,
  type Enrollment,
  type Plan,
} from "./enrollments";
import { canTransition } from "./enrollment-state";
import { PLANS, type PlanDisplay } from "../content/plans";
import {
  sendMenteeConfirmation,
  sendMentorNewEnrollmentAlert,
  sendMentorRejectedCheckoutAlert,
} from "../emails/templates";

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
    externalReference?: string;
  };
}

export type ProcessOutcome =
  | { type: "enrolled"; enrollment: Enrollment; duplicateAlert: boolean }
  | { type: "rejected"; reason: string }
  | { type: "ignored"; reason: string }
  | { type: "conflict"; reason: string; enrollment: Enrollment };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// tasks.md T28 (correção de bug identificado no lote 3): o plano é
// identificado pelo `externalReference` que lib/asaas.ts grava na criação do
// checkout (o slug do plano), não mais pelo texto do `name` do item - um
// texto de marketing que pode mudar em content/plans.ts sem quebrar essa
// identificação.
function findPlanByExternalReference(
  externalReference: string | undefined,
): PlanDisplay | undefined {
  if (!externalReference) return undefined;
  return PLANS.find((p) => p.slug === externalReference);
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
  return updateEnrollmentStatus(enrollment.id, "ativa", now);
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


async function processCheckoutPaid(
  event: AsaasCheckoutEvent,
  options: { now?: Date },
): Promise<ProcessOutcome> {
  const customerData = event.checkout.customerData;
  const email = customerData?.email;
  const name = customerData?.name;
  const planDisplay = findPlanByExternalReference(
    event.checkout.externalReference,
  );
  const itemValue = event.checkout.items?.[0]?.value;
  const amountCents =
    typeof itemValue === "number" && Number.isFinite(itemValue)
      ? Math.round(itemValue * 100)
      : null;
  const emailValid = !!email && EMAIL_REGEX.test(email);

  if (!emailValid || !name || !planDisplay || amountCents === null || amountCents <= 0) {
    const reason = rejectionReason(email, name, planDisplay, event.checkout.id);
    await sendMentorRejectedCheckoutAlert(event.checkout.id, reason);
    return { type: "rejected", reason };
  }

  const plan: Plan = planDisplay.slug;
  const now = options.now ?? new Date();

  const existingActive = await findActiveByEmailAndPlan(email, plan);

  const created = await createEnrollment({
    asaasCheckoutId: event.checkout.id,
    plan,
    customerName: name,
    customerEmail: email,
    amountCents,
    paidAt: now,
  });

  const activated = await activateEnrollment(created, now);
  const duplicateAlert = existingActive !== null;

  // AC5 (mentorando) e AC6 (mentor) são dois gatilhos independentes da
  // mesma "inscrição registrada com sucesso" - disparados juntos via
  // Promise.all para que a falha de um não impeça a tentativa do outro.
  // Fix MENT-18 (validation.md, ciclo 1): o mentor precisa ver o aviso de
  // duplicidade no próprio e-mail, não só receber o flag internamente.
  await Promise.all([
    sendMenteeConfirmation(activated),
    sendMentorNewEnrollmentAlert(activated, { duplicateAlert }),
  ]);

  return {
    type: "enrolled",
    enrollment: activated,
    duplicateAlert,
  };
}

const TERMINAL_EVENT_TYPES = new Set(["CHECKOUT_CANCELED", "CHECKOUT_EXPIRED"]);

/**
 * Handles CHECKOUT_CANCELED/CHECKOUT_EXPIRED. If no enrollment exists yet for
 * this checkout, a CHECKOUT_PAID was never processed for it - no-op, nothing
 * to create (MENT-06, MENT-13). If an enrollment already exists, a
 * CHECKOUT_PAID for this same checkout was already processed and is kept as
 * definitive: the enrollment is never reverted automatically, only flagged
 * as a conflict for manual review (MENT-13).
 */
async function processTerminalEvent(
  event: AsaasCheckoutEvent,
): Promise<ProcessOutcome> {
  const existing = await findByCheckoutId(event.checkout.id);

  if (!existing) {
    return {
      type: "ignored",
      reason: `No prior CHECKOUT_PAID found for checkout ${event.checkout.id}; ${event.event} is a no-op`,
    };
  }

  return {
    type: "conflict",
    reason: `${event.event} received after CHECKOUT_PAID already processed for checkout ${event.checkout.id}; enrollment kept as-is for manual review`,
    enrollment: existing,
  };
}

/**
 * Entry point: dispatches a checkout event from the Asaas webhook to the
 * right handler by event type. Unknown/unhandled event types are ignored
 * (spec.md edge case: unknown event types/fields never throw).
 */
export async function processCheckoutEvent(
  event: AsaasCheckoutEvent,
  options: { now?: Date } = {},
): Promise<ProcessOutcome> {
  if (event.event === "CHECKOUT_PAID") {
    return processCheckoutPaid(event, options);
  }

  if (TERMINAL_EVENT_TYPES.has(event.event)) {
    return processTerminalEvent(event);
  }

  return {
    type: "ignored",
    reason: `Unhandled event type: ${event.event}`,
  };
}
