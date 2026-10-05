// POST /api/checkout - cria um Asaas Checkout hospedado para o plano
// escolhido. Ver design.md "Checkout Route Handler" e spec.md P1 "Pagar o
// plano escolhido" (MENT-04, MENT-05, MENT-08).

import {
  createCheckout,
  AsaasApiError,
  AsaasConfigurationError,
} from "../../../lib/asaas";
import { PLANS, type PlanSlug } from "../../../content/plans";
import {
  CommercialError,
  listPlanPrices,
  releaseCouponReservation,
  reserveCoupon,
} from "../../../lib/commercial";

const VALID_PLANS: readonly PlanSlug[] = PLANS.map((plan) => plan.slug);

type CheckoutFailureCategory =
  | "auth"
  | "payload"
  | "endpoint"
  | "network"
  | "upstream";

function checkoutFailureCategory(status?: number): CheckoutFailureCategory {
  if (status === undefined) return "network";
  if (status === 401 || status === 403) return "auth";
  if (status === 400 || status === 422) return "payload";
  if (status === 404 || status === 405) return "endpoint";
  return "upstream";
}

function safeProviderDetail(value: string | undefined): string | null {
  return value
    ? value.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 300)
    : null;
}

function isValidPlan(value: unknown): value is PlanSlug {
  return (
    typeof value === "string" &&
    (VALID_PLANS as readonly string[]).includes(value)
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const plan = (body as { plan?: unknown } | null)?.plan;
  if (!isValidPlan(plan)) {
    return Response.json(
      { error: "Missing or invalid plan" },
      { status: 400 },
    );
  }

  const rawCouponCode = (body as { couponCode?: unknown } | null)?.couponCode;
  if (rawCouponCode !== undefined && typeof rawCouponCode !== "string") {
    return Response.json({ error: "Invalid coupon code" }, { status: 400 });
  }
  const couponCode = rawCouponCode?.trim().toUpperCase();
  if (rawCouponCode !== undefined && !couponCode) {
    return Response.json({ error: "Invalid coupon code" }, { status: 400 });
  }

  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = process.env.PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  const origin = configuredOrigin || requestOrigin;
  const prices = await listPlanPrices();
  const priceCents = prices[plan];
  if (!priceCents || priceCents <= 0) {
    return Response.json({ error: "Plan price unavailable" }, { status: 400 });
  }

  let couponId: string | undefined;
  let finalPriceCents = priceCents;

  try {
    if (couponCode) {
      const reservation = await reserveCoupon(
        couponCode,
        plan,
        priceCents,
        new Date(),
      );
      couponId = reservation.couponId;
      finalPriceCents = reservation.priceCents;
    }

    const { checkoutUrl } = await createCheckout(plan, origin, finalPriceCents);
    return Response.json({ checkoutUrl });
  } catch (err) {
    if (couponId) {
      try {
        await releaseCouponReservation(couponId);
      } catch {
        // Preserve the original checkout error; reservation cleanup is best effort.
      }
    }
    if (err instanceof CommercialError) {
      return Response.json(
        { error: couponErrorMessage(err.code) },
        { status: 400 },
      );
    }
    if (err instanceof AsaasConfigurationError) {
      return Response.json(
        {
          error:
            "O pagamento precisa de uma URL pública configurada. Defina PUBLIC_APP_URL e tente novamente.",
        },
        { status: 503 },
      );
    }
    if (err instanceof AsaasApiError) {
      console.error(
        "[checkout] Asaas checkout failed",
        JSON.stringify({
          category: checkoutFailureCategory(err.status),
          status: err.status ?? null,
          providerCode: safeProviderDetail(err.providerCode),
          providerDescription: safeProviderDetail(err.providerDescription),
        }),
      );
      return Response.json(
        {
          error:
            "Não foi possível iniciar o pagamento agora. Tente novamente em instantes.",
        },
        { status: 502 },
      );
    }
    throw err;
  }
}

function couponErrorMessage(code: CommercialError["code"]): string {
  switch (code) {
    case "expired":
      return "Este cupom expirou.";
    case "exhausted":
      return "Este cupom atingiu o limite de usos.";
    case "ineligible":
      return "Este cupom não é válido para o plano escolhido.";
    case "inactive":
      return "Este cupom não está mais ativo.";
    case "invalid_discount":
      return "Este cupom não pode ser aplicado a este preço.";
    case "unknown":
      return "Cupom não encontrado. Confira o código e tente novamente.";
    default:
      return "Não foi possível validar o cupom. Confira o código e tente novamente.";
  }
}
