// Validador do header de autenticidade do webhook Asaas. Ver spec.md P1
// "Confirmação automática pós-pagamento" AC2 (MENT-11): token inválido ou
// ausente deve ser rejeitado (401) pela rota (T18), nunca processado.

import { getEnv } from "./env";

/**
 * Returns true only when headerValue exactly matches the configured
 * ASAAS_WEBHOOK_TOKEN. A missing/empty header is always false, regardless
 * of the configured token's value.
 */
export function isValidWebhookToken(
  headerValue: string | null | undefined,
): boolean {
  if (!headerValue) {
    return false;
  }

  const env = getEnv();
  return headerValue === env.ASAAS_WEBHOOK_TOKEN;
}
