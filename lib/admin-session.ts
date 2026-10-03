// Sessão do admin (spec.md P2 "Lista de inscrições para o mentor", MENT-25).
// Ver design.md "Admin auth": senha única via cookie + middleware, não um
// sistema de auth completo. O cookie guarda um hash derivado de
// ADMIN_PASSWORD - nunca a senha em texto puro - e é comparado em tempo
// constante. Compartilhado entre a rota de login
// (app/api/admin/login/route.ts, T37) e o middleware (middleware.ts, T38):
// os dois precisam calcular/validar exatamente o mesmo valor de cookie, e o
// middleware roda em Edge runtime, então esta implementação usa só Web
// Crypto (SubtleCrypto + TextEncoder), disponível nos dois runtimes - nunca
// o módulo `crypto` do Node, que o Edge runtime não oferece.

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compares two strings in constant time with respect to their content
 * (every character pair is checked regardless of where a mismatch occurs),
 * avoiding a trivial-to-avoid timing attack from a short-circuiting `===`.
 * Different lengths return false immediately - safe here because both the
 * session token (a fixed-length hash) and the admin password are not
 * secrets derivable from their length alone.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Derives the admin session cookie value from the current ADMIN_PASSWORD.
 * Deterministic (same password -> same token) so the middleware can
 * recompute and compare it without any shared storage.
 */
export async function createAdminSessionToken(
  adminPassword: string,
): Promise<string> {
  return sha256Hex(`mentoria-admin-session-v1:${adminPassword}`);
}

/**
 * Validates a session cookie value against the token derived from the
 * current admin password, in constant time.
 */
export async function isValidAdminSessionToken(
  cookieValue: string | null | undefined,
  adminPassword: string,
): Promise<boolean> {
  if (!cookieValue) {
    return false;
  }
  const expected = await createAdminSessionToken(adminPassword);
  return timingSafeEqual(cookieValue, expected);
}
