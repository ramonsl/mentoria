// Cliente Asaas - criação de checkout hospedado. Schema de POST /v3/checkouts
// confirmado em 2026-10-02 contra https://docs.asaas.com/v3/reference/criar-novo-checkout
// (design.md flagged essa confirmação como risco pendente antes de codar o
// payload - ver "Risks & Concerns"): billingTypes (CREDIT_CARD|PIX),
// chargeTypes (DETACHED|RECURRENT|INSTALLMENT), callback.successUrl e
// callback.cancelUrl obrigatórios, items[] com name/value/quantity/
// imageBase64 obrigatórios e description opcional. A resposta de sucesso
// traz a URL do checkout hospedado no campo "link".

import { getEnv } from "./env";
import { PLANS, type PlanSlug } from "../content/plans";

export class AsaasApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AsaasApiError";
    this.status = status;
  }
}

// INCERTEZA (flagged em vez de assumida silenciosamente): o schema OpenAPI
// de items[] marca "imageBase64" como obrigatório, o que é incomum para um
// item de serviço (mentoria, não produto físico) e a página de referência
// não trouxe um exemplo de requisição completo pra confirmar na prática se
// a API realmente rejeita a chamada sem esse campo. Usando aqui um PNG
// transparente 1x1 como placeholder neutro - não é uma foto de produto real.
// Revisar se a Asaas rejeitar isso, ou quando houver uma imagem de marca
// definida para os planos.
const PLACEHOLDER_ITEM_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function findPlan(plan: PlanSlug) {
  const found = PLANS.find((p) => p.slug === plan);
  if (!found) {
    throw new Error(`Unknown plan: ${plan}`);
  }
  return found;
}

/**
 * Creates a one-time (DETACHED) Asaas hosted checkout for the given plan,
 * offering Pix and credit card (spec.md P1 "Pagar o plano escolhido" AC1-2).
 * `origin` is the landing page's own origin, used to build the success/cancel
 * redirect URLs (callback.successUrl points at /obrigado - MENT-22).
 */
export async function createCheckout(
  plan: PlanSlug,
  origin: string,
  amountCents: number,
): Promise<{ checkoutUrl: string }> {
  const env = getEnv();
  const planDisplay = findPlan(plan);
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Invalid checkout amount");
  }

  const requestBody = {
    billingTypes: ["PIX", "CREDIT_CARD"],
    chargeTypes: ["DETACHED"],
    // tasks.md T28: identifica o plano no processamento do webhook por este
    // campo (slug estável), não mais pelo texto de items[].name (que pode
    // mudar em content/plans.ts). Confirmado como campo top-level de
    // POST /v3/checkouts em docs.asaas.com/reference/create-new-checkout.
    externalReference: plan,
    callback: {
      successUrl: `${origin}/obrigado`,
      cancelUrl: origin,
    },
    items: [
      {
        name: planDisplay.name,
        description: planDisplay.targetAudience,
        // Valor em reais (não centavos) - convenção da API Asaas.
        value: amountCents / 100,
        quantity: 1,
        imageBase64: PLACEHOLDER_ITEM_IMAGE_BASE64,
      },
    ],
  };

  let response: Response;
  try {
    response = await fetch(`${env.ASAAS_API_BASE_URL}/v3/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: env.ASAAS_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    throw new AsaasApiError(
      `Failed to reach Asaas API: ${(err as Error).message}`,
    );
  }

  if (!response.ok) {
    throw new AsaasApiError(
      `Asaas API returned ${response.status} when creating checkout`,
      response.status,
    );
  }

  const data = (await response.json()) as { link?: string };
  if (!data.link) {
    throw new AsaasApiError("Asaas API response missing checkout link");
  }

  return { checkoutUrl: data.link };
}
