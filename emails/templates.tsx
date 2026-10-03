// Templates de e-mail transacional (spec.md P1 "Confirmação automática
// pós-pagamento" AC5/AC6, content.md §10, MENT-14/15/20). Corpo em texto
// puro montado a partir de content/emails.ts - 3 e-mails curtos de texto
// não justificam introduzir renderização React Email (coding principles:
// sem abstração para código de uso único).

import { getResendClient, sendWithRetry } from "../lib/email";
import { getEnv } from "../lib/env";
import { EMAIL_TEMPLATES_COPY } from "../content/emails";
import { PLANS } from "../content/plans";
import type { Enrollment } from "../lib/enrollments";

function planDisplayFor(plan: Enrollment["plan"]) {
  const found = PLANS.find((p) => p.slug === plan);
  if (!found) {
    throw new Error(`Unknown plan: ${plan}`);
  }
  return found;
}

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

function interpolate(line: string, vars: Record<string, string>): string {
  return line.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? vars[key] : match,
  );
}

function renderBody(
  lines: readonly string[],
  vars: Record<string, string>,
): string {
  return lines.map((line) => interpolate(line, vars)).join("\n\n");
}

async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const client = getResendClient();
  await sendWithRetry(() =>
    client.emails.send({
      from: `${EMAIL_TEMPLATES_COPY.senderName} <${EMAIL_TEMPLATES_COPY.senderEmail}>`,
      replyTo: EMAIL_TEMPLATES_COPY.replyTo,
      to: options.to,
      subject: options.subject,
      text: options.text,
    }),
  );
}

/**
 * Sends the mentee's payment confirmation (spec.md AC5, content.md §10.1).
 */
export async function sendMenteeConfirmation(
  enrollment: Enrollment,
): Promise<void> {
  const plan = planDisplayFor(enrollment.plan);
  const copy = EMAIL_TEMPLATES_COPY.menteeConfirmation;
  const vars = {
    customerFirstName: firstName(enrollment.customerName),
    planName: plan.name,
    priceLabel: plan.priceLabel,
  };

  await sendEmail({
    to: enrollment.customerEmail,
    subject: interpolate(copy.subject, vars),
    text: renderBody(copy.body, vars),
  });
}

/**
 * Alerts the mentor about a newly confirmed enrollment, for any plan
 * (spec.md AC6, MENT-15, content.md §10.2).
 *
 * DECISÃO: customerPhone não é coletado em nenhum ponto desta feature (sem
 * campo correspondente em Enrollment/lib/enrollments.ts) - o token cai num
 * placeholder fixo em vez de vazar o literal "{customerPhone}" pro mentor.
 */
export async function sendMentorNewEnrollmentAlert(
  enrollment: Enrollment,
): Promise<void> {
  const plan = planDisplayFor(enrollment.plan);
  const copy = EMAIL_TEMPLATES_COPY.mentorNewEnrollmentAlert;
  const env = getEnv();
  const vars = {
    customerName: enrollment.customerName,
    customerEmail: enrollment.customerEmail,
    customerPhone: "não coletado",
    planName: plan.name,
    priceLabel: plan.priceLabel,
    paidAt: formatDate(enrollment.paidAt),
    expiresAt: formatDate(enrollment.expiresAt),
  };

  await sendEmail({
    to: env.MENTOR_EMAIL,
    subject: interpolate(copy.subject, vars),
    text: renderBody(copy.body, vars),
  });
}

/**
 * Alerts the mentor that an enrollment's access has expired, for any plan
 * (spec.md AC11, MENT-20, content.md §10.3).
 */
export async function sendMentorExpirationAlert(
  enrollment: Enrollment,
): Promise<void> {
  const plan = planDisplayFor(enrollment.plan);
  const copy = EMAIL_TEMPLATES_COPY.mentorExpirationAlert;
  const env = getEnv();
  const vars = {
    customerName: enrollment.customerName,
    customerEmail: enrollment.customerEmail,
    planName: plan.name,
    paidAt: formatDate(enrollment.paidAt),
    expiresAt: formatDate(enrollment.expiresAt),
  };

  await sendEmail({
    to: env.MENTOR_EMAIL,
    subject: interpolate(copy.subject, vars),
    text: renderBody(copy.body, vars),
  });
}
