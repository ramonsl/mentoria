// Helper de retry genérico para envio de e-mail (spec.md P1 "Confirmação
// automática pós-pagamento" AC7, MENT-16: até 3 tentativas antes de
// desistir) + client Resend configurado via lib/env.ts.

import { Resend } from "resend";
import { getEnv } from "./env";

/**
 * Builds a Resend client authenticated with RESEND_API_KEY from lib/env.ts.
 * Never cached at module scope - getEnv() already throws a clear error if
 * the key is missing, same pattern as lib/supabase.ts.
 */
export function getResendClient(): Resend {
  const env = getEnv();
  return new Resend(env.RESEND_API_KEY);
}

/**
 * Calls fn, retrying up to maxAttempts times on failure. Returns the first
 * successful result immediately (no extra retries beyond what's needed).
 * If every attempt fails, rethrows the last error to the caller, who
 * registers the final failure (MENT-16).
 */
export async function sendWithRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}
