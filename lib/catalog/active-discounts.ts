import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, DiscountType } from "@/lib/types/database";
import type { ApplicableCampaign } from "@/lib/pricing/effective-price";

export interface ActiveCampaign {
  name: string;
  scope: "all" | "products" | "categories" | "brands";
  discount_type: DiscountType;
  discount_value: number;
  targets: { target_type: string; target_id: string }[];
}

export async function getActiveCampaigns(
  supabase: SupabaseClient<Database>,
): Promise<ActiveCampaign[]> {
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("campaigns")
    .select("name, scope, discount_type, discount_value, campaign_targets(target_type, target_id)")
    .eq("is_active", true)
    .lte("starts_at", nowIso)
    .gte("ends_at", nowIso);

  return (data ?? []).map((c) => ({
    name: c.name,
    scope: c.scope,
    discount_type: c.discount_type,
    discount_value: c.discount_value,
    targets: (c.campaign_targets as unknown as { target_type: string; target_id: string }[]) ?? [],
  }));
}

export function campaignsForProduct(
  campaigns: ActiveCampaign[],
  product: { id: string; brandId: string; categoryIds: string[] },
): ApplicableCampaign[] {
  return campaigns
    .filter((c) => {
      if (c.scope === "all") return true;
      if (c.scope === "products") return c.targets.some((t) => t.target_id === product.id);
      if (c.scope === "brands") return c.targets.some((t) => t.target_id === product.brandId);
      if (c.scope === "categories") {
        return c.targets.some((t) => product.categoryIds.includes(t.target_id));
      }
      return false;
    })
    .map((c) => ({ name: c.name, discountType: c.discount_type, discountValue: c.discount_value }));
}

export async function getActivePromotionsMap(
  supabase: SupabaseClient<Database>,
): Promise<Map<string, number>> {
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("promotions")
    .select("variant_id, promo_price")
    .eq("is_active", true)
    .lte("starts_at", nowIso)
    .gte("ends_at", nowIso);

  const map = new Map<string, number>();
  for (const promo of data ?? []) {
    map.set(promo.variant_id, Number(promo.promo_price));
  }
  return map;
}
