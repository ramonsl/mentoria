// Protege /admin/inscricoes (spec.md P2 "Lista de inscrições para o mentor",
// MENT-25): sem um cookie de sessão válido (setado por
// app/api/admin/login/route.ts, T37), redireciona para /admin/login. O
// `matcher` abaixo restringe este middleware só às rotas /admin/inscricoes -
// /admin/login (e qualquer rota pública do site) nunca passa por aqui, então
// nunca pode ser bloqueada por este middleware.

import { NextResponse, type NextRequest } from "next/server";
import { getEnv } from "./lib/env";
import {
  ADMIN_SESSION_COOKIE_NAME,
  isValidAdminSessionToken,
} from "./lib/admin-session";

export const config = {
  matcher: ["/admin/inscricoes", "/admin/inscricoes/:path*"],
};

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const env = getEnv();

  const valid = await isValidAdminSessionToken(cookieValue, env.ADMIN_PASSWORD);
  if (!valid) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}
