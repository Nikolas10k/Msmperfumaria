"use server";

import { createClient } from "@/lib/supabase/server";
import { checkExpressDelivery, type ExpressCheckResult, type ExpressRegion } from "@/lib/shipping/brasilia";

export async function checkExpressDeliveryAction(cep: string): Promise<ExpressCheckResult> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shipping_regions")
    .select("*, shipping_methods!inner(type)")
    .eq("is_active", true)
    .eq("shipping_methods.type", "express_brasilia");

  const regions: ExpressRegion[] = (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    cepRangeStart: r.cep_range_start,
    cepRangeEnd: r.cep_range_end,
    fee: Number(r.fee),
    deliveryDaysMin: r.delivery_days_min,
    deliveryDaysMax: r.delivery_days_max,
    cutoffTime: r.cutoff_time,
    activeWeekdays: r.active_weekdays,
    isActive: r.is_active,
  }));

  return checkExpressDelivery(cep, regions);
}
