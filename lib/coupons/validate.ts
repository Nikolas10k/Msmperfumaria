import type { DiscountType } from "@/lib/types/database";

export interface CouponForValidation {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxUses: number | null;
  maxUsesPerCustomer: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  totalUses: number;
}

export type CouponInvalidReason =
  | "inativo"
  | "fora_do_periodo"
  | "pedido_minimo_nao_atingido"
  | "limite_total_atingido"
  | "limite_por_cliente_atingido";

export type CouponValidationResult =
  | { valid: true; discountAmount: number }
  | { valid: false; reason: CouponInvalidReason };

export function validateCoupon(
  coupon: CouponForValidation,
  subtotal: number,
  customerUsageCount: number,
  now: Date = new Date(),
): CouponValidationResult {
  if (!coupon.isActive) return { valid: false, reason: "inativo" };

  if (now < new Date(coupon.startsAt) || now > new Date(coupon.endsAt)) {
    return { valid: false, reason: "fora_do_periodo" };
  }

  if (subtotal < coupon.minOrderValue) {
    return { valid: false, reason: "pedido_minimo_nao_atingido" };
  }

  if (coupon.maxUses !== null && coupon.totalUses >= coupon.maxUses) {
    return { valid: false, reason: "limite_total_atingido" };
  }

  if (customerUsageCount >= coupon.maxUsesPerCustomer) {
    return { valid: false, reason: "limite_por_cliente_atingido" };
  }

  const discountAmount =
    coupon.discountType === "percentage"
      ? Math.round(subtotal * (coupon.discountValue / 100) * 100) / 100
      : Math.min(coupon.discountValue, subtotal);

  return { valid: true, discountAmount };
}
