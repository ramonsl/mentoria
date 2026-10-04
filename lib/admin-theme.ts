// Tokens de cor do design system WattVision (.tasks/admin-wattvision-theme.md),
// reaproveitados só pra /admin - a landing pública não usa nada daqui.
// https://designmd.ai/groquispe100inf-max/design-md-sistema-de-monitoreo-el-ctrico-wattvision

import type { StatusLabel } from "./enrollment-filters";

export const ADMIN_THEME = {
  background: "#121212",
  surface: "#1E1E1E",
  border: "#2C2C2E",
  rowHover: "#252525",
  accent: "#00E5FF",
  success: "#32D74B",
  alert: "#FF453A",
  alertBackground: "#3A1C1C",
  text: "#FFFFFF",
  muted: "#98989D",
} as const;

// O design system só define verde (normal/"ao vivo") e vermelho (alerta) - não cobre os 4
// status deste painel. Critério 10 / Unresolved #1 de admin-wattvision-theme.md: Pago=verde,
// Cancelado/Expirado=vermelho (merecem atenção), Pendente=cinza neutro.
const STATUS_ACCENTS: Record<StatusLabel, string> = {
  Pago: ADMIN_THEME.success,
  Cancelado: ADMIN_THEME.alert,
  Expirado: ADMIN_THEME.alert,
  Pendente: ADMIN_THEME.muted,
};

export function statusAccent(label: StatusLabel): string {
  return STATUS_ACCENTS[label];
}
