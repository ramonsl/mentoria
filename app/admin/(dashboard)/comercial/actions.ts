"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { PLANS, type PlanSlug } from "../../../../content/plans";
import {
  createCoupon,
  deactivateCoupon,
  updatePlanPrice,
  type DiscountType,
} from "../../../../lib/commercial";
import {
  ADMIN_SESSION_COOKIE_NAME,
  isValidAdminSessionToken,
} from "../../../../lib/admin-session";
import { getEnv } from "../../../../lib/env";

type ActionResult = { success: true } | { error: string };

const PLAN_SLUGS = new Set<string>(PLANS.map((plan) => plan.slug));

function isPlanSlug(value: string): value is PlanSlug {
  return PLAN_SLUGS.has(value);
}

async function requireAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const { ADMIN_PASSWORD } = getEnv();
  if (!(await isValidAdminSessionToken(session, ADMIN_PASSWORD))) {
    throw new Error("Unauthorized");
  }
}

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function revalidateCommercialPages(): void {
  revalidatePath("/");
  revalidatePath("/admin/comercial");
}

export async function updatePlanPriceAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminSession();
  const plan = readString(formData, "plan");
  const priceCents = Number(readString(formData, "priceCents"));
  if (!isPlanSlug(plan) || !Number.isInteger(priceCents) || priceCents <= 0) {
    return { error: "Informe um preço inteiro positivo." };
  }

  try {
    await updatePlanPrice({ plan, priceCents });
  } catch {
    return { error: "Não foi possível atualizar o preço." };
  }
  revalidateCommercialPages();
  return { success: true };
}

export async function createCouponAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminSession();
  const discountType = readString(formData, "discountType");
  const discountValue = Number(readString(formData, "discountValue"));
  const planValue = readString(formData, "plan");
  const expiresAtValue = readString(formData, "expiresAt");
  const maxUsesValue = readString(formData, "maxUses");
  const expiresAt = expiresAtValue ? new Date(expiresAtValue) : null;
  const maxUses = maxUsesValue ? Number(maxUsesValue) : null;

  if (
    (discountType !== "percentage" && discountType !== "fixed") ||
    !Number.isInteger(discountValue) ||
    discountValue <= 0 ||
    (discountType === "percentage" && discountValue > 99) ||
    (planValue !== "" && !isPlanSlug(planValue)) ||
    (expiresAt && Number.isNaN(expiresAt.getTime())) ||
    (maxUses !== null && (!Number.isInteger(maxUses) || maxUses <= 0))
  ) {
    return { error: "Revise os dados do cupom." };
  }

  try {
    await createCoupon({
      code: readString(formData, "code"),
      discountType: discountType as DiscountType,
      discountValue,
      plan: planValue === "" ? null : planValue,
      expiresAt,
      maxUses,
    });
  } catch {
    return { error: "Não foi possível criar o cupom." };
  }
  revalidateCommercialPages();
  return { success: true };
}

export async function deactivateCouponAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminSession();
  const couponId = readString(formData, "couponId");
  if (!couponId) return { error: "Cupom inválido." };

  try {
    await deactivateCoupon(couponId);
  } catch {
    return { error: "Não foi possível desativar o cupom." };
  }
  revalidateCommercialPages();
  return { success: true };
}
