import { describe, expect, it } from "vitest";
import { ADMIN_THEME, statusAccent } from "./admin-theme";

describe("statusAccent", () => {
  it.each([
    ["Pago", ADMIN_THEME.success],
    ["Cancelado", ADMIN_THEME.alert],
    ["Expirado", ADMIN_THEME.alert],
    ["Pendente", ADMIN_THEME.muted],
  ] as const)(
    "critério 10 (admin-wattvision-theme.md): %s usa %s",
    (label, expected) => {
      expect(statusAccent(label)).toBe(expected);
    },
  );
});
