// GET /api/cron/check-expirations (spec.md P1 "Confirmação automática
// pós-pagamento" AC11, MENT-20). Chamado só pelo Vercel Cron (T26) - exige
// Authorization: Bearer <CRON_SECRET>. Marca inscrições vencidas (qualquer
// plano) como "expirada" e notifica o mentor por e-mail, uma vez por
// inscrição recém-expirada.

import { getEnv } from "../../../../lib/env";
import { markExpiredEnrollments } from "../../../../lib/enrollments";
import { sendMentorExpirationAlert } from "../../../../emails/templates";

export async function GET(request: Request): Promise<Response> {
  const env = getEnv();
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await markExpiredEnrollments(new Date());

  for (const enrollment of expired) {
    await sendMentorExpirationAlert(enrollment);
  }

  return Response.json({ expiredCount: expired.length });
}
