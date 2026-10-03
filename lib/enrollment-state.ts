// Máquina de estados da inscrição.
// Ver .specs/features/landing-mentoria/spec.md MENT-19: a inscrição
// permanece em exatamente um dos estados abaixo, transitando apenas pelos
// caminhos listados em VALID_TRANSITIONS.

export type EnrollmentStatus =
  | "pendente"
  | "paga"
  | "ativa"
  | "expirada"
  | "cancelada";

const VALID_TRANSITIONS: ReadonlySet<string> = new Set([
  "pendente->paga",
  "paga->ativa",
  "ativa->expirada",
  "pendente->cancelada",
  "pendente->expirada",
]);

/**
 * Returns true only for the exact set of transitions the spec allows.
 * Every other pair - including same-state "transitions" - is rejected.
 */
export function canTransition(
  from: EnrollmentStatus,
  to: EnrollmentStatus,
): boolean {
  return VALID_TRANSITIONS.has(`${from}->${to}`);
}
