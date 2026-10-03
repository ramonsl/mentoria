// POST /api/webhooks/asaas (spec.md P1 "Confirmação automática pós-pagamento"
// AC1-3, MENT-11/12/21). Valida o header de autenticidade, grava o evento de
// forma idempotente (por event id) tolerando campos extras desconhecidos no
// payload, e - só para um evento NOVO, nunca para um duplicado - dispara o
// processamento real (lib/process-checkout-event.ts, T19/T20/T23): cria a
// inscrição e envia os e-mails. Sempre retorna 200 ao Asaas: o evento já foi
// gravado de forma durável, então um erro de processamento vira log de
// auditoria (MENT-21), não uma instrução para o Asaas reentregar o webhook.

import { isValidWebhookToken } from "../../../../lib/verify-asaas-webhook";
import { logOutcome, recordEvent } from "../../../../lib/webhook-events";
import {
  processCheckoutEvent,
  type AsaasCheckoutEvent,
} from "../../../../lib/process-checkout-event";

interface AsaasWebhookPayload {
  id?: string;
  event?: string;
  checkout?: {
    id?: string;
    customerData?: { name?: string; email?: string } | null;
    items?: { name?: string; value?: number }[];
    externalReference?: string;
  };
  [key: string]: unknown;
}

export async function POST(request: Request): Promise<Response> {
  const token = request.headers.get("asaas-access-token");
  if (!isValidWebhookToken(token)) {
    // Fix MENT-11 (validation.md, ciclo 1): spec.md AC2 exige registrar a
    // tentativa para auditoria, não só retornar 401. Sem uma tabela de
    // auditoria dedicada (fora do escopo desta correção pontual - seria uma
    // migration nova), o log estruturado via console é o registro mínimo
    // capturado pela observabilidade da plataforma (Vercel/Runtime logs).
    console.error("[webhook-audit] rejected request: invalid or missing asaas-access-token", {
      tokenProvided: token !== null,
    });
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

  const recordResult = await recordEvent({
    id: payload.id ?? "",
    eventType: payload.event ?? "",
    checkoutId: payload.checkout?.id ?? "",
    payload,
  });

  // Idempotência (MENT-12): um event id já registrado antes não é
  // reprocessado - nem a inscrição é recriada, nem o e-mail é reenviado.
  if (recordResult.recorded) {
    const asaasEvent: AsaasCheckoutEvent = {
      id: recordResult.event.id,
      event: payload.event ?? "",
      checkout: {
        id: payload.checkout?.id ?? "",
        customerData: payload.checkout?.customerData,
        items: payload.checkout?.items,
        externalReference: payload.checkout?.externalReference,
      },
    };

    try {
      const outcome = await processCheckoutEvent(asaasEvent);
      // Fix MENT-13 (validation.md, ciclo 1): um "conflict" (evento fora de
      // ordem após um CHECKOUT_PAID já processado) ou um "rejected" (dados
      // malformados) não lança exceção - processCheckoutEvent resolve
      // normalmente - mas nenhum dos dois é um "success" de verdade: ambos
      // precisam de revisão manual (MENT-13, MENT-17), então o resultado
      // gravado reflete isso em vez de mascarar como sucesso.
      if (outcome.type === "conflict" || outcome.type === "rejected") {
        await logOutcome(recordResult.event.id, "error", outcome.reason);
      } else {
        await logOutcome(recordResult.event.id, "success");
      }
    } catch (err) {
      await logOutcome(
        recordResult.event.id,
        "error",
        (err as Error).message,
      );
    }
  }

  return Response.json({ ok: true });
}
