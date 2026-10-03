// POST /api/webhooks/asaas - esqueleto (spec.md P1 "Confirmação automática
// pós-pagamento" AC1-3, MENT-11/12/21). Valida o header de autenticidade,
// grava o evento de forma idempotente (por event id) tolerando campos extras
// desconhecidos no payload, e retorna 200. O processamento de negócio do
// CHECKOUT_PAID (lib/process-checkout-event.ts) é conectado a partir de T19 -
// fora do escopo desta task.

import { isValidWebhookToken } from "../../../../lib/verify-asaas-webhook";
import { recordEvent } from "../../../../lib/webhook-events";

interface AsaasWebhookPayload {
  id?: string;
  event?: string;
  checkout?: { id?: string };
  [key: string]: unknown;
}

export async function POST(request: Request): Promise<Response> {
  const token = request.headers.get("asaas-access-token");
  if (!isValidWebhookToken(token)) {
    return Response.json(
      { error: "Invalid or missing webhook token" },
      { status: 401 },
    );
  }

  let payload: AsaasWebhookPayload;
  try {
    payload = (await request.json()) as AsaasWebhookPayload;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  await recordEvent({
    id: payload.id ?? "",
    eventType: payload.event ?? "",
    checkoutId: payload.checkout?.id ?? "",
    payload,
  });

  return Response.json({ ok: true });
}
