import type { DiscountType } from "@/lib/types/database";

export interface ActivePromotion {
  promoPrice: number;
}

export interface ApplicableCampaign {
  name: string;
  discountType: DiscountType;
  discountValue: number;
}

export interface PriceInput {
  basePrice: number;
  compareAtPrice?: number | null;
  activePromotion?: ActivePromotion | null;
  applicableCampaigns?: ApplicableCampaign[];
}

export type PriceSource = "promotion" | "campaign" | "base";

export interface EffectivePrice {
  finalPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  source: PriceSource;
  campaignName?: string;
}

function applyDiscount(price: number, type: DiscountType, value: number): number {
  const discounted = type === "percentage" ? price * (1 - value / 100) : price - value;
  return Math.max(0, Math.round(discounted * 100) / 100);
}

/**
 * Resolve o preço final de uma variante combinando: promoção agendada (mais
 * específica) e campanhas aplicáveis (marca/categoria/produto/geral).
 * Sempre recalcular no servidor no checkout — nunca confiar no preço do client.
 */
export function computeEffectivePrice(input: PriceInput): EffectivePrice {
  const { basePrice, compareAtPrice, activePromotion, applicableCampaigns = [] } = input;

  const originalPrice =
    compareAtPrice && compareAtPrice > basePrice ? compareAtPrice : basePrice;

  const candidates: { price: number; source: PriceSource; campaignName?: string }[] = [
    { price: basePrice, source: "base" },
  ];

  if (activePromotion) {
    candidates.push({ price: activePromotion.promoPrice, source: "promotion" });
  }

  for (const campaign of applicableCampaigns) {
    candidates.push({
      price: applyDiscount(basePrice, campaign.discountType, campaign.discountValue),
      source: "campaign",
      campaignName: campaign.name,
    });
  }

  const best = candidates.reduce((lowest, current) =>
    current.price < lowest.price ? current : lowest,
  );

  const finalPrice = Math.max(0, Math.round(best.price * 100) / 100);
  const hasDiscount = finalPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round((1 - finalPrice / originalPrice) * 100)
    : 0;

  return {
    finalPrice,
    originalPrice,
    hasDiscount,
    discountPercent,
    source: best.source,
    campaignName: best.campaignName,
  };
}
