// POST /api/checkout - cria um Asaas Checkout hospedado para o plano
// escolhido. Ver design.md "Checkout Route Handler" e spec.md P1 "Pagar o
// plano escolhido" (MENT-04, MENT-05, MENT-08).

import { createCheckout, AsaasApiError } from "../../../lib/asaas";
import { PLANS, type PlanSlug } from "../../../content/plans";

const VALID_PLANS: readonly PlanSlug[] = PLANS.map((plan) => plan.slug);

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

  const origin = new URL(request.url).origin;

  try {
    const { checkoutUrl } = await createCheckout(plan, origin);
    return Response.json({ checkoutUrl });
  } catch (err) {
    if (err instanceof AsaasApiError) {
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
