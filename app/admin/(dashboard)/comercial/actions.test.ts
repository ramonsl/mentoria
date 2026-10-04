import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cookiesMock,
  isValidAdminSessionTokenMock,
  updatePlanPriceMock,
  createCouponMock,
  deactivateCouponMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  isValidAdminSessionTokenMock: vi.fn(),
  updatePlanPriceMock: vi.fn(),
  createCouponMock: vi.fn(),
  deactivateCouponMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("../../../../lib/admin-session", () => ({
  ADMIN_SESSION_COOKIE_NAME: "admin_session",
  isValidAdminSessionToken: isValidAdminSessionTokenMock,
}));
vi.mock("../../../../lib/env", () => ({
  getEnv: () => ({ ADMIN_PASSWORD: "admin-password" }),
}));
vi.mock("../../../../lib/commercial", () => ({
  updatePlanPrice: updatePlanPriceMock,
  createCoupon: createCouponMock,
  deactivateCoupon: deactivateCouponMock,
}));

import {
  createCouponAction,
  deactivateCouponAction,
  updatePlanPriceAction,
} from "./actions";

function formData(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("commercial admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookiesMock.mockResolvedValue({ get: () => ({ value: "valid-session" }) });
    isValidAdminSessionTokenMock.mockResolvedValue(true);
  });

  it("rejects a mutation when the admin session is absent", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined });
    isValidAdminSessionTokenMock.mockResolvedValue(false);

    await expect(
      updatePlanPriceAction(formData({ plan: "avulso", priceCents: "29900" })),
    ).rejects.toThrow("Unauthorized");
    expect(updatePlanPriceMock).not.toHaveBeenCalled();
  });

  it("returns a validation error without changing the plan price", async () => {
    const result = await updatePlanPriceAction(
      formData({ plan: "avulso", priceCents: "0" }),
    );

    expect(result).toEqual({ error: "Informe um preço inteiro positivo." });
    expect(updatePlanPriceMock).not.toHaveBeenCalled();
  });

  it("updates one price and revalidates the landing and commercial admin page", async () => {
    const result = await updatePlanPriceAction(
      formData({ plan: "avulso", priceCents: "34900" }),
    );

    expect(result).toEqual({ success: true });
    expect(updatePlanPriceMock).toHaveBeenCalledWith({
      plan: "avulso",
      priceCents: 34900,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/comercial");
  });

  it("creates a valid coupon and revalidates the commercial pages", async () => {
    const result = await createCouponAction(
      formData({
        code: "carreira10",
        discountType: "percentage",
        discountValue: "10",
        plan: "avulso",
        expiresAt: "2026-12-31",
        maxUses: "5",
      }),
    );

    expect(result).toEqual({ success: true });
    expect(createCouponMock).toHaveBeenCalledWith({
      code: "carreira10",
      discountType: "percentage",
      discountValue: 10,
      plan: "avulso",
      expiresAt: new Date("2026-12-31T00:00:00.000Z"),
      maxUses: 5,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/comercial");
  });

  it("deactivates only the selected coupon after checking the session", async () => {
    const result = await deactivateCouponAction(
      formData({ couponId: "coupon-123" }),
    );

    expect(result).toEqual({ success: true });
    expect(deactivateCouponMock).toHaveBeenCalledWith("coupon-123");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/comercial");
  });
});
