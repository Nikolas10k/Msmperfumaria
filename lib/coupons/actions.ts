"use server";

import { createClient } from "@/lib/supabase/server";
import { validateCoupon, type CouponValidationResult } from "@/lib/coupons/validate";

export async function validateCouponAction(
  code: string,
  subtotal: number,
): Promise<CouponValidationResult & { code: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*, coupon_usages(id, customer_id)")
    .ilike("code", code.trim())
    .maybeSingle();

  if (!coupon) {
    return { valid: false, reason: "inativo", code };
  }

  const usages = (coupon.coupon_usages as unknown as { customer_id: string }[]) ?? [];
  const customerUsageCount = user ? usages.filter((u) => u.customer_id === user.id).length : 0;

  const result = validateCoupon(
    {
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value),
      minOrderValue: Number(coupon.min_order_value),
      maxUses: coupon.max_uses,
      maxUsesPerCustomer: coupon.max_uses_per_customer,
      startsAt: coupon.starts_at,
      endsAt: coupon.ends_at,
      isActive: coupon.is_active,
      totalUses: usages.length,
    },
    subtotal,
    customerUsageCount,
  );

  return { ...result, code: coupon.code };
}
