// POST /api/admin/login - spec.md P2 "Lista de inscrições para o mentor"
// (MENT-25). Valida a senha única do admin contra ADMIN_PASSWORD
// (lib/env.ts) e, em caso de sucesso, seta um cookie httpOnly com um hash
// derivado da senha (nunca a senha em texto puro - ver lib/admin-session.ts).
// O middleware (middleware.ts, T38) valida esse mesmo cookie para proteger
// /admin/inscricoes.

import { NextResponse } from "next/server";
import { getEnv } from "../../../../lib/env";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  timingSafeEqual,
} from "../../../../lib/admin-session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const password = (body as { password?: unknown } | null)?.password;
  const env = getEnv();

  if (
    typeof password !== "string" ||
    !timingSafeEqual(password, env.ADMIN_PASSWORD)
  ) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createAdminSessionToken(env.ADMIN_PASSWORD);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
