import { describe, expect, it } from "vitest";
import { canTransition, type EnrollmentStatus } from "./enrollment-state";

// Transições válidas, conforme spec.md MENT-19 ("transitando apenas pelos
// caminhos: pendente→paga, paga→ativa, ativa→expirada, pendente→cancelada,
// pendente→expirada") e tasks.md T8.
const VALID_TRANSITIONS: [EnrollmentStatus, EnrollmentStatus][] = [
  ["pendente", "paga"],
  ["paga", "ativa"],
  ["ativa", "expirada"],
  ["pendente", "cancelada"],
  ["pendente", "expirada"],
];

const ALL_STATUSES: EnrollmentStatus[] = [
  "pendente",
  "paga",
  "ativa",
  "expirada",
  "cancelada",
];

describe("canTransition", () => {
  it.each(VALID_TRANSITIONS)(
    "allows the valid transition %s -> %s",
    (from, to) => {
      expect(canTransition(from, to)).toBe(true);
    },
  );

  // O spec define a lista de caminhos válidos como exaustiva ("apenas"), logo
  // qualquer par fora dela - incluindo os exemplos citados na task e toda
  // auto-transição - deve ser rejeitado.
  const isValid = (from: EnrollmentStatus, to: EnrollmentStatus) =>
    VALID_TRANSITIONS.some(([f, t]) => f === from && t === to);

  const invalidPairs: [EnrollmentStatus, EnrollmentStatus][] = [];
  for (const from of ALL_STATUSES) {
    for (const to of ALL_STATUSES) {
      if (!isValid(from, to)) {
        invalidPairs.push([from, to]);
      }
    }
  }

  it.each(invalidPairs)("rejects the invalid transition %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it("rejects the task-listed invalid examples explicitly", () => {
    expect(canTransition("expirada", "paga")).toBe(false);
    expect(canTransition("cancelada", "ativa")).toBe(false);
    expect(canTransition("paga", "pendente")).toBe(false);
  });
});
